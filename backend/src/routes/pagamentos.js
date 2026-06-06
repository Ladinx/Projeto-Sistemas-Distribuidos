const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, permitOnly } = require('../middleware/auth');

/**
 * @openapi
 * /pagamentos/{pedidoId}:
 *   post:
 *     tags: [Pagamentos]
 *     summary: Simular pagamento de um pedido (autenticado, apenas cliente dono)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoId
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
 *               - metodo
 *             properties:
 *               metodo:
 *                 type: string
 *                 enum: [cartao_credito, cartao_debito, pix]
 *                 example: "pix"
 *     responses:
 *       201:
 *         description: Pagamento aprovado e pedido atualizado para 'preparando'
 *       400:
 *         description: Método de pagamento inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Pedido não encontrado
 *       409:
 *         description: Pedido já possui pagamento registrado
 */
router.post('/:pedidoId', authenticateToken, permitOnly(['cliente']), async (req, res) => {
  const { pedidoId } = req.params;
  const { metodo } = req.body;
  const cliente_id = req.user.id;

  const metodosValidos = ['cartao_credito', 'cartao_debito', 'pix'];
  if (!metodo || !metodosValidos.includes(metodo)) {
    return res.status(400).json({ error: `Método inválido. Deve ser um de: ${metodosValidos.join(', ')}` });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const pedidoCheck = await client.query(
      'SELECT id, cliente_id, status FROM pedidos WHERE id = $1',
      [pedidoId]
    );
    if (pedidoCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const pedido = pedidoCheck.rows[0];

    if (pedido.cliente_id !== cliente_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Acesso negado. Este pedido pertence a outro cliente.' });
    }

    const pagamentoExistente = await client.query(
      'SELECT id FROM pagamentos WHERE pedido_id = $1',
      [pedidoId]
    );
    if (pagamentoExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Este pedido já possui um pagamento registrado.' });
    }

    const pagamentoResult = await client.query(
      `INSERT INTO pagamentos (pedido_id, status, metodo)
       VALUES ($1, 'aprovado', $2)
       RETURNING id, pedido_id, status, metodo, simulado_em`,
      [pedidoId, metodo]
    );

    await client.query(
      `UPDATE pedidos SET status = 'preparando' WHERE id = $1`,
      [pedidoId]
    );

    await client.query('COMMIT');

    return res.status(201).json(pagamentoResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao processar pagamento:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
});

/**
 * @openapi
 * /pagamentos/{pedidoId}:
 *   get:
 *     tags: [Pagamentos]
 *     summary: Consultar pagamento de um pedido (autenticado, cliente ou restaurante dono)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do pagamento
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Pedido ou pagamento não encontrado
 */
router.get('/:pedidoId', authenticateToken, async (req, res) => {
  const { pedidoId } = req.params;
  const { id: userId, tipo } = req.user;

  try {
    const pedidoCheck = await db.query(
      'SELECT id, cliente_id, restaurante_id FROM pedidos WHERE id = $1',
      [pedidoId]
    );
    if (pedidoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const pedido = pedidoCheck.rows[0];

    if (tipo === 'cliente' && pedido.cliente_id !== userId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    if (tipo === 'restaurante') {
      const restCheck = await db.query(
        'SELECT id FROM restaurantes WHERE id = $1 AND usuario_id = $2',
        [pedido.restaurante_id, userId]
      );
      if (restCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
    }

    const pagamentoResult = await db.query(
      'SELECT id, pedido_id, status, metodo, simulado_em FROM pagamentos WHERE pedido_id = $1',
      [pedidoId]
    );
    if (pagamentoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum pagamento encontrado para este pedido.' });
    }

    return res.json(pagamentoResult.rows[0]);
  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;