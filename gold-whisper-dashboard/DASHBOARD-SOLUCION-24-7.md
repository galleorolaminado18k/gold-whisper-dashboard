# Solución Dashboard Gold Whisper 24/7

## IMPORTANTE: Solución específica para Dashboard

Este documento proporciona la solución correcta para mantener el **Dashboard principal** funcionando 24/7, NO para n8n (por favor ignorar los archivos relacionados con n8n).

## Problema

El Dashboard principal de Gold Whisper (frontend React/Vite) no está disponible permanentemente cuando el servidor se reinicia o hay interrupciones.

## Solución completa

Para garantizar que el Dashboard esté disponible 24/7 y se inicie automáticamente tras cualquier reinicio:

1. Configuración de servicio systemd para el dashboard
2. Script de inicio automático con cron
3. Configuración de Nginx
4. Monitoreo automático

## Implementación paso a paso

### 1. Crear script de inicio para el Dashboard

```bash
cat > /opt/gold-whisper-dash/start-dashboard.sh << 'EOL'
#!/bin/bash
cd /opt/gold-whisper-dash
export NODE_ENV=production
npm run dev -- --host 0.0.0.0 --port 8081 > /var/log/gold-whisper-dashboard.log 2>&1 &
echo $! > /var/run/gold-whisper-dashboard.pid
EOL

chmod +x /opt/gold-whisper-dash/start-dashboard.sh
```

### 2. Configurar servicio systemd para el Dashboard

```bash
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

# Recargar systemd y habilitar el servicio
systemctl daemon-reload
systemctl enable gold-whisper-dashboard.service
systemctl start gold-whisper-dashboard.service
```

### 3. Configurar inicio automático con cron (alternativa a systemd)

Si el servicio systemd no funciona correctamente, se puede usar cron:

```bash
# Agregar a crontab para ejecutar al inicio
(crontab -l 2>/dev/null; echo "@reboot /opt/gold-whisper-dash/start-dashboard.sh") | crontab -
```

### 4. Configurar Nginx para el Dashboard

```bash
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

# Activar el sitio
ln -s /etc/nginx/sites-available/dashboard.galle18k.com /etc/nginx/sites-enabled/

# Verificar configuración y reiniciar Nginx
nginx -t && systemctl restart nginx
```

### 5. Configurar SSL con Certbot (Let's Encrypt)

```bash
# Obtener certificado SSL
certbot --nginx -d dashboard.galle18k.com
```

### 6. Crear script de monitoreo del Dashboard

```bash
cat > /opt/monitor-dashboard.sh << 'EOL'
#!/bin/bash

# Verificar si el dashboard está respondiendo
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081)

if [ "$response" != "200" ] && [ "$response" != "302" ]; then
    echo "$(date) - Dashboard no está respondiendo. Reiniciando..." >> /var/log/monitor-dashboard.log
    
    # Matar proceso anterior si existe
    if [ -f /var/run/gold-whisper-dashboard.pid ]; then
        kill $(cat /var/run/gold-whisper-dashboard.pid) 2>/dev/null
    fi
    
    # Reiniciar el dashboard
    /opt/gold-whisper-dash/start-dashboard.sh
else
    echo "$(date) - Dashboard funcionando correctamente." >> /var/log/monitor-dashboard.log
fi
EOL

chmod +x /opt/monitor-dashboard.sh

# Agregar a crontab para ejecutar cada 5 minutos
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/monitor-dashboard.sh") | crontab -
```

## Verificación

Para verificar que el Dashboard está funcionando correctamente:

1. Verificar que el servicio está activo:
   ```bash
   systemctl status gold-whisper-dashboard.service
   ```

2. Verificar que responde localmente:
   ```bash
   curl -I http://localhost:8081
   ```

3. Verificar que Nginx está redirigiendo correctamente:
   ```bash
   curl -I -H "Host: dashboard.galle18k.com" http://localhost
   ```

4. Visitar https://dashboard.galle18k.com en el navegador

## Solución de problemas

### Si el dashboard no inicia:

1. Verificar logs:
   ```bash
   journalctl -u gold-whisper-dashboard.service -n 50
   tail -f /var/log/gold-whisper-dashboard.log
   ```

2. Verificar dependencias:
   ```bash
   cd /opt/gold-whisper-dash
   npm install
   ```

3. Verificar si hay errores en la aplicación:
   ```bash
   cd /opt/gold-whisper-dash
   npm run dev -- --port 8081
   ```

### Reinicio manual

Si necesitas reiniciar manualmente el Dashboard:

```bash
# Usando systemd
systemctl restart gold-whisper-dashboard.service

# Usando el script directamente
if [ -f /var/run/gold-whisper-dashboard.pid ]; then
    kill $(cat /var/run/gold-whisper-dashboard.pid)
fi
/opt/gold-whisper-dash/start-dashboard.sh
```

## Comandos útiles para monitoreo

```bash
# Ver logs del Dashboard
tail -f /var/log/gold-whisper-dashboard.log

# Verificar si el proceso está ejecutándose
ps aux | grep "npm run dev"

# Verificar puertos en uso
netstat -tuln | grep 8081

# Ver logs de Nginx
tail -f /var/log/nginx/error.log
```

Con esta configuración, el Dashboard de Gold Whisper estará disponible 24/7 en https://dashboard.galle18k.com, con reinicio automático tras cualquier interrupción o reinicio del servidor.
