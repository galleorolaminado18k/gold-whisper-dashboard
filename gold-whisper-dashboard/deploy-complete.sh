#!/bin/bash

# Script completo de despliegue para VPS Hostinger
# Este script configura todo automáticamente

PROJECT_DIR="/opt/gold-whisper-dash"
DOMAIN="galle18k.com"

echo "============================================"
echo "Iniciando despliegue completo..."
echo "============================================"

# 1. Crear directorios
mkdir -p $PROJECT_DIR /var/log /opt

# 2. Clonar o actualizar proyecto
cd $PROJECT_DIR
if [ -d "gold-whisper-dash-main" ]; then
    echo "Actualizando proyecto..."
    cd gold-whisper-dash-main && git pull && cd ..
else
    echo "Clonando proyecto..."
    git clone https://github.com/galleorolaminado18k/gold-whisper-dashboard.git gold-whisper-dash-main
fi

# 3. Instalar dependencias
echo "Instalando dependencias..."
cd $PROJECT_DIR/gold-whisper-dash-main
npm install --silent
cd api && npm install --silent && cd ..

# 4. Crear scripts de inicio
cat > $PROJECT_DIR/start-api.sh << 'EOL'
#!/bin/bash
cd /opt/gold-whisper-dash/gold-whisper-dash-main/api
node index.js > /var/log/gold-whisper-api.log 2>&1 &
echo $! > /var/run/gold-whisper-api.pid
EOL
chmod +x $PROJECT_DIR/start-api.sh

cat > $PROJECT_DIR/start-dashboard.sh << 'EOL'
#!/bin/bash
cd /opt/gold-whisper-dash
export NODE_ENV=production
npm run dev -- --host 0.0.0.0 --port 8081 > /var/log/gold-whisper-dashboard.log 2>&1 &
echo $! > /var/run/gold-whisper-dashboard.pid
EOL
chmod +x $PROJECT_DIR/start-dashboard.sh

# 5. Configurar servicios systemd
cat > /etc/systemd/system/gold-whisper-api.service << 'EOL'
[Unit]
Description=Gold Whisper API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gold-whisper-dash/gold-whisper-dash-main/api
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

cat > /etc/systemd/system/gold-whisper-dashboard.service << 'EOL'
[Unit]
Description=Gold Whisper Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gold-whisper-dash
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 8081
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl enable gold-whisper-api.service gold-whisper-dashboard.service

# 6. Configurar Nginx
apt update && apt install -y nginx

cat > /etc/nginx/sites-available/api.$DOMAIN << 'EOL'
server {
    listen 80;
    server_name api.galle18k.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

cat > /etc/nginx/sites-available/dashboard.$DOMAIN << 'EOL'
server {
    listen 80;
    server_name dashboard.galle18k.com;
    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

cat > /etc/nginx/sites-available/chatwoot.$DOMAIN << 'EOL'
server {
    listen 80;
    server_name chatwoot.galle18k.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

ln -sf /etc/nginx/sites-available/api.$DOMAIN /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/dashboard.$DOMAIN /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/chatwoot.$DOMAIN /etc/nginx/sites-enabled/

nginx -t && systemctl restart nginx

# 7. Configurar SSL
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.$DOMAIN -d dashboard.$DOMAIN -d chatwoot.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || true

# 8. Scripts de monitoreo
cat > /opt/monitor-api.sh << 'EOL'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$response" != "200" ] && [ "$response" != "302" ]; then
    systemctl restart gold-whisper-api.service
fi
EOL
chmod +x /opt/monitor-api.sh

cat > /opt/monitor-dashboard.sh << 'EOL'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081)
if [ "$response" != "200" ] && [ "$response" != "302" ]; then
    systemctl restart gold-whisper-dashboard.service
fi
EOL
chmod +x /opt/monitor-dashboard.sh

# 9. Configurar cron
(crontab -l 2>/dev/null | grep -v 'start-api\|start-dashboard\|monitor'; cat << 'EOL'
@reboot /opt/gold-whisper-dash/start-api.sh
@reboot /opt/gold-whisper-dash/start-dashboard.sh
*/5 * * * * /opt/monitor-api.sh
*/5 * * * * /opt/monitor-dashboard.sh
EOL
) | crontab -

# 10. Iniciar servicios
systemctl start gold-whisper-api.service
systemctl start gold-whisper-dashboard.service

# 11. Iniciar Chatwoot
cd $PROJECT_DIR/gold-whisper-dash-main
docker-compose up -d || true

echo "============================================"
echo "DESPLIEGUE COMPLETADO"
echo "============================================"
echo "API: https://api.$DOMAIN"
echo "Dashboard: https://dashboard.$DOMAIN"
echo "Chatwoot: https://chatwoot.$DOMAIN"
echo "============================================"
