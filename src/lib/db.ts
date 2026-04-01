import { Pool, QueryResult, QueryResultRow } from 'pg';

let _pool: Pool | null = null;

function getPool(): Pool {
    if (!_pool) {
        _pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            // Add some standard pool settings
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }
    return _pool;
}

export const db = {
    /**
     * Executes a query and returns the rows
     */
    query: async <T extends QueryResultRow = any>(sql: string, values?: any[]): Promise<T[]> => {
        const pool = getPool();
        const res = await pool.query<T>(sql, values);
        return res.rows;
    },

    /**
     * Executes a command (INSERT, UPDATE, DELETE) and returns the result metadata
     */
    execute: async (sql: string, values?: any[]): Promise<QueryResult> => {
        const pool = getPool();
        return pool.query(sql, values);
    },

    /**
     * Get a connection from the pool for transactions
     */
    getClient: () => getPool().connect(),
};

export { db as pool };
