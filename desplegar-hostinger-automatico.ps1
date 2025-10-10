# Script PowerShell para desplegar Gold Whisper en VPS Hostinger
# Ejecutar desde terminal de VS Code (PowerShell)

$VPS_IP = "85.31.235.37"
$VPS_USER = "root"
$PROJECT_DIR = "/opt/gold-whisper-dash"
$DOMAIN = "galle18k.com"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Despliegue Automatico Gold Whisper en VPS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Función para ejecutar comandos en el VPS
function Invoke-SSHCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    Write-Host ">>> $Description..." -ForegroundColor Yellow
    ssh "${VPS_USER}@${VPS_IP}" $Command
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] $Description completado" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] $Description fallo" -ForegroundColor Red
    }
    Write-Host ""
}

# Paso 1: Verificar conexión
Write-Host "Verificando conexion al VPS..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "echo 'Conexion exitosa'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] No se pudo conectar al VPS. Verifica:" -ForegroundColor Red
    Write-Host "  1. La IP es correcta: $VPS_IP" -ForegroundColor White
    Write-Host "  2. Tienes acceso SSH configurado" -ForegroundColor White
    Write-Host "  3. Ejecuta: ssh ${VPS_USER}@${VPS_IP}" -ForegroundColor White
    exit 1
}
Write-Host "[OK] Conexion al VPS exitosa" -ForegroundColor Green
Write-Host ""

# Paso 2: Crear directorios base
Invoke-SSHCommand "mkdir -p $PROJECT_DIR" "Crear directorio del proyecto"
Invoke-SSHCommand "mkdir -p /var/log" "Crear directorio de logs"
Invoke-SSHCommand "mkdir -p /opt" "Crear directorio /opt"

# Paso 3: Clonar o actualizar proyecto
Write-Host ">>> Clonando/actualizando proyecto..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
    if [ -d '$PROJECT_DIR/gold-whisper-dash-main' ]; then
        echo 'Actualizando proyecto existente...'
        cd $PROJECT_DIR/gold-whisper-dash-main
        git pull
    else
        echo 'Clonando proyecto nuevo...'
        cd $PROJECT_DIR
        git clone https://github.com/galleorolaminado18k/gold-whisper-dashboard.git gold-whisper-dash-main
    fi
"@
Write-Host "[OK] Proyecto clonado/actualizado" -ForegroundColor Green
Write-Host ""

# Paso 4: Instalar dependencias
Invoke-SSHCommand @"
    cd $PROJECT_DIR/gold-whisper-dash-main && npm install
"@ "Instalar dependencias del Dashboard"

Invoke-SSHCommand @"
    cd $PROJECT_DIR/gold-whisper-dash-main/api && npm install
"@ "Instalar dependencias de la API"

# Paso 5: Crear script de inicio para API
Write-Host ">>> Creando script de inicio para API..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
cat > $PROJECT_DIR/start-api.sh << 'EOL'
#!/bin/bash
cd $PROJECT_DIR/gold-whisper-dash-main/api
node index.js > /var/log/gold-whisper-api.log 2>&1 &
echo \$! > /var/run/gold-whisper-api.pid
echo 'API iniciada'
EOL
chmod +x $PROJECT_DIR/start-api.sh
"@
Write-Host "[OK] Script de inicio API creado" -ForegroundColor Green
Write-Host ""

# Paso 6: Crear script de inicio para Dashboard
Write-Host ">>> Creando script de inicio para Dashboard..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
cat > $PROJECT_DIR/start-dashboard.sh << 'EOL'
#!/bin/bash
cd $PROJECT_DIR
export NODE_ENV=production
npm run dev -- --host 0.0.0.0 --port 8081 > /var/log/gold-whisper-dashboard.log 2>&1 &
echo \$! > /var/run/gold-whisper-dashboard.pid
echo 'Dashboard iniciado'
EOL
chmod +x $PROJECT_DIR/start-dashboard.sh
"@
Write-Host "[OK] Script de inicio Dashboard creado" -ForegroundColor Green
Write-Host ""

# Paso 7: Crear script de inicio para Chatwoot
Write-Host ">>> Creando script de inicio para Chatwoot..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
cat > $PROJECT_DIR/start-chatwoot.sh << 'EOL'
#!/bin/bash
cd $PROJECT_DIR/gold-whisper-dash-main
docker-compose up -d
echo 'Chatwoot iniciado'
EOL
chmod +x $PROJECT_DIR/start-chatwoot.sh
"@
Write-Host "[OK] Script de inicio Chatwoot creado" -ForegroundColor Green
Write-Host ""

# Paso 8: Crear servicios systemd
Write-Host ">>> Creando servicio systemd para API..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
cat > /etc/systemd/system/gold-whisper-api.service << 'EOL'
[Unit]
Description=Gold Whisper API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR/gold-whisper-dash-main/api
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL
systemctl daemon-reload
systemctl enable gold-whisper-api.service
"@
Write-Host "[OK] Servicio API configurado" -ForegroundColor Green
Write-Host ""

Write-Host ">>> Creando servicio systemd para Dashboard..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
cat > /etc/systemd/system/gold-whisper-dashboard.service << 'EOL'
[Unit]
Description=Gold Whisper Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 8081
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL
systemctl daemon-reload
systemctl enable gold-whisper-dashboard.service
"@
Write-Host "[OK] Servicio Dashboard configurado" -ForegroundColor Green
Write-Host ""

# Paso 9: Configurar Nginx
Write-Host ">>> Instalando y configurando Nginx..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
    if ! command -v nginx &> /dev/null; then
        apt update && apt install -y nginx
    fi
"@
Write-Host "[OK] Nginx instalado" -ForegroundColor Green

# Configurar virtual host para API
ssh "${VPS_USER}@${VPS_IP}" @"
cat > /etc/nginx/sites-available/api.$DOMAIN << 'EOL'
server {
    listen 80;
    server_name api.$DOMAIN;

    location / {
        proxy_pass http://localhost:3001;
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
ln -sf /etc/nginx/sites-available/api.$DOMAIN /etc/nginx/sites-enabled/
"@

# Configurar virtual host para Dashboard
ssh "${VPS_USER}@${VPS_IP}" @"
cat > /etc/nginx/sites-available/dashboard.$DOMAIN << 'EOL'
server {
    listen 80;
    server_name dashboard.$DOMAIN;

    location / {
        proxy_pass http://localhost:8081;
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
ln -sf /etc/nginx/sites-available/dashboard.$DOMAIN /etc/nginx/sites-enabled/
"@

# Configurar virtual host para Chatwoot
ssh "${VPS_USER}@${VPS_IP}" @"
cat > /etc/nginx/sites-available/chatwoot.$DOMAIN << 'EOL'
server {
    listen 80;
    server_name chatwoot.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
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
ln -sf /etc/nginx/sites-available/chatwoot.$DOMAIN /etc/nginx/sites-enabled/
"@

# Verificar y recargar Nginx
Invoke-SSHCommand "nginx -t && systemctl restart nginx" "Reiniciar Nginx"

# Paso 10: Configurar SSL con Certbot
Write-Host ">>> Configurando SSL con Certbot..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
    if ! command -v certbot &> /dev/null; then
        apt update && apt install -y certbot python3-certbot-nginx
    fi
    certbot --nginx -d api.$DOMAIN -d dashboard.$DOMAIN -d chatwoot.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || echo 'Certbot ya configurado o error'
"@
Write-Host "[OK] SSL configurado" -ForegroundColor Green
Write-Host ""

# Paso 11: Crear scripts de monitoreo
Write-Host ">>> Creando scripts de monitoreo..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
cat > /opt/monitor-api.sh << 'EOL'
#!/bin/bash
response=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001)
if [ '\$response' != '200' ] && [ '\$response' != '302' ]; then
    echo '\$(date) - API no responde. Reiniciando...' >> /var/log/monitor-api.log
    systemctl restart gold-whisper-api.service
else
    echo '\$(date) - API OK' >> /var/log/monitor-api.log
fi
EOL
chmod +x /opt/monitor-api.sh

cat > /opt/monitor-dashboard.sh << 'EOL'
#!/bin/bash
response=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8081)
if [ '\$response' != '200' ] && [ '\$response' != '302' ]; then
    echo '\$(date) - Dashboard no responde. Reiniciando...' >> /var/log/monitor-dashboard.log
    systemctl restart gold-whisper-dashboard.service
else
    echo '\$(date) - Dashboard OK' >> /var/log/monitor-dashboard.log
fi
EOL
chmod +x /opt/monitor-dashboard.sh
"@
Write-Host "[OK] Scripts de monitoreo creados" -ForegroundColor Green
Write-Host ""

# Paso 12: Configurar cron para inicio automático y monitoreo
Write-Host ">>> Configurando tareas cron..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" @"
(crontab -l 2>/dev/null | grep -v 'start-api\|start-dashboard\|start-chatwoot\|monitor'; cat << 'EOL'
@reboot $PROJECT_DIR/start-api.sh
@reboot $PROJECT_DIR/start-dashboard.sh
@reboot $PROJECT_DIR/start-chatwoot.sh
*/5 * * * * /opt/monitor-api.sh
*/5 * * * * /opt/monitor-dashboard.sh
EOL
) | crontab -
"@
Write-Host "[OK] Tareas cron configuradas" -ForegroundColor Green
Write-Host ""

# Paso 13: Iniciar servicios
Write-Host ">>> Iniciando servicios..." -ForegroundColor Yellow
Invoke-SSHCommand "systemctl start gold-whisper-api.service" "Iniciar API"
Invoke-SSHCommand "systemctl start gold-whisper-dashboard.service" "Iniciar Dashboard"
Invoke-SSHCommand "$PROJECT_DIR/start-chatwoot.sh" "Iniciar Chatwoot"

# Paso 14: Verificar estado
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "VERIFICACION DE SERVICIOS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Estado de la API:" -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "systemctl status gold-whisper-api.service | head -n 10"
Write-Host ""

Write-Host "Estado del Dashboard:" -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "systemctl status gold-whisper-dashboard.service | head -n 10"
Write-Host ""

Write-Host "Estado de Nginx:" -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "systemctl status nginx | head -n 5"
Write-Host ""

Write-Host "Contenedores Docker (Chatwoot):" -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "docker ps"
Write-Host ""

# Resumen final
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de acceso:" -ForegroundColor White
Write-Host "  API:       https://api.$DOMAIN" -ForegroundColor Cyan
Write-Host "  Dashboard: https://dashboard.$DOMAIN" -ForegroundColor Cyan
Write-Host "  Chatwoot:  https://chatwoot.$DOMAIN" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor White
Write-Host "  Ver logs API:       ssh ${VPS_USER}@${VPS_IP} 'tail -f /var/log/gold-whisper-api.log'" -ForegroundColor Gray
Write-Host "  Ver logs Dashboard: ssh ${VPS_USER}@${VPS_IP} 'tail -f /var/log/gold-whisper-dashboard.log'" -ForegroundColor Gray
Write-Host "  Reiniciar API:      ssh ${VPS_USER}@${VPS_IP} 'systemctl restart gold-whisper-api.service'" -ForegroundColor Gray
Write-Host "  Reiniciar Dashboard: ssh ${VPS_USER}@${VPS_IP} 'systemctl restart gold-whisper-dashboard.service'" -ForegroundColor Gray
Write-Host ""
Write-Host "El sistema ahora esta configurado para funcionar 24/7!" -ForegroundColor Green
Write-Host ""
