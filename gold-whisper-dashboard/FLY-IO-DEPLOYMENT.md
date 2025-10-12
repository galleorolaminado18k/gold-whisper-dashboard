# 🚀 DEPLOYMENT EN FLY.IO - 100% UPTIME GRATIS

## ✅ CARACTERÍSTICAS
- **NUNCA se duerme** - 24/7 activo
- **GRATIS** - 3 VMs incluidas
- **Fácil** - Deploy desde terminal
- **SSL automático** - HTTPS incluido

---

## 📋 PASO 1: INSTALAR FLY CLI

### Windows (PowerShell):
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Reiniciar Terminal después de instalar

---

## 📋 PASO 2: LOGIN EN FLY.IO

```bash
flyctl auth login
```

Se abrirá el navegador para hacer login. Si no tienes cuenta:
- Crea una en https://fly.io/app/sign-up
- **Es GRATIS** - No necesita tarjeta de crédito para el plan gratuito

---

## 📋 PASO 3: DESPLEGAR DASHBOARD

```bash
cd gold-whisper-dash-main
flyctl launch --no-deploy
# Cuando pregunte:
# - App name: gold-whisper-dashboard (o el que prefieras)
# - Region: mia (Miami) o la más cercana
# - Set up Postgres? NO
# - Deploy now? NO

# Ahora sí, despliega:
flyctl deploy
```

Esto tomará 2-3 minutos. Al finalizar verás:
```
Visit your newly deployed app at https://gold-whisper-dashboard.fly.dev
```

---

## 📋 PASO 4: DESPLEGAR API

```bash
cd api
flyctl launch --no-deploy
# Cuando pregunte:
# - App name: gold-whisper-api (o el que prefieras)
# - Region: mia (Miami)
# - Set up Postgres? NO
# - Deploy now? NO

# Configurar variables de entorno:
flyctl secrets set CHATWOOT_API_KEY="tu_api_key_aqui"
flyctl secrets set CHATWOOT_URL="tu_url_chatwoot_aqui"
flyctl secrets set PORT="8080"

# Desplegar:
flyctl deploy
```

---

## 📋 PASO 5: CONFIGURAR CHATWOOT

Chatwoot necesita PostgreSQL y Redis. Opciones:

### OPCIÓN A: Usar Chatwoot Cloud (Más fácil)
1. Registrate en https://www.chatwoot.com/
2. Plan gratuito: 2 agentes incluidos
3. Usa la URL que te den

### OPCIÓN B: Desplegar Chatwoot en Fly.io
```bash
# Crear Postgres
flyctl postgres create --name gold-whisper-db --region mia

# Crear Redis
flyctl redis create --name gold-whisper-redis --region mia

# Estos servicios tienen costo en Fly.io
# Considera usar Chatwoot Cloud (gratis)
```

---

## 📋 PASO 6: ACTUALIZAR CORS

Actualiza tu archivo `api/.env` con las URLs de producción:

```env
ALLOWED_ORIGINS=https://gold-whisper-dashboard.fly.dev
```

Redeploy la API:
```bash
cd api
flyctl deploy
```

---

## 📋 VERIFICAR DEPLOYMENT

```bash
# Ver status del dashboard
flyctl status -a gold-whisper-dashboard

# Ver logs del dashboard
flyctl logs -a gold-whisper-dashboard

# Ver status de la API
flyctl status -a gold-whisper-api

# Ver logs de la API
flyctl logs -a gold-whisper-api
```

---

## 🔧 COMANDOS ÚTILES

```bash
# Ver todas tus apps
flyctl apps list

# Escalar memoria (si necesitas más RAM)
flyctl scale memory 512 -a gold-whisper-dashboard

# Ver consumo de recursos
flyctl status -a gold-whisper-dashboard

# Abrir dashboard en el navegador
flyctl open -a gold-whisper-dashboard

# SSH a la instancia
flyctl ssh console -a gold-whisper-dashboard

# Reiniciar app
flyctl apps restart gold-whisper-dashboard
```

---

## 💰 LÍMITES DEL PLAN GRATUITO

```
✅ 3 VMs compartidas (256MB RAM c/u)
✅ 3 GB almacenamiento persistente
✅ 160 GB transferencia/mes
✅ NUNCA se apaga
```

---

## 🔄 ACTUALIZAR APPS

Cada vez que hagas cambios:

```bash
# Dashboard
cd gold-whisper-dash-main
flyctl deploy -a gold-whisper-dashboard

# API
cd api
flyctl deploy -a gold-whisper-api
```

---

## ❓ TROUBLESHOOTING

### App no inicia:
```bash
flyctl logs -a gold-whisper-dashboard
```

### Ver configuración:
```bash
flyctl config show -a gold-whisper-dashboard
```

### Problema con el build:
```bash
flyctl deploy --local-only -a gold-whisper-dashboard
```

---

## 🎉 ¡LISTO!

Tus apps estarán en:
- **Dashboard**: https://gold-whisper-dashboard.fly.dev
- **API**: https://gold-whisper-api.fly.dev

**Activas 24/7 sin dormirse nunca**
