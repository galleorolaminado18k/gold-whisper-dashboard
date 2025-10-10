# 🚀 Mantener el Servidor Siempre Activo

## Para que el dashboard esté siempre disponible (24/7)

### Opción 1: PM2 (Recomendado para producción)

PM2 es un administrador de procesos que mantiene tu aplicación corriendo incluso si se reinicia el servidor.

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar el servidor frontend
pm2 start "npm run dev" --name "galle-dashboard"

# Iniciar el API bridge
cd api
pm2 start "node chatwoot.js" --name "galle-bridge"

# Guardar la configuración
pm2 save

# Configurar PM2 para que inicie con el sistema
pm2 startup

# Ver el estado de los procesos
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar un proceso
pm2 restart galle-dashboard

# Detener un proceso
pm2 stop galle-dashboard
```

### Opción 2: Servicios de Windows

Crear servicios de Windows que inicien automáticamente:

```powershell
# Usar NSSM (Non-Sucking Service Manager)
# Descargar desde: https://nssm.cc/download

# Instalar servicio para frontend
nssm install GalleDashboard "C:\Program Files\nodejs\npm.cmd" "run dev"
nssm set GalleDashboard AppDirectory "C:\ruta\a\gold-whisper-dash-main"

# Instalar servicio para bridge
nssm install GalleBridge "C:\Program Files\nodejs\node.exe" "chatwoot.js"
nssm set GalleBridge AppDirectory "C:\ruta\a\gold-whisper-dash-main\api"

# Iniciar servicios
nssm start GalleDashboard
nssm start GalleBridge
```

### Opción 3: Docker (Recomendado para deploy)

```bash
# El proyecto ya tiene docker-compose.yml
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Opción 4: Servidor Cloud (Más confiable)

Para acceso 24/7 real desde cualquier lugar:

1. **Vercel/Netlify** (para el frontend)
2. **Heroku/Railway** (para el API bridge)
3. **AWS/Google Cloud** (solución completa)

## ⚠️ Nota Importante

**No es posible mantener una aplicación web corriendo si el PC está apagado.** 

Las páginas web necesitan un servidor activo. Opciones:

1. ✅ Mantener tu PC siempre encendido + PM2
2. ✅ Usar un servidor cloud (acceso desde cualquier lugar)
3. ✅ Usar un VPS (Virtual Private Server) económico

## 🔧 Configuración Automática al Iniciar Windows

Crear archivo batch: `iniciar-galle.bat`

```batch
@echo off
cd /d "C:\ruta\a\gold-whisper-dash-main"
start cmd /k "npm run dev"
cd api
start cmd /k "node chatwoot.js"
```

Luego:
1. Presiona `Win + R`
2. Escribe `shell:startup`
3. Copia `iniciar-galle.bat` ahí

Ahora se iniciará automáticamente al encender el PC.

## 📊 Monitoreo

Para verificar que todo está corriendo:

```bash
# Ver procesos con PM2
pm2 status

# Ver uso de recursos
pm2 monit

# Restart automático si falla
# (PM2 lo hace automáticamente)
```

## 🌐 Acceso Remoto

Para acceder desde otros dispositivos en tu red local:

1. Encuentra tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
2. Accede desde otros dispositivos: `http://TU-IP:8081`

Para acceso desde internet, necesitas:
- Configurar port forwarding en tu router
- O usar un servicio cloud (recomendado)
