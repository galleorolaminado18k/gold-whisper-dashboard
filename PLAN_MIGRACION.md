# 🔄 PLAN DE MIGRACIÓN - NUEVO-CURSOR → GOLD WHISPER DASHBOARD

**Fecha:** 19 de Octubre de 2025  
**Objetivo:** Integrar funcionalidades de NUEVO-CURSOR sin perder el código actual

---

## 📊 ANÁLISIS DE DIFERENCIAS

### Dependencias Faltantes en el Proyecto Actual:
```json
{
  "axios": "latest",              // ✅ Necesario para MiPaquete
  "chart.js": "latest",           // ✅ Para gráficos avanzados
  "react-chartjs-2": "latest",    // ✅ Wrapper de Chart.js
  "leaflet": "latest",            // ✅ Para mapas geográficos
  "react-leaflet": "latest",      // ✅ Wrapper de Leaflet
  "uuid": "latest"                // ✅ Para IDs únicos
}
```

### Dependencias que Ya Tienes:
- ✅ @supabase/ssr
- ✅ @supabase/supabase-js
- ✅ @vercel/analytics
- ✅ @vercel/blob
- ✅ recharts
- ✅ date-fns
- ✅ react-hook-form
- ✅ zod

---

## 🎯 FUNCIONALIDADES NUEVAS A MIGRAR

### 1. **Sistema de Inventario** ⭐ PRIORIDAD ALTA
**Archivos:**
- `adapters/inventory.ts`
- `components/inventory/modals.tsx`
- `components/inventory/movements-drawer.tsx`
- `components/inventory/reorder-aside.tsx`
- `lib/inventory-types.ts`

**Páginas:**
- `app/(dashboard)/inventario/page.tsx`

### 2. **CRM Mejorado** ⭐ PRIORIDAD ALTA
**Archivos:**
- `components/crm/PurchaseHistory.tsx`
- `app/api/crm/customer/[phone]/route.ts`

### 3. **Seguimiento Geográfico** ⭐ PRIORIDAD MEDIA
**Archivos:**
- `components/SalesMap.tsx`
- `app/api/metrics/geo/route.ts`
- `app/(dashboard)/geografia/page.tsx`

### 4. **Integración IA (Grok/X.AI)** ⭐ PRIORIDAD MEDIA
**Archivos:**
- `components/AIChatBubble.tsx`
- `components/ads/GrokPanel.tsx`
- `app/api/ads/ai/route.tsx`

### 5. **Dashboard de Publicidad** ⭐ PRIORIDAD MEDIA
**Archivos:**
- `components/ads/*` (todos)
- `app/api/ads/*` (todos)
- `app/(dashboard)/publicidad/page.tsx`

### 6. **Sistema de Pagos** ⭐ PRIORIDAD BAJA
**Archivos:**
- `app/api/pagos/list/route.ts`
- `app/(dashboard)/pagos/page.tsx`

### 7. **Entregas y Tracking Mejorado** ⭐ PRIORIDAD ALTA
**Archivos:**
- `app/api/mipaquete/tracking/route.ts` (MEJORADO)
- `app/(dashboard)/entregas/page.tsx`

---

## 📝 PASOS DE MIGRACIÓN

### FASE 1: PREPARACIÓN (No modificar código)
- [x] ✅ Extraer todas las configuraciones
- [x] ✅ Documentar APIs y tokens
- [x] ✅ Crear .env.example
- [ ] 🔲 Hacer backup del proyecto actual
- [ ] 🔲 Crear rama Git para migración

### FASE 2: CONFIGURACIÓN BASE
```bash
# 1. Crear archivo .env.local
cp .env.example .env.local

# 2. Rellenar con tus credenciales reales
# Editar .env.local manualmente

# 3. Instalar dependencias nuevas
npm install axios chart.js react-chartjs-2 leaflet react-leaflet uuid @types/leaflet
```

### FASE 3: MIGRACIÓN DE LIBRERÍAS
1. **Actualizar lib/mipaquete.ts** (mover tokens a env)
2. **Copiar nuevas librerías:**
   - `lib/inventory-types.ts`
   - `lib/ads-fetch.ts`
   - `lib/aggregate.ts`
   - `lib/attribution.ts`
   - `lib/revenue.ts`
   - `lib/store.ts`
   - `lib/ventasStore.ts`
   - `lib/fetchers.ts`

### FASE 4: MIGRACIÓN DE ADAPTADORES
1. Copiar `adapters/inventory.ts`

### FASE 5: MIGRACIÓN DE APIs
**Orden de prioridad:**

1. **APIs Críticas:**
   ```
   ✅ app/api/mipaquete/tracking/route.ts (mejorado)
   ✅ app/api/metrics/geo/route.ts
   ✅ app/api/crm/customer/[phone]/route.ts
   ```

2. **APIs Inventario:**
   ```
   ✅ app/api/sales/route.ts (si tiene cambios)
   ✅ app/api/finance/* (verificar mejoras)
   ```

3. **APIs Publicidad:**
   ```
   ✅ app/api/ads/ai/route.tsx
   ✅ app/api/ads/campaigns/route.ts
   ✅ app/api/ads/summary/route.ts
   ```

4. **APIs Secundarias:**
   ```
   ✅ app/api/pagos/list/route.ts
   ```

### FASE 6: MIGRACIÓN DE COMPONENTES
**Componentes Nuevos (no sobrescribir existentes):**

1. **Inventario:**
   ```
   components/inventory/modals.tsx
   components/inventory/movements-drawer.tsx
   components/inventory/reorder-aside.tsx
   ```

2. **Publicidad:**
   ```
   components/ads/CampaignCard.tsx
   components/ads/Donut.tsx
   components/ads/GrokPanel.tsx
   components/ads/KpiCard.tsx
   components/ads/LiveBadge.tsx
   components/ads/Table.tsx
   components/ads/Toolbar.tsx
   components/ads/ui.tsx
   ```

3. **Otros:**
   ```
   components/AIChatBubble.tsx
   components/SalesMap.tsx
   components/DatabaseInitializer.tsx
   components/crm/PurchaseHistory.tsx
   components/luxury-sales-dashboard.tsx
   ```

4. **Barra de Acciones:**
   ```
   components/AdsActionsBar.tsx
   components/AdsGraphsPanel.tsx
   components/AdsInfoBar.tsx
   components/AdsKpiCards.tsx
   components/AdsTable.tsx
   ```

### FASE 7: MIGRACIÓN DE PÁGINAS
**Páginas Nuevas:**

1. **Inventario:**
   ```
   app/(dashboard)/inventario/page.tsx
   app/(dashboard)/inventario/loading.tsx
   ```

2. **Geografía:**
   ```
   app/(dashboard)/geografia/page.tsx
   app/(dashboard)/geografia/loading.tsx
   ```

3. **Entregas:**
   ```
   app/(dashboard)/entregas/page.tsx
   app/(dashboard)/entregas/loading.tsx
   ```

4. **Pagos:**
   ```
   app/(dashboard)/pagos/page.tsx
   app/(dashboard)/pagos/loading.tsx
   ```

5. **Publicidad (si no existe):**
   ```
   app/(dashboard)/publicidad/page.tsx
   app/(dashboard)/publicidad/loading.tsx
   ```

6. **Ventas Totales:**
   ```
   app/(dashboard)/ventastotales/page.tsx
   app/(dashboard)/ventastotales/loading.tsx
   ```

### FASE 8: MIGRACIÓN DE SCRIPTS SQL
```bash
# Revisar y ejecutar en Supabase en orden:
scripts/001_create_sales_tables.sql
scripts/002-025_*.sql (revisar cuáles aplican)
```

**⚠️ IMPORTANTE:** NO ejecutar scripts que sobrescriban tablas existentes sin hacer backup.

### FASE 9: ACTUALIZACIÓN DEL SIDEBAR
Agregar nuevas rutas al `components/sidebar.tsx`:
- Inventario
- Geografía
- Entregas
- Pagos
- Publicidad (si aplica)

### FASE 10: PRUEBAS Y VALIDACIÓN
1. **Pruebas de Integración:**
   - [ ] Sistema de inventario funciona
   - [ ] Tracking de MiPaquete funciona
   - [ ] Mapas geográficos cargan
   - [ ] IA responde correctamente
   - [ ] Gráficos se muestran

2. **Pruebas de APIs:**
   - [ ] Todas las rutas responden
   - [ ] Datos se guardan correctamente
   - [ ] Tokens y credenciales funcionan

3. **Pruebas Visuales:**
   - [ ] Responsive design
   - [ ] Tema claro/oscuro
   - [ ] Animaciones

---

## ⚠️ ADVERTENCIAS CRÍTICAS

### 🚨 NO HACER:
1. ❌ NO sobrescribir archivos sin comparar primero
2. ❌ NO ejecutar scripts SQL sin backup
3. ❌ NO commitear tokens reales al repositorio
4. ❌ NO borrar componentes actuales sin verificar uso
5. ❌ NO desplegar sin probar en local primero

### ✅ SÍ HACER:
1. ✅ Crear rama de Git antes de empezar
2. ✅ Hacer backup completo de la base de datos
3. ✅ Probar cada fase antes de continuar
4. ✅ Usar .env.local para credenciales
5. ✅ Revisar conflictos de nombres

---

## 🔧 COMANDOS ÚTILES

### Git:
```bash
# Crear rama de migración
git checkout -b migracion-nuevo-cursor

# Hacer commit de cambios
git add .
git commit -m "feat: migrar funcionalidad X desde NUEVO-CURSOR"

# Si algo sale mal, volver atrás
git reset --hard HEAD
```

### NPM:
```bash
# Instalar todas las dependencias
npm install

# Limpiar cache si hay problemas
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

### Base de Datos:
```bash
# Hacer backup de Supabase
# Ve a Supabase Dashboard > Database > Backups

# Ejecutar script SQL
# Usa el SQL Editor en Supabase Dashboard
```

---

## 📋 CHECKLIST DE MIGRACIÓN

### Pre-Migración:
- [x] ✅ Documentación completa extraída
- [ ] 🔲 Backup de base de datos creado
- [ ] 🔲 Rama Git creada
- [ ] 🔲 .env.local configurado con credenciales reales

### Durante Migración:
- [ ] 🔲 Dependencias instaladas
- [ ] 🔲 Librerías migradas
- [ ] 🔲 APIs migradas
- [ ] 🔲 Componentes migrados
- [ ] 🔲 Páginas migradas
- [ ] 🔲 Scripts SQL ejecutados
- [ ] 🔲 Sidebar actualizado

### Post-Migración:
- [ ] 🔲 Todas las páginas cargan sin errores
- [ ] 🔲 APIs responden correctamente
- [ ] 🔲 Datos se guardan y recuperan
- [ ] 🔲 Tema funciona correctamente
- [ ] 🔲 Build de producción exitoso
- [ ] 🔲 Documentación actualizada

---

## 📞 CONTACTO DE EMERGENCIA

Si algo sale mal durante la migración:

1. **Revertir cambios:**
   ```bash
   git reset --hard origin/main
   ```

2. **Restaurar base de datos:**
   - Ve a Supabase > Database > Backups
   - Restaura el backup más reciente

3. **Limpiar instalación:**
   ```bash
   rm -rf node_modules .next
   npm install
   npm run dev
   ```

---

## 🎯 RESULTADO ESPERADO

Al completar la migración tendrás:

✅ Dashboard completo con todas las funcionalidades de NUEVO-CURSOR  
✅ Sistema de inventario funcional  
✅ Tracking geográfico de ventas  
✅ Integración con IA (Grok)  
✅ Dashboard de publicidad  
✅ Mejor tracking de envíos (MiPaquete)  
✅ Sistema de pagos  
✅ Todas las configuraciones en variables de entorno  
✅ Código limpio y mantenible  

---

**¡IMPORTANTE!** Este es un proceso que puede tomar varias horas. No te apresures y prueba cada fase antes de continuar.

