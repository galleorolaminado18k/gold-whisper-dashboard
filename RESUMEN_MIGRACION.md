# MIGRACIÓN GOLD WHISPER DASHBOARD

## Resumen de la Migración

Se ha migrado el proyecto Gold Whisper Dashboard de Vite/React a Next.js, preservando y mejorando la funcionalidad de Advertising (Meta Ads). Esta migración permite aprovechar las ventajas de Next.js como el renderizado del lado del servidor, mejores rutas, y una arquitectura más robusta.

## Cambios Principales

### Estructura de Archivos
- Migración de `src/pages` a `app/` siguiendo la estructura de Next.js App Router
- Reorganización de utilidades en `lib/` con subdirectorios funcionales:
  - `lib/meta/` para integraciones con Meta Ads
  - `lib/crm/` para funcionalidad de CRM y Chatwoot
  - `lib/ai/` para integraciones con Gemini y otros modelos

### Variables de Entorno
- Cambio de prefijo `VITE_` a `NEXT_PUBLIC_` para todas las variables de entorno
- Documentación completa en `.env.example` y `.env.local.example`

### Componentes y Páginas
- Conversión de componentes de página a formato Next.js con `page.tsx`
- Implementación de `loading.tsx` para estados de carga con Suspense
- Preservación de la funcionalidad de Advertising en `app/advertising/page.tsx`

### APIs y Servicios
- Adaptación de `metaAds.ts` para trabajar con Next.js y variables de entorno
- Mantenimiento de la integración con Chatwoot adaptada a Next.js
- Preservación de la funcionalidad de clasificación de conversaciones

## Módulos Migrados

1. **Advertising (Meta Ads)**
   - Página: `app/advertising/page.tsx`
   - Biblioteca: `lib/meta/metaAds.ts`
   - Utilidad: `lib/meta/campaignAttribution.ts`

2. **CRM y Chatwoot**
   - Utilidades: `lib/crm/chatwoot.ts`, `lib/crm/classifier.ts`
   - Integración: Adaptada para mantener compatibilidad

3. **AI Analytics**
   - Biblioteca: `lib/ai/gemini.ts`
   - Integración con múltiples proveedores de IA

## Instrucciones de Configuración

1. Copia `.env.example` a `.env.local` y configura las variables
2. Instala dependencias: `npm install` o `pnpm install`
3. Inicia el servidor de desarrollo: `npm run dev` o `pnpm dev`

## Variables de Entorno Críticas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BRIDGE_API_URL=
NEXT_PUBLIC_CHATWOOT_URL=
NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=
NEXT_PUBLIC_CHATWOOT_ACCOUNT_ID=
NEXT_PUBLIC_META_ACCESS_TOKEN=
```

## Próximos Pasos

1. Finalizar la implementación de las visualizaciones de campaña en la página de Advertising
2. Integrar completamente el flujo de CRM basado en Chatwoot
3. Implementar análisis de IA para campañas de Meta Ads
4. Configurar autenticación completa con Supabase

## Notas Adicionales

- Se ha mantenido la compatibilidad con los tipos de datos y APIs existentes
- El clasificador de etapas CRM mantiene la misma lógica pero con mejor estructura
- Las rutas ahora siguen el patrón de Next.js App Router para mejor organización