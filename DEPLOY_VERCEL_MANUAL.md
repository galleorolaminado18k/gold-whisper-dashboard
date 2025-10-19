# 🚀 DEPLOY A VERCEL - GUÍA MANUAL

## ✅ OPCIÓN MÁS FÁCIL: Deploy desde GitHub

### Paso 1: Conectar con Vercel

1. **Ve a:** https://vercel.com/signup
2. **Regístrate o inicia sesión** con tu cuenta de GitHub
3. **Autoriza a Vercel** para acceder a tus repositorios

### Paso 2: Importar tu Proyecto

1. **En Vercel Dashboard**, click en **"Add New"** → **"Project"**
2. **Busca:** `gold-whisper-dashboard`
3. **Click en "Import"**

### Paso 3: Configurar el Deploy

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: out
Install Command: npm install --legacy-peer-deps
```

### Paso 4: Variables de Entorno (Opcional)

Si usas Supabase, agrega:
```
NEXT_PUBLIC_SUPABASE_URL = tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = tu-key
```

### Paso 5: Deploy

1. Click **"Deploy"**
2. **Espera 2-3 minutos**
3. Tu sitio estará en: `https://gold-whisper-dashboard.vercel.app`

---

## 🌐 VINCULAR TU DOMINIO

### En Vercel Dashboard:

1. **Ve a tu proyecto** → **Settings** → **Domains**
2. **Agrega:** `dashboard.galle18k.com`
3. **Vercel te dará instrucciones DNS**

### En tu proveedor DNS (Hostinger/Cloudflare):

**Opción A: CNAME (Recomendado)**
```
Tipo: CNAME
Nombre: dashboard
Valor: cname.vercel-dns.com
TTL: Auto
```

**Opción B: A Record**
```
Tipo: A
Nombre: dashboard  
Valor: 76.76.21.21
TTL: Auto
```

---

## ⚙️ CONFIGURACIÓN YA LISTA

Tu proyecto ya tiene:
- ✅ `vercel.json` configurado
- ✅ `next.config.mjs` optimizado para export
- ✅ Build command correcto

---

## 🔄 ACTUALIZACIONES AUTOMÁTICAS

Después del primer deploy:
- ✅ Cada `git push` a GitHub = Deploy automático en Vercel
- ✅ No necesitas hacer nada más
- ✅ Vercel detecta cambios y redespliega

---

## 🎯 CONVIVENCIA CON GITHUB PAGES

**No hay conflicto:**
- **GitHub Pages:** `https://dashboard.galle18k.com/` (desde gh-pages branch)
- **Vercel:** Tu nueva URL de Vercel (diferente)
- **Puedes elegir** cuál usar para tu dominio personalizado

**Recomendación:** Usa Vercel para tu dominio principal y GitHub Pages como backup.

---

## ✨ VENTAJAS DE VERCEL

- ✅ SSL automático (HTTPS)
- ✅ CDN global
- ✅ Deploy en 2-3 minutos
- ✅ Rollback fácil
- ✅ Preview deployments
- ✅ Analytics incluido
- ✅ Gratis para proyectos personales

---

## 🚀 EMPEZAR AHORA

1. **Ve a:** https://vercel.com/new
2. **Importa** tu repositorio de GitHub
3. **Click en "Deploy"**
4. **¡Listo!** 🎉

---

**Tiempo total: 3-5 minutos** ⏱️

Tu sitio estará en vivo inmediatamente después del deploy.

