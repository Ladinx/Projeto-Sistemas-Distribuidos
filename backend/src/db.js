const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('railway');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query
};
