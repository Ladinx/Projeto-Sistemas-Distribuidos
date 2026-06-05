# Marketplace de Delivery (Nome a decidir)

Este é o repositório do projeto acadêmico de Programação Distribuída. O projeto consiste em um clone simplificado de um marketplace de delivery no modelo **SaaS**, implantado em nuvem pública (PaaS).

## Acesso Rápido (Produção)

O projeto está implantado e disponível nos seguintes links:
- **Frontend (Vercel):** https://projeto-sistemas-distribuidos.vercel.app/
- **Backend API (Railway):** projeto-sistemas-distribuidos-production.up.railway.app

---

## Estrutura do Repositório

- `/frontend`: Aplicação React + Vite (aponta para a URL do backend hospedado no Railway).
- `/backend`: API REST Express conectada ao PostgreSQL do Railway.

---

## Documentação da API

A documentação detalhada das rotas da API está disponível em:
- **[Documentação da API (api.md)](api.md)**

---

## Desenvolvimento Local / Setup de Teste (Opcional)

Caso queira executar os serviços localmente para fins de testes ou desenvolvimento, siga as instruções abaixo:

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

### Variáveis de Ambiente (Backend)
No arquivo `backend/.env`, certifique-se de configurar:
- `PORT`: Porta do servidor local (padrão: `5000`).
- `DATABASE_URL`: URI de conexão do PostgreSQL (ex: `postgresql://usuario:senha@localhost:5432/nome_banco`).
- `JWT_SECRET`: Chave secreta de assinatura do token JWT.
- `FRONTEND_URL`: URL da Vercel (em produção) ou localhost para liberação no CORS.
