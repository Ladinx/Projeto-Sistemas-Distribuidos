const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, permitOnly } = require('../middleware/auth');

// GET /restaurantes
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nome, email, descricao, categoria, endereco, criado_em FROM usuarios WHERE tipo = $1 ORDER BY nome ASC',
      ['restaurante']
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar restaurantes:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// GET /restaurantes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT id, nome, email, descricao, categoria, endereco, criado_em FROM usuarios WHERE id = $1 AND tipo = $2',
      [id, 'restaurante']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar restaurante por ID:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// PUT /restaurantes/:id
router.put('/:id', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, categoria, endereco } = req.body;

  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado. Não é permitido editar outros perfis.' });
  }

  if (!nome) {
    return res.status(400).json({ error: 'O nome é obrigatório.' });
  }

  try {
    const queryText = `
      UPDATE usuarios
      SET nome = $1, descricao = $2, categoria = $3, endereco = $4
      WHERE id = $5 AND tipo = 'restaurante'
      RETURNING id, nome, email, descricao, categoria, endereco
    `;
    const values = [nome, descricao || null, categoria || null, endereco || null, id];
    const result = await db.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar restaurante:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;
