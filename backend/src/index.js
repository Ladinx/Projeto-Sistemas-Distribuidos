require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

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
const produtoRoutes = require('./routes/produtos');
const pedidoRoutes = require('./routes/pedidos');

app.use('/auth', authRoutes);
app.use('/restaurantes', restauranteRoutes);
app.use('/', produtoRoutes);
app.use('/pedidos', pedidoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
