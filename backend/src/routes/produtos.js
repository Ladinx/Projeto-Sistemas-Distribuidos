const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, permitOnly } = require('../middleware/auth');

// GET /restaurantes/:id/produtos -> Lista o cardápio
router.get('/restaurantes/:id/produtos', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT id, nome, descricao, preco, ativo, criado_em FROM produtos WHERE restaurante_id = $1 ORDER BY criado_em DESC',
      [id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos do restaurante:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// POST /restaurantes/:id/produtos -> Adicionar prato
router.post('/restaurantes/:id/produtos', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco } = req.body;

  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado. Não é permitido adicionar produtos para outro restaurante.' });
  }

  if (!nome || preco === undefined) {
    return res.status(400).json({ error: 'Nome e Preço são obrigatórios.' });
  }

  try {
    const queryText = `
      INSERT INTO produtos (restaurante_id, nome, descricao, preco)
      VALUES ($1, $2, $3, $4)
      RETURNING id, restaurante_id, nome, descricao, preco, ativo, criado_em
    `;
    const values = [id, nome, descricao || null, preco];
    const result = await db.query(queryText, values);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// PUT /produtos/:id -> Editar prato
router.put('/produtos/:id', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, ativo } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({ error: 'Nome e Preço são obrigatórios.' });
  }

  try {
    const prodCheck = await db.query('SELECT restaurante_id FROM produtos WHERE id = $1', [id]);
    if (prodCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    if (prodCheck.rows[0].restaurante_id !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado. Este produto pertence a outro restaurante.' });
    }

    const queryText = `
      UPDATE produtos
      SET nome = $1, descricao = $2, preco = $3, ativo = $4
      WHERE id = $5
      RETURNING id, restaurante_id, nome, descricao, preco, ativo, criado_em
    `;
    const values = [nome, descricao || null, preco, ativo !== undefined ? ativo : true, id];
    const result = await db.query(queryText, values);

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao editar produto:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// DELETE /produtos/:id -> Remover prato
router.delete('/produtos/:id', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
  const { id } = req.params;

  try {
    const prodCheck = await db.query('SELECT restaurante_id FROM produtos WHERE id = $1', [id]);
    if (prodCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    if (prodCheck.rows[0].restaurante_id !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado. Este produto pertence a outro restaurante.' });
    }

    await db.query('DELETE FROM produtos WHERE id = $1', [id]);
    return res.json({ message: 'Produto removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;
