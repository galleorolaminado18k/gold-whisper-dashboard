# 🆓 DEPLOYMENT 100% GRATUITO 24/7

## 🎯 SOLUCIONES COMPLETAMENTE GRATUITAS

Esta guía presenta opciones 100% gratuitas para mantener tu aplicación funcionando 24/7.

---

## 🏆 OPCIÓN 1: ORACLE CLOUD (RECOMENDADA) - 100% GRATIS PERMANENTE

Oracle Cloud ofrece **servidores gratuitos PERMANENTES** (Always Free Tier).

### Especificaciones del servidor gratuito:
- **2 VM instances** (AMD)
- **1 GB RAM** cada una
- **Arm-based Ampere A1** cores (hasta 4 cores y 24GB RAM compartidos)
- **200 GB almacenamiento**
- **10 TB transferencia mensual**
- **IP pública**
- **GRATIS PARA SIEMPRE** (no requiere tarjeta de crédito después del trial)

### Pasos para Oracle Cloud:

#### 1. Crear cuenta
1. Ve a https://www.oracle.com/cloud/free/
2. Regístrate (requiere tarjeta solo para verificación, no se cobra)
3. Selecciona tu región (más cercana a Colombia: São Paulo o Ashburn)

#### 2. Crear instancia Ubuntu
```bash
Compute → Instances → Create Instance

Configuración:
- Image: Ubuntu 22.04
- Shape: VM.Standard.E2.1.Micro (Always Free)
- Network: Create new VCN
- SSH keys: Generate a key pair (descarga la private key)
```

#### 3. Configurar firewall
```bash
# En Oracle Cloud Console
Networking → Virtual Cloud Networks → Security Lists
Add Ingress Rules:
- Puerto 80 (HTTP)
- Puerto 443 (HTTPS)
- Puerto 3000 (Chatwoot)
- Puerto 8081 (Dashboard)
- Puerto 4000 (API)
```

#### 4. Conectarse al servidor
```bash
ssh -i tu-private-key.key ubuntu@TU-IP-PUBLICA
```

#### 5. Instalar Docker y Docker Compose
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo apt install docker-compose -y
```

#### 6. Instalar Git y clonar tu repositorio
```bash
sudo apt install git -y
git clone https://github.com/TU-USUARIO/gold-whisper-dashboard.git
cd gold-whisper-dashboard/gold-whisper-dash-main
```

#### 7. Configurar variables de entorno
```bash
nano docker-compose.yml
# Actualizar FRONTEND_URL con tu IP pública
# FRONTEND_URL: http://TU-IP-PUBLICA:3000
```

#### 8. Levantar Chatwoot
```bash
docker-compose up -d
```

#### 9. Instalar Node.js para la API
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

#### 10. Configurar y levantar API
```bash
cd api
npm install
nano .env
# Configurar CHATWOOT_URL=http://localhost:3020
# Configurar PORT=4000

# Instalar PM2 para mantener API corriendo
sudo npm install -g pm2
pm2 start chatwoot.js --name api
pm2 save
pm2 startup
```

#### 11. Instalar y configurar Nginx
```bash
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/dashboard

# Pegar configuración (ver abajo)
sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Configuración Nginx:
```nginx
server {
    listen 80;
    server_name TU-IP-PUBLICA;

    # Dashboard
    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Chatwoot
    location /chatwoot/ {
        proxy_pass http://localhost:3020/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 12. Build y servir Dashboard
```bash
cd ~/gold-whisper-dashboard/gold-whisper-dash-main
npm install
npm run build

# Servir con PM2
pm2 serve dist 8081 --name dashboard
pm2 save
```

### ✅ Resultado:
- **Dashboard**: http://TU-IP-PUBLICA
- **API**: http://TU-IP-PUBLICA/api
- **Chatwoot**: http://TU-IP-PUBLICA/chatwoot
- **Costo**: $0 USD (GRATIS PERMANENTE)

---

## 🏆 OPCIÓN 2: RENDER.COM - 100% GRATIS (con limitaciones)

Render ofrece plan gratuito pero con limitaciones:
- Se "duerme" después de 15 minutos de inactividad
- 750 horas gratis por mes (suficiente para 1 servicio 24/7)

### Pasos para Render:

#### 1. Frontend en Vercel (GRATIS)
```bash
# Ya cubierto en QUICK-START-DEPLOYMENT.md
# Vercel es 100% gratis para el frontend
```

#### 2. Backend en Render
1. Ve a https://render.com
2. Regístrate con GitHub
3. Haz clic en **"New +"** → **"Web Service"**
4. Selecciona tu repositorio
5. Configuración:
   - **Name**: gold-whisper-api
   - **Runtime**: Node
   - **Build Command**: `cd api && npm install`
   - **Start Command**: `cd api && node chatwoot.js`
   - **Plan**: Free

#### 3. Base de datos PostgreSQL (GRATIS en Render)
1. New + → PostgreSQL
2. Name: gold-whisper-db
3. Plan: Free
4. Copia la **Internal Database URL**

#### 4. Redis (GRATIS en Render)
1. New + → Redis
2. Name: gold-whisper-redis  
3. Plan: Free

#### 5. Chatwoot en Render
1. New + → Web Service
2. Configuración:
   - **Name**: gold-whisper-chatwoot
   - **Runtime**: Docker
   - **Plan**: Free
   - Variables de entorno:
     ```
     POSTGRES_HOST=tu-postgres-hostname
     POSTGRES_DATABASE=tu-database-name
     POSTGRES_USERNAME=tu-username
     POSTGRES_PASSWORD=tu-password
     REDIS_URL=tu-redis-url
     RAILS_ENV=production
     SECRET_KEY_BASE=generar-un-secret-key
     FRONTEND_URL=https://tu-chatwoot.onrender.com
     ```

### ⚠️ Limitaciones del plan gratuito Render:
- Servicios se duermen después de 15 minutos sin uso
- Primer request después de dormir toma 30-50 segundos
- 750 horas/mes gratis (solo permite 1 servicio 24/7)

---

## 🏆 OPCIÓN 3: FLY.IO - GRATIS con créditos mensuales

Fly.io ofrece:
- **$5 USD en créditos mensuales GRATIS**
- 3 VMs compartidas de 256MB
- 160GB transferencia mensual

### Pasos para Fly.io:

```bash
# 1. Instalar flyctl
curl -L https://fly.io/install.sh | sh

# 2. Autenticarse
flyctl auth signup
flyctl auth login

# 3. Crear app para Chatwoot
cd gold-whisper-dash-main
flyctl launch --name gold-whisper-chatwoot

# 4. Configurar PostgreSQL (gratis)
flyctl postgres create --name gold-whisper-db

# 5. Configurar Redis (gratis)
flyctl redis create --name gold-whisper-redis

# 6. Desplegar
flyctl deploy
```

---

## 🏆 OPCIÓN 4: GOOGLE CLOUD - Always Free Tier

Google Cloud ofrece:
- **1 micro instancia e2-micro** (0.25-0.5 vCPU, 1GB RAM)
- **30 GB almacenamiento**
- **1 GB tráfico de salida a América del Norte por mes**

Similar a Oracle pero con menos recursos gratuitos.

---

## 🏆 OPCIÓN 5: USAR TU PC COMO SERVIDOR (100% GRATIS)

Si tienes PC encendido 24/7 o quieres usarlo:

### Con Ngrok (túnel gratuito):

```bash
# 1. Instalar ngrok
https://ngrok.com/download

# 2. Autenticarse
ngrok authtoken TU-TOKEN

# 3. Exponer tu servidor local
ngrok http 8081

# Te da una URL pública:
# https://xxxxx.ngrok.io → http://localhost:8081
```

### ⚠️ Limitaciones Ngrok gratuito:
- URL cambia cada vez que reinicias ngrok
- 40 conexiones/minuto
- Solo 1 proceso a la vez

### Alternativas a Ngrok (también gratuitas):
- **LocalTunnel**: `npx localtunnel --port 8081`
- **Serveo**: `ssh -R 80:localhost:8081 serveo.net`
- **Pagekite**: https://pagekite.net

---

## 📊 COMPARACIÓN DE OPCIONES GRATUITAS

| Opción | Costo | Uptime | Recursos | Dificultad |
|--------|-------|--------|----------|------------|
| **Oracle Cloud** | $0 | 99.9% | ALTO | Media |
| **Render.com** | $0 | 95% (se duerme) | MEDIO | Baja |
| **Fly.io** | $0 | 99% | BAJO | Media |
| **Google Cloud** | $0 | 99.9% | BAJO | Media |
| **Ngrok + PC** | $0 | Depende | ALTO | Muy Baja |

---

## 🎯 RECOMENDACIÓN FINAL

### Para producción seria (GRATIS PERMANENTE):
👉 **Oracle Cloud Always Free Tier**
- Servidor completo Ubuntu
- Recursos suficientes para todo
- 100% gratis para siempre
- No se apaga nunca

### Para pruebas rápidas:
👉 **Render.com + Vercel**
- Más fácil de configurar
- Se duerme pero gratis
- Ideal para demos

### Para desarrollo/pruebas locales:
👉 **Ngrok + tu PC**
- Más simple
- Control total
- Requiere PC encendido

---

## 🚀 SIGUIENTE PASO

¿Qué opción prefieres?

1. **Oracle Cloud** → Guía detallada paso a paso (RECOMENDADO)
2. **Render.com** → Setup rápido en 15 minutos
3. **Ngrok** → Exponer tu servidor local ahora mismo

Avísame y te guío en detalle por la opción que elijas. Todas son 100% GRATUITAS.
