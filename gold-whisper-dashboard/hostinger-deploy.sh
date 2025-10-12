#!/bin/bash
# Script de despliegue para VPS Hostinger
# Este script desplegará la aplicación Gold Whisper Dashboard en el VPS de Hostinger

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Dominios
MAIN_DOMAIN="galle18k.com"
DASHBOARD_DOMAIN="dashboard.galle18k.com"
API_DOMAIN="api.galle18k.com"
CHATWOOT_DOMAIN="chatwoot.galle18k.com"

echo -e "${YELLOW}🚀 Iniciando despliegue a Hostinger VPS con subdominios:${NC}"
echo -e "   - Dashboard: ${GREEN}${DASHBOARD_DOMAIN}${NC}"
echo -e "   - API: ${GREEN}${API_DOMAIN}${NC}"
echo -e "   - Chatwoot: ${GREEN}${CHATWOOT_DOMAIN}${NC}"

# Configuración del servidor
VPS_IP=$(curl -s https://developers.hostinger.com/api/vps/v1/virtual-machines \
  -H "Authorization: Bearer ZaB83b4QuV3YyaUuVZVl0v9XlQhfaDvke659jZmM1c68484f" \
  -H "Content-Type: application/json" | grep -o '"ip_address":"[^"]*' | cut -d'"' -f4 | head -1)

if [ -z "$VPS_IP" ]; then
  echo -e "${RED}❌ No se pudo obtener la IP del VPS. Por favor, verifica tu token de API.${NC}"
  echo "IP manual: 31.70.131.9"
  VPS_IP="31.70.131.9"
fi

VPS_USER="root"
SSH_KEY="$HOME/.ssh/hostinger_key"

# Guardar clave SSH
echo -e "${YELLOW}📝 Configurando clave SSH...${NC}"
cat > "$SSH_KEY" << 'EOL'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJCMGcBkhkFA8XBstcHqdsJadjfWvnHyGHwd wFpNHCyo galleorolaminado18k@gmail.com
EOL

chmod 600 "$SSH_KEY"

# Comprimir proyecto para subir
echo -e "${YELLOW}🗜️ Comprimiendo proyecto...${NC}"
tar -czf gold-whisper-deploy.tar.gz gold-whisper-dash-main/

# Subir archivos al servidor
echo -e "${YELLOW}📤 Subiendo archivos al servidor ${VPS_IP}...${NC}"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no gold-whisper-deploy.tar.gz ${VPS_USER}@${VPS_IP}:/opt/

# Ejecutar comandos en el servidor remoto
echo -e "${YELLOW}⚙️ Configurando el servidor...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} << 'ENDSSH'
# Instalar dependencias
apt-get update
apt-get install -y docker.io docker-compose nodejs npm curl nginx certbot python3-certbot-nginx dnsutils

# Habilitar y arrancar Docker y Nginx
systemctl enable docker
systemctl start docker
systemctl enable nginx
systemctl start nginx

# Instalar PM2 globalmente
npm install -g pm2

# Configurar los registros DNS para subdominios (solo informativo)
echo "📋 IMPORTANTE: Asegúrate de configurar estos registros DNS en el panel de Hostinger:"
echo "   - Tipo A: dashboard.galle18k.com -> $(hostname -I | awk '{print $1}')"
echo "   - Tipo A: api.galle18k.com -> $(hostname -I | awk '{print $1}')"
echo "   - Tipo A: chatwoot.galle18k.com -> $(hostname -I | awk '{print $1}')"

# Preparar directorio
mkdir -p /opt/gold-whisper-dash
cd /opt
tar -xzf gold-whisper-deploy.tar.gz -C /opt/
cp -r gold-whisper-dash-main/* /opt/gold-whisper-dash/
cd /opt/gold-whisper-dash

# Configurar Nginx para el dominio
cp -f /tmp/nginx-hostinger.conf /etc/nginx/sites-available/gold-whisper

# Crear enlace simbólico si no existe
if [ ! -f "/etc/nginx/sites-enabled/gold-whisper" ]; then
  ln -s /etc/nginx/sites-available/gold-whisper /etc/nginx/sites-enabled/
fi

# Quitar el sitio por defecto de Nginx
rm -f /etc/nginx/sites-enabled/default

# Probar y recargar configuración de Nginx
nginx -t && systemctl reload nginx

# Configurar PM2 como servicio
pm2 startup
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# Iniciar servicios con PM2
cd /opt/gold-whisper-dash
chmod +x startup.sh
./startup.sh

# Guardar configuración de PM2
pm2 save

# Configurar dominio
echo "✅ Configurando aplicaciones en:"
echo "   - Dashboard: http://${DASHBOARD_DOMAIN}"
echo "   - API: http://${API_DOMAIN}"
echo "   - Chatwoot: http://${CHATWOOT_DOMAIN}"

# Intentar configurar HTTPS automáticamente
echo "📋 ¿Deseas configurar HTTPS con Let's Encrypt para los subdominios? (s/n)"
read -r https_choice

if [ "$https_choice" = "s" ]; then
  echo "🔐 Configurando HTTPS para los subdominios..."
  
  # Verificar que los subdominios sean accesibles primero
  for domain in "${DASHBOARD_DOMAIN}" "${API_DOMAIN}" "${CHATWOOT_DOMAIN}"; do
    if host "$domain" > /dev/null; then
      echo "✓ El subdominio $domain está configurado correctamente."
    else
      echo "⚠️ Advertencia: El subdominio $domain no parece estar configurado en DNS."
      echo "   Debes crear el registro DNS tipo A en el panel de Hostinger antes de continuar."
      echo "   Intenta de nuevo la configuración HTTPS más tarde con:"
      echo "   certbot --nginx -d $domain"
      continue
    fi
    
    certbot --nginx -d "$domain"
  done
  
  # Recargar Nginx
  systemctl reload nginx
  
  echo "✅ HTTPS configurado para los subdominios disponibles."
  echo "   Accede a tus aplicaciones vía HTTPS:"
  echo "   - Dashboard: https://${DASHBOARD_DOMAIN}"
  echo "   - API: https://${API_DOMAIN}"
  echo "   - Chatwoot: https://${CHATWOOT_DOMAIN}"
else
  echo "ℹ️ Omitiendo configuración HTTPS. Puedes configurarlo más tarde con:"
  echo "   certbot --nginx -d ${DASHBOARD_DOMAIN} -d ${API_DOMAIN} -d ${CHATWOOT_DOMAIN}"
fi

echo "✅ Despliegue completo en Hostinger VPS"
echo "- Dashboard URL: http://${DASHBOARD_DOMAIN}"
echo "- API URL: http://${API_DOMAIN}"
echo "- Chatwoot URL: http://${CHATWOOT_DOMAIN}"
echo "- IP directa del servidor: $(hostname -I | awk '{print $1}')"
ENDSSH

echo -e "${GREEN}✅ Despliegue completado!${NC}"
echo -e "${GREEN}🔗 La aplicación debería estar funcionando 24/7 en tu VPS de Hostinger${NC}"
echo -e "${YELLOW}ℹ️ Para verificar el estado, conéctate a tu VPS y ejecuta: ${NC}pm2 status"
