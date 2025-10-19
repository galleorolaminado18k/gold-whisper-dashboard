# 🔐 CONFIGURACIONES Y TOKENS EXTRAÍDOS - NUEVO-CURSOR

**Fecha de extracción:** 19 de Octubre de 2025  
**Proyecto:** Gold Whisper Dashboard - Migración desde NUEVO-CURSOR

---

## 📋 RESUMEN EJECUTIVO

Este documento contiene TODAS las configuraciones, tokens, APIs y credenciales encontradas en el proyecto NUEVO-CURSOR antes de realizar cualquier migración o cambio.

---

## 🔑 VARIABLES DE ENTORNO NECESARIAS

### Supabase (Base de Datos)
```env
# URLs de Supabase
SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL=<TU_URL_SUPABASE>
NEXT_PUBLIC_SUPABASE_URL=<TU_URL_SUPABASE>

# Keys de Supabase
SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY=<TU_ANON_KEY>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<TU_ANON_KEY>

# Service Role Key (para operaciones administrativas)
SUPABASE_SUPABASE_SERVICE_ROLE_KEY=<TU_SERVICE_ROLE_KEY>
SUPABASE_SUPABASE_URL=<TU_URL_SUPABASE>
```

### MiPaquete API (Sistema de Envíos)
```env
MIPAQUETE_API_KEY=<TU_API_KEY>
MIPAQUETE_SESSION_TRACKER=a0c96ea6-b22d-4fb7-a278-850678d5429c
```

**⚠️ CREDENCIALES HARDCODED EN CÓDIGO:**
```
Archivo: lib/mipaquete.ts
session-tracker: a0c96ea6-b22d-4fb7-a278-850678d5429c
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzExOWRjNDMzNjk2M2YzMzBlYjFjZTYiLCJuYW1lIjoiQ29tZXJjaWFsaXphZG9yYSIsInN1cm5hbWUiOiJnYWxlMThrIiwiZW1haWwiOiJnYWxsZW9yb2xhbWluYWRvMThrQGdtYWlsLmNvbSIsImNlbGxQaG9uZSI6IjMwMTY4NDUwMjYiLCJjcmVhdGVkQXQiOiIyMDI0LTEwLTE3VDIzOjI5OjA4LjAxNFoiLCJkYXRlIjoiMjAyNS0wOC0xOSAxMDoyMDoyNCIsImlhdCI6MTc1NTYxNjgyNH0.LHBLIsBCQlNM6WlnB514dN00dR7LcPjIQcYt1B62hEA
```

### X.AI / Grok API (Inteligencia Artificial)
```env
XAI_API_KEY=<TU_XAI_API_KEY>
NEXT_PUBLIC_XAI_API_KEY=<TU_XAI_API_KEY>
```

**⚠️ FALLBACK TOKEN HARDCODED:**
```
Archivo: app/api/ads/ai/route.tsx
FALLBACK_XAI: 7d9ef5c7-deca-4fcb-b06c-353f98ff9f0a
```

---

## 📦 DEPENDENCIAS Y PAQUETES

### Principales Paquetes del package.json:
```json
{
  "dependencies": {
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "@vercel/analytics": "1.3.1",
    "@vercel/blob": "latest",
    "axios": "latest",
    "chart.js": "latest",
    "date-fns": "4.1.0",
    "leaflet": "latest",
    "next": "15.2.4",
    "react": "^19",
    "react-dom": "^19",
    "recharts": "latest",
    "swr": "latest",
    "zod": "3.25.76"
  }
}
```

---

## 🗂️ ESTRUCTURA DE ARCHIVOS CLAVE

### APIs Implementadas (app/api/):
```
✅ ads/ - Publicidad y campañas de Meta/Facebook
  - ai/ - Integración con IA para análisis
  - campaigns/ - Gestión de campañas
  - summary/ - Resúmenes de publicidad

✅ clientes/ - Gestión de clientes
✅ crm/ - CRM y seguimiento de clientes
✅ facturacion/ - Sistema de facturación
✅ finance/ - Finanzas y KPIs
✅ invoices/ - Gestión de facturas
✅ mipaquete/ - Integración con MiPaquete
  - track/ - Tracking de envíos
  - tracking/ - Estado de envíos
  - check-returns/ - Verificar devoluciones
  - webhook/ - Webhook para actualizaciones

✅ metrics/ - Métricas y estadísticas
✅ pagos/ - Gestión de pagos
✅ sales/ - Ventas
✅ ventas/ - Sistema de ventas alternativo
✅ upload/ - Subida de archivos
```

### Librerías Personalizadas (lib/):
```
✅ supabase/ - Configuración de Supabase
  - client.ts - Cliente del navegador
  - server.ts - Cliente del servidor
  - middleware.ts - Middleware de sesiones

✅ ads-fetch.ts - Funciones para obtener datos de publicidad
✅ mipaquete.ts - Integración con MiPaquete
✅ export-utils.tsx - Utilidades de exportación
✅ fiscal-year-context.tsx - Contexto de año fiscal
✅ inventory-types.ts - Tipos para inventario
✅ types.ts - Tipos TypeScript generales
✅ utils.ts - Utilidades generales
```

### Componentes Principales (components/):
```
✅ ads/ - Componentes de publicidad
  - CampaignCard.tsx
  - GrokPanel.tsx - Panel de IA Grok
  - KpiCard.tsx
  - Table.tsx

✅ crm/ - Componentes CRM
✅ inventory/ - Gestión de inventario
  - modals.tsx
  - movements-drawer.tsx
  - reorder-aside.tsx

✅ ui/ - Componentes de interfaz (shadcn/ui)
✅ AIChatBubble.tsx - Chat con IA
✅ DatabaseInitializer.tsx - Inicializador de BD
✅ sidebar.tsx - Barra lateral
```

---

## 🗄️ BASE DE DATOS

### Scripts SQL Disponibles (scripts/):
```sql
✅ 001_create_sales_tables.sql - Crear tablas de ventas
✅ 002-025_*.sql - Migraciones progresivas
✅ EJECUTAR_EN_SUPABASE.sql - Script principal de configuración
```

### Tablas Principales:
- `sales` - Ventas
- `return_tracking` - Seguimiento de devoluciones
- `invoices` - Facturas
- `invoice_items` - Items de facturas
- `expenses` - Gastos

---

## 🔧 CONFIGURACIONES ESPECIALES

### next.config.mjs:
```javascript
{
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true }
}
```

### middleware.ts:
- Middleware de Supabase DESACTIVADO temporalmente
- Configurado para bypass de autenticación

---

## 📊 INTEGRACIONES EXTERNAS

### 1. **MiPaquete** (Envíos)
- Base URL: `https://api-v2.mpr.mipaquete.com`
- Session Tracker: `a0c96ea6-b22d-4fb7-a278-850678d5429c`
- Email: `galleorolaminado18k@gmail.com`
- Teléfono: `3016845026`

### 2. **X.AI / Grok** (Inteligencia Artificial)
- Usado para análisis de campañas publicitarias
- Integrado en componentes AIChatBubble y GrokPanel

### 3. **Supabase** (Base de Datos)
- PostgreSQL en la nube
- Autenticación y almacenamiento

### 4. **Vercel** (Hosting)
- Analytics: v1.3.1
- Blob storage

---

## 🎨 CARACTERÍSTICAS ÚNICAS DEL PROYECTO

### 1. Sistema de Inventario Completo
- Gestión de productos
- Movimientos de inventario
- Alertas de reorden

### 2. CRM Integrado
- Historial de compras
- Seguimiento de clientes
- Análisis de comportamiento

### 3. Sistema de Facturación
- Generación de PDFs
- Sincronización con ventas
- Estados de factura

### 4. Dashboard de Publicidad
- Integración con Meta/Facebook Ads
- Análisis con IA (Grok)
- KPIs en tiempo real

### 5. Seguimiento de Envíos
- Integración completa con MiPaquete
- Tracking automático
- Gestión de devoluciones

### 6. Análisis Geográfico
- Mapas interactivos con Leaflet
- Distribución de ventas por región

---

## ⚠️ NOTAS IMPORTANTES

### Tokens y Credenciales Hardcoded:
1. **MiPaquete API** está hardcoded en `lib/mipaquete.ts`
   - ⚠️ DEBE moverse a variables de entorno
   
2. **Nombres de variables duplicados en Supabase**
   - Variables con nombres largos: `SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL`
   - ⚠️ Necesita limpieza y estandarización

### Configuraciones de Desarrollo:
- ESLint ignorado en builds
- TypeScript errors ignorados en builds
- Imágenes sin optimizar

---

## 📝 RECOMENDACIONES ANTES DE MIGRAR

1. ✅ **Crear archivo `.env.local`** con todas las variables
2. ✅ **Mover credenciales hardcoded** a variables de entorno
3. ✅ **Ejecutar scripts SQL** en Supabase del proyecto principal
4. ✅ **Instalar dependencias** faltantes en el proyecto principal
5. ✅ **Revisar conflictos** de componentes existentes
6. ✅ **Hacer backup** del proyecto actual antes de migrar

---

## 🚀 PRÓXIMOS PASOS

1. Crear archivo `.env.local` en el proyecto principal
2. Copiar componentes nuevos sin sobrescribir existentes
3. Integrar APIs faltantes
4. Migrar scripts SQL
5. Probar funcionalidad por módulo
6. Documentar cambios

---

**IMPORTANTE:** Este archivo debe guardarse de forma segura antes de realizar cualquier cambio en el código.

