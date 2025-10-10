# 🚀 Despliegue Completo en VPS Ubuntu (Opción Recomendada)

## ✅ Análisis de tu VPS Ubuntu

Según los datos de tu servidor VPS:

| Recurso | Disponible | Usado | 
|---------|------------|-------|
| CPU | 2 núcleos | 1% |
| Memoria | ? | 14% |
| Disco | 100 GB | 14 GB (86 GB libres) |
| Ancho de Banda | 8 TB | 0.002 TB (prácticamente todo disponible) |
| IP | 85.31.235.37 | - |

**¡Esta es la MEJOR OPCIÓN para tu proyecto!** Tienes recursos abundantes y ya pagados.

## 🌟 Ventajas del Despliegue en tu VPS Ubuntu

1. **Control Total**: Administración completa del entorno
2. **Sin Hibernación**: A diferencia de planes gratuitos, tu servidor está siempre activo
3. **Recursos Abundantes**: 86GB de disco libre y 8TB de ancho de banda
4. **Costo-Efectivo**: Ya pagado, no hay gastos adicionales
5. **SSL Gratuito**: Configuraremos Let's Encrypt para HTTPS gratis
6. **Rendimiento Óptimo**: Todos los servicios en el mismo servidor

## 📋 Plan de Despliegue Optimizado para tu VPS

### 1. Preparación del Servidor (Una sola vez)

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias necesarias
sudo apt install -y curl git nginx certbot python3-certbot-nginx nodejs npm

# Instalar PM2 para mantener la aplicación activa
sudo npm install -y pm2 -g

# Crear directorios para la aplicación
sudo mkdir -p /opt/gold-whisper/{frontend,api,chatwoot}
```

### 2. Configuración de Nginx con SSL Gratuito

```bash
# Crear configuración de Nginx para los subdominios
sudo nano /etc/nginx/sites-available/gold-whisper.conf
```

Pegar este contenido (configurado para tus subdominios):

```nginx
# Configuración para el Dashboard (Frontend)
server {
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
```

Activar la configuración y obtener SSL gratuito:

```bash
# Activar la configuración
sudo ln -s /etc/nginx/sites-available/gold-whisper.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Obtener certificados SSL gratuitos con Let's Encrypt
sudo certbot --nginx -d dashboard.galle18k.com -d api.galle18k.com -d chatwoot.galle18k.com
```

### 3. Despliegue del Frontend

```bash
# Ir al directorio del frontend
cd /opt/gold-whisper/frontend

# Clonar el repositorio (o copiar los archivos)
git clone https://github.com/galleorolaminado18k/gold-whisper-dashboard .

# Instalar dependencias y construir
npm install
npm run build

# Configurar PM2 para servir el frontend
pm2 start npm --name "frontend" -- start
```

### 4. Despliegue de la API y Chatwoot

```bash
# Ir al directorio de la API
cd /opt/gold-whisper/api

# Clonar o copiar los archivos de la API
git clone https://github.com/galleorolaminado18k/gold-whisper-dashboard .
cd api

# Instalar dependencias
npm install

# Configurar PM2 para mantener la API y Chatwoot activos
pm2 start index.js --name "api"
pm2 start chatwoot.js --name "chatwoot"

# Guardar configuración de PM2 para que se inicie automáticamente
pm2 save
pm2 startup
```

### 5. Script de Despliegue Completo

Para automatizar todo lo anterior, he creado un script completo. Ejecuta lo siguiente en tu VPS:

```bash
# Descargar el script de despliegue
wget -O deploy-vps.sh https://raw.githubusercontent.com/galleorolaminado18k/gold-whisper-dashboard/main/deploy-vps.sh

# Dar permisos de ejecución
chmod +x deploy-vps.sh

# Ejecutar el script
sudo ./deploy-vps.sh
```

## 📊 Beneficios de Almacenamiento en tu VPS

Con 86GB de espacio libre en disco, tienes una capacidad MUCHO MAYOR que cualquier plan gratuito:

| Servicio | Tu VPS | Planes Gratuitos |
|----------|--------|------------------|
| Almacenamiento | 86GB | 1-3GB |
| Ancho de Banda | 8TB | 100GB/mes |
| Uptime | 100% | Hibernación |
| Rendimiento | Dedicado | Compartido |

Tu VPS puede manejar fácilmente el crecimiento futuro de la aplicación sin ningún problema.

## 🔒 Monitoreo y Respaldos

Para mantener tu aplicación segura y respaldada:

1. **Respaldos Automáticos**:

```bash
# Crear script de respaldo
sudo nano /opt/backup.sh
```

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/backups"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de la aplicación
tar -czf $BACKUP_DIR/gold-whisper_$TIMESTAMP.tar.gz /opt/gold-whisper

# Mantener solo los últimos 7 respaldos
ls -t $BACKUP_DIR/gold-whisper_*.tar.gz | tail -n +8 | xargs rm -f
```

```bash
# Dar permisos y programar en cron
chmod +x /opt/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -
```

2. **Monitoreo**:

```bash
# Instalar herramienta de monitoreo
sudo apt install -y htop

# Crear script simple de monitoreo
sudo nano /opt/monitor.sh
```

```bash
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
```

```bash
# Programar en cron cada 30 minutos
chmod +x /opt/monitor.sh
(crontab -l 2>/dev/null; echo "*/30 * * * * /opt/monitor.sh") | crontab -
```

## 🌟 Conclusión

**Utilizar tu VPS Ubuntu es definitivamente la MEJOR opción** para desplegar Gold Whisper Dashboard:

- ✅ **Recursos abundantes**: 86GB de disco libre
- ✅ **Siempre activo**: Sin problemas de hibernación
- ✅ **SSL gratuito**: Con Let's Encrypt
- ✅ **Alto rendimiento**: Recursos dedicados
- ✅ **Costo-efectivo**: Ya está pagado

El script y configuraciones proporcionados te permitirán desplegar toda la aplicación en tu VPS, aprovechando al máximo los recursos que ya tienes disponibles.
