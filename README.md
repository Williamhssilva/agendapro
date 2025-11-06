# 🚀 AgendaPro — SaaS de Agendamentos (Multi-tenant)

Sistema de agendamento online para salões, barbearias e clínicas de estética.

### Estado Atual (MVP)
- **Admin**: Dashboard com calendário completo, agenda diária, cadastro/edição de serviços e profissionais, página de configurações (logo, cor, horários), Meu Plano (leitura), reagendamento e alteração de status.
- **Cliente**: Fluxo público de agendar com confirmação (em progresso final), APIs públicas de listagem.
- **Infra**: Supabase (Postgres + Storage), NextAuth v5, Prisma, Next.js App Router, Tailwind.
- **Resiliência**: Tratamento de P1001 (queda intermitente do DB) nas telas críticas, com fallback e aviso.

---

## 📦 Requisitos
- Node.js 18+ (recomendado 20+)
- npm
- Conta Supabase (gratuita)

---

## ⚙️ Setup Rápido

1) Instalar deps
```bash
cd agendapro
npm install
```

2) Criar `.env` (use `ENV_TEMPLATE.txt` como base)
```env
DATABASE_URL=postgresql://postgres.[PROJETO]:[SENHA]@aws-0-[REGIÃO].pooler.supabase.com:5432/postgres
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-com: openssl rand -base64 32
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3) Aplicar schema Prisma
```bash
npx prisma db push
npx prisma generate
```

4) Rodar
```bash
npm run dev
```

Abra `http://localhost:3000`.

---

## 🧭 Principais Telas e Rotas

- Admin
  - `/(admin)/dashboard` — visão geral + calendário (react-big-calendar) com eventos coloridos por status
  - `/(admin)/agenda` — agenda diária otimizada em paralelo e resiliente a P1001
  - `/(admin)/configuracoes` — logo (Supabase Storage), cor primária, horários de funcionamento
  - `/(admin)/meu-plano` — resumo de plano/limites e status de assinatura
- Cliente
  - `/(cliente)/agendar` — fluxo público de agendamento (confirmação em `/(cliente)/agendar/confirmacao`)
- Landing
  - `/` — página de vendas com seções de prova social e FAQ

---

## 🧠 Destaques Técnicos

- **Performance**: consultas paralelas com `Promise.all` e `Promise.allSettled`
- **Calendário**: `react-big-calendar` com PT-BR, responsivo, cores por status
- **Reagendamento**: `PATCH /api/agendamentos/[id]/reagendar` com transação serializável, `pg_advisory_xact_lock` e retry `P2034`
- **Status**: `PATCH /api/agendamentos/[id]/status`
- **Horários disponíveis**: `/api/horarios-disponiveis` com cache headers
- **P1001**: mapeado para HTTP 503 nas APIs públicas + fallback visual nas páginas críticas
- **Upload de logo**: `/api/upload/logo` (Supabase Storage), valida tamanho/tipo e persiste no `Estabelecimento`

---

## 🗃️ Modelos (Prisma)
Tabelas principais: `Estabelecimento`, `Plano`, `Usuario`, `Profissional`, `Servico`, `Cliente`, `Agendamento`, `Configuracao`.

Veja `prisma/schema.prisma` para índices e relacionamentos.

---

## 🔐 Variáveis de Ambiente Essenciais
- `DATABASE_URL` — string de conexão (Supabase, Session mode)
- `NEXTAUTH_URL` — URL do app (ex.: http://localhost:3000)
- `NEXTAUTH_SECRET` — secret seguro (32+ chars)
- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Storage + APIs públicas
- `SUPABASE_SERVICE_ROLE_KEY` — somente no servidor (uploads e tarefas server-side)

Dica: Evite aspas no `.env` para o Prisma (ver `DIAGNOSTICO_PROBLEMA.md`).

---

## 🧪 QA do MVP (checklist)
- Público (cliente)
  - [ ] Listar serviços e profissionais públicos (APIs 200 + caching)
  - [ ] Selecionar data/serviço/profissional e obter horários
  - [ ] Confirmar agendamento e ver tela de confirmação
- Admin
  - [ ] Ver calendário e eventos com status corretos
  - [ ] Reagendar (validações + conflitos)
  - [ ] Alterar status (Confirmar/Cancelamento)
  - [ ] Atualizar logo e cor e ver persistência
  - [ ] Ajustar horários de funcionamento e ver efeito nos horários disponíveis
- Confiabilidade
  - [ ] Simular P1001: páginas críticas continuam carregando com banner de aviso

---

## 🧰 Comandos Úteis
```bash
# Desenvolvimento
npm run dev

# Prisma / Banco
npm run db:push
npm run db:generate
npm run db:studio

# Produção (local)
npm run build && npm run start
```

---

## 🚀 Deploy

- **Vercel (recomendado p/ MVP)**: mais simples, escalável e sem manutenção de servidor
  - Configure as envs no dashboard da Vercel
  - Build: `next build` | Start: `next start`

- **VPS (Hostinger/HostGator/DO)**: custo menor e controle total
  - Siga `DEPLOY_VPS.md`
  - Inclui `ecosystem.config.js` (PM2), `nginx.conf.example`, `deploy.sh`

---

## 🐛 Troubleshooting

- **Prisma P1001 (DB indisponível)**:
  - Intermitente no Supabase; tratamos com fallback (503 nas APIs públicas e `Promise.allSettled` nas páginas críticas)
  - Verifique rede e variável `DATABASE_URL`

- **Supabase RLS aviso (public.Agendamento sem RLS)**:
  - É um warning do painel; como acessamos via servidor com Prisma, o controle é feito na aplicação (tenant-id)

- **Upload falha com XML/JSON inválido**:
  - Cheque `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

---

## 🧭 Roadmap Próximo (MVP)
- `mvp-cliente-flow-qa`: QA completo do fluxo público
- `mvp-public-apis`: confirmar headers multi-tenant e caching
- `mvp-confirmacao-ui`: finalizar tela de confirmação
- `mvp-logs-metricas`: logs mínimos + métricas de erro nas APIs
- `mvp-deploy-prod`: variáveis, build e políticas Supabase
- `mvp-doc-teste`: roteiro de teste + seed de homologação

---

**Status:** Em desenvolvimento ativo  
**Versão:** 0.1.0  
**Atualizado:** Nov 2025

