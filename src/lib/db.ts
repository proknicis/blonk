import mysql from 'mysql2/promise';

// Create the connection pool
export const pool = mysql.createPool(process.env.DATABASE_URL!);

// For backward compatibility and easier transition
export const db = pool;

// Mocking some common prisma-like interface if needed,
// but it's better to use raw SQL now as requested.
