#!/bin/bash
# Script de actualización para Gold Whisper Dashboard en Hostinger VPS
# Este script actualiza la aplicación en el VPS sin perder configuraciones

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Iniciando actualización de Gold Whisper Dashboard en VPS Hostinger...${NC}"

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

# Verificar si la clave SSH existe
if [ ! -f "$SSH_KEY" ]; then
  echo -e "${YELLOW}📝 Clave SSH no encontrada. Creando...${NC}"
  cat > "$SSH_KEY" << 'EOL'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJCMGcBkhkFA8XBstcHqdsJadjfWvnHyGHwd wFpNHCyo galleorolaminado18k@gmail.com
EOL
  chmod 600 "$SSH_KEY"
fi

# Comprimir solo los archivos que han cambiado
echo -e "${YELLOW}🗜️ Preparando archivos para actualización...${NC}"
git diff --name-only HEAD | xargs tar -czf update.tar.gz

# Si no hay diferencias Git, empaquetar archivos clave
if [ ! -s update.tar.gz ]; then
  echo -e "${YELLOW}⚠️ No se detectaron cambios con Git. Preparando actualización básica...${NC}"
  tar -czf update.tar.gz \
    gold-whisper-dash-main/docker-compose.yml \
    gold-whisper-dash-main/ecosystem.config.js \
    gold-whisper-dash-main/startup.sh \
    gold-whisper-dash-main/api \
    gold-whisper-dash-main/src
fi

# Subir archivos al servidor
echo -e "${YELLOW}📤 Subiendo archivos actualizados al servidor ${VPS_IP}...${NC}"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no update.tar.gz nginx-hostinger.conf ${VPS_USER}@${VPS_IP}:/tmp/

# Ejecutar comandos en el servidor remoto
echo -e "${YELLOW}⚙️ Aplicando actualización en el servidor...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} << 'ENDSSH'
# Crear respaldo
echo "📦 Creando respaldo antes de actualizar..."
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
mkdir -p /opt/backups
cd /opt/gold-whisper-dash
tar -czf /opt/backups/gold-whisper-backup-${TIMESTAMP}.tar.gz .

# Extraer actualización
echo "📂 Extrayendo archivos actualizados..."
mkdir -p /tmp/update
tar -xzf /tmp/update.tar.gz -C /tmp/update

# Copiar archivos nuevos manteniendo la estructura
echo "🔄 Aplicando actualizaciones..."
cp -rf /tmp/update/* /opt/gold-whisper-dash/

# Instalar/actualizar dependencias
cd /opt/gold-whisper-dash
npm install

# Actualizar API si es necesario
if [ -d "/tmp/update/gold-whisper-dash-main/api" ]; then
  echo "🔄 Actualizando API..."
  cd /opt/gold-whisper-dash/api
  npm install
fi

# Configurar Nginx si el archivo está presente
if [ -f "/tmp/nginx-hostinger.conf" ]; then
  echo "🔄 Actualizando configuración de Nginx..."
  cp /tmp/nginx-hostinger.conf /etc/nginx/sites-available/gold-whisper
  
  # Crear enlace simbólico si no existe
  if [ ! -f "/etc/nginx/sites-enabled/gold-whisper" ]; then
    ln -s /etc/nginx/sites-available/gold-whisper /etc/nginx/sites-enabled/
  fi
  
  # Reiniciar Nginx
  systemctl restart nginx
fi

# Asegurar permisos correctos
chmod +x /opt/gold-whisper-dash/startup.sh

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
cd /opt/gold-whisper-dash
pm2 reload all

# Verificar estado
echo "✅ Actualización completada. Estado actual:"
pm2 status

# Limpiar archivos temporales
rm -rf /tmp/update /tmp/update.tar.gz /tmp/nginx-hostinger.conf
ENDSSH

echo -e "${GREEN}✅ Actualización finalizada correctamente!${NC}"
echo -e "${GREEN}🔗 Servicios reiniciados automáticamente.${NC}"
echo -e "${YELLOW}ℹ️ Para verificar el estado, conéctate a tu VPS y ejecuta: ${NC}pm2 status"

# Limpiar archivos locales
rm -f update.tar.gz
