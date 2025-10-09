# 🚀 GUÍA DE DESPLIEGUE 24/7 EN LA NUBE

Esta guía te ayudará a mantener tu Dashboard y Chatwoot funcionando 24/7, incluso con tu PC apagado.

## 📋 COMPONENTES A DESPLEGAR

1. **Dashboard React** (Frontend)
2. **API Node.js** (Backend Bridge)
3. **Chatwoot** (Sistema de mensajería completo)

---

## 🎯 OPCIÓN RECOMENDADA: RAILWAY.APP

Railway.app es la mejor opción porque:
- ✅ Plan gratuito con $5 USD de crédito mensual
- ✅ Soporta Docker (perfecto para Chatwoot)
- ✅ Fácil deployment desde GitHub
- ✅ URLs HTTPS automáticas
- ✅ Variables de entorno seguras
- ✅ Base de datos PostgreSQL incluida

---

## 🛠️ PASO 1: PREPARAR EL REPOSITORIO

### 1.1 Inicializar Git (si no está inicializado)

```bash
cd gold-whisper-dash-main
git init
git add .
git commit -m "Initial commit for deployment"
```

### 1.2 Crear cuenta en GitHub y subir el código

1. Ve a https://github.com y crea una cuenta (o inicia sesión)
2. Crea un nuevo repositorio (puede ser privado)
3. Ejecuta estos comandos:

```bash
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

---

## 🚀 PASO 2: DESPLEGAR CHATWOOT EN RAILWAY

### 2.1 Crear cuenta en Railway

1. Ve a https://railway.app
2. Regístrate con tu cuenta de GitHub
3. Conecta tu repositorio

### 2.2 Desplegar Chatwoot

1. En Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Selecciona tu repositorio
4. Railway detectará automáticamente el `docker-compose.yml`

### 2.3 Configurar variables de entorno para Chatwoot

En Railway, ve a tu servicio Chatwoot y añade estas variables:

```env
RAILS_ENV=production
NODE_ENV=production
SECRET_KEY_BASE=TU_SECRET_KEY_AQUI
FRONTEND_URL=https://tu-app-chatwoot.railway.app
FORCE_SSL=true
```

**IMPORTANTE**: Railway te dará una URL como `https://chatwoot-production.up.railway.app`

### 2.4 Obtener credenciales de Chatwoot

Una vez desplegado:
1. Accede a tu URL de Chatwoot
2. Crea una cuenta de administrador
3. Ve a Settings → Access Token
4. Copia el token de API

---

## 🖥️ PASO 3: DESPLEGAR LA API NODE.JS

### 3.1 Crear archivos de configuración para Railway

Crea `railway.json` en la raíz del proyecto:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "node api/chatwoot.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3.2 Desplegar en Railway

1. En Railway, crea un nuevo servicio
2. Selecciona **"Deploy from GitHub repo"**
3. Selecciona la carpeta `api`
4. Railway detectará automáticamente que es Node.js

### 3.3 Configurar variables de entorno para la API

```env
PORT=4000
CHATWOOT_URL=https://tu-chatwoot.railway.app
CHATWOOT_API_TOKEN=TU_TOKEN_DE_CHATWOOT
CHATWOOT_ACCOUNT_ID=1
NODE_ENV=production
```

Railway te dará una URL como `https://api-production.up.railway.app`

---

## 🌐 PASO 4: DESPLEGAR EL DASHBOARD EN VERCEL

### 4.1 Preparar el Dashboard

Crea `.env.production` en la raíz:

```env
VITE_SUPABASE_URL=https://dcnmswdvvgpqofxoyjop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjbm1zd2R2dmdwcW9meG95am9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5MjI3ODYsImV4cCI6MjA0MzQ5ODc4Nn0.mq7V9Hh79PRdqGg9d--HRExG2CvGlywVWRWQUiYTsD0

VITE_CHATWOOT_URL=https://api-production.up.railway.app
VITE_CHATWOOT_ACCOUNT_ID=1
VITE_CHATWOOT_USER_TOKEN=TU_TOKEN_AQUI

VITE_META_BUSINESS_ID=1067806144007153
VITE_META_ACCESS_TOKEN=EAAC4zHE6iMYBPt67m4GY5ML3mWCGeBPiO6N6i6i751ZCOfdSSytbfrXnQ6mRcZBHhJXZBmZCWmgZB4V9Ws4oBpQTTMO6zequoZBNBRuXgHGggZCMNWAaMB3L2ubFyBieDeMj5WLP01AZB04Q7vC0DOs1SGkUUszktaBiXcVKapvGwXwotsTyy0MHZA1I52fZB4Rv4DVQZDZD
VITE_META_AD_ACCOUNT_IDS=360084149294973,5518735214914409
VITE_META_AD_ACCOUNT_NAMES=orolaminado18kcucuta,GALLE 18K DETAL
VITE_META_AD_ACCOUNT_ID=360084149294973
VITE_META_AD_ACCOUNT_NAME=orolaminado18kcucuta
```

### 4.2 Desplegar en Vercel

1. Ve a https://vercel.com
2. Regístrate con tu cuenta de GitHub
3. Haz clic en **"Add New Project"**
4. Selecciona tu repositorio
5. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Añade las variables de entorno desde `.env.production`

7. Haz clic en **"Deploy"**

Vercel te dará una URL como `https://tu-dashboard.vercel.app`

---

## 🔄 PASO 5: ACTUALIZAR CORS EN LA API

Actualiza `api/chatwoot.js` para permitir tu dominio de Vercel:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://127.0.0.1:8081",
      "https://tu-dashboard.vercel.app"  // ← Añade tu URL de Vercel
    ],
    credentials: true
  })
);
```

---

## ✅ VERIFICACIÓN FINAL

### Checklist de URLs:

- [ ] Chatwoot funcionando en: `https://chatwoot-xxx.railway.app`
- [ ] API funcionando en: `https://api-xxx.railway.app`
- [ ] Dashboard funcionando en: `https://tu-app.vercel.app`

### Pruebas:

1. **Chatwoot**: Accede a tu URL y verifica que puedes iniciar sesión
2. **API**: Accede a `https://tu-api.railway.app/health` (debe responder `{"ok":true}`)
3. **Dashboard**: Accede a tu URL de Vercel y verifica que todo carga correctamente

---

## 💰 COSTOS ESTIMADOS

| Servicio | Costo Mensual |
|----------|---------------|
| **Railway.app** (Chatwoot + API) | $5 USD (crédito gratuito) o $5-10 USD |
| **Vercel** (Dashboard) | GRATIS |
| **Supabase** (Base de datos) | GRATIS (ya configurado) |
| **TOTAL** | $0-10 USD/mes |

---

## 🔧 ALTERNATIVAS

### Alternativa 1: Render.com (Todo en uno)

Render.com es otra excelente opción:
- Plan gratuito limitado
- Soporta Docker
- URLs HTTPS automáticas

### Alternativa 2: VPS en DigitalOcean/Linode

Para control total:
- Costo: $5-12 USD/mes
- Requiere configuración manual
- Control total del servidor

---

## 📞 SOPORTE

Si tienes problemas durante el deployment:

1. Verifica los logs en Railway/Vercel
2. Asegúrate de que todas las variables de entorno estén configuradas
3. Verifica que las URLs estén correctamente configuradas en CORS

---

## 🎉 ¡LISTO!

Una vez completados estos pasos, tu aplicación estará funcionando 24/7 en la nube, accesible desde cualquier lugar del mundo. Ya no necesitas mantener tu PC encendido.

**URLs finales:**
- Dashboard: `https://tu-app.vercel.app`
- Chatwoot: `https://tu-chatwoot.railway.app`
- API: `https://tu-api.railway.app`
