import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export const pgDb = {

    async connect() {
        await pool.query("SELECT 1");
        console.log("POSTGRES CONECTADO");
        return true;
    },

    async get(key, defaultValue = null) {
        try {
            console.log("LEYENDO:", key);

            const result = await pool.query(
                "SELECT value FROM bot_storage WHERE key = $1",
                [key]
            );

            if (!result.rows.length) {
                console.log("NO EXISTE:", key);
                return defaultValue;
            }

            const value = result.rows[0].value;

            if (typeof value === "string") {
                return JSON.parse(value);
            }

            return value;

        } catch (error) {
            console.error("ERROR GET:", error);
            return defaultValue;
        }
    },


    async set(key, value) {
        try {
            console.log("GUARDANDO:", key, value);

            await pool.query(
                `
                INSERT INTO bot_storage (key, value)
                VALUES ($1, $2::jsonb)
                ON CONFLICT (key)
                DO UPDATE SET value = EXCLUDED.value
                `,
                [
                    key,
                    JSON.stringify(value)
                ]
            );

            return true;

        } catch (error) {
            console.error("ERROR SET:", error);
            return false;
        }
    },


    async delete(key) {
        try {
            await pool.query(
                "DELETE FROM bot_storage WHERE key = $1",
                [key]
            );

            return true;

        } catch (error) {
            console.error("ERROR DELETE:", error);
            return false;
        }
    },


    async list(prefix) {
        try {
            const result = await pool.query(
                "SELECT key FROM bot_storage WHERE key LIKE $1",
                [`${prefix}%`]
            );

            return result.rows.map(row => row.key);

        } catch (error) {
            console.error("ERROR LIST:", error);
            return [];
        }
    },


    async insertVerificationAudit(record) {
        return true;
    }
};
