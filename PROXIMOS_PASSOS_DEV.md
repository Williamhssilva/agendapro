# 🎯 Próximos Passos de Desenvolvimento

## Status Atual: ✅ Projeto Inicializado!

Você acabou de criar a estrutura base do AgendaPro! 🎉

---

## 📊 O que já está pronto:

- ✅ Projeto Next.js 14 configurado
- ✅ TypeScript + Tailwind CSS
- ✅ Schema Prisma multi-tenant completo
- ✅ Seed de dados iniciais
- ✅ Estrutura de pastas organizada
- ✅ Configurações básicas

---

## 🚀 Próximas Features (em ordem de prioridade)

### **SEMANA 1-2: Autenticação + Multi-Tenancy**

#### **Tarefa 1: Configurar NextAuth.js**
- [ ] Criar `src/auth.ts` (configuração NextAuth)
- [ ] Criar `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Implementar login com email/senha
- [ ] Implementar Google OAuth
- [ ] Criar páginas de login/cadastro

**Arquivos a criar:**
```
src/
├── auth.ts
├── app/
│   ├── api/auth/[...nextauth]/route.ts
│   ├── login/page.tsx
│   └── cadastro/page.tsx
```

**Tempo estimado:** 2-3 dias

---

#### **Tarefa 2: Middleware de Tenant Detection**
- [ ] Criar `src/middleware.ts`
- [ ] Detectar subdomain
- [ ] Buscar tenant no banco
- [ ] Injetar tenant no request
- [ ] Proteger rotas

**Código base:**
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = extractSubdomain(hostname);
  
  if (subdomain) {
    // Buscar tenant e injetar no header
    const tenant = await getTenant(subdomain);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenant.id);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}
```

**Tempo estimado:** 2-3 dias

---

### **SEMANA 3-4: Core Features (Serviços + Profissionais)**

#### **Tarefa 3: CRUD de Serviços**
- [ ] Criar API routes (`/api/servicos`)
- [ ] Criar página de listagem
- [ ] Criar modal/página de criação
- [ ] Criar modal/página de edição
- [ ] Implementar delete
- [ ] Filtrar por tenant_id

**Arquivos:**
```
src/app/
├── api/servicos/
│   ├── route.ts           # GET, POST
│   └── [id]/route.ts      # PUT, DELETE
├── (admin)/
│   └── servicos/
│       ├── page.tsx       # Lista
│       └── [id]/page.tsx  # Editar
```

**Tempo estimado:** 3-4 dias

---

#### **Tarefa 4: CRUD de Profissionais**
- [ ] Criar API routes (`/api/profissionais`)
- [ ] Criar página de listagem (grid de cards)
- [ ] Criar formulário de cadastro
- [ ] Upload de foto (Supabase Storage)
- [ ] Configuração de horários
- [ ] Implementar delete

**Tempo estimado:** 3-4 dias

---

### **SEMANA 5-6: Sistema de Agendamento (Admin)**

#### **Tarefa 5: Lógica de Disponibilidade**
- [ ] Função para calcular horários disponíveis
- [ ] Considerar:
  - Horários do profissional
  - Agendamentos existentes
  - Duração do serviço
  - Horário de funcionamento

**Pseudo-código:**
```typescript
async function getHorariosDisponiveis(
  profissionalId: string,
  servicoId: string,
  data: Date
): Promise<string[]> {
  // 1. Buscar horários do profissional
  // 2. Buscar agendamentos do dia
  // 3. Calcular slots livres
  // 4. Retornar array de horários ['09:00', '09:30', ...]
}
```

**Tempo estimado:** 2-3 dias

---

#### **Tarefa 6: Interface de Agendamento (Admin)**
- [ ] Criar página de agenda do dia
- [ ] Timeline visual (lista hora a hora)
- [ ] Criar agendamento manual
- [ ] Editar agendamento
- [ ] Cancelar agendamento
- [ ] Marcar como concluído

**Tempo estimado:** 3-4 dias

---

### **SEMANA 7-8: Área do Cliente**

#### **Tarefa 7: Site do Cliente (White-label)**
- [ ] Detectar tenant por subdomain
- [ ] Carregar configurações (logo, cor)
- [ ] Aplicar tema dinâmico (CSS variables)
- [ ] Criar home page do tenant
- [ ] Listar serviços disponíveis
- [ ] Listar profissionais

**Tempo estimado:** 3-4 dias

---

#### **Tarefa 8: Agendamento Online (Cliente)**
- [ ] Página de agendamento
- [ ] Escolher serviço
- [ ] Escolher profissional
- [ ] Calendário de datas
- [ ] Grid de horários disponíveis
- [ ] Formulário de dados (nome, telefone)
- [ ] Criar agendamento
- [ ] Página de confirmação

**Tempo estimado:** 4-5 dias

---

### **SEMANA 9-10: Billing**

#### **Tarefa 9: Integração Mercado Pago**
- [ ] Criar conta no Mercado Pago
- [ ] Configurar credenciais
- [ ] Criar produtos (planos) no MP
- [ ] Criar subscription ao escolher plano
- [ ] Webhook para renovação
- [ ] Gerenciar trial (14 dias)

**Tempo estimado:** 4-5 dias

---

#### **Tarefa 10: Página "Meu Plano"**
- [ ] Mostrar plano atual
- [ ] Mostrar uso (profissionais, notificações)
- [ ] Botão de upgrade
- [ ] Histórico de pagamentos
- [ ] Cancelamento

**Tempo estimado:** 2-3 dias

---

### **SEMANA 11: Notificações**

#### **Tarefa 11: Email (SendGrid)**
- [ ] Configurar SendGrid
- [ ] Templates de email (HTML)
- [ ] Email de confirmação
- [ ] Email de lembrete
- [ ] Cron job para lembretes (Vercel Cron)

**Tempo estimado:** 3-4 dias

---

#### **Tarefa 12: WhatsApp (Evolution API)**
- [ ] Configurar Evolution API
- [ ] Integrar com webhook
- [ ] Mensagem de confirmação
- [ ] Mensagem de lembrete
- [ ] Limitar por plano

**Tempo estimado:** 3-4 dias

---

### **SEMANA 12: Polish & Deploy**

#### **Tarefa 13: Finalização**
- [ ] Testes em todas as features
- [ ] Otimizações de performance
- [ ] SEO básico
- [ ] Error handling
- [ ] Loading states
- [ ] Responsividade mobile

**Tempo estimado:** 3-4 dias

---

#### **Tarefa 14: Deploy**
- [ ] Push para GitHub
- [ ] Conectar Vercel
- [ ] Configurar env vars em produção
- [ ] Deploy automático
- [ ] Configurar domínio
- [ ] SSL/HTTPS

**Tempo estimado:** 1-2 dias

---

## 📋 Checklist Geral do MVP

### **Funcionalidades:**
- [ ] Login/Cadastro
- [ ] Multi-tenancy funcionando
- [ ] Onboarding de estabelecimento
- [ ] CRUD de serviços
- [ ] CRUD de profissionais
- [ ] Admin pode criar agendamento
- [ ] Cliente pode agendar online
- [ ] Email de confirmação
- [ ] WhatsApp notificações
- [ ] Billing (Mercado Pago)
- [ ] Trial de 14 dias
- [ ] Personalização (logo/cor)
- [ ] Dashboard com métricas básicas

### **Qualidade:**
- [ ] Mobile responsivo
- [ ] Performance otimizada
- [ ] Error handling
- [ ] Validações de formulário
- [ ] Segurança (queries filtradas por tenant)
- [ ] Testes básicos

---

## 🎓 Recursos de Aprendizado

### **Se você vai desenvolver:**

**Next.js:**
- Tutorial oficial: [nextjs.org/learn](https://nextjs.org/learn)
- Curso gratuito: "Next.js 14 Full Course" (YouTube)

**Prisma:**
- Docs oficiais: [prisma.io/docs](https://prisma.io/docs)
- Tutorial: "Prisma + Next.js" (YouTube)

**NextAuth:**
- Docs: [authjs.dev](https://authjs.dev)
- Tutorial: "NextAuth v5 Tutorial" (YouTube)

**Multi-tenancy:**
- Artigo: "Building Multi-Tenant Apps with Next.js"
- Video: "SaaS Multi-Tenancy Architecture"

---

## 💡 Dicas Importantes

### **1. Sempre filtre por tenant_id:**
```typescript
// ✅ CERTO
const servicos = await prisma.servico.findMany({
  where: { estabelecimentoId: tenant.id }
});

// ❌ ERRADO (vai retornar de todos os tenants!)
const servicos = await prisma.servico.findMany();
```

### **2. Use Prisma Studio para debug:**
```bash
npm run db:studio
```

### **3. Teste multi-tenancy cedo:**
Crie 2 estabelecimentos demo e verifique que os dados não vazam entre eles.

### **4. Commits frequentes:**
```bash
git add .
git commit -m "feat: implementa CRUD de serviços"
git push
```

---

## 🎯 Meta Semana a Semana

| Semana | Entregável | Status |
|--------|------------|--------|
| 1-2 | Auth + Multi-tenancy | ⏳ |
| 3-4 | Serviços + Profissionais | ⏳ |
| 5-6 | Agendamento (Admin + Cliente) | ⏳ |
| 7-8 | Site do Cliente + Reserva | ⏳ |
| 9-10 | Billing | ⏳ |
| 11 | Notificações | ⏳ |
| 12 | Deploy | ⏳ |

---

**Pronto para começar a primeira tarefa?** 

Leia o próximo arquivo: `TAREFA_01_AUTH.md` (vou criar agora!)

🚀 **Bora codar!**

