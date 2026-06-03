# Marketplace de Delivery (Nome a decidir) — Backend API & Mono-repo

Este é o repositório do projeto acadêmico de Programação Distribuída / Computação em Nuvem. O projeto consiste em um clone simplificado de um marketplace de delivery no modelo **SaaS**, com backend em **Node.js + Express** (hospedado no Railway com PostgreSQL) e frontend em **React + Vite** (hospedado na Vercel).

## Estrutura do Repositório (Mono-repo)

- `/frontend`: Aplicação React + Vite (aponta para a URL do backend hospedado no Railway).
- `/backend`: API REST Express conectada ao PostgreSQL do Railway.

---

## Backend Setup & Desenvolvimento Local

### Pré-requisitos
- Node.js (v18 ou superior recomendado)
- Banco de dados PostgreSQL rodando localmente ou na nuvem

### Como Rodar o Backend
1. Entre na pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie e configure o arquivo `.env` com base no `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Ajuste a `DATABASE_URL` e `JWT_SECRET` conforme necessário.
4. Execute o servidor em modo de desenvolvimento (com auto-reload):
   ```bash
   npm run dev
   ```

---

## Variáveis de Ambiente (Backend)

No arquivo `.env`, certifique-se de configurar:
- `PORT`: Porta do servidor local (padrão: `5000`).
- `DATABASE_URL`: URI de conexão do PostgreSQL (ex: `postgresql://usuario:senha@localhost:5432/nome_banco`).
- `JWT_SECRET`: Chave secreta de assinatura do token JWT.
- `FRONTEND_URL`: URL da Vercel (em produção) para fins de liberação no CORS.

---

## Contrato da API (Rotas e Formatos)

Toda rota protegida requer o header: `Authorization: Bearer <TOKEN_JWT>`.

### 1. Autenticação

#### Registro de Usuário
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "nome": "João Restaurante",
    "email": "joao@restaurante.com",
    "senha": "senha_segura",
    "tipo": "restaurante", // "cliente" ou "restaurante"
    "descricao": "Melhor hambúrguer da cidade", // Opcional (restaurante)
    "categoria": "Hambúrgueres", // Opcional (restaurante)
    "endereco": "Rua das Flores, 123" // Opcional
  }
  ```
- **Retorno (201 Created):**
  ```json
  {
    "id": 1,
    "nome": "João Restaurante",
    "email": "joao@restaurante.com",
    "tipo": "restaurante",
    "descricao": "Melhor hambúrguer da cidade",
    "categoria": "Hambúrgueres",
    "endereco": "Rua das Flores, 123"
  }
  ```

#### Login de Usuário
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "joao@restaurante.com",
    "senha": "senha_segura"
  }
  ```
- **Retorno (200 OK):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "usuario": {
      "id": 1,
      "nome": "João Restaurante",
      "email": "joao@restaurante.com",
      "tipo": "restaurante",
      "descricao": "Melhor hambúrguer da cidade",
      "categoria": "Hambúrgueres",
      "endereco": "Rua das Flores, 123"
    }
  }
  ```

---

### 2. Restaurantes

#### Listar Restaurantes
- **GET** `/restaurantes`
- **Retorno (200 OK):** Array de restaurantes cadastrados (sem expor senhas).
  ```json
  [
    {
      "id": 1,
      "nome": "João Restaurante",
      "email": "joao@restaurante.com",
      "descricao": "Melhor hambúrguer da cidade",
      "categoria": "Hambúrgueres",
      "endereco": "Rua das Flores, 123",
      "criado_em": "2026-06-03T18:00:00.000Z"
    }
  ]
  ```

#### Detalhes de um Restaurante
- **GET** `/restaurantes/:id`
- **Retorno (200 OK):** Detalhes individuais do restaurante.

#### Atualizar Perfil de Restaurante (Autenticado, apenas o próprio restaurante)
- **PUT** `/restaurantes/:id`
- **Body:**
  ```json
  {
    "nome": "Novo Nome Restaurante",
    "descricao": "Nova descrição",
    "categoria": "Pizza",
    "endereco": "Av. Principal, 456"
  }
  ```
- **Retorno (200 OK):** Perfil atualizado.

---

### 3. Produtos (Cardápio)

#### Listar Cardápio de um Restaurante
- **GET** `/restaurantes/:id/produtos`
- **Retorno (200 OK):** Array de produtos cadastrados pelo restaurante.

#### Adicionar Prato ao Cardápio (Autenticado, apenas restaurante do ID correspondente)
- **POST** `/restaurantes/:id/produtos`
- **Body:**
  ```json
  {
    "nome": "Hambúrguer Duplo Cheddar",
    "descricao": "Pão, 2x carnes, muito cheddar e bacon",
    "preco": 32.90
  }
  ```
- **Retorno (201 Created):** Detalhes do produto criado.

#### Editar Prato (Autenticado, apenas restaurante dono do produto)
- **PUT** `/produtos/:id`
- **Body:**
  ```json
  {
    "nome": "Cheddar Burger Premium",
    "descricao": "Receita atualizada com molho especial",
    "preco": 35.90,
    "ativo": true
  }
  ```
- **Retorno (200 OK):** Produto atualizado.

#### Remover Prato (Autenticado, apenas restaurante dono do produto)
- **DELETE** `/produtos/:id`
- **Retorno (200 OK):** `{ "message": "Produto removido com sucesso." }`

---

### 4. Pedidos e Carrinho

*Nota: O carrinho de compras é gerenciado localmente no frontend via `localStorage`. A finalização do pedido envia os itens consolidados ao backend.*

#### Checkout / Finalizar Pedido (Autenticado, apenas usuário "cliente")
- **POST** `/pedidos`
- **Body:**
  ```json
  {
    "restaurante_id": 1,
    "endereco_entrega": "Rua Salvador, 45 - Apto 302",
    "itens": [
      {
        "produto_id": 4,
        "quantidade": 2
      },
      {
        "produto_id": 5,
        "quantidade": 1
      }
    ]
  }
  ```
- **Retorno (201 Created):**
  ```json
  {
    "id": 10,
    "status": "pendente",
    "total": 98.70,
    "endereco_entrega": "Rua Salvador, 45 - Apto 302",
    "criado_em": "2026-06-03T18:30:00.000Z",
    "itens": [
      {
        "produto_id": 4,
        "quantidade": 2,
        "preco_unitario": 32.90
      },
      {
        "produto_id": 5,
        "quantidade": 1,
        "preco_unitario": 32.90
      }
    ]
  }
  ```

#### Listar Pedidos (Autenticado, Cliente ou Restaurante)
- **GET** `/pedidos`
- **Retorno (200 OK):** Retorna os pedidos relacionados à conta logada (se cliente, mostra nome do restaurante; se restaurante, mostra nome do cliente).

#### Detalhes do Pedido (Autenticado, Cliente ou Restaurante proprietário do pedido)
- **GET** `/pedidos/:id`
- **Retorno (200 OK):** Detalhes completos do pedido, incluindo lista de itens com seus nomes e preços unitários na época da compra.

#### Atualizar Status do Pedido (Autenticado, apenas Restaurante dono do pedido)
- **PUT** `/pedidos/:id/status`
- **Body:**
  ```json
  {
    "status": "preparando" // "pendente", "preparando", "em_entrega", "entregue", "cancelado"
  }
  ```
- **Retorno (200 OK):** Pedido atualizado com o novo status.
