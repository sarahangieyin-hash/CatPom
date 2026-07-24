import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.POSTGRES_SSL ? { rejectUnauthorized: false } : false
});

export const pgDb = {
    query: async (text, params = []) => {
        const result = await pool.query(text, params);
        return result;
    },

    connect: async () => {
        await pool.query("SELECT 1");
        return true;
    },

    insertVerificationAudit: async (record) => {
        await pool.query(
            `INSERT INTO verification_audit (data)
             VALUES ($1)`,
            [record]
        );
        return true;
    }
};
