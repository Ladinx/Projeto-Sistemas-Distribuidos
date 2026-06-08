const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, permitOnly } = require('../middleware/auth');

router.put('/:id', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, ativo, foto_url } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({ error: 'Nome e Preço são obrigatórios.' });
  }

  try {
    const prodCheck = await db.query(
      `SELECT p.id, r.usuario_id
       FROM produtos p
       JOIN restaurantes r ON p.restaurante_id = r.id
       WHERE p.id = $1`,
      [id]
    );
    if (prodCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    if (prodCheck.rows[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado. Este produto pertence a outro restaurante.' });
    }

    const queryText = `
      UPDATE produtos
      SET nome = $1, descricao = $2, preco = $3, ativo = $4, foto_url = $5
      WHERE id = $6
      RETURNING id, restaurante_id, nome, descricao, preco, foto_url, ativo, criado_em
    `;
    const values = [nome, descricao || null, preco, ativo !== undefined ? ativo : true, foto_url || null, id];
    const result = await db.query(queryText, values);

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao editar produto:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// tava retornando 200 c/ body, agr vai devolver 204 no contet
router.delete('/:id', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
  const { id } = req.params;

  try {
    const prodCheck = await db.query(
      `SELECT p.id, r.usuario_id
       FROM produtos p
       JOIN restaurantes r ON p.restaurante_id = r.id
       WHERE p.id = $1`,
      [id]
    );
    if (prodCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    if (prodCheck.rows[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado. Este produto pertence a outro restaurante.' });
    }

    await db.query('DELETE FROM produtos WHERE id = $1', [id]);
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;

// reduzi p PUT e DELETE apenas
