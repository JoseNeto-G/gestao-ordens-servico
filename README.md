# Gestao de Ordens de Servico + CRM

Sistema web full-stack de gestao para pequenas e medias empresas: cadastro de clientes, funil de vendas (CRM), historico de interacoes, abertura de chamados e acompanhamento de ordens de servico. Projeto de portfolio construido com Node.js/Express no backend e React (Vite) no frontend, cobrindo tanto o modulo operacional (ordens de servico) quanto o modulo comercial (CRM/pipeline), como um mini ERP.

## Stack

- **Backend:** Node.js, Express, better-sqlite3, JWT (jsonwebtoken), bcryptjs
- **Frontend:** React, Vite, axios

## Funcionalidades

### Ordens de servico

- Autenticacao com login e token JWT
- Abertura de ordens de servico vinculadas a um cliente
- Atualizacao de status da ordem (aberta, em andamento, concluida, cancelada)
- Painel com contadores por status

### CRM / Funil de clientes

- Cadastro de clientes com etapas de funil (lead, em negociacao, ativo, inativo)
- Board estilo kanban para mover clientes entre as etapas
- Historico de interacoes por cliente (ligacao, e-mail, WhatsApp, reuniao, nota)
- Registro rapido de novas interacoes direto pelo perfil do cliente

## Como rodar localmente

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed   # cria usuario admin, clientes e interacoes de exemplo
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
    routes/       # auth, clients (CRM + pipeline), orders
    middleware/    # autenticacao JWT
    db.js          # setup do banco (SQLite)
    server.js       # entrada da aplicacao
frontend/
  src/
    pages/         # Login, Dashboard (ordens), Pipeline (CRM)
    api.js         # instancia axios
    App.jsx         # navegacao entre ordens de servico e CRM
```

## Endpoints principais

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/api/clients/pipeline` | Clientes agrupados por etapa do funil |
| PATCH | `/api/clients/:id/status` | Move o cliente entre as etapas (lead, em_negociacao, ativo, inativo) |
| GET | `/api/clients/:id/interactions` | Historico de interacoes do cliente |
| POST | `/api/clients/:id/interactions` | Registra uma nova interacao (ligacao, e-mail, WhatsApp, reuniao, nota) |
| PATCH | `/api/orders/:id/status` | Atualiza o status de uma ordem de servico |

---

Desenvolvido por [Jose Neto](https://github.com/JoseNeto-G).
