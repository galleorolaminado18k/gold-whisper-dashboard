#!/bin/bash
# Script de despliegue automatizado para Gold Whisper Dashboard en VPS Ubuntu
# Para ser ejecutado en el servidor Ubuntu VPS 85.31.235.37

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar progreso
show_progress() {
  echo -e "${BLUE}➤ $1${NC}"
}

# Función para mostrar éxito
show_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Función para mostrar error
show_error() {
  echo -e "${RED}✗ $1${NC}"
  exit 1
}

# Encabezado
clear
echo -e "${YELLOW}===========================================================${NC}"
echo -e "${YELLOW}      DESPLIEGUE AUTOMATIZADO DE GOLD WHISPER DASHBOARD      ${NC}"
echo -e "${YELLOW}===========================================================${NC}"
echo -e "${GREEN}Este script desplegará automáticamente todos los componentes${NC}"
echo -e "${GREEN}de Gold Whisper Dashboard en tu VPS Ubuntu.${NC}"
echo -e "${BLUE}IP del servidor: 85.31.235.37${NC}"
echo -e ""

# Verificar si estamos ejecutando como root
if [ "$EUID" -ne 0 ]; then
  show_error "Este script debe ejecutarse como root (usa sudo)."
fi

# Actualizar el sistema
show_progress "Actualizando el sistema..."
apt update -qq && apt upgrade -y -qq
show_success "Sistema actualizado"

# Instalar dependencias necesarias
show_progress "Instalando dependencias..."
apt install -y curl git nginx certbot python3-certbot-nginx nodejs npm
show_success "Dependencias instaladas"

# Instalar PM2 globalmente
show_progress "Instalando PM2..."
npm install -g pm2
show_success "PM2 instalado"

# Crear directorios para la aplicación
show_progress "Creando estructura de directorios..."
mkdir -p /opt/gold-whisper/{frontend,api}
show_success "Directorios creados"

# Configurar Nginx
show_progress "Configurando Nginx..."
cat > /etc/nginx/sites-available/gold-whisper.conf << 'EOL'
# Configuración para el Dashboard (Frontend)
server {
    listen 80;
    server_name dashboard.galle18k.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Configuración para la API
server {
    listen 80;
    server_name api.galle18k.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Configuración para Chatwoot
server {
    listen 80;
    server_name chatwoot.galle18k.com;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Activar la configuración de Nginx
ln -sf /etc/nginx/sites-available/gold-whisper.conf /etc/nginx/sites-enabled/
# Eliminar el default si existe
[ -f /etc/nginx/sites-enabled/default ] && rm /etc/nginx/sites-enabled/default
# Verificar la configuración de Nginx
nginx -t && systemctl reload nginx
show_success "Nginx configurado correctamente"

# Preguntar al usuario si quiere obtener certificados SSL
echo -e "${YELLOW}"
read -p "¿Quieres obtener certificados SSL ahora? (s/n): " get_ssl
echo -e "${NC}"

if [ "$get_ssl" = "s" ]; then
    show_progress "Obteniendo certificados SSL con Let's Encrypt..."
    certbot --nginx -d dashboard.galle18k.com -d api.galle18k.com -d chatwoot.galle18k.com
    show_success "Certificados SSL instalados"
else
    echo -e "${BLUE}Puedes obtener certificados SSL más tarde con:${NC}"
    echo "sudo certbot --nginx -d dashboard.galle18k.com -d api.galle18k.com -d chatwoot.galle18k.com"
fi

# Clonar el repositorio
show_progress "Descargando el código de la aplicación..."
cd /opt/gold-whisper
git clone https://github.com/galleorolaminado18k/gold-whisper-dashboard.git temp
# Mover archivos a los directorios correspondientes
cp -r temp/* frontend/
cp -r temp/api/* api/
rm -rf temp
show_success "Código descargado y organizado"

# Desplegar el frontend
show_progress "Desplegando el frontend..."
cd /opt/gold-whisper/frontend
npm install
npm run build
# Configurar un servidor estático simple con Express
cat > server.js << 'EOL'
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Compresión gzip para mejor rendimiento
app.use(compression());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Manejar rutas SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend ejecutándose en http://localhost:${PORT}`);
});
EOL
# Instalar dependencias para el servidor
npm install express compression
# Iniciar con PM2
pm2 start server.js --name "gold-whisper-frontend"
show_success "Frontend desplegado"

# Desplegar la API
show_progress "Desplegando la API..."
cd /opt/gold-whisper/api
npm install
# Iniciar con PM2
pm2 start index.js --name "gold-whisper-api" -- --port 3001
show_success "API desplegada"

# Desplegar Chatwoot
show_progress "Desplegando Chatwoot..."
cd /opt/gold-whisper/api
# Asegurarse de que chatwoot.js sea el archivo correcto
if [ -f "chatwoot.js" ]; then
    pm2 start chatwoot.js --name "gold-whisper-chatwoot" -- --port 3002
    show_success "Chatwoot desplegado"
else
    show_error "No se encontró el archivo chatwoot.js"
fi

# Guardar la configuración de PM2 para que se inicie automáticamente
show_progress "Configurando arranque automático..."
pm2 save
pm2 startup
show_success "PM2 configurado para inicio automático"

# Crear script de monitoreo
show_progress "Creando script de monitoreo..."
cat > /opt/monitor.sh << 'EOL'
#!/bin/bash
# Verificar servicios
if ! pgrep -f "pm2" > /dev/null; then
    pm2 resurrect
    echo "PM2 reiniciado en $(date)" >> /var/log/gold-whisper-monitor.log
fi

# Verificar espacio en disco
DISK_USAGE=$(df / | grep / | awk '{ print $5}' | sed 's/%//g')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "Alerta: Uso de disco al ${DISK_USAGE}% en $(date)" >> /var/log/gold-whisper-monitor.log
fi
EOL
chmod +x /opt/monitor.sh
(crontab -l 2>/dev/null; echo "*/30 * * * * /opt/monitor.sh") | crontab -
show_success "Script de monitoreo creado y programado"

# Crear script de respaldo
show_progress "Creando script de respaldo..."
cat > /opt/backup.sh << 'EOL'
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/backups"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de la aplicación
tar -czf $BACKUP_DIR/gold-whisper_$TIMESTAMP.tar.gz /opt/gold-whisper

# Mantener solo los últimos 7 respaldos
ls -t $BACKUP_DIR/gold-whisper_*.tar.gz | tail -n +8 | xargs rm -f
EOL
chmod +x /opt/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -
show_success "Script de respaldo creado y programado (diario a las 2 AM)"

# Mensaje final
echo -e "${GREEN}===========================================================${NC}"
echo -e "${GREEN}      ¡DESPLIEGUE COMPLETADO EXITOSAMENTE!      ${NC}"
echo -e "${GREEN}===========================================================${NC}"
echo -e ""
echo -e "${YELLOW}Tus servicios están disponibles en:${NC}"
echo -e "- Dashboard: ${BLUE}https://dashboard.galle18k.com${NC}"
echo -e "- API: ${BLUE}https://api.galle18k.com${NC}"
echo -e "- Chatwoot: ${BLUE}https://chatwoot.galle18k.com${NC}"
echo -e ""
echo -e "${YELLOW}Para ver el estado de los servicios:${NC}"
echo -e "  ${BLUE}pm2 status${NC}"
echo -e ""
echo -e "${YELLOW}Para ver logs:${NC}"
echo -e "  ${BLUE}pm2 logs${NC}"
echo -e ""
echo -e "${YELLOW}Backups automáticos:${NC} ${BLUE}/opt/backups/${NC} (diarios a las 2 AM)"
echo -e ""
echo -e "${RED}IMPORTANTE:${NC} Recuerda configurar tus registros DNS para que apunten a ${BLUE}85.31.235.37${NC}:"
echo -e "- dashboard.galle18k.com → ${BLUE}85.31.235.37${NC}"
echo -e "- api.galle18k.com → ${BLUE}85.31.235.37${NC}"
echo -e "- chatwoot.galle18k.com → ${BLUE}85.31.235.37${NC}"
echo -e ""
echo -e "${GREEN}¡Disfruta de tu aplicación en tu propio VPS con SSL gratuito y rendimiento óptimo!${NC}"
