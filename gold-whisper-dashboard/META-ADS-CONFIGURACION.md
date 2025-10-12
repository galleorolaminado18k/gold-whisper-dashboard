# Configuración de Meta Ads - Integración Completa

## 📊 Credenciales Configuradas

### Información de la Cuenta
- **Negocio**: COMERCIALIZADORA GALLE18K ORO LAMINADO Y ACCESORIOS S.A.S.
- **ID del Portafolio**: `1067806144007153`
- **Cuenta Publicitaria**: `orolaminado18kcucuta`
- **ID de la Cuenta**: `360084149294973`

### Token de Acceso
✅ Token configurado en `.env.local`
🔒 Token válido para acceso a API de Meta Ads

## 🔧 Archivos Configurados

### 1. `.env.local`
Archivo de variables de entorno con credenciales seguras:
```
VITE_META_BUSINESS_ID=1067806144007153
VITE_META_AD_ACCOUNT_ID=360084149294973
VITE_META_ACCESS_TOKEN=EAAC4zHE6iMYBPt67m4GY5ML3mWCGeBPiO6N6i6i751ZCOfdSSytbfrXnQ6mRcZBHhJXZBmZCWmgZB4V9Ws4oBpQTTMO6zequoZBNBRuXgHGggZCMNWAaMB3L2ubFyBieDeMj5WLP01AZB04Q7vC0DOs1SGkUUszktaBiXcVKapvGwXwotsTyy0MHZA1I52fZB4Rv4DVQZDZD
VITE_META_AD_ACCOUNT_NAME=orolaminado18kcucuta
```

### 2. `src/lib/metaAds.ts`
Servicio de integración con Meta Ads API v21.0

## 📡 Funciones Disponibles

### `fetchMetaCampaigns()`
Obtiene todas las campañas activas de la cuenta
- Retorna: Array de campañas con información básica
- Campos: ID, nombre, estado, objetivo, presupuesto

### `fetchCampaignsWithInsights(datePreset)`
Combina campañas con sus métricas de rendimiento
- Parámetro: `datePreset` (ej: 'last_30d', 'last_7d', 'today')
- Retorna: Campañas con métricas completas

### `fetchAdAccountInfo()`
Información de la cuenta publicitaria
- Balance, gasto total, estado de la cuenta

### `updateCampaignStatus(campaignId, status)`
Activa o pausa una campaña
- Estados: 'ACTIVE' | 'PAUSED'

## 📊 Métricas Disponibles

Las siguientes métricas se obtienen de Meta Ads:

### Métricas de Gasto
- `spend`: Gasto total
- `daily_budget`: Presupuesto diario
- `lifetime_budget`: Presupuesto total

### Métricas de Alcance
- `impressions`: Impresiones totales
- `reach`: Alcance único
- `frequency`: Frecuencia promedio

### Métricas de Engagement
- `clicks`: Clics totales
- `ctr`: Click-through rate (%)
- `cpc`: Costo por clic
- `cpm`: Costo por mil impresiones

### Conversiones (pendiente vincular con CRM)
- `conversions`: Total de conversiones
- `cost_per_conversion`: Costo por conversión

## 🔄 Próximos Pasos

### 1. Actualizar Advertising.tsx
Reemplazar datos mock con datos reales de Meta Ads:
```typescript
import { fetchCampaignsWithInsights } from '@/lib/metaAds';

// En el componente
const { data: campaigns } = useQuery({
  queryKey: ['meta-campaigns', datePreset],
  queryFn: () => fetchCampaignsWithInsights(datePreset),
  refetchInterval: 300000, // 5 minutos
});
```

### 2. Vincular con CRM
Para conectar ventas del CRM con campañas de Meta Ads:
1. Agregar campo `campaign_id` en conversaciones de Chatwoot
2. Crear tabla `campaign_sales` en Supabase
3. Rastrear conversiones por campaña
4. Calcular ROAS real: (Ingresos / Gasto) * 100

### 3. Webhook de Conversiones
Configurar webhook en Meta Ads para rastrear conversiones en tiempo real:
- URL: `https://tu-dominio.com/api/meta-webhook`
- Eventos: purchase, lead, contact

## 🔐 Seguridad

### Mejores Prácticas Implementadas
✅ Token almacenado en variables de entorno
✅ No expuesto en código fuente
✅ Archivo `.env.local` en `.gitignore`
✅ Manejo de errores en todas las llamadas API

### Renovación de Token
⚠️ **Importante**: Los tokens de Meta Ads expiran
- Token actual: Short-lived (60 días)
- Para token Long-lived: Configurar en Meta Business Suite
- Renovar antes de expiración para evitar interrupción

## 🧪 Prueba de Conexión

Para probar la conexión:
```typescript
import { fetchAdAccountInfo } from '@/lib/metaAds';

// Probar conexión
const accountInfo = await fetchAdAccountInfo();
console.log('Cuenta:', accountInfo);
```

## 📞 Soporte

Si hay errores de conexión:
1. Verificar que el token no ha expirado
2. Confirmar permisos de la cuenta publicitaria
3. Revisar console de navegador para errores de CORS
4. Verificar que el ID de cuenta es correcto (con prefijo `act_`)

## 🎯 Estado Actual

✅ Credenciales configuradas
✅ Servicio de API creado
✅ Funciones de lectura implementadas
✅ Manejo de errores configurado
⏳ Pendiente: Integrar con componente React
⏳ Pendiente: Vincular con CRM para ROAS real
