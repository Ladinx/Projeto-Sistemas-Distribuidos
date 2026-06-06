const { Pool } = require('pg');
require('dotenv').config();

// guard
// se o url n estiver no env encerra auto
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida! Verifique o .env');
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('railway');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  }
  release();
  console.log('Conexão com o banco de dados estabelecida com sucesso!!.');
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query
};