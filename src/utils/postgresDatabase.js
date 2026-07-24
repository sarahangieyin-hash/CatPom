import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.POSTGRES_SSL ? { rejectUnauthorized: false } : false
});

export const pgDb = {
    connect: async () => {
        await pool.query("SELECT 1");
        return true;
    },

    get: async (key, defaultValue = null) => {
        const result = await pool.query(
            "SELECT value FROM bot_storage WHERE key = $1",
            [key]
        );

        if (result.rows.length === 0) {
            return defaultValue;
        }

        return result.rows[0].value;
    },

    set: async (key, value) => {
        await pool.query(
            `
            INSERT INTO bot_storage (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key)
            DO UPDATE SET value = EXCLUDED.value
            `,
            [key, value]
        );

        return true;
    },

    delete: async (key) => {
        await pool.query(
            "DELETE FROM bot_storage WHERE key = $1",
            [key]
        );

        return true;
    },

    list: async (prefix) => {
        const result = await pool.query(
            "SELECT key FROM bot_storage WHERE key LIKE $1",
            [`${prefix}%`]
        );

        return result.rows.map(row => row.key);
    },

    query: async (text, params = []) => {
        return pool.query(text, params);
    },

    insertVerificationAudit: async (record) => {
        return true;
    }
};
