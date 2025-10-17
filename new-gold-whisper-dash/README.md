# Gold Whisper Dashboard

Dashboard completo para la gestión de Galle 18K, integrando CRM, Publicidad, Ventas y más.

## Migración y Mejoras

Este proyecto combina la estructura base del proyecto SalesDashboard (Next.js) con la sección de publicidad del proyecto anterior (Gold Whisper Dashboard con Vite).

### Características Principales:

- **Framework**: Next.js 15+ con React 19
- **Base de Datos**: Supabase
- **Autenticación**: Supabase Auth + Fallback Auth
- **Integración con Meta Ads**: Gestión completa de campañas publicitarias
- **Integración con Chatwoot**: CRM y gestión de conversaciones
- **Análisis con IA**: Gemini API para análisis de campañas
- **Sección de Ventas**: Gestión completa de ventas y facturación

## Configuración

1. Crea un archivo `.env.local` con las variables necesarias (ver `.env.local.example`)
2. Instala las dependencias: `npm install` o `pnpm install`
3. Ejecuta el servidor de desarrollo: `npm run dev` o `pnpm run dev`

## Estructura del Proyecto

- `/app`: Páginas de Next.js (App Router)
- `/components`: Componentes reutilizables
- `/lib`: Utilidades y APIs
  - `/ai`: Integración con Gemini y otros modelos de IA
  - `/crm`: CRM, Chatwoot, clasificador de etapas
  - `/meta`: Integración con Meta Ads API
- `/public`: Archivos estáticos

## Variables de Entorno

Las variables de entorno están documentadas en `.env.local.example`. Asegúrate de configurar:

- Credenciales de Supabase
- Credenciales de Chatwoot
- Tokens de Meta Ads
- Configuración de IA

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## Créditos

Este proyecto combina el trabajo de diversos colaboradores y equipos anteriores, preservando la funcionalidad crítica mientras se moderniza la estructura y se añaden nuevas capacidades.