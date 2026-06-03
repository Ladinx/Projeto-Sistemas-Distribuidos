const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('railway');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

const query = (text, params) => pool.query(text, params);

const initializeDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('Database schema initialized/verified successfully.');
    } else {
      console.warn('schema.sql not found, skipping db initialization script.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  pool,
  query,
  initializeDatabase
};
