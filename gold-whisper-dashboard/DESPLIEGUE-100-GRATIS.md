# 🚀 Despliegue 100% GRATUITO de Gold Whisper Dashboard

Esta guía está enfocada en opciones **COMPLETAMENTE GRATUITAS** para desplegar Gold Whisper Dashboard. Todas las opciones incluidas aquí son:

- ✅ **100% gratuitas**, sin costos ocultos
- ✅ Con **SSL gratuito** incluido
- ✅ Con dominios personalizados

## Opción 1: Netlify + Render (100% Gratis)

### Para el Dashboard (Frontend) - Netlify

1. Crea una cuenta en [Netlify](https://netlify.com/) (puedes usar tu cuenta de GitHub o Google)
2. Haz clic en "New site from Git"
3. Configura:
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Environment variables:
     - `VITE_API_URL`: URL de tu API en Render
     - `VITE_CHATWOOT_URL`: URL de tu Chatwoot en Render
4. Deploy
5. Ve a "Domain Settings" y configura tu subdominio personalizado: `dashboard.galle18k.com`
   - Crea un registro CNAME en Hostinger hacia `tu-sitio.netlify.app`

### Para la API y Chatwoot - Render (Plan Free)

1. Crea una cuenta en [Render](https://render.com/) (puedes usar tu cuenta de GitHub)
2. Crea dos "Web Services":

   **Para la API:**
   - Selecciona "New Web Service"
   - Conecta tu repositorio o sube manualmente los archivos
   - Nombre: "gold-whisper-api"
   - Root Directory: `/api`
   - Start Command: `node index.js`
   - Plan: **Free**
   - Configura dominio: `api.galle18k.com` (CNAME a Render)

   **Para Chatwoot:**
   - Selecciona "New Web Service"
   - Nombre: "gold-whisper-chatwoot"
   - Root Directory: `/api`
   - Start Command: `node chatwoot.js`
   - Plan: **Free**
   - Configura dominio: `chatwoot.galle18k.com` (CNAME a Render)

### Mantener activos los servicios gratuitos (para evitar hibernación)

Los planes gratuitos de Render se "duermen" tras 15 minutos de inactividad. Para mantenerlos activos:

1. Usa [Cron-job.org](https://cron-job.org/) (gratis):
   - Regístrate y crea un nuevo cron job
   - URL: Tu API y Chatwoot URLs
   - Intervalo: Cada 14 minutos
   - Esta solución 100% gratuita mantendrá tus servicios activos 24/7

## Opción 2: Despliegue GitHub Pages + Cloudflare Workers (100% Gratis)

### Dashboard (Frontend) - GitHub Pages

1. Actualiza tu `vite.config.ts` añadiendo `base: '/gold-whisper-dash/'`
2. Configura tu repositorio para GitHub Pages:
   - Settings > Pages > Source: GitHub Actions
   - Añade un workflow para Vite
3. Disfruta del hosting y SSL gratis
4. Configura tu dominio personalizado en GitHub Pages

### API y Chatwoot - Cloudflare Workers (100% Gratis)

1. Crea una cuenta en [Cloudflare](https://cloudflare.com/) (gratuita)
2. Ve a Workers & Pages > Create Application
3. Sube tu código usando Wrangler CLI o directamente en la web
4. Configura los Workers (hasta 100,000 solicitudes diarias gratis):
   - Un worker para la API
   - Otro worker para Chatwoot
5. Configura subdominios personalizados

## Opción 3: Solución Todo-en-Uno - Firebase (100% Gratis)

Firebase ofrece un plan gratuito generoso que puede alojar toda tu aplicación:

1. Crea cuenta en [Firebase](https://firebase.google.com/) (Google)
2. Crea un nuevo proyecto
3. Para el frontend:
   - Usa Firebase Hosting (gratis)
   - Configura con `firebase init` y despliega con `firebase deploy`
4. Para la API y Chatwoot:
   - Usa Firebase Cloud Functions (plan gratuito)
   - Límite generoso: 2M invocaciones/mes gratis
5. Firebase te da SSL gratuito automáticamente
6. Configura tu dominio personalizado en Firebase

## ⚡ BONUS: Evitar cualquier costo por alto tráfico

Si tu aplicación recibe mucho tráfico y estás preocupado por superar los límites gratuitos:

### Caching con Cloudflare (100% Gratis)
1. Añade tu dominio a Cloudflare (gratis)
2. Activa el Page Rules y el caching agresivo
3. Configura Cloudflare Workers para caching de API (gratis)
4. Esto reducirá dramáticamente las solicitudes a tus backends

### Rate Limiting en Frontend (Previene abusos)
Añade este código al frontend para limitar solicitudes:

```javascript
// Agregado en src/lib/utils.ts
export const rateLimitedFetch = (() => {
  const timestamps = {};
  return async (url, options = {}) => {
    const now = Date.now();
    if (timestamps[url] && now - timestamps[url] < 2000) {
      // Limitar solicitudes a cada 2 segundos por endpoint
      await new Promise(r => setTimeout(r, 2000 - (now - timestamps[url])));
    }
    timestamps[url] = Date.now();
    return fetch(url, options);
  };
})();
```

## Resumen: Mejor combinación 100% gratuita

Para un despliegue 100% gratuito con mejor rendimiento:

1. **Dashboard**: Netlify (mejor rendimiento, SSL gratis, sin límites)
2. **API y Chatwoot**: Render + Cron-job.org para mantenerlos activos
3. **Dominio**: Configura CNAME en tus subdominios actuales

Esta combinación te dará un despliegue 100% gratuito, con SSL, y con buen rendimiento para uso normal, sin ningún costo oculto.
