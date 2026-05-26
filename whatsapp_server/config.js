/**
 * ============================================================================
 * DATABASE CONFIGURATION
 * ============================================================================
 * Establishes a highly efficient PostgreSQL connection pool using the pg package.
 * Automatically loads credentials from .env and enables SSL.
 * ============================================================================
 */

import pkg from 'pg';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ [Database Config] DATABASE_URL is not set. Please create a .env file.");
}

export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,                 // Maximum number of clients in the pool
  idleTimeoutMillis: 30000 // Close idle clients after 30 seconds
});

// Test connection instantly
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ [Database Config] Connection test failed:', err.message);
  } else {
    console.log('✅ [Database Config] Supabase Postgres connected successfully at:', res.rows[0].now);
  }
});
