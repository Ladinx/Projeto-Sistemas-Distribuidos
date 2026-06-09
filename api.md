# Documentação da API

Esta API foi desenvolvida em Node.js com Express e se comunica com um banco de dados PostgreSQL.

## Estrutura da API e Endpoints

Toda rota que exige autenticação requer o envio do token no cabeçalho HTTP da requisição:
`Authorization: Bearer <TOKEN_JWT>`

### 1. Autenticação
- `POST /auth/register`: Cadastro de usuários (clientes ou restaurantes).
- `POST /auth/login`: Autenticação e geração do token JWT.
- `GET /auth/me`: Retorna dados do usuário autenticado a partir do token (requer autenticação).
- `PUT /auth/profile`: Atualiza o perfil do usuário logado (nome, foto_url; restaurantes também atualizam descricao e endereço). Requer autenticação.

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
- `GET /pedidos/mais-pedidos`: Lista os produtos mais pedidos pelo cliente logado (requer autenticação).

### 5. Pagamentos
- `POST /pagamentos/{pedidoId}`: Simula o pagamento de um pedido (requer autenticação como cliente dono). Status do pedido alterado para 'preparando'.
- `GET /pagamentos/{pedidoId}`: Consulta o status do pagamento (requer autenticação como cliente dono ou restaurante do pedido).

### 6. Upload
- `POST /upload`: Faz upload de uma imagem e retorna a URL hospedada. Enviar como multipart/form-data no campo 'image' (requer autenticação).
