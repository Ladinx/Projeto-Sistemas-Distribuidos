const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, permitOnly } = require('../middleware/auth');

/**
 * @openapi
 * /restaurantes:
 *   get:
 *     tags: [Restaurantes]
 *     summary: Listar todos os restaurantes
 *     responses:
 *       200:
 *         description: Array de restaurantes cadastrados
 */
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

/**
 * @openapi
 * /restaurantes/{id}:
 *   get:
 *     tags: [Restaurantes]
 *     summary: Detalhes de um restaurante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do restaurante
 *     responses:
 *       200:
 *         description: Dados do restaurante
 *       404:
 *         description: Restaurante não encontrado
 */
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

/**
 * @openapi
 * /restaurantes/{id}:
 *   put:
 *     tags: [Restaurantes]
 *     summary: Atualizar perfil do restaurante (autenticado)
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
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               categoria:
 *                 type: string
 *               endereco:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *       400:
 *         description: Nome é obrigatório
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Restaurante não encontrado
 */
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
