const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, permitOnly } = require('../middleware/auth');

// join entre restaurante e user, retorna url da pfp tbm
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.nome, u.email, r.descricao, r.endereco, r.foto_url, r.criado_em
       FROM restaurantes r
       JOIN usuarios u ON r.usuario_id = u.id
       ORDER BY r.nome ASC`
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
      `SELECT r.id, r.nome, u.email, r.descricao, r.endereco, r.foto_url, r.criado_em, r.usuario_id
       FROM restaurantes r
       JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.id = $1`,
      [id]
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

// correção da verificação de ownership
router.put('/:id', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, endereco } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'O nome é obrigatório.' });
  }

  try {
    const restCheck = await db.query(
      'SELECT id FROM restaurantes WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );
    if (restCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acesso negado. Não é permitido editar outros perfis.' });
    }

    const queryText = `
      UPDATE restaurantes
      SET nome = $1, descricao = $2, endereco = $3
      WHERE id = $4
      RETURNING id, nome, descricao, endereco, foto_url
    `;
    const values = [nome, descricao || null, endereco || null, id];
    const result = await db.query(queryText, values);

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar restaurante:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;