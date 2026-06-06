const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, permitOnly } = require('../middleware/auth');

// corrige p verificação pelo restaurante.id
router.post('/', authenticateToken, permitOnly(['cliente']), async (req, res) => {
  const { restaurante_id, itens, endereco_entrega } = req.body;
  const cliente_id = req.user.id;

  if (!restaurante_id || !itens || !Array.isArray(itens) || itens.length === 0 || !endereco_entrega) {
    return res.status(400).json({ error: 'restaurante_id, itens (array) e endereco_entrega são obrigatórios.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const restCheck = await client.query('SELECT id FROM restaurantes WHERE id = $1', [restaurante_id]);
    if (restCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    let total = 0;
    const itemsWithDetails = [];

    for (const item of itens) {
      const { produto_id, quantidade } = item;
      if (!produto_id || !quantidade || quantidade <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cada item deve ter produto_id e quantidade maior que 0.' });
      }

      const prodCheck = await client.query(
        'SELECT id, preco, restaurante_id FROM produtos WHERE id = $1 AND ativo = true',
        [produto_id]
      );

      if (prodCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Produto ID ${produto_id} não encontrado ou inativo.` });
      }

      const produto = prodCheck.rows[0];
      if (produto.restaurante_id !== parseInt(restaurante_id)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Produto ID ${produto_id} não pertence ao restaurante informado.` });
      }

      const precoUnitario = parseFloat(produto.preco);
      total += precoUnitario * quantidade;

      itemsWithDetails.push({
        produto_id,
        quantidade,
        preco_unitario: precoUnitario
      });
    }

    const orderInsertQuery = `
      INSERT INTO pedidos (cliente_id, restaurante_id, status, total, endereco_entrega)
      VALUES ($1, $2, 'pendente', $3, $4)
      RETURNING id, status, total, endereco_entrega, criado_em
    `;
    const orderResult = await client.query(orderInsertQuery, [cliente_id, restaurante_id, total, endereco_entrega]);
    const pedido = orderResult.rows[0];

    const itemInsertQuery = `
      INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario)
      VALUES ($1, $2, $3, $4)
    `;
    for (const details of itemsWithDetails) {
      await client.query(itemInsertQuery, [pedido.id, details.produto_id, details.quantidade, details.preco_unitario]);
    }

    await client.query('COMMIT');

    return res.status(201).json({
      ...pedido,
      itens: itemsWithDetails
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao realizar checkout do pedido:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
});

// GET /pedidos -> Listar pedidos (Cliente ou Restaurante)
router.get('/', authenticateToken, async (req, res) => {
  const { id, tipo } = req.user;
  try {
    let queryText = '';
    const values = [id];

    if (tipo === 'cliente') {
      queryText = `
        SELECT p.id, p.status, p.total, p.endereco_entrega, p.criado_em,
               r.nome AS restaurante_nome
        FROM pedidos p
        JOIN restaurantes r ON p.restaurante_id = r.id
        WHERE p.cliente_id = $1
        ORDER BY p.criado_em DESC
      `;
    } else if (tipo === 'restaurante') {
      queryText = `
        SELECT p.id, p.status, p.total, p.endereco_entrega, p.criado_em,
               u.nome AS cliente_nome
        FROM pedidos p
        JOIN usuarios u ON p.cliente_id = u.id
        JOIN restaurantes r ON p.restaurante_id = r.id
        WHERE r.usuario_id = $1
        ORDER BY p.criado_em DESC
      `;
    }

    const result = await db.query(queryText, values);
    return res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// faz join com restaurantes
// ownership do restaurante é verificada via query ao invés de comparar direto por id
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userTipo = req.user.tipo;

  try {
    const orderQuery = `
      SELECT p.id, p.cliente_id, p.restaurante_id, p.status, p.total, p.endereco_entrega, p.criado_em,
             c.nome AS cliente_nome, r.nome AS restaurante_nome
      FROM pedidos p
      JOIN usuarios c ON p.cliente_id = c.id
      JOIN restaurantes r ON p.restaurante_id = r.id
      WHERE p.id = $1
    `;
    const orderResult = await db.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const pedido = orderResult.rows[0];

    if (userTipo === 'cliente' && pedido.cliente_id !== userId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }
    if (userTipo === 'restaurante') {
      const restCheck = await db.query('SELECT id FROM restaurantes WHERE id = $1 AND usuario_id = $2', [pedido.restaurante_id, userId]);
      if (restCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
    }

    const itemsQuery = `
      SELECT pi.id, pi.produto_id, pi.quantidade, pi.preco_unitario,
             prod.nome AS produto_nome
      FROM pedido_itens pi
      JOIN produtos prod ON pi.produto_id = prod.id
      WHERE pi.pedido_id = $1
    `;
    const itemsResult = await db.query(itemsQuery, [id]);

    return res.json({
      ...pedido,
      itens: itemsResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// PUT /pedidos/:id/status -> Atualizar status do pedido (Apenas restaurante do pedido)
router.put('/:id/status', authenticateToken, permitOnly(['restaurante']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const restaurante_id = req.user.id;

  const validStatuses = ['pendente', 'preparando', 'em_entrega', 'entregue', 'cancelado'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Deve ser um de: ${validStatuses.join(', ')}` });
  }

  try { // busca rest id via user id do token antes de veririfcar ownership
    const restCheck = await db.query('SELECT id FROM restaurantes WHERE usuario_id = $1', [restaurante_id]);
    if (restCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Acesso negado. Restaurante não encontrado.' });
    }
    const restauranteId = restCheck.rows[0].id;

    const orderCheck = await db.query('SELECT restaurante_id FROM pedidos WHERE id = $1', [id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    if (orderCheck.rows[0].restaurante_id !== restauranteId) {
      return res.status(403).json({ error: 'Acesso negado. Este pedido pertence a outro restaurante.' });
    }

    const queryText = `
      UPDATE pedidos
      SET status = $1
      WHERE id = $2
      RETURNING id, status, total, criado_em
    `;
    const result = await db.query(queryText, [status, id]);

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;