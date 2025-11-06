# 🚀 Deploy no Vercel (Hobby) — Checklist Rápido

Este guia assume que você já tem a conta Vercel e o projeto no GitHub.

---

## 1) Pré-requisitos
- Banco Supabase criado (Database URL em Session mode)
- Variáveis .env definidas localmente e testadas
- Build local ok: `npm run build`

---

## 2) Variáveis no Vercel (Project Settings → Environment Variables)
- `DATABASE_URL` (Session mode)
- `NEXTAUTH_URL` → `https://SEU-PROJETO.vercel.app`
- `NEXTAUTH_SECRET` (32+ chars)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side)

Recomendado: crie em Environment = Production e marque `Encrypt` quando disponível.

---

## 3) Configuração de Build
- Build Command: `next build`
- Install Command: `npm install`
- Output: (padrão do Next.js)
- Node.js: padrão Vercel (adequado para Next 15)

Nosso `package.json` já possui:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```
Se preferir, defina no Vercel o Install Command como `npm install && npx prisma generate`.

---

## 4) Banco de Dados / Prisma
- Não execute migrations pelo Vercel Hobby.
- Aplique schema localmente: `npx prisma db push` (ou `prisma migrate deploy` se usar migrations) e só então faça o deploy.

---

## 5) Regiões
- Se o Supabase estiver em `sa-east-1`, escolha uma região mais próxima quando disponível no Vercel (ex.: GRU). Se não houver, siga padrão.

---

## 6) Testes pós-deploy
- Acessar `https://SEU-PROJETO.vercel.app`
- Testar login, dashboard, agenda, upload de logo e fluxo público
- Verificar chamadas a APIs públicas (`/api/public/servicos`, `/api/public/profissionais`)
- Confirmar que `NEXTAUTH_URL` está igual ao domínio de produção

---

## 7) Observações do plano Hobby
- Execução serverless com limites de tempo/memória: nosso uso atual está dentro
- Conexões ao banco: P1001 pode ocorrer intermitentemente; telas críticas já têm fallback visual
- Upload de logo: requer `SUPABASE_SERVICE_ROLE_KEY` no servidor (mantido como env secret)

---

## 8) Rollback
- Vercel → Deployments → selecionar deploy anterior → Promote

---

## 9) Dicas
- Use `ENV_TEMPLATE.txt` como base para Production e Preview
- Habilite Preview Deploys para revisar antes de promover
- Configure domínios customizados quando possível

---

Pronto! Se algo falhar, verifique o build log do Vercel e o console do navegador (Network/Console).
