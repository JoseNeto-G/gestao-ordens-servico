# Gestao de Ordens de Servico

Sistema web full-stack para gestao de ordens de servico: cadastro de clientes, abertura de chamados e acompanhamento de status. Projeto de portfolio construido com Node.js/Express no backend e React (Vite) no frontend.

## Stack

- **Backend:** Node.js, Express, better-sqlite3, JWT (jsonwebtoken), bcryptjs
- **Frontend:** React, Vite, axios

## Funcionalidades

- Autenticacao com login e token JWT
- Cadastro e listagem de clientes
- Abertura de ordens de servico vinculadas a um cliente
- Atualizacao de status da ordem (aberta, em andamento, concluida, cancelada)
- Painel com contadores por status

## Como rodar localmente

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed   # cria usuario admin e clientes de exemplo
npm run dev
```

A API sobe em `http://localhost:3333`. Usuario de teste apos o seed: `admin@exemplo.com` / `admin123`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173` e usa proxy para a API em `/api`.

## Estrutura

```
backend/
  src/
    routes/       # auth, clients, orders
    middleware/    # autenticacao JWT
    db.js          # setup do banco (SQLite)
    server.js       # entrada da aplicacao
frontend/
  src/
    pages/         # Login, Dashboard
    api.js         # instancia axios
    App.jsx
```

---

Desenvolvido por [Jose Neto](https://github.com/JoseNeto-G).
