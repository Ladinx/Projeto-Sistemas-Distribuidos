# Documentação da API

Esta API foi desenvolvida em Node.js com Express e se comunica com um banco de dados PostgreSQL.

## Interface Interativa (Swagger)

A API possui documentação automática gerada através do Swagger. Nela, você pode visualizar todos os endpoints disponíveis, seus formatos de envio (Request Body), parâmetros necessários e respostas esperadas, além de poder testar as requisições diretamente pela interface.

### Como acessar o Swagger localmente:
1. Certifique-se de que o backend está rodando localmente (veja as instruções de inicialização no README principal).
2. Acesse a URL no seu navegador: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## Estrutura da API e Endpoints

Toda rota que exige autenticação requer o envio do token no cabeçalho HTTP da requisição:
`Authorization: Bearer <TOKEN_JWT>`

O Swagger divide os endpoints nas seguintes categorias:

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

---

## Como a documentação automática foi feita

A documentação automática utiliza as seguintes bibliotecas no diretório `/backend`:
- `swagger-jsdoc`: Permite escrever a especificação OpenAPI utilizando anotações JSDoc diretamente nos arquivos de rotas.
- `swagger-ui-express`: Renderiza a interface do Swagger UI a partir do JSON gerado, servindo-a em `/api-docs`.

A configuração do Swagger pode ser encontrada em `backend/src/swagger.js`.
