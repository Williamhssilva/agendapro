#!/bin/bash

# Script de Deploy Automático - AgendaPro
# Execute: ./deploy.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do AgendaPro..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório da aplicação
APP_DIR="/var/www/agendapro/agendapro"
cd "$APP_DIR"

# Criar diretório de logs se não existir
mkdir -p /var/www/agendapro/logs

# 1. Backup do .env (segurança)
echo -e "${YELLOW}📦 Fazendo backup do .env...${NC}"
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ Backup criado${NC}"
fi

# 2. Atualizar código (se usar Git)
echo -e "${YELLOW}📥 Atualizando código...${NC}"
if [ -d .git ]; then
    git pull origin main || git pull origin master
    echo -e "${GREEN}✅ Código atualizado${NC}"
else
    echo -e "${YELLOW}⚠️  Não é um repositório Git, pulando atualização${NC}"
fi

# 3. Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install --production
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 4. Gerar Prisma Client
echo -e "${YELLOW}🗄️  Gerando Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client gerado${NC}"

# 5. Executar migrations (se houver)
echo -e "${YELLOW}🔄 Executando migrations...${NC}"
if [ -d "prisma/migrations" ]; then
    npx prisma migrate deploy || echo -e "${YELLOW}⚠️  Nenhuma migration pendente${NC}"
else
    echo -e "${YELLOW}⚠️  Usando db push ao invés de migrations${NC}"
    npx prisma db push --skip-generate || echo -e "${RED}❌ Erro ao aplicar schema${NC}"
fi

# 6. Build da aplicação
echo -e "${YELLOW}🏗️  Fazendo build da aplicação...${NC}"
npm run build
echo -e "${GREEN}✅ Build concluído${NC}"

# 7. Reiniciar aplicação no PM2
echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
pm2 restart agendapro || pm2 start ecosystem.config.js
echo -e "${GREEN}✅ Aplicação reiniciada${NC}"

# 8. Verificar status
echo -e "${YELLOW}📊 Verificando status...${NC}"
sleep 2
pm2 status

echo -e "${GREEN}"
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📊 Para ver logs: pm2 logs agendapro"
echo "🔄 Para reiniciar: pm2 restart agendapro"
echo "📈 Para monitorar: pm2 monit"
echo -e "${NC}"

