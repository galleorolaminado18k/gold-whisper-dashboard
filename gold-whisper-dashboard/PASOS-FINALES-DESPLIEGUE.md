# 🚀 Pasos Finales para Despliegue 24/7

## ✅ Progreso Actual

Hemos completado estos pasos importantes:

1. ✓ Análisis de las opciones de despliegue
2. ✓ Configuración básica en el VPS Ubuntu (85.31.235.37)
3. ✓ Configuración de Nginx para los subdominios
4. ✓ Estructura de directorios para el proyecto

## 🔄 Pasos Pendientes para Completar el Despliegue

### 1. Configurar Registros DNS

Antes de obtener certificados SSL, debes configurar los registros DNS para apuntar a tu VPS:

1. Accede al panel de control de tu dominio (galle18k.com)
2. Agrega estos registros tipo A:

| Subdominio | Tipo | Valor |
|------------|------|-------|
| dashboard  | A    | 85.31.235.37 |
| api        | A    | 85.31.235.37 |
| chatwoot   | A    | 85.31.235.37 |

**Nota**: La propagación DNS puede tardar entre 15 minutos y 24 horas. Puedes verificar la propagación con:
```bash
dig dashboard.galle18k.com
dig api.galle18k.com
dig chatwoot.galle18k.com
```

### 2. Obtener Certificados SSL

Una vez que los registros DNS estén propagados, obtén los certificados SSL:

```bash
ssh root@85.31.235.37
certbot --nginx -d dashboard.galle18k.com -d api.galle18k.com -d chatwoot.galle18k.com
```

### 3. Desplegar el Frontend

```bash
ssh root@85.31.235.37

# Instalar PM2 globalmente si no está instalado
npm install -g pm2

# Clonar el repositorio
cd /opt/gold-whisper/frontend
git clone https://github.com/galleorolaminado18k/gold-whisper-dashboard.git .

# Instalar dependencias y construir
npm install
npm run build

# Crear un servidor simple para el frontend
cat > server.js << 'EOL'
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = 3000;

app.use(compression());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend ejecutándose en http://localhost:${PORT}`);
});
EOL

# Instalar Express
npm install express compression

# Iniciar con PM2
pm2 start server.js --name "gold-whisper-frontend"
pm2 save
```

### 4. Desplegar la API

```bash
ssh root@85.31.235.37

cd /opt/gold-whisper/api
git clone https://github.com/galleorolaminado18k/gold-whisper-dashboard.git temp
cp -r temp/api/* .
rm -rf temp

# Instalar dependencias
npm install

# Iniciar con PM2
pm2 start index.js --name "gold-whisper-api" -- --port 3001
pm2 save
```

### 5. Desplegar Chatwoot

```bash
ssh root@85.31.235.37

# Si tienes un archivo chatwoot.js específico
cd /opt/gold-whisper/api
# Asumimos que ya está copiado en el paso anterior

# Iniciar con PM2
pm2 start chatwoot.js --name "gold-whisper-chatwoot" -- --port 3002
pm2 save
```

### 6. Configurar Respaldos Automáticos

```bash
ssh root@85.31.235.37

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
```

### 7. Configurar Monitoreo Simple

```bash
ssh root@85.31.235.37

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
```

## 📋 Verificación Final

Una vez completados todos los pasos, verifica que todo funciona:

1. Accede a https://dashboard.galle18k.com
2. Verifica que la API responde en https://api.galle18k.com
3. Accede a Chatwoot en https://chatwoot.galle18k.com

## 🔧 Mantenimiento

Para futuras actualizaciones o mantenimiento:

```bash
# Iniciar sesión en el servidor
ssh root@85.31.235.37

# Ver estado de los servicios
pm2 status

# Ver logs si hay problemas
pm2 logs

# Actualizar código
cd /opt/gold-whisper/frontend
git pull
npm install
npm run build
pm2 restart gold-whisper-frontend

# Reiniciar servicios
pm2 restart all
```

Tu aplicación ya está lista para funcionar 24/7 en tu propio VPS, con suficiente espacio (86GB) para manejar grandes cantidades de datos.
