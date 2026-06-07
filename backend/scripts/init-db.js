require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const sqlPath = path.join(__dirname, '..', 'sql', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('ATENCAO: Isso vai DROPAR todas as tabelas existentes e recri-las.');
    console.log('Conectando ao banco...');
    await pool.query(sql);
    console.log('Schema aplicado com sucesso!');
  } catch (error) {
    console.error('Erro ao aplicar schema:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
