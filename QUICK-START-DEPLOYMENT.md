# ⚡ GUÍA RÁPIDA: DEPLOYMENT EN 30 MINUTOS

Sigue estos pasos en orden para tener tu aplicación funcionando 24/7 en la nube.

---

## ✅ CHECKLIST PRE-DEPLOYMENT

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta en GitHub (https://github.com)
- [ ] Cuenta en Railway (https://railway.app)
- [ ] Cuenta en Vercel (https://vercel.com)
- [ ] Todas las credenciales actuales (Supabase, Meta Ads, etc.)

---

## 🚀 PASO 1: SUBIR CÓDIGO A GITHUB (5 minutos)

### 1.1 Abrir terminal en la carpeta del proyecto

```bash
cd "c:\Users\USUARIO\Downloads\gold-whisper-dash-main nuevo2.0\gold-whisper-dash-main"
```

### 1.2 Inicializar Git

```bash
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### 1.3 Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `gold-whisper-dashboard`
3. Privacidad: **Privado** (recomendado)
4. NO inicialices con README, .gitignore o licencia
5. Haz clic en **"Create repository"**

### 1.4 Subir código

Copia y pega estos comandos (reemplaza `TU-USUARIO` con tu usuario de GitHub):

```bash
git remote add origin https://github.com/TU-USUARIO/gold-whisper-dashboard.git
git branch -M main
git push -u origin main
```

**✅ Verificación**: Ve a tu repositorio en GitHub y confirma que ves todos los archivos.

---

## 🐳 PASO 2: DESPLEGAR CHATWOOT EN RAILWAY (10 minutos)

### 2.1 Crear proyecto en Railway

1. Ve a https://railway.app
2. Haz clic en **"Login with GitHub"**
3. Autoriza Railway
4. Haz clic en **"New Project"**
5. Selecciona **"Deploy from GitHub repo"**
6. Busca y selecciona: `gold-whisper-dashboard`

### 2.2 Configurar servicios

Railway detectará el `docker-compose.yml` y creará automáticamente:
- PostgreSQL
- Redis
- Chatwoot
- Sidekiq

### 2.3 Configurar variables de entorno

En el servicio **Chatwoot**:

1. Haz clic en el servicio **chatwoot**
2. Ve a **"Variables"**
3. Añade estas variables (Railway ya tiene algunas configuradas):

```env
FRONTEND_URL=https://chatwoot-production-xxxx.up.railway.app
FORCE_SSL=true
SECRET_KEY_BASE=6fe54df4d64d6e1f31b80d695d3e08d56f14eea4e9ef0f8fc6e7cf4b5efb5555e5a9e925203c2af833575f89c49ee38cd5e99e867c146da9b3582102138e9d37
```

**IMPORTANTE**: Railway te asignará una URL pública. Cópiala y actualiza `FRONTEND_URL`.

### 2.4 Esperar el deployment

- Toma 3-5 minutos
- Verás logs en tiempo real
- Cuando termine, verás "✅ Deployed"

### 2.5 Acceder a Chatwoot

1. Haz clic en el servicio **chatwoot**
2. Copia la URL pública (ejemplo: `https://chatwoot-production-xxxx.up.railway.app`)
3. Ábrela en tu navegador
4. **Crea tu cuenta de administrador**:
   - Email: tu@email.com
   - Nombre: Tu Nombre
   - Password: TuPassword123!

### 2.6 Obtener API Token

1. Inicia sesión en Chatwoot
2. Ve a **Profile Settings** (icono de usuario arriba a la derecha)
3. Ve a **Access Token**
4. Haz clic en **"Generate Token"**
5. **COPIA EL TOKEN** - lo necesitarás en el siguiente paso

**✅ Guarda estos datos**:
- URL de Chatwoot: `_________________`
- API Token: `_________________`
- Account ID: `1` (por defecto)

---

## 🔧 PASO 3: DESPLEGAR API EN RAILWAY (5 minutos)

### 3.1 Crear nuevo servicio

1. En tu proyecto de Railway, haz clic en **"New"**
2. Selecciona **"GitHub Repo"**
3. Selecciona el mismo repositorio: `gold-whisper-dashboard`
4. Railway creará un nuevo servicio

### 3.2 Configurar Root Directory

1. Haz clic en el nuevo servicio
2. Ve a **"Settings"**
3. En **"Root Directory"**, escribe: `/api`
4. Guarda los cambios

### 3.3 Configurar variables de entorno

En **"Variables"**, añade:

```env
PORT=4000
NODE_ENV=production
CHATWOOT_URL=https://chatwoot-production-xxxx.up.railway.app
CHATWOOT_API_TOKEN=TU_TOKEN_DE_CHATWOOT_DEL_PASO_ANTERIOR
CHATWOOT_ACCOUNT_ID=1
FRONTEND_URL=https://tu-dashboard.vercel.app
ALLOWED_ORIGINS=https://tu-dashboard.vercel.app
```

**NOTA**: Actualizaremos `FRONTEND_URL` y `ALLOWED_ORIGINS` después del siguiente paso.

### 3.4 Esperar deployment

- Toma 1-2 minutos
- Copia la URL pública de la API (ejemplo: `https://api-production-xxxx.up.railway.app`)

### 3.5 Verificar API

Abre en tu navegador: `https://tu-api.railway.app/health`

Deberías ver:
```json
{"ok":true,"service":"chatwoot-bridge"}
```

**✅ Guarda estos datos**:
- URL de API: `_________________`

---

## 🌐 PASO 4: DESPLEGAR DASHBOARD EN VERCEL (5 minutos)

### 4.1 Ir a Vercel

1. Ve a https://vercel.com
2. Haz clic en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**

### 4.2 Importar proyecto

1. Haz clic en **"Add New..."** → **"Project"**
2. Busca: `gold-whisper-dashboard`
3. Haz clic en **"Import"**

### 4.3 Configurar proyecto

1. **Framework Preset**: Vite (se detecta automáticamente)
2. **Root Directory**: `./` (dejar por defecto)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### 4.4 Añadir variables de entorno

Haz clic en **"Environment Variables"** y añade (reemplaza las URLs con las de Railway):

```env
VITE_SUPABASE_URL=https://dcnmswdvvgpqofxoyjop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjbm1zd2R2dmdwcW9meG95am9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5MjI3ODYsImV4cCI6MjA0MzQ5ODc4Nn0.mq7V9Hh79PRdqGg9d--HRExG2CvGlywVWRWQUiYTsD0

VITE_CHATWOOT_URL=https://api-production-xxxx.up.railway.app
VITE_CHATWOOT_ACCOUNT_ID=1
VITE_CHATWOOT_USER_TOKEN=TU_TOKEN_DE_CHATWOOT

VITE_META_BUSINESS_ID=1067806144007153
VITE_META_ACCESS_TOKEN=EAAC4zHE6iMYBPt67m4GY5ML3mWCGeBPiO6N6i6i751ZCOfdSSytbfrXnQ6mRcZBHhJXZBmZCWmgZB4V9Ws4oBpQTTMO6zequoZBNBRuXgHGggZCMNWAaMB3L2ubFyBieDeMj5WLP01AZB04Q7vC0DOs1SGkUUszktaBiXcVKapvGwXwotsTyy0MHZA1I52fZB4Rv4DVQZDZD
VITE_META_AD_ACCOUNT_IDS=360084149294973,5518735214914409
VITE_META_AD_ACCOUNT_NAMES=orolaminado18kcucuta,GALLE 18K DETAL
VITE_META_AD_ACCOUNT_ID=360084149294973
VITE_META_AD_ACCOUNT_NAME=orolaminado18kcucuta
```

### 4.5 Deploy

1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos
3. Verás **"Congratulations!"** cuando termine

### 4.6 Obtener URL

Copia tu URL de Vercel (ejemplo: `https://gold-whisper-dashboard.vercel.app`)

**✅ Guarda este dato**:
- URL del Dashboard: `_________________`

---

## 🔄 PASO 5: ACTUALIZAR CORS EN LA API (2 minutos)

### 5.1 Volver a Railway

1. Ve a tu proyecto en Railway
2. Selecciona el servicio de la **API**
3. Ve a **"Variables"**

### 5.2 Actualizar variables

Actualiza estas variables con tu URL real de Vercel:

```env
FRONTEND_URL=https://tu-dashboard-real.vercel.app
ALLOWED_ORIGINS=https://tu-dashboard-real.vercel.app
```

### 5.3 Redeploy

Railway re-desplegará automáticamente la API (toma 1 minuto).

---

## ✅ PASO 6: VERIFICACIÓN FINAL (3 minutos)

### Checklist de verificación:

#### Chatwoot
- [ ] Accede a tu URL de Chatwoot
- [ ] Puedes iniciar sesión
- [ ] Puedes crear una conversación de prueba

#### API
- [ ] Accede a `https://tu-api.railway.app/health`
- [ ] Ves: `{"ok":true,"service":"chatwoot-bridge"}`
- [ ] Accede a `https://tu-api.railway.app/inboxes`
- [ ] Ves una lista de inboxes (si tienes configurados)

#### Dashboard
- [ ] Accede a tu URL de Vercel
- [ ] La página carga correctamente
- [ ] Puedes hacer login (si tienes autenticación)
- [ ] Puedes ver conversaciones de Chatwoot
- [ ] No hay errores en la consola del navegador (F12)

---

## 🎉 ¡FELICIDADES!

Tu aplicación está ahora funcionando 24/7 en la nube. Ya no necesitas mantener tu PC encendido.

### 📋 URLs finales:

```
Dashboard:  https://_____________________.vercel.app
Chatwoot:   https://_____________________.railway.app
API:        https://_____________________.railway.app
```

### 💰 Costos mensuales:

- Railway: $5-10 USD (después del crédito gratuito)
- Vercel: GRATIS
- Supabase: GRATIS
- **Total: $5-10 USD/mes**

---

## 🔧 ACTUALIZACIONES FUTURAS

Cuando hagas cambios en tu código:

1. **Commit y push a GitHub**:
```bash
git add .
git commit -m "Descripción de cambios"
git push
```

2. **Railway y Vercel se actualizarán automáticamente** (deployment automático activado por defecto)

---

## 🆘 PROBLEMAS COMUNES

### Error: "Origin not allowed by CORS"
- Verifica que las variables `FRONTEND_URL` y `ALLOWED_ORIGINS` en la API tengan la URL correcta de Vercel
- No olvides incluir `https://` al inicio

### Error: "Failed to fetch conversations"
- Verifica que el `CHATWOOT_URL` en la API apunte a tu instancia de Chatwoot en Railway
- Verifica que el `CHATWOOT_API_TOKEN` sea correcto
- Verifica que el `VITE_CHATWOOT_URL` en Vercel apunte a tu API en Railway

### Chatwoot no inicia
- Verifica los logs en Railway
- Asegúrate de que PostgreSQL y Redis estén funcionando
- Puede tomar hasta 5 minutos en el primer deployment

### Dashboard muestra página en blanco
- Abre la consola del navegador (F12)
- Verifica errores en la pestaña Console
- Verifica que todas las variables de entorno estén configuradas en Vercel

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisa los logs en Railway y Vercel
2. Verifica que todas las URLs y tokens estén correctos
3. Asegúrate de que los servicios estén "running" (no "crashed")

¡Tu aplicación debería estar funcionando perfectamente! 🚀
