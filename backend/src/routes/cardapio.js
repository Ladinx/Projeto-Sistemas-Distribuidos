const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, permitOnly } = require('../middleware/auth');

/**
 * @openapi
 * /restaurantes/{id}/produtos:
 *   get:
 *     tags: [Cardápio]
 *     summary: Listar cardápio de um restaurante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do restaurante
 *     responses:
 *       200:
 *         description: Array de produtos do restaurante
 */
router.get('/:id/produtos', async (req, res) => {
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

/**
 * @openapi
 * /restaurantes/{id}/produtos:
 *   post:
 *     tags: [Cardápio]
 *     summary: Adicionar prato ao cardápio (autenticado, apenas restaurante dono)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - preco
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Hambúrguer Duplo Cheddar"
 *               descricao:
 *                 type: string
 *                 example: "Pão, 2x carnes, muito cheddar e bacon"
 *               preco:
 *                 type: number
 *                 example: 32.90
 *     responses:
 *       201:
 *         description: Produto criado
 *       400:
 *         description: Nome e Preço são obrigatórios
 *       403:
 *         description: Acesso negado
 */
router.post('/:id/produtos', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({ error: 'Nome e Preço são obrigatórios.' });
  }

  try {
    const restCheck = await db.query(
      'SELECT id FROM restaurantes WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );
    if (restCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acesso negado. Não é permitido adicionar produtos para outro restaurante.' });
    }

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

module.exports = router;