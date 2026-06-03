const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Registro
router.post('/register', async (req, res) => {
  const { nome, email, senha, tipo, descricao, categoria, endereco } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha, tipo' });
  }

  if (tipo !== 'cliente' && tipo !== 'restaurante') {
    return res.status(400).json({ error: "O tipo de usuário deve ser 'cliente' ou 'restaurante'" });
  }

  try {
    const userCheck = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const queryText = `
      INSERT INTO usuarios (nome, email, senha, tipo, descricao, categoria, endereco)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, nome, email, tipo, descricao, categoria, endereco
    `;
    const values = [nome, email, senhaHash, tipo, descricao || null, categoria || null, endereco || null];
    const result = await db.query(queryText, values);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Login
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
      process.env.JWT_SECRET || 'supersecretjwtkey123!@#',
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        descricao: usuario.descricao,
        categoria: usuario.categoria,
        endereco: usuario.endereco
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;
