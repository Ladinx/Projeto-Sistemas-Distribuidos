# Documentação da API

Esta API foi desenvolvida em Node.js com Express e se comunica com um banco de dados PostgreSQL.

## Estrutura da API e Endpoints

Toda rota que exige autenticação requer o envio do token no cabeçalho HTTP da requisição:
`Authorization: Bearer <TOKEN_JWT>`

### 1. Autenticação
- `POST /auth/register`: Cadastro de usuários (clientes ou restaurantes).
- `POST /auth/login`: Autenticação e geração do token JWT.

### 2. Restaurantes
- `GET /restaurantes`: Listagem de todos os restaurantes cadastrados.
- `GET /restaurantes/{id}`: Detalhes de um restaurante específico.
- `PUT /restaurantes/{id}`: Atualização dos dados do próprio restaurante (requer autenticação).

### 3. Produtos (Cardápio)
- `GET /restaurantes/{id}/produtos`: Lista os produtos/cardápio de um restaurante específico.
- `POST /restaurantes/{id}/produtos`: Adiciona um prato ao cardápio (requer autenticação como restaurante).
- `PUT /produtos/{id}`: Atualiza os dados de um prato (requer autenticação como o restaurante proprietário).
- `DELETE /produtos/{id}`: Remove um prato do cardápio (requer autenticação como o restaurante proprietário).

### 4. Pedidos
- `POST /pedidos`: Checkout / Criação de um novo pedido (requer autenticação como cliente).
- `GET /pedidos`: Listagem de pedidos associados ao usuário logado (cliente ou restaurante).
- `GET /pedidos/{id}`: Detalhes de um pedido específico (requer autenticação).
- `PUT /pedidos/{id}/status`: Atualização do status do pedido (requer autenticação como o restaurante proprietário).
