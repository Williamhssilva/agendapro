# 🚀 Guia de Deploy em VPS - AgendaPro

Guia completo para deploy do AgendaPro em VPS (HostGator, Hostinger, DigitalOcean, etc).

---

## 📋 Pré-requisitos

### **1. VPS Configurado**
- Ubuntu 22.04 LTS (recomendado)
- Mínimo: 2 vCPU, 2GB RAM, 20GB SSD
- Recomendado: 4 vCPU, 4GB RAM, 40GB SSD
- IP público configurado

### **2. Domínio (opcional mas recomendado)**
- Domínio apontando para o IP do VPS
- Exemplo: `agendapro.com.br` → `123.45.67.89`

### **3. Acesso SSH**
```bash
ssh root@SEU_IP_VPS
# ou
ssh usuario@SEU_IP_VPS
```

---

## 🔧 Passo 1: Configuração Inicial do Servidor

### **1.1 Atualizar Sistema**
```bash
sudo apt update && sudo apt upgrade -y
```

### **1.2 Instalar Node.js 20.x (LTS)**
```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

### **1.3 Instalar PM2 (Gerenciador de Processos)**
```bash
sudo npm install -g pm2
```

### **1.4 Instalar Nginx**
```bash
sudo apt install -y nginx
```

### **1.5 Instalar Certbot (SSL Let's Encrypt)**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 📦 Passo 2: Preparar Aplicação no Servidor

### **2.1 Criar Diretório da Aplicação**
```bash
sudo mkdir -p /var/www/agendapro
sudo chown -R $USER:$USER /var/www/agendapro
cd /var/www/agendapro
```

### **2.2 Clonar Repositório**
```bash
# Opção 1: Se usar Git
git clone https://github.com/SEU_USUARIO/agendapro.git .

# Opção 2: Upload manual via SFTP
# Use FileZilla ou similar para enviar os arquivos
```

### **2.3 Instalar Dependências**
```bash
cd /var/www/agendapro/agendapro
npm install --production
```

### **2.4 Gerar Prisma Client**
```bash
npx prisma generate
```

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

### **3.1 Criar arquivo .env**
```bash
nano /var/www/agendapro/agendapro/.env
```

### **3.2 Preencher variáveis (copie do ENV_TEMPLATE.txt)**

**OBRIGATÓRIAS:**
```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres.[PROJETO]:[SENHA]@aws-0-[REGIÃO].pooler.supabase.com:5432/postgres

# NextAuth
NEXTAUTH_URL=https://seu-dominio.com.br
NEXTAUTH_SECRET=cole-aqui-um-secret-aleatorio-de-32-caracteres

# App Config
NEXT_PUBLIC_APP_URL=https://seu-dominio.com.br
NODE_ENV=production
```

**OPCIONAIS (mas importantes):**
```env
# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Mercado Pago (quando implementar)
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# SendGrid (quando implementar)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@seu-dominio.com.br
```

**Salvar:** `Ctrl+O`, `Enter`, `Ctrl+X`

### **3.3 Proteger arquivo .env**
```bash
chmod 600 .env
```

---

## 🗄️ Passo 4: Configurar Banco de Dados

### **4.1 Aplicar Schema no Banco**
```bash
npx prisma db push
```

### **4.2 (Opcional) Popular dados iniciais**
```bash
npx prisma db seed
```

---

## 🏗️ Passo 5: Build da Aplicação

```bash
npm run build
```

Isso vai criar a pasta `.next` com a aplicação otimizada.

---

## ⚙️ Passo 6: Configurar PM2

### **6.1 Criar arquivo de configuração PM2**

Crie o arquivo `ecosystem.config.js` na raiz do projeto:

```bash
nano /var/www/agendapro/agendapro/ecosystem.config.js
```

Cole o conteúdo do arquivo `ecosystem.config.js` (já criado no projeto).

### **6.2 Iniciar aplicação com PM2**
```bash
pm2 start ecosystem.config.js
```

### **6.3 Configurar PM2 para iniciar no boot**
```bash
pm2 startup
# Execute o comando que aparecer (algo como: sudo env PATH=...)
pm2 save
```

### **6.4 Verificar status**
```bash
pm2 status
pm2 logs agendapro
```

---

## 🌐 Passo 7: Configurar Nginx

### **7.1 Criar configuração do Nginx**

```bash
sudo nano /etc/nginx/sites-available/agendapro
```

Cole o conteúdo do arquivo `nginx.conf` (já criado no projeto).

**IMPORTANTE:** Substitua:
- `seu-dominio.com.br` pelo seu domínio real
- `123.45.67.89` pelo IP do seu VPS (se não tiver domínio)

### **7.2 Habilitar site**
```bash
sudo ln -s /etc/nginx/sites-available/agendapro /etc/nginx/sites-enabled/
```

### **7.3 Testar configuração**
```bash
sudo nginx -t
```

### **7.4 Reiniciar Nginx**
```bash
sudo systemctl restart nginx
```

---

## 🔒 Passo 8: Configurar SSL (HTTPS)

### **8.1 Com Domínio (Recomendado)**
```bash
sudo certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br
```

Certbot vai:
- Gerar certificado SSL
- Configurar renovação automática
- Atualizar configuração do Nginx

### **8.2 Sem Domínio (Apenas IP)**
SSL não funciona com IP apenas. Você precisará:
- Usar domínio próprio, OU
- Usar Cloudflare Proxy (gratuito) que fornece SSL

---

## ✅ Passo 9: Verificar Deploy

### **9.1 Verificar se aplicação está rodando**
```bash
pm2 status
pm2 logs agendapro --lines 50
```

### **9.2 Testar acesso**
- Acesse: `https://seu-dominio.com.br`
- Verifique se carrega sem erros
- Teste login/cadastro

### **9.3 Verificar logs em caso de erro**
```bash
# Logs da aplicação
pm2 logs agendapro

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 🔄 Passo 10: Scripts de Atualização

### **10.1 Script de Deploy (criar: deploy.sh)**

```bash
nano /var/www/agendapro/deploy.sh
```

Cole o conteúdo do arquivo `deploy.sh` (já criado no projeto).

Tornar executável:
```bash
chmod +x deploy.sh
```

### **10.2 Usar script de deploy**
```bash
cd /var/www/agendapro
./deploy.sh
```

---

## 🛡️ Passo 11: Segurança Básica

### **11.1 Configurar Firewall (UFW)**
```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ativar firewall
sudo ufw enable
sudo ufw status
```

### **11.2 Desabilitar root login (opcional mas recomendado)**
```bash
# Criar usuário não-root
sudo adduser deploy
sudo usermod -aG sudo deploy

# Configurar chave SSH
# (depois de configurar, desabilitar root login)
```

### **11.3 Configurar backup automático**
```bash
# Criar script de backup do .env
# Configurar cron job para backup diário
```

---

## 📊 Comandos Úteis

### **Gerenciar Aplicação**
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs agendapro

# Reiniciar
pm2 restart agendapro

# Parar
pm2 stop agendapro

# Recarregar (zero downtime)
pm2 reload agendapro
```

### **Gerenciar Nginx**
```bash
# Reiniciar
sudo systemctl restart nginx

# Recarregar configuração
sudo nginx -s reload

# Ver status
sudo systemctl status nginx
```

### **Atualizar Aplicação**
```bash
cd /var/www/agendapro/agendapro
git pull
npm install --production
npx prisma generate
npm run build
pm2 restart agendapro
```

---

## 🐛 Troubleshooting

### **Erro: "Cannot find module"**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install --production
npx prisma generate
```

### **Erro: "Port 3000 already in use"**
```bash
# Verificar processo
pm2 list
pm2 delete agendapro
pm2 start ecosystem.config.js
```

### **Erro: "502 Bad Gateway"**
```bash
# Verificar se PM2 está rodando
pm2 status

# Verificar logs
pm2 logs agendapro

# Verificar se porta está correta no Nginx
sudo nano /etc/nginx/sites-available/agendapro
```

### **Erro: "Database connection failed"**
```bash
# Verificar .env
cat .env | grep DATABASE_URL

# Testar conexão
npx prisma db push
```

---

## 📝 Checklist de Deploy

- [ ] Node.js 20.x instalado
- [ ] PM2 instalado e configurado
- [ ] Nginx instalado e configurado
- [ ] Arquivo .env preenchido corretamente
- [ ] Prisma Client gerado
- [ ] Build da aplicação executado
- [ ] Aplicação rodando no PM2
- [ ] Nginx configurado e testado
- [ ] SSL configurado (se tiver domínio)
- [ ] Firewall configurado
- [ ] Aplicação acessível via HTTPS
- [ ] Login/cadastro funcionando
- [ ] Logs sendo monitorados

---

## 💰 Estimativa de Custos

### **VPS Hostinger/HostGator:**
- **Básico:** R$ 30-50/mês (2 vCPU, 2GB RAM)
- **Recomendado:** R$ 60-80/mês (4 vCPU, 4GB RAM)

### **Outros Custos:**
- **Domínio:** R$ 30-50/ano
- **Supabase:** GRÁTIS (até 500MB) ou R$ 25/mês
- **SSL:** GRÁTIS (Let's Encrypt)

**Total estimado:** R$ 30-80/mês

---

## 🎯 Próximos Passos

1. ✅ Configurar monitoramento (PM2 Plus ou UptimeRobot)
2. ✅ Configurar backups automáticos
3. ✅ Configurar domínio personalizado por tenant
4. ✅ Otimizar performance (cache, CDN)
5. ✅ Configurar CI/CD (GitHub Actions)

---

**Dúvidas?** Consulte os logs ou me avise!

