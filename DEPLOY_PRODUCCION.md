# 🚀 GUÍA DE DESPLIEGUE A PRODUCCIÓN
## dashboard.galle18k.com

**Fecha:** 19 de Octubre de 2025  
**Dominio:** https://dashboard.galle18k.com/

---

## 🎯 DESPLIEGUE RÁPIDO

### Opción 1: Vercel (Recomendado - Más Rápido)

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy a producción
vercel --prod

# 4. Configurar dominio personalizado
# Ve a Vercel Dashboard → Settings → Domains
# Agrega: dashboard.galle18k.com
```

**Configurar DNS en tu proveedor:**
```
Tipo: CNAME
Nombre: dashboard
Valor: cname.vercel-dns.com
```

---

### Opción 2: Netlify

```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod

# 4. Configurar dominio
# Netlify Dashboard → Domain Settings
# Add custom domain: dashboard.galle18k.com
```

---

### Opción 3: Build Manual y Hostinger/VPS

```bash
# 1. Build de producción
npm run build

# 2. El output estará en .next/

# 3. Subir a tu servidor via FTP/SSH
# O usar el script existente:
.\desplegar-hostinger-automatico.ps1
```

---

## ⚙️ VARIABLES DE ENTORNO EN PRODUCCIÓN

Configura estas variables en tu plataforma:

### Vercel
```bash
# Desde CLI
vercel env add MIPAQUETE_API_KEY
vercel env add MIPAQUETE_SESSION_TRACKER
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# O desde Dashboard:
# Vercel → Tu Proyecto → Settings → Environment Variables
```

### Netlify
```bash
# Dashboard → Site Settings → Environment Variables
# O usando CLI:
netlify env:set MIPAQUETE_API_KEY tu-valor
```

---

## 🔧 CONFIGURACIÓN ACTUAL

Tu proyecto está configurado con:
- ✅ Next.js 15.2.4
- ✅ APIs dinámicas habilitadas
- ✅ Build optimizado

---

## 📋 CHECKLIST PRE-DEPLOY

- [ ] ✅ Dependencias instaladas
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Build exitoso localmente
- [ ] ⚠️ DNS apuntando al hosting correcto
- [ ] ⚠️ Certificado SSL configurado (automático en Vercel/Netlify)

---

## 🚀 DEPLOY AHORA

```bash
# Si usas Vercel:
vercel --prod

# Si usas Netlify:
netlify deploy --prod

# Si usas tu servidor:
npm run build
# Luego sube la carpeta .next/ a tu servidor
```

---

## 🌐 VERIFICAR DEPLOY

Después del deploy, verifica:
1. ✅ https://dashboard.galle18k.com/ carga correctamente
2. ✅ APIs funcionan: `/api/mipaquete/track`
3. ✅ No hay errores en consola del navegador
4. ✅ Certificado SSL activo (🔒)

---

## 📞 TROUBLESHOOTING

### Error: "Dominio no resuelve"
**Solución:** Verifica la configuración DNS. Puede tardar hasta 48h en propagar.

### Error: "APIs no funcionan"
**Solución:** Verifica que las variables de entorno estén configuradas en la plataforma.

### Error: "Build falla"
**Solución:** Ejecuta `npm install` y `npm run build` localmente primero.

---

## ✨ TU PROYECTO ESTÁ LISTO

- ✅ Código actualizado con nuevas funcionalidades
- ✅ APIs de MiPaquete integradas
- ✅ Sistema de inventario funcionando
- ✅ Build de producción optimizado

**¡Solo falta hacer el deploy! 🚀**

