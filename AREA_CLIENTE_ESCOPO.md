# 👤 Área do Cliente - Escopo Completo

## 🎯 Objetivo

Permitir que **clientes finais** (pessoas que querem agendar) possam:
1. Acessar o site do estabelecimento
2. Ver serviços disponíveis
3. Escolher profissional
4. Selecionar data e horário
5. Preencher seus dados
6. Confirmar agendamento

**Tudo isso de forma autônoma, 24/7, sem precisar ligar!**

---

## 🌐 Como Funciona (White-Label)

### **Acesso por Subdomain:**

**Exemplo:**
- Admin criou estabelecimento com slug: `"meu-salao"`
- Cliente acessa: **`meu-salao.localhost:3000`** (dev) ou **`meu-salao.agendapro.com.br`** (prod)
- Sistema detecta tenant pelo subdomain
- Carrega logo, cores, serviços daquele estabelecimento
- **Parece um site próprio do salão!**

---

## 📋 O QUE PRECISA SER CRIADO:

### **1. DETECÇÃO DE TENANT (JÁ TEMOS! ✅)**

O middleware já detecta subdomain! Só precisamos usar:

```typescript
import { getTenantBySubdomain } from "@/lib/tenant";

const tenant = await getTenantBySubdomain(); // Pega do subdomain
```

---

### **2. LAYOUT DO CLIENTE (1 arquivo)**

**Arquivo:** `src/app/(cliente)/layout.tsx`

**O que faz:**
- Detecta tenant por subdomain
- Carrega logo e cor primária
- Aplica tema (CSS variables)
- Header com nome do estabelecimento
- Sem autenticação (público)

**Estimativa:** 30 minutos

---

### **3. HOME DO CLIENTE (1 arquivo)**

**Arquivo:** `src/app/(cliente)/page.tsx`

**O que mostra:**
- Hero com nome do estabelecimento
- Endereço e contato
- Grid de serviços disponíveis
- Cards de profissionais (com avaliações - futuro)
- CTA grande "Agendar Horário"
- Footer com "Powered by AgendaPro"

**Estimativa:** 45 minutos

---

### **4. FLUXO DE AGENDAMENTO (3 arquivos)**

#### **4.1 Página Principal de Agendamento**

**Arquivo:** `src/app/(cliente)/agendar/page.tsx`

**Formulário em etapas:**

**Passo 1: Escolher Serviço**
- Lista de serviços ativos
- Preço e duração
- Seleção por radio button

**Passo 2: Escolher Profissional**
- Lista de profissionais ativos
- Opção "Sem preferência"

**Passo 3: Escolher Data**
- Input de data
- Mínimo: hoje + antecedenciaMinima

**Passo 4: Escolher Horário**
- Busca horários disponíveis via API
- Grid de horários (igual admin tem)
- Mostra "ocupado" vs "disponível"

**Passo 5: Dados do Cliente**
- Nome
- Telefone (WhatsApp)
- Email (opcional)

**Passo 6: Revisar e Confirmar**
- Resumo completo
- Botão "Confirmar Agendamento"

**Estimativa:** 2 horas

---

#### **4.2 Componente de Seleção de Horários**

**Arquivo:** `src/components/cliente/SelecionarHorario.tsx`

**O que faz:**
- Recebe: servicoId, profissionalId, data
- Busca horários disponíveis
- Mostra grid interativo
- Retorna horário selecionado

**Estimativa:** 30 minutos

---

#### **4.3 Página de Confirmação**

**Arquivo:** `src/app/(cliente)/agendar/confirmacao/page.tsx`

**O que mostra:**
- ✅ Agendamento criado com sucesso!
- Resumo do agendamento
- Informações de contato do estabelecimento
- Instruções (ex: chegar 10min antes)
- Botão "Voltar para início"

**Estimativa:** 30 minutos

---

### **5. API PÚBLICA DE AGENDAMENTO (1 arquivo)**

**Arquivo:** `src/app/api/public/agendamento/route.ts`

**O que faz:**
- Recebe dados do formulário
- Valida disponibilidade
- Cria cliente (se novo)
- Cria agendamento
- **NÃO precisa de autenticação** (público)
- **MAS precisa de tenant_id** (pega do header do middleware)

**Segurança:**
- Rate limiting (futuro)
- Validação de dados
- Verificação de disponibilidade

**Estimativa:** 45 minutos

---

### **6. PERSONALIZAÇÃO (CSS Variables)**

**Arquivo:** Adicionar em `src/app/(cliente)/layout.tsx`

**O que faz:**
- Carrega `tenant.corPrimaria` do banco
- Injeta CSS variables:
```css
:root {
  --primary: #EC4899; /* Cor do tenant */
}
```
- Componentes usam `var(--primary)`




**Estimativa:** 30 minutos

---

## 📊 RESUMO DE ARQUIVOS A CRIAR:

```
src/app/(cliente)/
├── layout.tsx                      ⏳ Layout white-label
├── page.tsx                        ⏳ Home do estabelecimento
└── agendar/
    ├── page.tsx                    ⏳ Fluxo de agendamento
    └── confirmacao/page.tsx        ⏳ Sucesso

src/app/api/public/
└── agendamento/route.ts            ⏳ API pública

src/components/cliente/
├── SelecionarHorario.tsx           ⏳ Grid de horários
└── ResumoAgendamento.tsx           ⏳ Resumo (opcional)
```

**Total:** 6-7 arquivos  
**Tempo estimado:** 4-5 horas  
**Complexidade:** Média (reutiliza muita coisa que já fizemos!)

---

## 🔄 O QUE JÁ TEMOS (Reutilizável):

- ✅ Lógica de horários disponíveis (`lib/horarios.ts`)
- ✅ API de horários (`/api/horarios-disponiveis`)
- ✅ Validações (Zod schemas)
- ✅ Helpers de tenant
- ✅ Components de UI (podem adaptar)

**Vamos REAPROVEITAR ~60% do código!**

---

## 🎨 DIFERENÇAS: Admin vs Cliente

### **Área Admin (O que fizemos):**
- 🔐 Precisa login
- 💼 Design profissional (indigo/purple)
- 📊 Stats e métricas
- ⚙️ Configurações e gestão
- 🔧 CRUD completo

### **Área Cliente (Vamos fazer):**
- 🌐 Público (sem login)
- 🎨 Design do estabelecimento (white-label)
- 📅 Foco em agendar
- ✨ Simples e direto
- 📱 Mobile-first

---

## 🔑 PONTOS CRÍTICOS:

### **1. Detecção de Tenant:**

**Admin:**
- Usa `session.user.estabelecimentoId`
- Qualquer domínio funciona

**Cliente:**
- Usa subdomain (middleware já faz!)
- `meu-salao.localhost:3000` → busca tenant "meu-salao"

### **2. API Pública vs Protegida:**

**Protegida (Admin):**
```typescript
const session = await auth();
if (!session) return 401;
```

**Pública (Cliente):**
```typescript
// Sem auth, MAS precisa de tenant
const tenant = await getTenantBySubdomain();
if (!tenant) return 404;
```

### **3. Criar Agendamento:**

**Admin:** Cria direto (confia no admin)  
**Cliente:** Precisa validar mais:
- Horário ainda disponível?
- Dentro da antecedência mínima?
- Estabelecimento aceita agendamentos?
- Trial não expirou?

---

## 🚀 FLUXO DO CLIENTE (Passo a Passo):

```
1. Cliente acessa: meu-salao.localhost:3000
   └─> Vê home do estabelecimento

2. Clica em "Agendar"
   └─> Vai para /agendar

3. Escolhe serviço
   └─> Ex: "Corte Feminino - R$ 60"

4. Escolhe profissional
   └─> Ex: "Ana Paula" ou "Sem preferência"

5. Escolhe data
   └─> Ex: "28/10/2025"

6. Sistema busca horários disponíveis
   └─> GET /api/horarios-disponiveis

7. Cliente escolhe horário
   └─> Ex: "14:00"

8. Preenche dados
   └─> Nome, telefone, email

9. Confirma
   └─> POST /api/public/agendamento

10. Vê confirmação
    └─> "Agendamento criado! Você receberá um WhatsApp"
```

---

## 🎨 DESIGN (White-Label):

### **Cores:**
- Primary: Carrega do `tenant.corPrimaria`
- Default: Indigo (#4F46E5)
- Exemplo: Salão rosa (#EC4899), Barbearia preta (#1F2937)

### **Logo:**
- Carrega de `tenant.logoUrl`
- Fallback: Iniciais do nome

### **Branding:**
- Nome do estabelecimento em destaque
- Endereço e contato visíveis
- "Powered by AgendaPro" discreto no footer

---

## 📱 RESPONSIVIDADE:

**CRÍTICO!** Cliente usa 90% no celular!

- ✅ Mobile-first design
- ✅ Botões grandes (fácil clicar)
- ✅ Formulário em etapas (não tudo de uma vez)
- ✅ Feedback claro
- ✅ Loading states

---

## ⏱️ ESTIMATIVA REALISTA:

**Se começar agora:**

- **Layout cliente:** 30min
- **Home page:** 45min
- **Fluxo agendamento:** 2h
- **API pública:** 45min
- **Confirmação:** 30min
- **Testes e ajustes:** 30min

**Total:** 4-5 horas

**Considerando que você já está afiado:** Talvez **3 horas!** 🚀

---

## 🎯 DEPOIS DA ÁREA DO CLIENTE:

Você terá:
- ✅ Sistema COMPLETO end-to-end
- ✅ Admin gerencia
- ✅ Cliente agenda
- ✅ Ciclo fechado!

**Aí sim dá para:**
- Demonstrar para clientes reais
- Fazer beta testing
- Validar o produto
- Começar a vender!

---

## 💡 DICA:

**Reutilize ao máximo:**
- Grid de horários → Igual do admin
- Formulários → Mesma estrutura
- Validações → Mesmas schemas
- Lógica → Mesmas funções

**Só muda:**
- Design (cores do tenant)
- Fluxo (mais simples)
- Sem login (público)

---

## ✨ QUER QUE EU CRIE AGORA?

Posso implementar a área do cliente completa:
- Layout
- Home
- Fluxo de agendamento
- API pública
- Confirmação

**Em ~1 hora de código (eu criando os arquivos)**

**Ou prefere:**
- Pausar por hoje
- Revisar o que tem
- Continuar amanhã descansado

**Você decide!** 💪

---

**Me diz: continua agora ou pausa?** 🚀
