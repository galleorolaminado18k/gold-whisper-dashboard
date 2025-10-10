# 🔐 Credenciales y Configuración de Chatwoot

## 📋 Información de la Cuenta

**Account ID:** 1

**URL de Chatwoot:** http://localhost:3020

**Frontend URL:** http://localhost:8081

**Bridge API URL:** http://localhost:4000

## 🔑 Tokens de Acceso

### Website Token (Para Widget Web)
```
1n2Pm5QMR7PC8qNR2PMz7SRP
```

### API Token (Para Integraciones)
```
LKLQSw2D5AtCoyFBVEAmUwFM
```

## 📝 Script de Integración del Widget

Para agregar el widget de Chatwoot en tu sitio web, usa este código:

```html
<script>
  (function(d,t) {
    var BASE_URL="http://localhost:3020";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.chatwootSDK.run({
        websiteToken: '1n2Pm5QMR7PC8qNR2PMz7SRP',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
</script>
```

## ⚙️ Configuración en el Proyecto

Las credenciales están configuradas en:

### Archivo `.env.local`
```env
VITE_CHATWOOT_URL=http://localhost:3020
VITE_CHATWOOT_WEBSITE_TOKEN=1n2Pm5QMR7PC8qNR2PMz7SRP
VITE_CHATWOOT_API_TOKEN=LKLQSw2D5AtCoyFBVEAmUwFM
VITE_CHATWOOT_ACCOUNT_ID=1
VITE_FRONTEND_URL=http://localhost:8081
VITE_BRIDGE_API_URL=http://localhost:4000
```

### Archivo `src/lib/chatwoot.ts`
El archivo ya está configurado para leer estas variables de entorno automáticamente.

## 🔌 Configuración del Bridge API

El bridge API debe estar configurado con estos parámetros:

```javascript
{
  chatwootUrl: 'http://localhost:3020',
  apiToken: 'LKLQSw2D5AtCoyFBVEAmUwFM',
  accountId: 1,
  port: 4000
}
```

## 🚀 Iniciar el Proyecto

1. **Asegúrate de que Chatwoot esté corriendo:**
   ```bash
   cd gold-whisper-dash-main
   docker-compose ps
   ```

2. **Inicia el bridge API** (si aún no está corriendo):
   ```bash
   cd api
   node chatwoot.js
   ```

3. **Inicia el dashboard:**
   ```bash
   npm run dev
   ```

4. **Accede al dashboard:**
   - Dashboard: http://localhost:8081
   - Chatwoot Admin: http://localhost:3020

## 📊 Estructura de URLs

```
Dashboard Frontend → http://localhost:8081
         ↓
Bridge API → http://localhost:4000
         ↓
Chatwoot Backend → http://localhost:3020
```

## 🔧 API Endpoints del Bridge

El bridge API debería exponer estos endpoints:

- **GET** `/conversations` - Obtener todas las conversaciones
- **GET** `/conversations/:id/messages` - Obtener mensajes de una conversación
- **POST** `/send-message` - Enviar un mensaje
- **POST** `/send-voice-note` - Enviar nota de voz

## 🧪 Pruebas de Conexión

### 1. Verificar Chatwoot
```bash
curl http://localhost:3020/api/v1/accounts/1
```

### 2. Verificar Bridge API
```bash
curl http://localhost:4000/conversations
```

### 3. Verificar Dashboard
```bash
curl http://localhost:8081
```

## 🛠️ Solución de Problemas

### Si Chatwoot no responde:
```bash
cd gold-whisper-dash-main
docker-compose restart chatwoot
docker-compose logs -f chatwoot
```

### Si el Bridge API no funciona:
```bash
cd api
# Verificar que esté usando el token correcto
node chatwoot.js
```

### Si el Dashboard no conecta:
```bash
# Verificar que .env.local existe y tiene las variables correctas
cat .env.local

# Reiniciar el servidor de desarrollo
npm run dev
```

## 📝 Notas Importantes

1. **Tokens en Producción**: En producción, usa variables de entorno del servidor, NO los incluyas en el código
2. **HTTPS**: Para producción, cambia todas las URLs a HTTPS
3. **CORS**: Asegúrate de que Chatwoot y el Bridge API permitan peticiones desde tu dominio
4. **Seguridad**: El API Token es sensible, no lo compartas públicamente

## 🔒 Seguridad

⚠️ **IMPORTANTE**: Este archivo contiene información sensible. En un entorno de producción:

1. NO versiones este archivo en Git (agrégalo a `.gitignore`)
2. Usa variables de entorno del servidor
3. Usa HTTPS para todas las comunicaciones
4. Rota los tokens periódicamente
5. Implementa autenticación y autorización adecuadas

## 📚 Recursos Adicionales

- [Documentación de Chatwoot](https://www.chatwoot.com/docs)
- [API Reference de Chatwoot](https://www.chatwoot.com/developers/api/)
- [Widget Web SDK](https://www.chatwoot.com/docs/product/channels/live-chat/sdk/setup)

---

**Última actualización:** 2025-10-08
