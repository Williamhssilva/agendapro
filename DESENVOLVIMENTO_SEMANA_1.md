# 🚀 Desenvolvimento - Semana 1: Auth + Multi-Tenancy

## 🎯 Objetivo desta Semana

Implementar:
- ✅ Autenticação com NextAuth.js v5
- ✅ Login/Cadastro com email e senha
- ✅ Middleware de detecção de tenant (subdomain)
- ✅ Proteção de rotas
- ✅ Primeira página admin funcionando

---

## 📋 STATUS ATUAL

- ✅ Projeto estruturado
- ✅ Banco conectado (Supabase)
- ✅ Schema aplicado (`prisma db push`)
- ✅ Dados iniciais (`prisma db seed`)
- ✅ Servidor rodando (`npm run dev`)
- ⏳ Agora: Implementar Auth

---

## 🔨 TAREFA 1: Configurar NextAuth.js

### **Passo 1: Criar arquivo de configuração do Auth**

Criar: `src/auth.ts`

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Login com Email/Senha
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
          include: { estabelecimento: true },
        });

        if (!usuario || !usuario.senha) {
          return null;
        }

        const senhaCorreta = await bcrypt.compare(
          credentials.password as string,
          usuario.senha
        );

        if (!senhaCorreta) {
          return null;
        }

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nome,
          estabelecimentoId: usuario.estabelecimentoId,
        };
      },
    }),

    // Google OAuth (opcional)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.estabelecimentoId = user.estabelecimentoId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.estabelecimentoId = token.estabelecimentoId;
      }
      return session;
    },
  },
});
```

### **Passo 2: Criar route handler**

Criar: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

### **Passo 3: Adicionar tipos do NextAuth**

Criar: `src/types/next-auth.d.ts`

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      estabelecimentoId: string;
    } & DefaultSession["user"];
  }

  interface User {
    estabelecimentoId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    estabelecimentoId: string;
  }
}
```

---

## 🔨 TAREFA 2: Criar Páginas de Login/Cadastro

### **Criar: `src/app/login/page.tsx`**

```typescript
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Login</h1>
        
        <form action={async (formData) => {
          "use server";
          await signIn("credentials", formData);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 🔨 TAREFA 3: Middleware de Tenant Detection

### **Criar: `src/middleware.ts`**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Extrair subdomain
  const subdomain = extractSubdomain(hostname);
  
  if (subdomain) {
    // Adicionar tenant ao header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', subdomain);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

function extractSubdomain(hostname: string): string | null {
  // Localhost: demo.localhost:3000
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return null;
  }
  
  // Produção: salaobella.agendapro.com.br
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 🔨 TAREFA 4: Helper para pegar Tenant

### **Criar: `src/lib/tenant.ts`**

```typescript
import { headers } from 'next/headers';
import { prisma } from './prisma';

export async function getTenant() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');
  
  if (!tenantSlug) {
    return null;
  }
  
  const estabelecimento = await prisma.estabelecimento.findUnique({
    where: { slug: tenantSlug },
    include: {
      plano: true,
      configuracoes: true,
    },
  });
  
  return estabelecimento;
}

export async function requireTenant() {
  const tenant = await getTenant();
  
  if (!tenant) {
    throw new Error('Tenant não encontrado');
  }
  
  return tenant;
}
```

---

## 🔨 TAREFA 5: Dashboard Admin (Primeira Página Protegida)

### **Criar: `src/app/(admin)/dashboard/page.tsx`**

```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  const tenant = await getTenant();
  
  if (!tenant) {
    return <div>Tenant não encontrado</div>;
  }
  
  // Buscar agendamentos de hoje
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  
  const agendamentosHoje = await prisma.agendamento.count({
    where: {
      estabelecimentoId: tenant.id,
      dataHora: {
        gte: hoje,
        lt: amanha,
      },
    },
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard - {tenant.nome}
        </h1>
        
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Agendamentos Hoje</p>
            <p className="text-4xl font-bold text-indigo-600">{agendamentosHoje}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Plano Atual</p>
            <p className="text-xl font-bold text-gray-900">{tenant.plano.nome}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📋 CHECKLIST SEMANA 1:

### **Hoje (Dia 1):**
- [x] Projeto estruturado
- [x] Banco conectado
- [ ] Criar `src/auth.ts`
- [ ] Criar `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Criar `src/types/next-auth.d.ts`
- [ ] Testar login básico

### **Dia 2:**
- [ ] Criar página de login (`src/app/login/page.tsx`)
- [ ] Criar página de cadastro
- [ ] Testar autenticação funcionando

### **Dia 3:**
- [ ] Criar `src/middleware.ts` (tenant detection)
- [ ] Criar `src/lib/tenant.ts` (helpers)
- [ ] Testar subdomain detection

### **Dia 4:**
- [ ] Criar layout admin com sidebar
- [ ] Criar dashboard protegido
- [ ] Mostrar dados do tenant

### **Dia 5:**
- [ ] Refinar proteção de rotas
- [ ] Adicionar loading states
- [ ] Testar tudo funcionando

---

## 🎯 RESULTADO ESPERADO (Final da Semana 1):

Você terá:
- ✅ Login/Cadastro funcionando
- ✅ Usuário autenticado
- ✅ Tenant detectado por subdomain
- ✅ Dashboard mostrando dados do estabelecimento
- ✅ Rotas protegidas

**Acessos:**
- `http://localhost:3000` → Landing/Login
- `http://demo.localhost:3000` → Site do "Salão Demo"
- `http://localhost:3000/dashboard` → Admin (protegido)

---

## 🚀 PRÓXIMA AÇÃO IMEDIATA:

Vou criar os arquivos da Tarefa 1 agora?

1. `src/auth.ts`
2. `src/app/api/auth/[...nextauth]/route.ts`
3. `src/types/next-auth.d.ts`
4. `src/app/login/page.tsx`

**Posso começar a criar?** 💪

