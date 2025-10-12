# 🚀 Despliegue Rápido en 1-Click

## Opción 1: Despliegue instantáneo con Netlify/Vercel

### Para el Dashboard (Frontend)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/user/gold-whisper-dash)

1. Haz clic en el botón "Deploy to Netlify"
2. Inicia sesión o crea una cuenta
3. Netlify desplegará automáticamente tu dashboard
4. Configuración de dominio:
   - Ve a "Domain settings" en Netlify
   - Añade tu dominio personalizado: `dashboard.galle18k.com`
   - Configura un registro CNAME en Hostinger apuntando a tu sitio de Netlify

### Para la API (Backend)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/user/gold-whisper-dash)

1. Haz clic en el botón "Deploy to Render"
2. Inicia sesión o crea una cuenta
3. Selecciona la carpeta `api` como directorio raíz
4. Configura como se indica en `DESPLIEGUE-ALTERNATIVO-RENDER.md`

## Opción 2: Despliegue con Railway (Muy sencillo, con SSL)

Railway es otra plataforma que ofrece despliegue sencillo y SSL gratuito automático.

1. Ve a [Railway.app](https://railway.app/) y crea una cuenta
2. Haz clic en "New Project" > "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará automáticamente el tipo de proyecto
5. Para el dashboard, configura:
   - Root directory: `/`
   - Environment: Node.js
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`

6. Para la API, crea otro proyecto y configura:
   - Root directory: `/api`
   - Start Command: `node index.js`

7. Configura dominios personalizados en "Settings" > "Domains"

## Opción 3: Despliegue Manual Más Fácil (Para VPS Hostinger)

Si prefieres seguir usando tu VPS de Hostinger, aquí tienes un método más directo:

```bash
# Copia y pega este comando en la terminal de Hostinger (vía SSH)

curl -s -L https://raw.githubusercontent.com/user/gold-whisper-dash/main/easy-deploy.sh | bash
```

Este script automatiza todo el proceso de instalación y configuración, incluyendo:
- Configuración de Nginx
- Instalación de Certbot para SSL gratuito
- Configuración de servicios con PM2
- Despliegue de todos los componentes

## Configuración de dominio siempre necesaria

Independientemente del método que elijas, siempre necesitarás configurar tus subdominios en el panel de Hostinger:

1. Inicia sesión en tu panel de Hostinger
2. Ve a "DNS / Nameservers"
3. Añade los registros necesarios según el método de despliegue elegido:
   - Para VPS Hostinger: registros A apuntando a la IP 31.70.131.9
   - Para Netlify/Render/Railway: registros CNAME apuntando a los dominios proporcionados

## Obtener SSL Gratuito Automáticamente

Con cualquiera de estas opciones (Netlify, Render, Railway), obtendrás certificados SSL gratuitos automáticamente. No necesitas hacer nada adicional para habilitar HTTPS.

## Recomendación final

Para la solución más rápida y sin complicaciones, recomiendo:
1. Dashboard → Netlify (despliega en 45 segundos)
2. API → Railway o Render (ambos con SSL gratuito)
3. Chatwoot → Versión oficial en la nube (si es posible)

Estas opciones te darán tu aplicación funcionando en minutos, con SSL gratuito y sin necesidad de configuraciones complejas.
