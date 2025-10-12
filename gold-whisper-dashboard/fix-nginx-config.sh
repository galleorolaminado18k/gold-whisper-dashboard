#!/bin/bash
# Script para corregir la configuración de Nginx y redireccionar correctamente los subdominios
# Este script corrige el problema donde dashboard.galle18k.com muestra n8n

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===========================================================${NC}"
echo -e "${YELLOW}      CORRECCIÓN DE CONFIGURACIÓN NGINX PARA SUBDOMINOS      ${NC}"
echo -e "${YELLOW}===========================================================${NC}"
echo -e "${GREEN}Este script corregirá la configuración de Nginx para que los${NC}"
echo -e "${GREEN}subdominios apunten correctamente a tus aplicaciones.${NC}"
echo -e ""

# Configuración correcta para gold-whisper.conf
echo -e "${BLUE}Generando nueva configuración de Nginx...${NC}"

# Crear archivo de configuración correcto
cat > gold-whisper-fixed.conf << 'EOL'
# Configuración para el dashboard (corregida)
server {
    listen 80;
    server_name dashboard.galle18k.com;
    
    location / {
        # Redireccionar al puerto 8081 (Gold Whisper Dashboard)
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Configuración para la API
server {
    listen 80;
    server_name api.galle18k.com;
    
    location / {
        # Redireccionar al puerto 3001 (API de Gold Whisper)
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Configuración para Chatwoot
server {
    listen 80;
    server_name chatwoot.galle18k.com;
    
    location / {
        # Redireccionar al puerto 3020 (Chatwoot)
        proxy_pass http://localhost:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOL

echo -e "${GREEN}Configuración generada correctamente.${NC}"
echo -e ""
echo -e "${YELLOW}INSTRUCCIONES:${NC}"
echo -e "${BLUE}1. Conéctate a tu servidor VPS:${NC}"
echo -e "   ssh root@85.31.235.37"
echo -e ""
echo -e "${BLUE}2. Copia y pega estos comandos:${NC}"
echo -e "   ${GREEN}# Respaldo de la configuración actual${NC}"
echo -e "   cp /etc/nginx/sites-available/gold-whisper.conf /etc/nginx/sites-available/gold-whisper.conf.bak"
echo -e ""
echo -e "   ${GREEN}# Listar configuraciones actuales${NC}"
echo -e "   ls -la /etc/nginx/sites-available/"
echo -e ""
echo -e "   ${GREEN}# Ver configuración de n8n (si existe)${NC}"
echo -e "   cat /etc/nginx/sites-available/n8n"
echo -e ""
echo -e "   ${GREEN}# Verificar qué está corriendo en el puerto 80${NC}"
echo -e "   sudo lsof -i :80"
echo -e ""
echo -e "   ${GREEN}# Verificar qué está corriendo en el puerto que usa n8n${NC}"
echo -e "   sudo lsof -i :5678"
echo -e ""
echo -e "${BLUE}3. Crea nueva configuración:${NC}"
echo -e '   cat > /etc/nginx/sites-available/gold-whisper.conf << "EOF"
# Configuración para el dashboard (corregida)
server {
    listen 80;
    server_name dashboard.galle18k.com;
    
    location / {
        # Redireccionar al puerto 8081 (Gold Whisper Dashboard)
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Configuración para la API
server {
    listen 80;
    server_name api.galle18k.com;
    
    location / {
        # Redireccionar al puerto 3001 (API de Gold Whisper)
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Configuración para Chatwoot
server {
    listen 80;
    server_name chatwoot.galle18k.com;
    
    location / {
        # Redireccionar al puerto 3020 (Chatwoot)
        proxy_pass http://localhost:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF'
echo -e ""
echo -e "${BLUE}4. Verifica la configuración y reinicia Nginx:${NC}"
echo -e "   nginx -t"
echo -e "   systemctl restart nginx"
echo -e ""
echo -e "${BLUE}5. Verifica qué está ejecutándose en los puertos necesarios:${NC}"
echo -e "   ss -tulpn | grep LISTEN"
echo -e ""
echo -e "${RED}NOTA IMPORTANTE:${NC}"
echo -e "Si el problema persiste, puede ser necesario identificar qué aplicaciones están"
echo -e "ejecutándose en qué puertos y ajustar la configuración en consecuencia."
echo -e "Las aplicaciones y puertos comunes suelen ser:"
echo -e "  - Dashboard: puerto 8081"
echo -e "  - Chatwoot: puerto 3020"
echo -e "  - n8n: puerto 5678"
echo -e "${YELLOW}===========================================================${NC}"
