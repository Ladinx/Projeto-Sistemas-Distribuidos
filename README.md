# Marketplace de Delivery (Nome a decidir)

Este é o repositório do projeto acadêmico de Programação Distribuída. O projeto consiste em um clone simplificado de um marketplace de delivery no modelo **SaaS**, com backend em **Node.js + Express** (hospedado no Railway com PostgreSQL) e frontend em **React + Vite** (hospedado na Vercel).

## Estrutura do Repositório

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

## Documentação da API & Swagger

A documentação detalhada das rotas da API, incluindo formatos de requisição, respostas e a interface interativa do Swagger, foi movida para um arquivo dedicado:

- **[Documentação da API (api.md)](file:///home/ladinx/Documentos/sistemas_distribuidos/Projeto/api.md)**

### Acesso rápido ao Swagger:
Quando o backend estiver rodando, você pode acessar a interface interativa do Swagger em:
- [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

