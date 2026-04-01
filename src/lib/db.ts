import { Pool, QueryResult, QueryResultRow } from 'pg';

let _pool: Pool | null = null;

function getPool(): Pool {
    if (!_pool) {
        const connectionString = process.env.DATABASE_URL;
        
        if (!connectionString) {
            throw new Error("[Database Initialization Failure] DATABASE_URL environment variable is not defined. Ensure your .env file is loaded and contains the correct institutional credentials.");
        }

        _pool = new Pool({
            connectionString: connectionString,
            // Institutional pool performance configuration
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
            ssl: false // Use true + CA if using managed/remote database
        });

        // Add a master error listener to prevent process crashes on dormant reconnect failures
        _pool.on('error', (err) => {
            console.error('[Sovereign DB Pool - Uncaught Error]', err);
        });
    }
    return _pool;
}

export const db = {
    /**
     * Executes a high-performance query and returns result rows
     */
    query: async <T extends QueryResultRow = any>(sql: string, values?: any[]): Promise<T[]> => {
        try {
            const pool = getPool();
            const res = await pool.query<T>(sql, values);
            return res.rows;
        } catch (error) {
            console.error('[Sovereign DB Query Trace]', { sql, values, error });
            throw error;
        }
    },

    /**
     * Executes an atomic state mutation (INSERT, UPDATE, DELETE)
     */
    execute: async (sql: string, values?: any[]): Promise<QueryResult> => {
        try {
            const pool = getPool();
            return await pool.query(sql, values);
        } catch (error) {
            console.error('[Sovereign DB Execution Trace]', { sql, values, error });
            throw error;
        }
    },

    /**
     * Reserves a dedicated client for sequential transactional operations
     */
    getClient: () => getPool().connect(),
};

export { db as pool };
