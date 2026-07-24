import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export const pgDb = {
    async connect() {
        await pool.query("SELECT 1");
        return true;
    },

    async get(key, defaultValue = null) {
        const result = await pool.query(
            "SELECT value FROM bot_storage WHERE key = $1",
            [key]
        );

        if (!result.rows.length) return defaultValue;

        return result.rows[0].value;
    },

    async set(key, value) {
        await pool.query(
            `
            INSERT INTO bot_storage (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key)
            DO UPDATE SET value = EXCLUDED.value
            `,
            [key, JSON.stringify(value)]
        );

        return true;
    },

    async delete(key) {
        await pool.query(
            "DELETE FROM bot_storage WHERE key = $1",
            [key]
        );

        return true;
    },

    async list(prefix) {
        const result = await pool.query(
            "SELECT key FROM bot_storage WHERE key LIKE $1",
            [`${prefix}%`]
        );

        return result.rows.map(r => r.key);
    },

    async insertVerificationAudit() {
        return true;
    }
};
