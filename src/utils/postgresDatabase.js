import pg from "pg";

const { Pool } = pg;

const connectionString =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.PG_CONNECTION_STRING ||
    process.env.PGURI;

const poolConfig = {
    connectionString,
};

if (connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) {
    poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);

global.pgPool = pool;

export const pgDb = {
    pool,

    async connect() {
        if (!connectionString) {
            console.error("❌ No se encontró ninguna variable de entorno de PostgreSQL.");
            return false;
        }

        try {
            await pool.query("SELECT 1");
            console.log("✅ POSTGRES CONECTADO CORRECTAMENTE");

            await pool.query(`
                CREATE TABLE IF NOT EXISTS bot_storage (
                    key TEXT PRIMARY KEY,
                    value JSONB NOT NULL
                );
            `);

            global.db = this;
            global.pgPool = pool;

            return true;
        } catch (error) {
            console.error("❌ ERROR DE CONEXIÓN A POSTGRESQL:", error.message);
            return false;
        }
    },

    async query(text, params) {
        return pool.query(text, params);
    },

    async get(key, defaultValue = null) {
        try {
            const result = await pool.query(
                "SELECT value FROM bot_storage WHERE key = $1",
                [key]
            );

            if (!result.rows.length) {
                return defaultValue;
            }

            let value = result.rows[0].value;

            if (typeof value === "string") {
                try {
                    value = JSON.parse(value);
                } catch {}
            }

            return value;
        } catch (error) {
            console.error("ERROR GET:", error.message);
            return defaultValue;
        }
    },

    async set(key, value) {
        try {
            const jsonValue = typeof value === 'object' ? JSON.stringify(value) : value;

            await pool.query(
                `
                INSERT INTO bot_storage (key, value)
                VALUES ($1, $2::jsonb)
                ON CONFLICT (key)
                DO UPDATE SET value = EXCLUDED.value
                `,
                [key, jsonValue]
            );

            return true;
        } catch (error) {
            console.error("ERROR SET:", error.message);
            return false;
        }
    },

    async delete(key) {
        try {
            await pool.query("DELETE FROM bot_storage WHERE key = $1", [key]);
            return true;
        } catch (error) {
            console.error("ERROR DELETE:", error.message);
            return false;
        }
    },

    async list(prefix) {
        try {
            const result = await pool.query(
                "SELECT key, value FROM bot_storage WHERE key LIKE $1",
                [`${prefix}%`]
            );

            return result.rows.map(row => {
                let value = row.value;

                if (typeof value === "string") {
                    try {
                        value = JSON.parse(value);
                    } catch {}
                }

                return { key: row.key, value };
            });
        } catch (error) {
            console.error("ERROR LIST:", error.message);
            return [];
        }
    },

    async insertVerificationAudit(record) {
        return true;
    }
};
