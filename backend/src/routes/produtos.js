const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, permitOnly } = require('../middleware/auth');

/**
 * @openapi
 * /produtos/{id}:
 *   put:
 *     tags: [Produtos]
 *     summary: Editar prato (autenticado, apenas restaurante dono)
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
 *               preco:
 *                 type: number
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       400:
 *         description: Nome e Preço são obrigatórios
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 */
router.put('/:id', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
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

/**
 * @openapi
 * /produtos/{id}:
 *   delete:
 *     tags: [Produtos]
 *     summary: Remover prato (autenticado, apenas restaurante dono)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Produto removido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 */
// tava retornando 200 c/ body, agr vai devolver 204 no contet
router.delete('/:id', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
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
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;

// reduzi p PUT e DELETE apenas
