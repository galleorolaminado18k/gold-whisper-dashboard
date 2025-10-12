# ESTADO ACTUAL DEL DESPLIEGUE

## PROBLEMA IDENTIFICADO

El script automatizado requiere **acceso SSH sin contraseña** al VPS. Actualmente está solicitando la contraseña en cada comando, lo que hace imposible la automatización completa.

## SOLUCIÓN INMEDIATA (2 opciones)

### OPCIÓN 1: Configurar SSH Keys (RECOMENDADO - Una sola vez)

Ejecuta estos comandos en PowerShell para configurar acceso sin contraseña:

```powershell
# 1. Generar clave SSH (si no existe)
ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\id_rsa" -N ""

# 2. Copiar clave al servidor (ingresa la contraseña UNA vez)
Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub" | ssh root@85.31.235.37 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"

# 3. Verificar que funciona (no debe pedir contraseña)
ssh root@85.31.235.37 "echo 'SSH configurado correctamente'"

# 4. Ejecutar el script de despliegue
powershell -ExecutionPolicy Bypass -File "gold-whisper-dash-main\desplegar-hostinger-automatico.ps1"
```

### OPCIÓN 2: Script Manual Simplificado (SIN automatización)

Si no quieres configurar SSH keys, usa estos comandos conectándote manualmente:

```powershell
# Conectarse al VPS
ssh root@85.31.235.37
```

Una vez conectado al VPS, ejecuta estos comandos:

```bash
# Crear directorios
mkdir -p /opt/gold-whisper-dash
cd /opt/gold-whisper-dash

# Clonar proyecto
git clone https://github.com/galleorolaminado18k/gold-whisper-dashboard.git gold-whisper-dash-main
cd gold-whisper-dash-main

# Instalar dependencias
npm install
cd api && npm install && cd ..

# Crear script de inicio API
cat > /opt/gold-whisper-dash/start-api.sh << 'EOL'
#!/bin/bash
cd /opt/gold-whisper-dash/gold-whisper-dash-main/api
node index.js > /var/log/gold-whisper-api.log 2>&1 &
echo $! > /var/run/gold-whisper-api.pid
EOL
chmod +x /opt/gold-whisper-dash/start-api.sh

# Crear script de inicio Dashboard
cat > /opt/gold-whisper-dash/start-dashboard.sh << 'EOL'
#!/bin/bash
cd /opt/gold-whisper-dash
export NODE_ENV=production
npm run dev -- --host 0.0.0.0 --port 8081 > /var/log/gold-whisper-dashboard.log 2>&1 &
echo $! > /var/run/gold-whisper-dashboard.pid
EOL
chmod +x /opt/gold-whisper-dash/start-dashboard.sh

# Crear servicio systemd para API
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

# Crear servicio systemd para Dashboard
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

# Recargar systemd
systemctl daemon-reload
systemctl enable gold-whisper-api.service
systemctl enable gold-whisper-dashboard.service

# Instalar Nginx si no está
apt update && apt install -y nginx

# Configurar Nginx para API
cat > /etc/nginx/sites-available/api.galle18k.com << 'EOL'
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

# Configurar Nginx para Dashboard
cat > /etc/nginx/sites-available/dashboard.galle18k.com << 'EOL'
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

# Configurar Nginx para Chatwoot
cat > /etc/nginx/sites-available/chatwoot.galle18k.com << 'EOL'
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

# Activar sitios
ln -sf /etc/nginx/sites-available/api.galle18k.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/dashboard.galle18k.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/chatwoot.galle18k.com /etc/nginx/sites-enabled/

# Reiniciar Nginx
nginx -t && systemctl restart nginx

# Instalar Certbot para SSL
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.galle18k.com -d dashboard.galle18k.com -d chatwoot.galle18k.com --non-interactive --agree-tos --email admin@galle18k.com

# Crear scripts de monitoreo
cat > /opt/monitor-api.sh << 'EOL'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$response" != "200" ] && [ "$response" != "302" ]; then
    echo "$(date) - API no responde. Reiniciando..." >> /var/log/monitor-api.log
    systemctl restart gold-whisper-api.service
else
    echo "$(date) - API OK" >> /var/log/monitor-api.log
fi
EOL
chmod +x /opt/monitor-api.sh

cat > /opt/monitor-dashboard.sh << 'EOL'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081)
if [ "$response" != "200" ] && [ "$response" != "302" ]; then
    echo "$(date) - Dashboard no responde. Reiniciando..." >> /var/log/monitor-dashboard.log
    systemctl restart gold-whisper-dashboard.service
else
    echo "$(date) - Dashboard OK" >> /var/log/monitor-dashboard.log
fi
EOL
chmod +x /opt/monitor-dashboard.sh

# Configurar cron
(crontab -l 2>/dev/null; echo "@reboot /opt/gold-whisper-dash/start-api.sh") | crontab -
(crontab -l 2>/dev/null; echo "@reboot /opt/gold-whisper-dash/start-dashboard.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/monitor-api.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/monitor-dashboard.sh") | crontab -

# Iniciar servicios
systemctl start gold-whisper-api.service
systemctl start gold-whisper-dashboard.service

# Iniciar Chatwoot
cd /opt/gold-whisper-dash/gold-whisper-dash-main
docker-compose up -d

# Verificar estado
echo "============================================"
echo "VERIFICANDO SERVICIOS"
echo "============================================"
systemctl status gold-whisper-api.service | head -n 10
systemctl status gold-whisper-dashboard.service | head -n 10
systemctl status nginx | head -n 5
docker ps

echo "============================================"
echo "DESPLIEGUE COMPLETADO"
echo "============================================"
echo "URLs de acceso:"
echo "  API:       https://api.galle18k.com"
echo "  Dashboard: https://dashboard.galle18k.com"
echo "  Chatwoot:  https://chatwoot.galle18k.com"
echo "============================================"
```

## ARCHIVOS INCORRECTOS A IGNORAR

Los siguientes archivos fueron creados por error y deben ser IGNORADOS:

- `SOLUCION-N8N-24-7.md` ❌ (n8n no forma parte del proyecto)
- `deploy-n8n-24-7.sh` ❌ (n8n no forma parte del proyecto)
- Cualquier referencia a n8n en otros documentos

## ARCHIVOS CORRECTOS PARA USAR

- `RESUMEN-COMPLETO-HOSTINGER-VPS.md` ✅ (Documentación completa)
- `desplegar-hostinger-automatico.ps1` ✅ (Script automatizado - requiere SSH keys)
- `ESTADO-ACTUAL-Y-SOLUCION.md` ✅ (Este archivo)

## RESUMEN

1. **Si quieres automatización completa**: Configura SSH keys (OPCIÓN 1) y ejecuta el script PowerShell
2. **Si prefieres hacerlo manual**: Conéctate al VPS y ejecuta los comandos de la OPCIÓN 2

El sistema NO incluye n8n - ese fue un error. Solo incluye:
- Dashboard (React + Vite)
- API (Node.js + Express)
- Chatwoot (Docker)
