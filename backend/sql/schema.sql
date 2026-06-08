-- PostgreSQL 14+
-- aplcar com: psql -U <user> -d <dbname> -f schema.sql

-- pgcrypto:gera UUIDs

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- limpeza p reexecutar em dev
-- em prod tem qusar migrations ao invés de recriar tudo

DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS pedido_itens CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS restaurantes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS tipo_usuario CASCADE;
DROP TYPE IF EXISTS status_pedido CASCADE;
DROP TYPE IF EXISTS status_pagamento CASCADE;
DROP TYPE IF EXISTS metodo_pagamento CASCADE;

-- /\/\ TIPOS ENUM
-- garante q valores invalidos sejam rejeitados pelo banco independente de validação no app
CREATE TYPE tipo_usuario AS ENUM ('cliente', 'restaurante');
CREATE TYPE status_pedido AS ENUM ('pendente', 'preparando', 'em_entrega', 'entregue', 'cancelado');
CREATE TYPE status_pagamento AS ENUM ('pendente', 'aprovado', 'recusado');
CREATE TYPE metodo_pagamento AS ENUM ('cartao_credito', 'cartao_debito', 'pix', 'dinheiro');

-- /\/\ USUARIOS
-- centraliza os clientes e os restaurantes 
CREATE TABLE  usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha TEXT NOT NULL, -- BCRYPT HASH
  tipo tipo_usuario NOT NULL,
  foto_url TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- idx p buscas por email e listagem por tipo
CREATE INDEX idx_users_email ON usuarios (email);
CREATE INDEX idx_users_tipo ON usuarios (tipo);

-- /\/\ RESTAURANTES
CREATE TABLE restaurantes (
  id          SERIAL        PRIMARY KEY,
  usuario_id  INTEGER       NOT NULL UNIQUE REFERENCES usuarios (id) ON DELETE CASCADE,
  nome        VARCHAR(150)  NOT NULL,
  descricao   TEXT,
  endereco    VARCHAR(255),
  foto_url    TEXT,
  criado_em   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_restaurantes_usuario ON restaurantes (usuario_id);

-- /\/\ PRODUTOS
CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
  foto_url TEXT, -- url no s3 (i guess)
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_produtos_restaurante ON produtos (restaurante_id);
CREATE INDEX idx_produtos_ativo ON produtos (restaurante_id, ativo);

-- /\/\ PEDIDOS
CREATE TABLE pedidos(
  id  SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
  restaurante_id INTEGER NOT NULL REFERENCES restaurantes (id) ON DELETE RESTRICT,
  status status_pedido NOT NULL DEFAULT 'pendente',
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  endereco_entrega VARCHAR(255) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);
CREATE INDEX idx_pedidos_restaurante ON pedidos (restaurante_id);
CREATE INDEX idx_pedidos_status ON pedidos (status);

-- /\/\ PEDIDO ITEms
CREATE TABLE pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos  (id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos (id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(10, 2) NOT NULL CHECK (preco_unitario >= 0)
);
 
CREATE INDEX idx_pedido_itens_pedido ON pedido_itens (pedido_id);
CREATE INDEX idx_pedido_itens_produto ON pedido_itens (produto_id);

-- /\/\ PAGAMENTOS
CREATE TABLE pagamentos (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL UNIQUE REFERENCES pedidos (id) ON DELETE CASCADE,
  status status_pagamento NOT NULL DEFAULT 'pendente',
  metodo metodo_pagamento NOT NULL,
  simulado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pagamentos_pedido ON pagamentos (pedido_id);
CREATE INDEX idx_pagamentos_status ON pagamentos (status);