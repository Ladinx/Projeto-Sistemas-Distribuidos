const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// p cliente inse apenas em usuario e p restaurante faz nos dois
router.post('/register', async (req, res) => {
  const { nome, email, senha, tipo, descricao, categoria, endereco } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha, tipo' });
  }

  if (tipo !== 'cliente' && tipo !== 'restaurante') {
    return res.status(400).json({ error: "O tipo de usuário deve ser 'cliente' ou 'restaurante'" });
  }

  let client;
  try {
    client = await db.pool.connect();
    const userCheck = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    await client.query('BEGIN');

    const usuarioResult = await client.query(
      `INSERT INTO usuarios (nome, email, senha, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, tipo`,
      [nome, email, senhaHash, tipo]
    );
    const usuario = usuarioResult.rows[0];

    if (tipo === 'restaurante') {
      await client.query(
        `INSERT INTO restaurantes (usuario_id, nome, descricao, categoria, endereco)
         VALUES ($1, $2, $3, $4, $5)`,
        [usuario.id, nome, descricao || null, categoria || null, endereco || null]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json(usuario);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  } finally {
    if (client) client.release();
  }
});

// retorno limpo de login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios: email, senha' });
  }

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const usuario = result.rows[0];
    const match = await bcrypt.compare(senha, usuario.senha);
    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const usuarioResponse = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    };

    if (usuario.tipo === 'restaurante') {
      const restResult = await db.query(
        'SELECT descricao, categoria, endereco, foto_url FROM restaurantes WHERE usuario_id = $1',
        [usuario.id]
      );
      if (restResult.rows.length > 0) {
        Object.assign(usuarioResponse, restResult.rows[0]);
      }
    }

    return res.json({
      token,
      usuario: usuarioResponse
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// retorna dados do user logado a partir do token
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nome, email, tipo, criado_em FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const userData = result.rows[0];

    if (userData.tipo === 'restaurante') {
      const restResult = await db.query(
        'SELECT descricao, categoria, endereco, foto_url FROM restaurantes WHERE usuario_id = $1',
        [userData.id]
      );
      if (restResult.rows.length > 0) {
        Object.assign(userData, restResult.rows[0]);
      }
    }

    return res.json(userData);
  } catch (error) {
    console.error('Erro ao buscar usuário autenticado:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;