# 🚀 Guia de Hospedagem para Produção - AgendaPro

**Considerações:** 100 clientes iniciais, multi-tenancy com subdomínios, Next.js 15

**Última atualização:** 31 de Outubro de 2025

---

## 🎯 REQUISITOS DO PROJETO

### **Stack Atual:**
- ✅ Next.js 15 (App Router)
- ✅ PostgreSQL (atualmente Supabase Free)
- ✅ Prisma ORM
- ✅ NextAuth.js v5
- ✅ Multi-tenancy com subdomínios (wildcard)

### **Necessidades:**
1. **Hosting Next.js** - App com SSR/SSG
2. **Banco de Dados PostgreSQL** - Dados de 100 clientes
3. **Wildcard SSL** - Para subdomínios (*.agendapro.com.br)
4. **Domínio Customizado** - agendapro.com.br (ou similar)
5. **Armazenamento** - Para logos e imagens (Supabase Storage)

### **Estimativa de Tráfego (100 clientes):**
- ~50-100 agendamentos/dia
- ~500-1000 visitas/dia (clientes + admin)
- ~50GB bandwidth/mês
- Banco: ~5-10GB (começo conservador)

---

## 🏆 RECOMENDAÇÕES (Por Ordem de Prioridade)

### **⭐ OPÇÃO 1: Vercel + Supabase Pro** (Recomendado)

**Por quê?**
- ✅ Vercel é **otimizado para Next.js** (criado pela equipe Next.js)
- ✅ Deploy automático do Git
- ✅ SSL gratuito e automático (inclui wildcard)
- ✅ CDN global incluído
- ✅ Setup simples (minutos)
- ✅ Supabase Pro já tem o banco rodando

#### **Configuração:**

**Vercel (Hospedagem Next.js):**
- **Plano:** Pro ($20/mês) ou Enterprise (se crescer)
- **Features:**
  - ✅ Deploy automático (GitHub/GitLab)
  - ✅ Preview deployments
  - ✅ Analytics incluído
  - ✅ Edge Functions (se precisar)
  - ✅ SSL automático (wildcard gratuito)
  - ✅ Sem limite de bandwidth no Pro

**Supabase (Banco de Dados):**
- **Plano:** Pro ($25/mês) ou Team ($599/mês se muitos usuários)
- **Features:**
  - ✅ PostgreSQL gerenciado
  - ✅ 8GB storage (Pro) ou 250GB (Team)
  - ✅ Backups automáticos
  - ✅ Connection pooling
  - ✅ Supabase Storage (para logos/imagens)

**Domínio:**
- **Registro:** Google Domains, Namecheap, ou Registro.br (~R$40/ano)
- **Configuração:** Apontar DNS para Vercel
- **Wildcard:** Vercel configura automaticamente

#### **Custos Estimados:**
```
Vercel Pro:           $20/mês (~R$100/mês)
Supabase Pro:         $25/mês (~R$125/mês)
Domínio:              R$40/ano (~R$3/mês)
Total:                ~R$228/mês (início)
```

#### **Vantagens:**
- ✅ Setup em **menos de 1 hora**
- ✅ Zero configuração de servidor
- ✅ Escala automática
- ✅ CDN global (performance mundial)
- ✅ Deploy automático (push no Git)
- ✅ SSL wildcard automático

#### **Desvantagens:**
- ⚠️ Custo mais alto que self-hosted
- ⚠️ Vercel tem limite de funções serverless (mas suficiente para 100 clientes)

**🎯 Recomendação:** **Escolha esta opção se quer focar em desenvolvimento e não se preocupar com infra**

---

### **💰 OPÇÃO 2: Railway + Supabase Pro** (Custo-Benefício)

**Por quê?**
- ✅ Custo menor que Vercel
- ✅ Mais flexível (pode rodar outros serviços)
- ✅ Deploy automático também
- ✅ Bom para começar e escalar

#### **Configuração:**

**Railway (Hospedagem Next.js):**
- **Plano:** Pro ($20/mês) ou Hobby ($5/mês para começar)
- **Features:**
  - ✅ Deploy automático (GitHub)
  - ✅ SSL automático (wildcard)
  - ✅ Preview deployments
  - ✅ Variáveis de ambiente fáceis
  - ✅ Logs em tempo real

**Supabase (Banco):**
- **Plano:** Pro ($25/mês) - mesmo da Opção 1

**Domínio:**
- **Mesmo da Opção 1**

#### **Custos Estimados:**
```
Railway Pro:          $20/mês (~R$100/mês)
Supabase Pro:         $25/mês (~R$125/mês)
Domínio:              R$40/ano (~R$3/mês)
Total:                ~R$228/mês (igual Vercel)
```

**Para começar:**
```
Railway Hobby:        $5/mês (~R$25/mês) [limitado]
Total início:         ~R$153/mês
```

#### **Vantagens:**
- ✅ Custo menor (se começar com Hobby)
- ✅ Mais controle sobre infraestrutura
- ✅ Pode escalar gradualmente
- ✅ Suporta outros serviços (workers, cron jobs)

#### **Desvantagens:**
- ⚠️ Setup um pouco mais complexo que Vercel
- ⚠️ CDN não tão otimizado quanto Vercel

**🎯 Recomendação:** **Escolha esta opção se quer economizar no início e ter mais controle**

---

### **🌍 OPÇÃO 3: Vercel + Neon Database** (Alternativa ao Supabase)

**Por quê?**
- ✅ Neon é **mais barato** que Supabase Pro
- ✅ PostgreSQL serverless (escala automaticamente)
- ✅ Branching de banco (útil para testes)
- ✅ Bom para começar

#### **Configuração:**

**Vercel (Hospedagem):**
- **Mesmo da Opção 1**

**Neon (Banco de Dados):**
- **Plano:** Scale ($19/mês) ou Launch (free tier para testes)
- **Features:**
  - ✅ PostgreSQL serverless
  - ✅ Branching (criar "branches" do banco)
  - ✅ 10GB storage (Scale)
  - ✅ Connection pooling incluído
  - ⚠️ Sem storage de arquivos (precisa Cloudflare R2 ou S3)

**Storage para imagens:**
- **Cloudflare R2:** $0.015/GB (muito barato)
- **AWS S3:** ~$0.023/GB
- **Supabase Storage:** Incluído no Supabase Pro

**Domínio:**
- **Mesmo das opções anteriores**

#### **Custos Estimados:**
```
Vercel Pro:           $20/mês (~R$100/mês)
Neon Scale:           $19/mês (~R$95/mês)
Cloudflare R2:        ~$2/mês (começo)
Domínio:              R$40/ano (~R$3/mês)
Total:                ~R$200/mês
```

#### **Vantagens:**
- ✅ Custo total menor
- ✅ PostgreSQL moderno (serverless)
- ✅ Branching de banco (dev/prod separados facilmente)

#### **Desvantagens:**
- ⚠️ Precisa configurar storage separado
- ⚠️ Setup mais complexo
- ⚠️ Sem dashboard completo como Supabase

**🎯 Recomendação:** **Escolha se quer economizar e não se importa com setup extra**

---

### **🖥️ OPÇÃO 4: Self-Hosted (DigitalOcean/Linode)** (Avançado)

**Por quê?**
- ✅ Controle total
- ✅ Custo muito menor no longo prazo
- ✅ Pode rodar tudo em uma VPS

#### **Configuração:**

**DigitalOcean Droplet:**
- **Tamanho:** 4GB RAM / 2 vCPU (~$24/mês) ou 8GB (~$48/mês)
- **SO:** Ubuntu 22.04
- **Stack:**
  - PM2 ou Docker (para Next.js)
  - PostgreSQL (no próprio droplet ou gerenciado)
  - Nginx (reverse proxy + SSL)
  - Certbot (Let's Encrypt SSL)

**Ou PostgreSQL Gerenciado:**
- **DigitalOcean Managed Database:** $15/mês (1GB RAM, início)
- **Supabase Pro:** $25/mês (mais completo)

#### **Custos Estimados:**
```
Droplet 4GB:          $24/mês (~R$120/mês)
PostgreSQL gerenciado: $25/mês (~R$125/mês)
Backup automático:    $5/mês (~R$25/mês)
Domínio:              R$40/ano (~R$3/mês)
Total:                ~R$273/mês
```

**Mais econômico (tudo no droplet):**
```
Droplet 8GB:          $48/mês (~R$240/mês)
Backup:               $5/mês (~R$25/mês)
Domínio:              R$3/mês
Total:                ~R$268/mês
```

#### **Vantagens:**
- ✅ Controle total
- ✅ Custo fixo (não escala com uso)
- ✅ Pode rodar outros serviços

#### **Desvantagens:**
- ❌ Setup complexo (horas/dias)
- ❌ Manutenção manual
- ❌ Precisa conhecimento de servidor
- ❌ Sem CDN automático
- ❌ Backup manual (ou configurar)

**🎯 Recomendação:** **Só escolha se tem experiência com servidores e quer economizar no longo prazo**

---

## 📊 COMPARAÇÃO RÁPIDA

| Opção | Custo/mês | Dificuldade | Tempo Setup | Escalabilidade |
|-------|-----------|-------------|-------------|----------------|
| **Vercel + Supabase** ⭐ | ~R$228 | ⭐ Fácil | 30min | ⭐⭐⭐⭐⭐ |
| **Railway + Supabase** | ~R$228 | ⭐⭐ Média | 1h | ⭐⭐⭐⭐ |
| **Vercel + Neon** | ~R$200 | ⭐⭐ Média | 2h | ⭐⭐⭐⭐⭐ |
| **Self-Hosted** | ~R$268+ | ⭐⭐⭐⭐ Difícil | 4h+ | ⭐⭐⭐ |

---

## 🎯 RECOMENDAÇÃO FINAL

### **Para 100 clientes iniciais:**

**🥇 1ª Escolha: Vercel + Supabase Pro**
- ✅ Mais rápido para começar (30min setup)
- ✅ Zero manutenção
- ✅ Performance excelente
- ✅ Escala facilmente
- ✅ Custo justificável para o valor

**🥈 2ª Escolha: Railway + Supabase (se economizar no início)**
- ✅ Custo similar
- ✅ Pode começar com Hobby ($5) e subir depois
- ✅ Mais controle

**🥉 3ª Escolha: Self-Hosted (se tem experiência)**
- ✅ Economia no longo prazo
- ✅ Controle total
- ⚠️ Requer conhecimento técnico

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### **Para Vercel + Supabase (Opção Recomendada):**

#### **1. Setup Vercel (15 minutos)**
- [ ] Criar conta na Vercel
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente:
  - `DATABASE_URL` (Supabase)
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (seu domínio)
  - Outras envs necessárias
- [ ] Deploy automático configurado

#### **2. Setup Supabase Pro (10 minutos)**
- [ ] Upgrade de Free para Pro
- [ ] Configurar connection pooling (PGBouncer)
- [ ] Configurar backups automáticos
- [ ] Testar conexão do Vercel

#### **3. Setup Domínio (15 minutos)**
- [ ] Registrar domínio (agendapro.com.br ou similar)
- [ ] Configurar DNS na Vercel:
  - Apex domain: `agendapro.com.br`
  - Wildcard: `*.agendapro.com.br`
- [ ] SSL automático (Vercel faz sozinho)
- [ ] Testar subdomínios

#### **4. Configurar Prisma em Produção (5 minutos)**
- [ ] Garantir `DATABASE_URL` correto no Vercel
- [ ] Rodar migrations: `prisma migrate deploy`
- [ ] Testar conexão

#### **5. Testes Finais**
- [ ] Testar área admin
- [ ] Testar área cliente (subdomain)
- [ ] Testar APIs
- [ ] Verificar SSL em todos os subdomínios

**Tempo total:** ~45 minutos

---

## 💰 PROJEÇÃO DE CUSTOS (100 → 1000 clientes)

### **Cenário 1: Vercel + Supabase**
```
100 clientes:    R$228/mês
500 clientes:    R$228/mês (mesmo)
1000 clientes:   R$600/mês (Vercel Enterprise + Supabase Team)
```

### **Cenário 2: Self-Hosted**
```
100 clientes:    R$268/mês
500 clientes:    R$268/mês (mesmo)
1000 clientes:   R$480/mês (droplet maior)
```

---

## ⚠️ PONTOS IMPORTANTES

### **1. Wildcard SSL**
- ✅ Vercel e Railway configuram **automaticamente**
- ✅ Self-hosted precisa configurar manualmente (Let's Encrypt + certbot)

### **2. Connection Pooling**
- ✅ Supabase Pro inclui PGBouncer
- ✅ Neon inclui connection pooling
- ✅ Self-hosted precisa configurar PgBouncer ou usar pool do Prisma

### **3. Backups**
- ✅ Supabase Pro: backups automáticos
- ✅ Neon: backups automáticos
- ✅ Self-hosted: precisa configurar manualmente

### **4. Storage de Imagens**
- ✅ Supabase: Storage incluído (Pro)
- ✅ Neon: Precisa Cloudflare R2 ou S3
- ✅ Self-hosted: Precisa configurar (MinIO, S3, etc)

### **5. Variáveis de Ambiente**
- ✅ Vercel/Railway: Interface visual
- ✅ Self-hosted: Arquivo `.env` no servidor

---

## 🚀 PRÓXIMO PASSO RECOMENDADO

1. **Escolha uma das opções acima** (recomendo Vercel + Supabase)
2. **Comece com setup básico** (domínio + deploy)
3. **Teste localmente** com as credenciais de produção
4. **Migre gradualmente** (não precisa fazer tudo de uma vez)

---

## 📞 DÚVIDAS COMUNS

**P: Posso começar com Supabase Free?**
R: Sim, mas tem limite de 500MB de banco e não tem connection pooling. Recomendo Pro desde o início.

**P: Vercel Free funciona?**
R: Para testes sim, mas tem limite de 100GB bandwidth/mês e funções serverless limitadas. Pro é necessário para produção.

**P: Posso mudar depois?**
R: Sim! Todas as opções permitem migração. Vercel pode exportar config, Supabase tem export completo, etc.

**P: Qual domínio usar?**
R: `agendapro.com.br` ou similar. Registro.br é bom para domínio .br.

---

## ✅ CONCLUSÃO

**Para começar com 100 clientes:**
- **Vercel + Supabase Pro** é a escolha mais segura e rápida
- **Custo:** ~R$228/mês (justificável para SaaS)
- **Setup:** Menos de 1 hora
- **Manutenção:** Zero

**Quando chegar a 500+ clientes:**
- Avaliar upgrade para Vercel Enterprise
- Ou considerar Self-Hosted se custo for prioridade

---

**Última atualização:** 31/10/2025  
**Próxima revisão:** Após escolher hospedagem

