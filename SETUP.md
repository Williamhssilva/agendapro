# 🚀 Setup do Projeto AgendaPro

## Guia passo a passo para rodar o projeto pela primeira vez

---

## ✅ Passo 1: Verificar Pré-requisitos

```bash
# Verificar Node.js (deve ser 18+)
node --version

# Verificar npm
npm --version
```

Se não tiver Node.js, baixe em: [nodejs.org](https://nodejs.org)

---

## ✅ Passo 2: Instalar Dependências

```bash
cd agendapro
npm install
```

Aguarde a instalação (~2-3 minutos).

---

## ✅ Passo 3: Criar Banco de Dados (Supabase)

### 3.1 Criar conta e projeto

1. Acesse: [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login (pode usar GitHub)
4. Clique em "New Project"
5. Preencha:
   - **Name:** agendapro-dev
   - **Database Password:** Crie uma senha forte (ANOTE!)
   - **Region:** South America (São Paulo)
6. Clique "Create new project"
7. Aguarde ~2 minutos

### 3.2 Copiar Connection String

1. No projeto criado, vá em **Settings** (⚙️ no menu lateral)
2. Clique em **Database**
3. Role até **Connection String**
4. Copie a URI em **Session mode** (não Transaction!)
5. Substitua `[YOUR-PASSWORD]` pela senha que você criou

Exemplo:
```
postgresql://postgres.abcdefg:SuaSenhaAqui@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## ✅ Passo 4: Configurar Variáveis de Ambiente

### 4.1 Criar arquivo .env

Crie um arquivo chamado `.env` na pasta `agendapro/`:

```bash
# Windows (PowerShell)
New-Item -Path .env -ItemType File

# Ou apenas crie manualmente no VSCode
```

### 4.2 Preencher .env

Copie o conteúdo de `ENV_TEMPLATE.txt` e preencha:

**MÍNIMO para rodar:**

```env
# Cole sua connection string do Supabase aqui:
DATABASE_URL="postgresql://postgres...."

# Para desenvolvimento local:
NEXTAUTH_URL="http://localhost:3000"

# Gere um secret aleatório:
# Execute: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET="cole-o-resultado-aqui"

# Configuração básica:
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Os outros (Mercado Pago, SendGrid) podem ficar vazios por enquanto!**

---

## ✅ Passo 5: Aplicar Schema no Banco

```bash
npx prisma db push
```

Você verá:
```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema
```

---

## ✅ Passo 6: Popular Dados Iniciais

```bash
npx prisma db seed
```

Isso cria:
- 3 Planos (Básico, Profissional, Premium)
- 1 Estabelecimento demo
- 1 Profissional de exemplo
- 5 Serviços padrão

---

## ✅ Passo 7: Rodar o Projeto

```bash
npm run dev
```

Abra no navegador: [http://localhost:3000](http://localhost:3000)

Você verá a página inicial do AgendaPro! 🎉

---

## 🔍 Verificar se Está Funcionando

### Abrir Prisma Studio (Interface Visual do Banco)

```bash
npm run db:studio
```

Abre automaticamente em: [http://localhost:5555](http://localhost:5555)

Você deve ver:
- 3 registros em "Plano"
- 1 registro em "Estabelecimento"
- 1 registro em "Profissional"
- 5 registros em "Servico"

---

## ⚠️ Problemas Comuns

### Erro: "Can't reach database server"

**Solução:** Verifique se a DATABASE_URL está correta e se tem acesso à internet.

### Erro: "Module not found: @prisma/client"

**Solução:**
```bash
npx prisma generate
```

### Erro: "NEXTAUTH_SECRET is not set"

**Solução:** 
```bash
# Gerar secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copiar resultado para .env
```

### Porta 3000 já em uso

**Solução:**
```bash
# Rodar em outra porta
npm run dev -- -p 3001
```

---

## 🎯 Próximos Passos Após Setup

Depois que tudo estiver rodando:

1. ✅ Explorar Prisma Studio (ver os dados)
2. ✅ Testar a página inicial (localhost:3000)
3. ✅ Ver próximo arquivo: `PROXIMOS_PASSOS_DEV.md`
4. ✅ Começar implementação de Auth

---

## 📚 Comandos Úteis

```bash
# Ver logs do Prisma
npm run db:studio

# Resetar banco (CUIDADO!)
npx prisma migrate reset

# Gerar Prisma Client (após mudar schema)
npx prisma generate

# Formatar código
npx prettier --write .
```

---

## 🆘 Precisa de Ajuda?

1. Verifique a documentação em `/docs`
2. Veja os protótipos em `/prototipos`
3. Leia `GUIA_APRENDER_SAAS.md`

---

**Status após setup:** ✅ Projeto rodando local com banco conectado!

**Próximo:** Implementar autenticação e multi-tenancy

