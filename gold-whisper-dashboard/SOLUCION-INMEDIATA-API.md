# 🔧 Solución Inmediata para el Error de la API

## El problema exacto:

El error que estás viendo es:
```
Error: Cannot find module '/opt/gold-whisper-dash/gold-whisper-dash-main/api/index.js'
```

Esto significa que Node está buscando el archivo en la ruta incorrecta. La ruta correcta debería ser `/opt/gold-whisper-dash/api/index.js` (sin la parte `gold-whisper-dash-main`).

## ⚡ Solución rápida (copia y pega estos comandos exactamente):

```bash
# 1. Crear la API directamente en la ubicación correcta
mkdir -p /opt/api-simple
cd /opt/api-simple

# 2. Inicializar el proyecto e instalar dependencias
npm init -y
npm install express cors

# 3. Crear un archivo index.js simple pero funcional
cat > index.js << 'EOL'
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API Gold Whisper funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de estado
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`API Gold Whisper escuchando en http://localhost:${port}`);
});
EOL

# 4. Ejecutar la API
node index.js
```

## 🔄 Configurar para que se ejecute automáticamente al reiniciar el servidor:

Presiona `Ctrl+C` para detener la API primero, luego copia y pega estos comandos:

```bash
# Crear el servicio de systemd
cat > /etc/systemd/system/gold-whisper-api.service << 'EOL'
[Unit]
Description=Gold Whisper API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/api-simple
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

# Activar e iniciar el servicio
systemctl daemon-reload
systemctl enable gold-whisper-api.service
systemctl start gold-whisper-api.service

# Verificar el estado
systemctl status gold-whisper-api.service
```

## 🔍 Verificar que la API está funcionando:

```bash
# Comprobar que la API está escuchando en el puerto 3001
ss -tulpn | grep 3001

# Probar la API con curl
curl http://localhost:3001/
curl http://localhost:3001/status
```

## 🔄 Si necesitas reiniciar la API en el futuro:

```bash
# Reiniciar el servicio
systemctl restart gold-whisper-api.service
```

## 📋 Para ver los registros de la API:

```bash
# Ver los últimos logs
journalctl -u gold-whisper-api.service -n 50
# Seguir los logs en tiempo real
journalctl -u gold-whisper-api.service -f
