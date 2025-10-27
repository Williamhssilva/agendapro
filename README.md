# 🚀 AgendaPro - Sistema SaaS Multi-Tenant

Sistema de agendamento online para salões, barbearias e clínicas de estética.

## 📋 Pré-requisitos

- Node.js 18+ (você tem v22 ✅)
- npm ou yarn
- Conta Supabase (grátis)

## 🛠️ Setup Inicial

### 1. Instalar dependências

```bash
cd agendapro
npm install
```

### 2. Configurar Banco de Dados (Supabase)

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta (se não tiver)
3. Crie um novo projeto
4. Copie a `DATABASE_URL` em Settings → Database → Connection String
   - Use o mode "Session" não "Transaction"
   - Formato: `postgresql://postgres.[PROJETO]:[SENHA]@aws-0-[REGIÃO].pooler.supabase.com:5432/postgres`

### 3. Criar arquivo .env

Crie um arquivo `.env` na raiz com:

```env
# Database (Supabase)
DATABASE_URL="cole-sua-url-aqui"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-com: openssl rand -base64 32"

# Mercado Pago (depois)
MERCADOPAGO_ACCESS_TOKEN=""
MERCADOPAGO_PUBLIC_KEY=""

# SendGrid (depois)
SENDGRID_API_KEY=""
SENDGRID_FROM_EMAIL="noreply@agendapro.com.br"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Aplicar Schema no Banco

```bash
npx prisma db push
```

### 5. Popular banco com dados de exemplo

```bash
npx prisma db seed
```

### 6. Rodar o projeto

```bash
npm run dev
```

Abra: [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
agendapro/
├── prisma/
│   ├── schema.prisma       # Modelo de dados multi-tenant
│   └── seed.ts             # Dados iniciais
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/         # Componentes React
│   ├── lib/                # Utilities
│   │   ├── prisma.ts       # Prisma Client
│   │   └── utils.ts        # Helper functions
│   └── middleware.ts       # Tenant detection (próximo)
├── public/                 # Assets estáticos
├── .env                    # Variáveis de ambiente
├── package.json
└── README.md
```

## 🎯 Decisões Técnicas Tomadas

- ✅ **Multi-tenancy:** Row-Level Security
- ✅ **Auth:** NextAuth.js v5
- ✅ **Database:** Supabase PostgreSQL
- ✅ **Payments:** Mercado Pago
- ✅ **Storage:** Supabase Storage
- ✅ **Tenant Detection:** Subdomain
- ✅ **Escopo:** MVP Completo (12 semanas)

## 📊 Schema do Banco

### Tabelas Principais:

- `Estabelecimento` - Cada salão/barbearia (tenant)
- `Plano` - Básico, Profissional, Premium
- `Usuario` - Donos/admins do estabelecimento
- `Profissional` - Cabeleireiras, barbeiros, etc
- `Servico` - Corte, barba, manicure, etc
- `Cliente` - Clientes finais
- `Agendamento` - Bookings
- `Configuracao` - Settings por estabelecimento

## 🚀 Próximos Passos

1. [ ] Implementar autenticação (NextAuth)
2. [ ] Criar middleware de tenant detection
3. [ ] Implementar CRUD de serviços
4. [ ] Implementar CRUD de profissionais
5. [ ] Sistema de agendamento (admin)
6. [ ] Sistema de agendamento (cliente)
7. [ ] Integração Mercado Pago
8. [ ] Notificações email
9. [ ] WhatsApp (Evolution API)
10. [ ] Deploy

## 📚 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Rodar servidor dev

# Banco de dados
npm run db:push          # Aplicar schema
npm run db:studio        # Interface visual do banco
npm run db:seed          # Popular dados de exemplo
npm run db:generate      # Gerar Prisma Client

# Build
npm run build            # Build para produção
npm run start            # Rodar produção
```

## 🎓 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [NextAuth Docs](https://authjs.dev)

## 📝 Notas

- Multi-tenancy implementado via `tenant_id` em todas as tabelas
- Subdomain detection para identificar tenant
- White-label suportado (logo + cor primária)
- Trial de 14 dias padrão para novos estabelecimentos

---

**Status:** 🏗️ Em Desenvolvimento  
**Versão:** 0.1.0  
**Última atualização:** Outubro 2025

