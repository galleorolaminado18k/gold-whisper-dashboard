# Solución para el Error de la API

Veo que estás teniendo problemas al ejecutar la API. El error es:

```
Error: Cannot find module '/opt/gold-whisper-dash/gold-whisper-dash-main/api/index.js'
```

## El problema

El problema es que Node.js no puede encontrar el archivo `index.js`. Esto puede deberse a:
1. La ruta del archivo es incorrecta
2. El archivo no existe
3. Hay problemas con las dependencias

## Solución paso a paso

Sigue estos pasos exactamente como se indican:

### 1. Primero, verifica las rutas correctas

```bash
# Verificar estructura de directorios
ls -la /opt/gold-whisper-dash/
ls -la /opt/gold-whisper-dash/api/
```

### 2. Instalar dependencias de la API

```bash
cd /opt/gold-whisper-dash/api
npm install
```

### 3. Verificar que el archivo index.js existe

```bash
ls -la /opt/gold-whisper-dash/api/index.js
```

### 4. Si el archivo no existe, créalo:

```bash
cat > /opt/gold-whisper-dash/api/index.js << 'EOL'
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`);
});
EOL
```

### 5. Intenta ejecutar la API nuevamente:

```bash
cd /opt/gold-whisper-dash/api
node index.js
```

### 6. Si sigue fallando, intenta este enfoque alternativo:

```bash
# Crear un nuevo directorio para la API
mkdir -p /opt/api-gold-whisper

# Crear un nuevo archivo index.js simple
cat > /opt/api-gold-whisper/index.js << 'EOL'
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

app.get('/status', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`API alternativa escuchando en el puerto ${port}`);
});
EOL

# Instalar dependencias
cd /opt/api-gold-whisper
npm init -y
npm install express cors

# Ejecutar la API
node index.js
```

### 7. Actualizar configuración de Nginx si usas la API alternativa

Si tuviste que usar la solución alternativa en el paso 6, actualiza la configuración de Nginx:

```bash
# Editar la configuración
cat > /etc/nginx/sites-available/gold-whisper.conf << 'EOL'
server {
    listen 80;
    server_name dashboard.galle18k.com;
    
    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name api.galle18k.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name chatwoot.galle18k.com;
    
    location / {
        proxy_pass http://localhost:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOL

# Reiniciar Nginx
systemctl restart nginx
```

## Para arrancar el Dashboard

Ya que veo que también podrías tener problemas con el Dashboard, aquí tienes los comandos:

```bash
# Ir al directorio del Dashboard
cd /opt/gold-whisper-dash

# Instalar dependencias
npm install

# Iniciar el Dashboard en puerto 8081
npm run dev -- --port 8081
```

## Configuración para inicio automático

Una vez que hayas solucionado los problemas, usa estos comandos para configurar el inicio automático:

```bash
# Crear servicio para la API
cat > /etc/systemd/system/gold-whisper-api.service << 'EOL'
[Unit]
Description=Gold Whisper API
After=network.target

[Service]
Type=simple
User=root
# Ajusta la ruta según donde hayas logrado que funcione
WorkingDirectory=/opt/gold-whisper-dash/api
# O si usaste la alternativa:
# WorkingDirectory=/opt/api-gold-whisper
ExecStart=/usr/bin/node index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOL

# Activar e iniciar el servicio
systemctl daemon-reload
systemctl enable gold-whisper-api.service
systemctl start gold-whisper-api.service

# Verificar estado
systemctl status gold-whisper-api.service
