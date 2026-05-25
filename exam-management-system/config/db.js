const { Pool } = require('pg');
require('dotenv').config();

// Create a Pool using the DATABASE_URL from Neon
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    
    // Neon DB requires SSL to connect securely
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the connection
pool.on('connect', () => {
    console.log('✅ Connected to Neon PostgreSQL database successfully!');
});

// Handle connection errors
pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

// Export the pool so other files can use it
module.exports = pool;