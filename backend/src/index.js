require('dotenv').config();
const express = require('express');
const cors = require('cors');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET não configurado. Defina a variável no arquivo .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
  console.warn('[FRONTEND_URL não definida. Requisições do frontend serão bloqueadas em produção.');
}

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Acesso não permitido pelo CORS'), false);
  },
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const authRoutes = require('./routes/auth');
const restauranteRoutes = require('./routes/restaurantes');
const cardapioRoutes = require('./routes/cardapio');
const produtoRoutes = require('./routes/produtos');
const pedidoRoutes = require('./routes/pedidos');
const pagamentoRoutes = require('./routes/pagamentos');

app.use('/auth', authRoutes);
app.use('/restaurantes', restauranteRoutes);
app.use('/restaurantes', cardapioRoutes);
app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/pagamentos', pagamentoRoutes);

app.listen(PORT, () => {
  console.log(`[server] Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV || 'development'}`);
});