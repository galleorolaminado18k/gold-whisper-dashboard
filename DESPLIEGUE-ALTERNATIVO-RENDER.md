# 🚀 Despliegue Alternativo en Render.com con SSL Gratuito

## Ventajas de esta alternativa:
- ✅ SSL gratuito automático
- ✅ Despliegue más rápido y sencillo
- ✅ No requiere Git Bash ni configuraciones complejas
- ✅ Servicios 24/7 con plan gratuito o económico
- ✅ Interfaz web para gestión (no necesitas SSH)

## 1️⃣ Preparación

1. Crea una cuenta en [Render.com](https://render.com/) (puedes usar tu cuenta de GitHub)
2. Divide el despliegue en 3 servicios:
   - Dashboard (Frontend React/Vite)
   - API (Backend Node.js)
   - Chatwoot (Docker)

## 2️⃣ Despliegue del Dashboard (Frontend)

1. En Render.com, selecciona **"New Web Service"**
2. Conecta con tu repositorio de GitHub o sube directamente la carpeta `gold-whisper-dash-main`
3. Configura:
   - **Name**: `gold-whisper-dashboard`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - **Environment Variables**: 
     - `VITE_API_URL=https://gold-whisper-api.onrender.com`
     - `VITE_CHATWOOT_URL=https://gold-whisper-chatwoot.onrender.com`

4. Selecciona **"Create Web Service"**

## 3️⃣ Despliegue de la API (Backend)

1. En Render.com, selecciona **"New Web Service"**
2. Conecta con tu repositorio de GitHub o sube directamente la carpeta `gold-whisper-dash-main/api`
3. Configura:
   - **Name**: `gold-whisper-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment Variables**: Copia las variables de tu archivo `.env`

4. Selecciona **"Create Web Service"**

## 4️⃣ Despliegue de Chatwoot (integrado en el código)

1. En Render.com, selecciona **"New Web Service"**
2. Configura:
   - **Name**: `gold-whisper-chatwoot`
   - **Environment**: `Node`
   - **Root Directory**: `/api` (donde se encuentra la implementación de Chatwoot)
   - **Build Command**: `npm install`
   - **Start Command**: `node chatwoot.js`
   - **Environment Variables**: Copia las variables de tu archivo `.env`

3. Selecciona **"Create Web Service"**

## 5️⃣ Configuración de Dominio Personalizado y SSL

1. Una vez desplegados los servicios, ve a la página de cada servicio en Render
2. En "Settings" > "Custom Domain":
   - Para el Dashboard: Añade `dashboard.galle18k.com`
   - Para la API: Añade `api.galle18k.com`
   - Para Chatwoot: Añade `chatwoot.galle18k.com`

3. Sigue las instrucciones para configurar los registros CNAME en tu panel de Hostinger:
   - Tipo CNAME: `dashboard.galle18k.com` → `gold-whisper-dashboard.onrender.com`
   - Tipo CNAME: `api.galle18k.com` → `gold-whisper-api.onrender.com`
   - Tipo CNAME: `chatwoot.galle18k.com` → `gold-whisper-chatwoot.onrender.com`

4. Render configurará **automáticamente** certificados SSL (Let's Encrypt) para tus dominios

## 6️⃣ Verificación

1. Espera aproximadamente 5-10 minutos para que los certificados SSL se emitan
2. Verifica accediendo a:
   - `https://dashboard.galle18k.com`
   - `https://api.galle18k.com`
   - `https://chatwoot.galle18k.com`

## 🔄 Actualizaciones futuras

Para actualizar tus servicios en Render.com:
1. Inicia sesión en tu cuenta de Render
2. Selecciona el servicio que deseas actualizar
3. Haz clic en "Manual Deploy" > "Deploy latest commit" o sube una nueva versión

## 💰 Consideraciones de costos

- Render ofrece un **plan gratuito** con limitaciones (servicios se suspenden después de períodos de inactividad)
- Para servicio 24/7 ininterrumpido, puedes actualizar al plan **Individual** ($7/mes por servicio)
- Alternativa: Configurar un "cron job" gratuito (con [cron-job.org](https://cron-job.org)) para hacer ping a tus servicios cada 10 minutos y evitar que entren en suspensión

## ⚠️ Posibles problemas y soluciones

1. **Error de despliegue**:
   - Verifica los logs en Render para identificar errores específicos
   - Asegúrate de que todas las dependencias estén correctamente configuradas

2. **Problemas de dominio**:
   - La propagación DNS puede tardar hasta 48 horas (generalmente menos de 1 hora)
   - Verifica la configuración DNS en tu panel de Hostinger

3. **Límites del plan gratuito**:
   - Si experimentas suspensiones por inactividad, considera actualizar al plan Individual
   - O configura un cron job para mantener activos tus servicios
