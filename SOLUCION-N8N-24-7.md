# Solución para N8N 24/7

## Problema

N8N no está disponible permanentemente cuando el servidor se reinicia o hay interrupciones.

## Solución rápida

Para garantizar que n8n esté disponible 24/7 y se inicie automáticamente tras cualquier reinicio, implementaremos:

1. Configuración de servicio systemd para n8n
2. Configuración de Nginx como proxy inverso
3. Configuración de DNS para el subdominio n8n.galle18k.com

## Implementación paso a paso

### 1. Instalar n8n (si aún no está instalado)

```bash
# Instalar n8n globalmente
npm install -g n8n

# Verificar instalación
n8n --version
```

### 2. Crear servicio systemd para n8n

```bash
cat > /etc/systemd/system/n8n.service << 'EOL'
[Unit]
Description=n8n
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/.n8n
Environment=NODE_ENV=production
ExecStart=/usr/bin/n8n start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

# Recargar systemd y habilitar el servicio
systemctl daemon-reload
systemctl enable n8n.service
systemctl start n8n.service

# Verificar estado
systemctl status n8n.service
```

### 3. Configurar Nginx como proxy inverso

```bash
cat > /etc/nginx/sites-available/n8n.galle18k.com << 'EOL'
server {
    listen 80;
    server_name n8n.galle18k.com;

    location / {
        proxy_pass http://localhost:5678;
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

# Crear enlace simbólico para activar el sitio
ln -s /etc/nginx/sites-available/n8n.galle18k.com /etc/nginx/sites-enabled/

# Verificar configuración de Nginx
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

### 4. Configurar SSL con Certbot (Let's Encrypt)

```bash
# Instalar Certbot (si no está instalado)
apt update
apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
certbot --nginx -d n8n.galle18k.com
```

### 5. Configurar variables de entorno para n8n

Crea un archivo `.env` para configurar n8n:

```bash
mkdir -p /root/.n8n
cat > /root/.n8n/.env << 'EOL'
N8N_HOST=n8n.galle18k.com
N8N_PROTOCOL=https
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://n8n.galle18k.com
N8N_ENCRYPTION_KEY=tu-clave-segura-aqui
N8N_USER_FOLDER=/root/.n8n
EOL
```

### 6. Configuración de DNS

Agrega un registro A en tu panel de control de Hostinger:

- Tipo: A
- Nombre: n8n
- Valor: 85.31.235.37 (la IP de tu VPS)
- TTL: Automático o 3600

### 7. Reiniciar n8n

```bash
systemctl restart n8n.service
```

### 8. Script de recuperación automática

Crear un script que verifique periódicamente si n8n está funcionando y lo reinicie si es necesario:

```bash
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
```

### 9. Verificación

1. Verificar que el servicio systemd está funcionando:
   ```bash
   systemctl status n8n.service
   ```

2. Verificar que n8n responde localmente:
   ```bash
   curl -I http://localhost:5678
   ```

3. Verificar que el proxy de Nginx funciona:
   ```bash
   curl -I -H "Host: n8n.galle18k.com" http://localhost
   ```

4. Navegar a https://n8n.galle18k.com en tu navegador

## Solución de problemas

### Si n8n no inicia

Verifica los logs para identificar el problema:

```bash
journalctl -u n8n.service -n 50
```

Problemas comunes:

1. **Permisos**: Asegúrate que el usuario tiene permisos para acceder a los archivos de n8n
   ```bash
   chown -R root:root /root/.n8n
   ```

2. **Puerto en uso**: Verifica si el puerto 5678 está disponible
   ```bash
   netstat -tuln | grep 5678
   ```

3. **Dependencias faltantes**: Reinstala n8n
   ```bash
   npm install -g n8n
   ```

### Si Nginx no redirige correctamente

1. Verifica los logs de error de Nginx:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

2. Confirma que el sitio está habilitado:
   ```bash
   ls -la /etc/nginx/sites-enabled/
   ```

## Mantenimiento

Para actualizaciones futuras de n8n:

```bash
# Actualizar n8n
npm update -g n8n

# Reiniciar el servicio
systemctl restart n8n.service
```

## Backup de configuración

Respalda regularmente tu configuración de n8n:

```bash
# Crear directorio de backups
mkdir -p /opt/backups/n8n

# Respaldar configuración
cp -r /root/.n8n/* /opt/backups/n8n/$(date +%Y%m%d)/
```

Con esta configuración, n8n estará disponible 24/7 en https://n8n.galle18k.com, con reinicio automático tras cualquier interrupción o reinicio del servidor.
