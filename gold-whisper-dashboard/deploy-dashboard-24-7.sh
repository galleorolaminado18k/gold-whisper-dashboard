#!/bin/bash

# Script para implementar el Dashboard Gold Whisper con disponibilidad 24/7

# Variables de configuración - Personaliza según tus necesidades
DASHBOARD_DOMAIN="dashboard.galle18k.com"
SERVER_IP="85.31.235.37"
DASHBOARD_PORT="8081"
DASHBOARD_DIR="/opt/gold-whisper-dash"

echo "====================================================================="
echo "Implementación automática de Dashboard Gold Whisper 24/7 en $DASHBOARD_DOMAIN"
echo "====================================================================="

# Crear directorio de logs
mkdir -p /var/log/
touch /var/log/deploy-dashboard.log

# Función para registrar mensajes
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a /var/log/deploy-dashboard.log
}

# 1. Verificar que el directorio del proyecto existe
if [ ! -d "$DASHBOARD_DIR" ]; then
    log "❌ El directorio $DASHBOARD_DIR no existe. Por favor, verifica la ruta correcta."
    exit 1
fi

# 2. Verificar que Node.js y npm están instalados
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    log "Node.js o npm no encontrados. Instalando..."
    apt update && apt install -y nodejs npm >> /var/log/deploy-dashboard.log 2>&1
fi

log "✅ Node.js y npm están disponibles. Versión de Node: $(node -v), Versión de npm: $(npm -v)"

# 3. Instalar dependencias del proyecto
log "Instalando dependencias del proyecto..."
cd $DASHBOARD_DIR
npm install >> /var/log/deploy-dashboard.log 2>&1
if [ $? -eq 0 ]; then
    log "✅ Dependencias instaladas correctamente"
else
    log "❌ Error al instalar dependencias. Verifica los logs en /var/log/deploy-dashboard.log"
fi

# 4. Crear script de inicio para el Dashboard
log "Creando script de inicio para el Dashboard..."
cat > $DASHBOARD_DIR/start-dashboard.sh << EOL
#!/bin/bash
cd $DASHBOARD_DIR
export NODE_ENV=production
npm run dev -- --host 0.0.0.0 --port $DASHBOARD_PORT > /var/log/gold-whisper-dashboard.log 2>&1 &
echo \$! > /var/run/gold-whisper-dashboard.pid
EOL

chmod +x $DASHBOARD_DIR/start-dashboard.sh
log "✅ Script de inicio creado en $DASHBOARD_DIR/start-dashboard.sh"

# 5. Crear servicio systemd para el Dashboard
log "Configurando servicio systemd para el Dashboard..."
cat > /etc/systemd/system/gold-whisper-dashboard.service << EOL
[Unit]
Description=Gold Whisper Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$DASHBOARD_DIR
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port $DASHBOARD_PORT
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

# Recargar systemd y habilitar/iniciar el servicio
systemctl daemon-reload
systemctl enable gold-whisper-dashboard.service
systemctl start gold-whisper-dashboard.service
if systemctl is-active --quiet gold-whisper-dashboard.service; then
    log "✅ Servicio gold-whisper-dashboard iniciado correctamente"
else
    log "⚠️ Error al iniciar el servicio gold-whisper-dashboard. Intentando con el script directo..."
    $DASHBOARD_DIR/start-dashboard.sh
    sleep 3
    if ps aux | grep -q "[n]pm run dev.*$DASHBOARD_PORT"; then
        log "✅ Dashboard iniciado correctamente mediante script"
    else
        log "❌ Error al iniciar el Dashboard. Verificando logs..."
        tail -n 20 /var/log/gold-whisper-dashboard.log >> /var/log/deploy-dashboard.log 2>&1
    fi
fi

# 6. Configurar inicio automático con cron (alternativa a systemd)
log "Configurando inicio automático con cron (como respaldo)..."
(crontab -l 2>/dev/null | grep -v "start-dashboard.sh"; echo "@reboot $DASHBOARD_DIR/start-dashboard.sh") | crontab -

# 7. Configurar Nginx para el Dashboard
log "Configurando Nginx como proxy inverso para el Dashboard..."
# Verificar si Nginx está instalado
if ! command -v nginx &> /dev/null; then
    log "Nginx no encontrado. Instalando..."
    apt update && apt install -y nginx >> /var/log/deploy-dashboard.log 2>&1
fi

# Crear configuración de sitio para el Dashboard
cat > /etc/nginx/sites-available/$DASHBOARD_DOMAIN << EOL
server {
    listen 80;
    server_name $DASHBOARD_DOMAIN;

    location / {
        proxy_pass http://localhost:$DASHBOARD_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Crear enlace simbólico para activar el sitio
ln -sf /etc/nginx/sites-available/$DASHBOARD_DOMAIN /etc/nginx/sites-enabled/

# Verificar configuración de Nginx
nginx -t >> /var/log/deploy-dashboard.log 2>&1
if [ $? -eq 0 ]; then
    log "✅ Configuración de Nginx validada correctamente"
    systemctl restart nginx
else
    log "❌ Error en la configuración de Nginx. Verifica los logs en /var/log/deploy-dashboard.log"
fi

# 8. Configurar SSL con Certbot (Let's Encrypt)
log "Configurando SSL con Let's Encrypt..."
# Verificar si Certbot está instalado
if ! command -v certbot &> /dev/null; then
    log "Certbot no encontrado. Instalando..."
    apt update && apt install -y certbot python3-certbot-nginx >> /var/log/deploy-dashboard.log 2>&1
fi

# Obtener certificado SSL (no interactivo)
log "Obteniendo certificado SSL para $DASHBOARD_DOMAIN..."
certbot --nginx -d $DASHBOARD_DOMAIN --non-interactive --agree-tos --email admin@$DASHBOARD_DOMAIN >> /var/log/deploy-dashboard.log 2>&1
if [ $? -eq 0 ]; then
    log "✅ Certificado SSL obtenido correctamente"
else
    log "⚠️ Error al obtener certificado SSL. Verifica los logs en /var/log/deploy-dashboard.log"
fi

# 9. Crear script de monitoreo y recuperación automática
log "Creando script de monitoreo para el Dashboard..."
cat > /opt/monitor-dashboard.sh << 'EOL'
#!/bin/bash

DASHBOARD_PORT="8081"
DASHBOARD_DIR="/opt/gold-whisper-dash"

# Verificar si el dashboard está respondiendo
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$DASHBOARD_PORT)

if [ "$response" != "200" ] && [ "$response" != "302" ]; then
    echo "$(date) - Dashboard no está respondiendo. Reiniciando..." >> /var/log/monitor-dashboard.log
    
    # Matar proceso anterior si existe
    if [ -f /var/run/gold-whisper-dashboard.pid ]; then
        pid=$(cat /var/run/gold-whisper-dashboard.pid)
        if ps -p $pid > /dev/null; then
            kill $pid
            sleep 2
        fi
    fi
    
    # Reiniciar el dashboard
    $DASHBOARD_DIR/start-dashboard.sh
else
    echo "$(date) - Dashboard funcionando correctamente." >> /var/log/monitor-dashboard.log
fi
EOL

# Reemplazar placeholders en el script de monitoreo
sed -i "s|DASHBOARD_PORT=\"8081\"|DASHBOARD_PORT=\"$DASHBOARD_PORT\"|g" /opt/monitor-dashboard.sh
sed -i "s|DASHBOARD_DIR=\"/opt/gold-whisper-dash\"|DASHBOARD_DIR=\"$DASHBOARD_DIR\"|g" /opt/monitor-dashboard.sh

chmod +x /opt/monitor-dashboard.sh

# Agregar a crontab para ejecutar cada 5 minutos
(crontab -l 2>/dev/null | grep -v "monitor-dashboard.sh"; echo "*/5 * * * * /opt/monitor-dashboard.sh") | crontab -
log "✅ Script de monitoreo configurado para ejecutarse cada 5 minutos"

# 10. Verificar que el Dashboard responde
log "Verificando que el Dashboard está respondiendo..."
sleep 5  # Esperar a que el servicio esté completamente iniciado
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$DASHBOARD_PORT)
if [ "$response" = "200" ] || [ "$response" = "302" ]; then
    log "✅ Dashboard respondiendo correctamente en puerto $DASHBOARD_PORT"
else
    log "⚠️ Dashboard no responde como se esperaba (código: $response). Revisa los logs para más detalles."
fi

# 11. Mostrar información de configuración
log ""
log "====================================================================="
log "✅ ¡Implementación de Dashboard Gold Whisper 24/7 completada!"
log "====================================================================="
log "URL de acceso: https://$DASHBOARD_DOMAIN"
log "Puerto local: $DASHBOARD_PORT"
log "Directorio de la aplicación: $DASHBOARD_DIR"
log "Monitoreo automático: Cada 5 minutos"
log "====================================================================="
log "Pasos recomendados:"
log "1. Verifica el estado del servicio: systemctl status gold-whisper-dashboard.service"
log "2. Verifica la URL en tu navegador: https://$DASHBOARD_DOMAIN"
log "3. Asegúrate que el registro DNS en Hostinger para el dominio $DASHBOARD_DOMAIN"
log "   apunta a $SERVER_IP"
log "====================================================================="
log "Para ver los logs del despliegue: cat /var/log/deploy-dashboard.log"
log "Para ver los logs del Dashboard: tail -f /var/log/gold-whisper-dashboard.log"
log "Para ver los logs de monitoreo: tail -f /var/log/monitor-dashboard.log"
log "====================================================================="
log "Para reiniciar manualmente el dashboard:"
log "systemctl restart gold-whisper-dashboard.service"
log "O alternativamente: $DASHBOARD_DIR/start-dashboard.sh"
log "====================================================================="

# Verificación final del servicio
if systemctl is-active --quiet gold-whisper-dashboard.service; then
    log "El servicio gold-whisper-dashboard está activo y ejecutándose"
else
    if ps aux | grep -q "[n]pm run dev.*$DASHBOARD_PORT"; then
        log "Dashboard ejecutándose mediante script de inicio (no systemd)"
    else
        log "⚠️ El Dashboard no parece estar activo. Verifica los logs."
    fi
fi
