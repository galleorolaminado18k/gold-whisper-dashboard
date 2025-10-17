# Gold Whisper Dashboard

## Descripción General

Gold Whisper Dashboard es una plataforma completa de CRM y análisis para el negocio de joyería Galle 18K. Integra conversaciones de Chatwoot, campañas de Meta Ads, análisis impulsado por IA (Gemini) y gestión del ciclo de vida del cliente desde el contacto inicial hasta la entrega.

## Stack Tecnológico

- **Frontend**: Next.js 15+ con React 19
- **Base de datos**: Supabase (auth + datos)
- **UI**: shadcn/ui con Tailwind CSS
- **Análisis de datos**: Recharts
- **IA**: Google Generative AI (Gemini)

## Dominio de Negocio

Comercio electrónico colombiano de joyería (oro laminado 18K + balinería premium) con flujo de ventas a través de WhatsApp/Instagram.

## Componentes Clave

### 1. Sistema de Autenticación

- **Autenticación dual**: Supabase (producción) + autenticación simulada de respaldo (desarrollo)
- Controlado mediante variables de entorno
- Rutas protegidas con middleware de autenticación
- Sesión persistente en localStorage con actualización automática

### 2. Integración con Supabase

- Cliente inicializado con validación de URL
- URL predeterminada configurada en variables de entorno
- Tipos auto-generados
- **Variables de entorno críticas**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Sistema CRM

- Vistas en tabla con pestañas por etapa
- Clasificador de etapas para categorizar conversaciones automáticamente:
  - `por_contestar` → mensajes de clientes sin responder
  - `pendiente_datos` → esperando información de envío/pago
  - `por_confirmar` → confirmación de pedido pendiente
  - `pendiente_guia` → esperando número de seguimiento
  - `pedido_completo` → pedidos cumplidos
- Usa patrones de regex + análisis de historial de mensajes

### 4. Integración con Chatwoot

- API Bridge para evitar problemas de CORS
- **Funciones clave**: `fetchConversations()`, `fetchMessages()`, `sendMessage()`
- Normaliza tipos de mensajes: `0/"incoming"` = cliente, `1/"outgoing"` = agente
- Configuración mediante variables de entorno

### 5. Análisis con IA

- Soporte multi-proveedor: Gemini (predeterminado), OpenAI, Anthropic
- Configuración almacenada en localStorage + respaldo a variables de entorno
- Prompt de sistema ajustado para análisis de marketing de joyería (ROAS, CVR, CPC)

### 6. Integración con Meta Ads

- Obtiene campañas, conjuntos de anuncios e insights de la API de Marketing de Facebook
- **Tipos clave**: `MetaCampaign`, `MetaInsights`, `MetaAdSet`
- Cálculos de ROAS/CVR con AOV (valor promedio de pedido) desde variables de entorno

## Flujos de Desarrollo

### Desarrollo Local

```bash
npm install        # Instalar dependencias
npm run dev        # Iniciar servidor de desarrollo en puerto 3000
npm run build      # Compilación para producción
npm run start      # Iniciar servidor de producción con la compilación
```

### Configuración de Entorno

Crea un archivo `.env.local` con las variables requeridas:

```env
# Supabase (requerido para producción)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Chatwoot Bridge
NEXT_PUBLIC_BRIDGE_API_URL=http://localhost:4000
NEXT_PUBLIC_CHATWOOT_URL=http://localhost:3020
NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=token
NEXT_PUBLIC_CHATWOOT_ACCOUNT_ID=1

# IA (opcional)
NEXT_PUBLIC_GEMINI_API_KEY=your-key

# Métricas de Negocio
NEXT_PUBLIC_DEFAULT_AOV=285000
NEXT_PUBLIC_AOV_BALINERIA=195000
NEXT_PUBLIC_AOV_JOYERIA=375000
```

## Estructura de Archivos

- `app/` → Componentes de página con enrutamiento App Router de Next.js
- `components/` → Componentes de UI reutilizables
- `lib/` → Lógica de negocio, clientes API, utilidades
- `hooks/` → Hooks personalizados de React
- `public/` → Activos estáticos

## Convenciones

- **Componentes**: Archivos PascalCase, exportaciones nombradas
- **Utilidades**: camelCase (`utils.ts`, `chatwoot.ts`)
- **Tipos**: PascalCase con sufijos descriptivos (`CWMessage`, `MetaCampaign`, `CRMStageId`)

## Patrones Críticos

### Manejo de Tipos de Mensaje

Las APIs de Chatwoot devuelven tipos de mensaje inconsistentes (string vs number). Siempre normalizar:

```typescript
function toMsgType(v: unknown): "incoming" | "outgoing" | undefined {
  if (v === 0 || v === "0" || v === "incoming") return "incoming";
  if (v === 1 || v === "1" || v === "outgoing") return "outgoing";
  return undefined;
}
```

### Lógica de Clasificación de Etapas

El clasificador CRM usa heurísticas basadas en regex. Al modificar:
- Probar con texto en español (dialecto colombiano: "dirección", "barrio", "cédula")
- Considerar el orden de los mensajes (la dirección del último mensaje importa)
- Tener en cuenta la recopilación parcial de datos (teléfono sin barrio, etc.)

## Despliegue

- **Vercel**: Configuración automática con Next.js
- **Docker**: Configuración multi-servicio disponible para entornos locales
- **VPS**: Scripts de shell para despliegue incluidos