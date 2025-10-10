# Resumen Completo: Despliegue Gold Whisper en VPS Hostinger

## OBJETIVO PRINCIPAL
Desplegar el Dashboard Gold Whisper, API y Chatwoot en VPS de Hostinger para que estén disponibles 24/7, incluso cuando el PC local esté apagado.

## INFORMACIÓN DEL SERVIDOR

- **Proveedor**: Hostinger VPS
- **IP del servidor**: 85.31.235.37
- **Sistema operativo**: Ubuntu
- **Dominio**: galle18k.com
- **Subdominios configurados**:
  - api.galle18k.com → API backend
  - dashboard.galle18k.com → Dashboard frontend  
  - chatwoot.galle18k.com → Chatwoot

## ARQUITECTURA DE LA SOLUCIÓN

```
[PC Local] ←→ [VPS Hostinger (85.31.235.37)]
                     ↓
                  [Nginx] (Puerto 80/443)
                     ↓
         ┌───────────┼───────────┐
         ↓           ↓           ↓
    Dashboard    API        Chatwoot
   (Puerto 8081) (Puerto 3001) (Docker)
```

## ESTRUCTURA DE ARCHIVOS EN EL SERVIDOR

```
/opt/gold-whisper-dash/
├── gold-whisper-dash-main/     # Código del proyecto
│   ├── src/                    # Código fuente Dashboard
│   ├── api/                    # Código fuente API
│   │   ├── index.js
│   │   ├── chatwoot.js
│   │   └── .env
│   ├── package.json
│   ├── docker-compose.yml      # Configuración Chatwoot
│   └── ...
├── start-api.sh                # Script inicio API
├── start-dashboard.sh          # Script inicio Dashboard
└── start-chatwoot.sh          # Script inicio Chatwoot

/etc/nginx/
├── sites-available/
│   ├── api.galle18k.com        # Config Nginx para API
│   ├── dashboard.galle18k.com  # Config Nginx para Dashboard
│   └── chatwoot.galle18k.com   # Config Nginx para Chatwoot
└── sites-enabled/              # Enlaces simbólicos activos

/opt/
├── monitor-api.sh             # Script monitoreo API
├── monitor-dashboard.sh       # Script monitoreo Dashboard
└── monitor-chatwoot.sh        # Script monitoreo Chatwoot

/var/log/
├── gold-whisper-api.log       # Logs de la API
├── gold-whisper-dashboard.log # Logs del Dashboard
├── monitor-api.log            # Logs de monitoreo API
└── monitor-dashboard.log      # Logs de monitoreo Dashboard

/etc/systemd/system/
├── gold-whisper-api.service       # Servicio systemd API
├── gold-whisper-dashboard.service # Servicio systemd Dashboard
└── ...

/var/run/
├── gold-whisper-api.pid          # PID de proceso API
└── gold-whisper-dashboard.pid    # PID de proceso Dashboard
```

## COMPONENTES DEL SISTEMA

### 1. API Backend (Node.js + Express)

**Ubicación**: `/opt/gold-whisper-dash/gold-whisper-dash-main/api/`

**Puerto**: 3001

**Archivo principal**: `index.js`

**Variables de entorno**: `/opt/gold-whisper-dash/gold-whisper-dash-main/api/.env`

**URL de acceso**: https://api.galle18k.com

### 2. Dashboard Frontend (React + Vite)

**Ubicación**: `/opt/gold-whisper-dash/`

**Puerto**: 8081

**Comando de inicio**: `npm run dev -- --host 0.0.0.0 --port 8081`

**URL de acceso**: https://dashboard.galle18k.com

### 3. Chatwoot (Docker)

**Ubicación**: `/opt/gold-whisper-dash/gold-whisper-dash-main/`

**Archivo de configuración**: `docker-compose.yml`

**URL de acceso**: https://chatwoot.galle18k.com

## CONFIGURACIÓN DNS EN HOSTINGER

En el panel de control de Hostinger, configurar los siguientes registros DNS:

```
Tipo: A
Nombre: api
Valor: 85.31.235.37
TTL: 3600

Tipo: A
Nombre: dashboard
Valor: 85.31.235.37
TTL: 3600

Tipo: A  
Nombre: chatwoot
Valor: 85.31.235.37
TTL: 3600
```

## CONFIGURACIÓN NGINX

### Para API (api.galle18k.com)

```nginx
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
```

### Para Dashboard (dashboard.galle18k.com)

```nginx
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
```

### Para Chatwoot (chatwoot.galle18k.com)

```nginx
server {
    listen 80;
    server_name chatwoot.galle18k.com;

    location / {
        proxy_pass http://localhost:3000;  # Puerto de Chatwoot
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
```

## SCRIPTS DE INICIO AUTOMÁTICO

### Script para API (`/opt/gold-whisper-dash/start-api.sh`)

```bash
#!/bin/bash
cd /opt/gold-whisper-dash/gold-whisper-dash-main/api
node index.js > /var/log/gold-whisper-api.log 2>&1 &
echo $! > /var/run/gold-whisper-api.pid
```

### Script para Dashboard (`/opt/gold-whisper-dash/start-dashboard.sh`)

```bash
#!/bin/bash
cd /opt/gold-whisper-dash
export NODE_ENV=production
npm run dev -- --host 0.0.0.0 --port 8081 > /var/log/gold-whisper-dashboard.log 2>&1 &
echo $! > /var/run/gold-whisper-dashboard.pid
```

### Script para Chatwoot (`/opt/gold-whisper-dash/start-chatwoot.sh`)

```bash
#!/bin/bash
cd /opt/gold-whisper-dash/gold-whisper-dash-main
docker-compose up -d
```

## SERVICIOS SYSTEMD

### API Service (`/etc/systemd/system/gold-whisper-api.service`)

```ini
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
```

### Dashboard Service (`/etc/systemd/system/gold-whisper-dashboard.service`)

```ini
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
```

## SCRIPTS DE MONITOREO

### Monitor API (`/opt/monitor-api.sh`)

```bash
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)

if [ "$response" != "200" ] && [ "$response" != "302" ]; then
    echo "$(date) - API no está respondiendo. Reiniciando..." >> /var/log/monitor-api.log
    systemctl restart gold-whisper-api.service
else
    echo "$(date) - API funcionando correctamente." >> /var/log/monitor-api.log
fi
```

### Monitor Dashboard (`/opt/monitor-dashboard.sh`)

```bash
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081)

if [ "$response" != "200" ] && [ "$response" != "302" ]; then
    echo "$(date) - Dashboard no está respondiendo. Reiniciando..." >> /var/log/monitor-dashboard.log
    systemctl restart gold-whisper-dashboard.service
else
    echo "$(date) - Dashboard funcionando correctamente." >> /var/log/monitor-dashboard.log
fi
```

## CONFIGURACIÓN CRON PARA INICIO AUTOMÁTICO Y MONITOREO

```bash
# Inicio automático al arrancar el servidor
@reboot /opt/gold-whisper-dash/start-api.sh
@reboot /opt/gold-whisper-dash/start-dashboard.sh
@reboot /opt/gold-whisper-dash/start-chatwoot.sh

# Monitoreo cada 5 minutos
*/5 * * * * /opt/monitor-api.sh
*/5 * * * * /opt/monitor-dashboard.sh
```

## CERTIFICADOS SSL (Let's Encrypt)

Para obtener certificados SSL gratuitos:

```bash
certbot --nginx -d api.galle18k.com
certbot --nginx -d dashboard.galle18k.com
certbot --nginx -d chatwoot.galle18k.com
```

## COMANDOS ÚTILES PARA ADMINISTRACIÓN

### Verificar estado de servicios

```bash
# Estado de la API
systemctl status gold-whisper-api.service

# Estado del Dashboard
systemctl status gold-whisper-dashboard.service

# Estado de Nginx
systemctl status nginx

# Contenedores Docker (Chatwoot)
docker ps
```

### Ver logs

```bash
# Logs de la API
tail -f /var/log/gold-whisper-api.log

# Logs del Dashboard
tail -f /var/log/gold-whisper-dashboard.log

# Logs de Nginx
tail -f /var/log/nginx/error.log

# Logs de Docker
docker-compose logs -f
```

### Reiniciar servicios

```bash
# Reiniciar API
systemctl restart gold-whisper-api.service

# Reiniciar Dashboard
systemctl restart gold-whisper-dashboard.service

# Reiniciar Nginx
systemctl restart nginx

# Reiniciar Chatwoot
cd /opt/gold-whisper-dash/gold-whisper-dash-main
docker-compose restart
```

## ARCHIVOS DE DOCUMENTACIÓN CREADOS

Durante este proceso se crearon los siguientes archivos de documentación (puedes ignorar los relacionados con Fly.io):

### Documentos principales (USAR ESTOS):
1. **RESUMEN-TECNICO-COMPLETO.md** - Resumen técnico de la arquitectura
2. **PROXIMOS-PASOS-24-7.md** - Pasos para configurar inicio automático
3. **CONFIGURACION-FINAL-CHATWOOT.md** - Configuración específica de Chatwoot
4. **DASHBOARD-SOLUCION-24-7.md** - Solución para el Dashboard
5. **deploy-dashboard-24-7.sh** - Script automatizado de despliegue
6. **INSTRUCCIONES-EJECUTAR-DEPLOY.md** - Instrucciones para ejecutar script

### Documentos históricos (referencia):
7. **VERIFICACION-FINAL-DNS.md** - Verificación de configuración DNS
8. **CORRECCION-ERROR-SERVICIO.md** - Solución a errores de systemd
9. **SOLUCION-PAGINA-HOSTINGER.md** - Configuración DNS en Hostinger

### Documentos a IGNORAR (son para Fly.io):
- SOLUCION-CORRECTA-FLY-IO.md
- FLY-IO-DEPLOYMENT.md
- fly.toml (ambos archivos)

## PASOS PARA IMPLEMENTACIÓN COMPLETA

### 1. Conectarse al VPS

```bash
ssh root@85.31.235.37
```

### 2. Clonar el proyecto (si no está ya)

```bash
cd /opt
git clone [URL_DEL_REPOSITORIO] gold-whisper-dash
cd gold-whisper-dash/gold-whisper-dash-main
```

### 3. Instalar dependencias

```bash
# Dependencias del Dashboard
npm install

# Dependencias de la API
cd api
npm install
cd ..
```

### 4. Configurar variables de entorno

Crear/editar `/opt/gold-whisper-dash/gold-whisper-dash-main/api/.env` con las credenciales necesarias.

### 5. Crear scripts de inicio

```bash
# Script para API
cat > /opt/gold-whisper-dash/start-api.sh << 'EOL'
#!/bin/bash
cd /opt/gold-whisper-dash/gold-whisper-dash-main/api
node index.js > /var/log/gold-whisper-api.log 2>&1 &
echo $! > /var/run/gold-whisper-api.pid
EOL

# Script para Dashboard
cat > /opt/gold-whisper-dash/start-dashboard.sh << 'EOL'
#!/bin/bash
cd /opt/gold-whisper-dash
export NODE_ENV=production
npm run dev -- --host 0.0.0.0 --port 8081 > /var/log/gold-whisper-dashboard.log 2>&1 &
echo $! > /var/run/gold-whisper-dashboard.pid
EOL

# Dar permisos de ejecución
chmod +x /opt/gold-whisper-dash/start-api.sh
chmod +x /opt/gold-whisper-dash/start-dashboard.sh
```

### 6. Configurar servicios systemd

Crear los archivos de servicio según se especifica arriba y luego:

```bash
systemctl daemon-reload
systemctl enable gold-whisper-api.service
systemctl enable gold-whisper-dashboard.service
systemctl start gold-whisper-api.service
systemctl start gold-whisper-dashboard.service
```

### 7. Configurar Nginx

Crear los archivos de configuración según se especifica arriba y luego:

```bash
ln -s /etc/nginx/sites-available/api.galle18k.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/dashboard.galle18k.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/chatwoot.galle18k.com /etc/nginx/sites-enabled/

nginx -t
systemctl restart nginx
```

### 8. Configurar SSL

```bash
certbot --nginx -d api.galle18k.com
certbot --nginx -d dashboard.galle18k.com
certbot --nginx -d chatwoot.galle18k.com
```

### 9. Configurar monitoreo

Crear los scripts de monitoreo y añadirlos a crontab:

```bash
crontab -e
# Añadir las líneas de cron especificadas arriba
```

### 10. Verificar funcionamiento

```bash
# Verificar servicios
systemctl status gold-whisper-api.service
systemctl status gold-whisper-dashboard.service

# Probar acceso
curl http://localhost:3001
curl http://localhost:8081

# Verificar desde navegador
# https://api.galle18k.com
# https://dashboard.galle18k.com
# https://chatwoot.galle18k.com
```

## VERIFICACIÓN 24/7

Para confirmar que todo funciona 24/7:

1. Accede a los servicios desde el navegador
2. Apaga tu PC local completamente
3. Espera unas horas
4. Vuelve a acceder desde otro dispositivo
5. Los servicios deben seguir funcionando

## SOLUCIÓN DE PROBLEMAS

### Si la API no funciona:

```bash
journalctl -u gold-whisper-api.service -n 50
tail -f /var/log/gold-whisper-api.log
```

### Si el Dashboard no funciona:

```bash
journalctl -u gold-whisper-dashboard.service -n 50
tail -f /var/log/gold-whisper-dashboard.log
```

### Si Nginx da error:

```bash
nginx -t
tail -f /var/log/nginx/error.log
```

## RESUMEN PARA OTRA IA

Si otra IA necesita ayudar con este proyecto, debe saber:

1. **Objetivo**: Desplegar Gold Whisper Dashboard + API + Chatwoot en VPS Hostinger para disponibilidad 24/7
2. **Servidor**: VPS Ubuntu en 85.31.235.37
3. **Componentes**: 
   - Dashboard React/Vite en puerto 8081
   - API Node.js/Express en puerto 3001
   - Chatwoot en Docker (puerto 3000)
4. **Proxy**: Nginx redirige subdominios a puertos locales
5. **Persistencia**: Servicios systemd + cron + scripts de monitoreo
6. **SSL**: Let's Encrypt con Certbot
7. **Rutas clave**: 
   - Proyecto: `/opt/gold-whisper-dash/`
   - Configs Nginx: `/etc/nginx/sites-available/`
   - Services: `/etc/systemd/system/`
   - Scripts: `/opt/`
   - Logs: `/var/log/`

## CONCLUSIÓN

Esta configuración garantiza que Gold Whisper Dashboard, API y Chatwoot estén disponibles 24/7 en el VPS de Hostinger, con:

- ✅ Inicio automático tras reinicios del servidor
- ✅ Monitoreo y reinicio automático en caso de fallos
- ✅ Certificados SSL para acceso seguro
- ✅ Independencia total del PC local
- ✅ Logs detallados para diagnóstico
- ✅ Configuración robusta y escalable
