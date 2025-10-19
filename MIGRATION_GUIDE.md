# 🚀 Dashboard de Ventas - Guía de Configuración Completa

## ✅ Migración Completada

La migración del dashboard desde `C:\Users\USUARIO\Downloads\salesdashboard_with_publicidad\salesdashboard-merged\` ha sido completada exitosamente.

## 📋 Pasos de Configuración Restantes

### 1. Configurar Variables de Entorno

**IMPORTANTE**: Necesitas crear el archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://evjgujiyjplvbudgfiwr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role_aqui

# Meta Ads API (opcional)
META_ACCESS_TOKEN=tu_token_meta_aqui
META_AD_ACCOUNT_ID=tu_ad_account_id_aqui

# Google Gemini API (opcional)
GOOGLE_GEMINI_API_KEY=tu_gemini_key_aqui
```

### 2. Configurar Base de Datos en Supabase

1. **Ve a tu proyecto en Supabase Dashboard**: https://supabase.com/dashboard
2. **Abre el SQL Editor**
3. **Ejecuta el script**: `scripts/001_create_sales_tables.sql`
4. **Verifica que las tablas se crearon**:
   - `sales` - Tabla principal de ventas
   - `return_tracking` - Tabla para tracking de devoluciones

### 3. Obtener las Claves de Supabase

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Ejecutar el Proyecto

```bash
npm run dev
```

## 🔧 Estructura del Nuevo Dashboard

### Características Principales:
- ✅ **Next.js 15** con App Router
- ✅ **Supabase** para base de datos
- ✅ **Tailwind CSS** para estilos
- ✅ **Radix UI** para componentes
- ✅ **React Hook Form** para formularios
- ✅ **Recharts** para gráficos

### Páginas Disponibles:
- 📊 **Dashboard Principal** (`/`)
- 💰 **Ventas** (`/ventas`)
- 📈 **Ventas Totales** (`/ventastotales`)
- 🧾 **Facturación** (`/facturacion`)
- 🎯 **CRM** (`/crm`)
- 📍 **Geografía** (`/geografia`)
- 🎂 **Cumpleaños** (`/cumpleanos`)
- 📢 **Publicidad** (`/publicidad`)
- ⚙️ **Configuración** (`/configuracion`)

### APIs Disponibles:
- `/api/sales` - Gestión de ventas
- `/api/invoices` - Gestión de facturas
- `/api/finance` - Análisis financiero
- `/api/meta/campaigns` - Campañas de Meta Ads

## 🗂️ Archivos Importantes

### Configuración:
- `package.json` - Dependencias del proyecto
- `next.config.mjs` - Configuración de Next.js
- `tailwind.config.ts` - Configuración de Tailwind
- `tsconfig.json` - Configuración de TypeScript

### Base de Datos:
- `scripts/001_create_sales_tables.sql` - Script principal de creación de tablas
- `scripts/002_seed_sample_data.sql` - Datos de ejemplo (opcional)

### Componentes:
- `components/ui/` - Componentes de UI reutilizables
- `components/sales-table.tsx` - Tabla de ventas
- `components/invoices-table.tsx` - Tabla de facturas
- `components/stat-card.tsx` - Tarjetas de estadísticas

## 🚨 Solución de Problemas

### Error: "Could not find the table 'public.sales'"
**Solución**: Ejecuta el script SQL `001_create_sales_tables.sql` en Supabase

### Error: "Missing env vars"
**Solución**: Crea el archivo `.env.local` con las variables de Supabase

### Error: "Server Error - fetch to supabase.co failed"
**Solución**: Verifica que las variables de entorno sean correctas

## 📞 Soporte

Si encuentras problemas:
1. Verifica que todas las variables de entorno estén configuradas
2. Confirma que las tablas de Supabase existan
3. Revisa los logs de la consola para errores específicos

## 🎉 ¡Listo para Usar!

Una vez completados estos pasos, tu dashboard estará completamente funcional con:
- Gestión completa de ventas
- Sistema de facturación
- Análisis financiero
- Integración con Meta Ads
- CRM integrado
- Y mucho más...

---

**Nota**: El proyecto anterior ha sido respaldado en la carpeta `backup_20251017_004509/` por seguridad.
