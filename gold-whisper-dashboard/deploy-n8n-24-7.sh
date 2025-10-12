#!/bin/bash

# Script para implementar N8N con disponibilidad 24/7
# Basado en SOLUCION-N8N-24-7.md

# Variables de configuración - Personaliza según tus necesidades
N8N_DOMAIN="n8n.galle18k.com"
SERVER_IP="85.31.235.37"
N8N_PORT="5678"
N8N_ENCRYPTION_KEY=$(openssl rand -hex 24)
N8N_USER_FOLDER="/root/.n8n"

echo "====================================================================="
echo "Implementación automática de N8N 24/7 en $N8N_DOMAIN"
echo "====================================================================="

# Crear directorio de logs
mkdir -p /var/log/
touch /var/log/deploy-n8n.log

# Función para registrar mensajes
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a /var/log/deploy-n8n.log
}

# 1. Instalar N8N
log "Instalando N8N globalmente..."
npm install -g n8n >> /var/log/deploy-n8n.log 2>&1
if [ $? -eq 0 ]; then
    log "✅ N8N instalado correctamente. Versión: $(n8n --version)"
else
    log "❌ Error al instalar N8N. Verifica los logs en /var/log/deploy-n8n.log"
    exit 1
fi

# 2. Crear directorio y archivo de configuración para N8N
log "Configurando directorios y variables de entorno para N8N..."
mkdir -p $N8N_USER_FOLDER

# Crear archivo .env para N8N
cat > $N8N_USER_FOLDER/.env << EOL
N8N_HOST=$N8N_DOMAIN
N8N_PROTOCOL=https
N8N_PORT=$N8N_PORT
N8N_EDITOR_BASE_URL=https://$N8N_DOMAIN
N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY
N8N_USER_FOLDER=$N8N_USER_FOLDER
EOL

log "✅ Configuración de N8N creada en $N8N_USER_FOLDER/.env"

# 3. Crear servicio systemd para N8N
log "Configurando servicio systemd para N8N..."
cat > /etc/systemd/system/n8n.service << EOL
[Unit]
Description=n8n
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$N8N_USER_FOLDER
Environment=NODE_ENV=production
ExecStart=/usr/bin/n8n start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

# Recargar systemd y habilitar/iniciar el servicio
systemctl daemon-reload
systemctl enable n8n.service
systemctl start n8n.service
if systemctl is-active --quiet n8n.service; then
    log "✅ Servicio n8n iniciado correctamente"
else
    log "❌ Error al iniciar el servicio n8n. Verificando logs..."
    journalctl -u n8n.service -n 20 >> /var/log/deploy-n8n.log 2>&1
fi

# 4. Configurar Nginx como proxy inverso
log "Configurando Nginx como proxy inverso para N8N..."
# Verificar si Nginx está instalado
if ! command -v nginx &> /dev/null; then
    log "Nginx no encontrado. Instalando..."
    apt update && apt install -y nginx >> /var/log/deploy-n8n.log 2>&1
fi

# Crear configuración de sitio para N8N
cat > /etc/nginx/sites-available/$N8N_DOMAIN << EOL
server {
    listen 80;
    server_name $N8N_DOMAIN;

    location / {
        proxy_pass http://localhost:$N8N_PORT;
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
ln -sf /etc/nginx/sites-available/$N8N_DOMAIN /etc/nginx/sites-enabled/

# Verificar configuración de Nginx
nginx -t >> /var/log/deploy-n8n.log 2>&1
if [ $? -eq 0 ]; then
    log "✅ Configuración de Nginx validada correctamente"
    systemctl restart nginx
else
    log "❌ Error en la configuración de Nginx. Verifica los logs en /var/log/deploy-n8n.log"
fi

# 5. Configurar SSL con Certbot (Let's Encrypt)
log "Configurando SSL con Let's Encrypt..."
# Verificar si Certbot está instalado
if ! command -v certbot &> /dev/null; then
    log "Certbot no encontrado. Instalando..."
    apt update && apt install -y certbot python3-certbot-nginx >> /var/log/deploy-n8n.log 2>&1
fi

# Obtener certificado SSL (no interactivo)
log "Obteniendo certificado SSL para $N8N_DOMAIN..."
certbot --nginx -d $N8N_DOMAIN --non-interactive --agree-tos --email admin@$N8N_DOMAIN >> /var/log/deploy-n8n.log 2>&1
if [ $? -eq 0 ]; then
    log "✅ Certificado SSL obtenido correctamente"
else
    log "❌ Error al obtener certificado SSL. Verifica los logs en /var/log/deploy-n8n.log"
fi

# 6. Crear script de monitoreo y recuperación automática
log "Creando script de monitoreo para N8N..."
cat > /opt/monitor-n8n.sh << 'EOL'
#!/bin/bash

# Verificar si n8n está respondiendo
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5678)

if [ "$response" != "200" ] && [ "$response" != "302" ]; then
    echo "$(date) - n8n no está respondiendo. Reiniciando..." >> /var/log/monitor-n8n.log
    systemctl restart n8n.service
else
    echo "$(date) - n8n está funcionando correctamente." >> /var/log/monitor-n8n.log
fi
EOL

chmod +x /opt/monitor-n8n.sh

# Agregar a crontab para ejecutar cada 5 minutos
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/monitor-n8n.sh") | crontab -
log "✅ Script de monitoreo configurado para ejecutarse cada 5 minutos"

# 7. Crear directorio para backups
mkdir -p /opt/backups/n8n
log "✅ Directorio de backups creado en /opt/backups/n8n"

# 8. Mostrar información de configuración
log ""
log "====================================================================="
log "✅ ¡Implementación de N8N 24/7 completada!"
log "====================================================================="
log "URL de acceso: https://$N8N_DOMAIN"
log "Puerto local: $N8N_PORT"
log "Directorio de configuración: $N8N_USER_FOLDER"
log "Monitoreo automático: Cada 5 minutos"
log "====================================================================="
log "Pasos recomendados:"
log "1. Verifica el estado del servicio: systemctl status n8n.service"
log "2. Verifica la URL en tu navegador: https://$N8N_DOMAIN"
log "3. Actualiza el registro DNS en Hostinger para el dominio $N8N_DOMAIN"
log "   añadiendo un registro A apuntando a $SERVER_IP"
log "====================================================================="
log "Para ver los logs del despliegue: cat /var/log/deploy-n8n.log"
log "Para ver los logs del servicio: journalctl -u n8n.service -f"
log "====================================================================="

# Verificación final del servicio
if systemctl is-active --quiet n8n.service; then
    log "El servicio n8n está activo y ejecutándose"
else
    log "⚠️ El servicio n8n no está activo. Verifica los logs con: journalctl -u n8n.service"
fi

log "Espera unos minutos para que N8N se inicie completamente antes de acceder."
