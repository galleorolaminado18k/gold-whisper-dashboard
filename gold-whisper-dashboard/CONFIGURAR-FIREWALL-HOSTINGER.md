# 🔥 CONFIGURAR FIREWALL DE HOSTINGER

## ⚠️ PROBLEMA IDENTIFICADO
El firewall de Hostinger ("bridge-5000") está bloqueando el puerto 80 (HTTP), por eso no puedes acceder al dashboard desde internet.

---

## ✅ SOLUCIÓN: ABRIR PUERTOS EN EL FIREWALL

### PASO 1: Entrar al Panel de Firewall

1. En el panel de Hostinger, ve a: **VPS > Cortafuegos**
2. Click en el firewall "bridge-5000"
3. Click en **"Agregar regla"** (botón morado)

### PASO 2: Agregar Regla para HTTP (Puerto 80)

**Configuración de la regla:**

```
Protocolo: TCP
Puerto: 80
Fuente: 0.0.0.0/0 (Cualquier IP)
Acción: ACCEPT (Permitir)
Descripción: HTTP - Dashboard
```

### PASO 3: Agregar Regla para HTTPS (Puerto 443)

**Configuración de la regla:**

```
Protocolo: TCP
Puerto 443
Fuente: 0.0.0.0/0 (Cualquier IP)
Acción: ACCEPT (Permitir)
Descripción: HTTPS - Dashboard (futuro SSL)
```

### PASO 4: Agregar Regla para SSH (Puerto 22) - Si no existe

```
Protocolo: TCP
Puerto: 22
Fuente: 0.0.0.0/0
Acción: ACCEPT
Descripción: SSH
```

### PASO 5: Activar el Firewall

1. Asegúrate que el toggle del firewall esté **ACTIVADO** (el switch azul)
2. Las reglas se aplicarán automáticamente

---

## 🎯 RESULTADO ESPERADO

Después de configurar el firewall correctamente:

✅ **http://dashboard.galle18k.com** → FUNCIONARÁ
✅ **http://api.galle18k.com** → FUNCIONARÁ
✅ **http://85.31.235.37** → FUNCIONARÁ

---

## 📸 CONFIGURACIÓN VISUAL (LO QUE DEBES VER)

Tu firewall debe tener al menos estas reglas:

| Protocolo | Puerto | Fuente | Acción | Descripción |
|-----------|--------|--------|--------|-------------|
| TCP | 22 | 0.0.0.0/0 | ACCEPT | SSH |
| TCP | 80 | 0.0.0.0/0 | ACCEPT | HTTP |
| TCP | 443 | 0.0.0.0/0 | ACCEPT | HTTPS |
| TCP | 3000 | 0.0.0.0/0 | ACCEPT | Chatwoot (opcional) |
| TCP | 4000 | 0.0.0.0/0 | ACCEPT | API (opcional) |

---

## 🔍 VERIFICAR QUE FUNCIONA

Después de configurar el firewall, espera 1-2 minutos y prueba:

```bash
# Desde tu PC
curl -I http://85.31.235.37
curl -I http://dashboard.galle18k.com
```

**Deberías ver**: `HTTP/1.1 200 OK`

O simplemente abre en el navegador:
- http://dashboard.galle18k.com

---

## ⚡ ALTERNATIVA: SI NO PUEDES MODIFICAR EL FIREWALL

Si Hostinger no te deja modificar el firewall o sigue sin funcionar:

### OPCIÓN 1: VERCEL (RECOMENDADO - 2 MINUTOS)

1. Ve a: https://vercel.com
2. Login con GitHub
3. Click "Add New Project"
4. Selecciona tu repo `gold-whisper-dashboard`
5. Framework: Vite
6. Click "Deploy"

**Listo en 30 segundos**

### OPCIÓN 2: NETLIFY (DRAG & DROP)

1. Ejecuta: `npm run build` en tu proyecto local
2. Ve a: https://app.netlify.com/drop
3. Arrastra la carpeta `dist`
4. **Listo**

### OPCIÓN 3: RAILWAY.APP

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd gold-whisper-dash-main
railway up
```

---

## 💡 RESUMEN

**Problema**: Firewall de Hostinger bloqueando puerto 80

**Solución Directa**: 
1. Panel Hostinger → Cortafuegos → bridge-5000
2. Agregar regla TCP puerto 80, fuente 0.0.0.0/0, ACCEPT
3. Agregar regla TCP puerto 443, fuente 0.0.0.0/0, ACCEPT
4. Guardar y esperar 1-2 minutos

**Solución Alternativa** (más fácil):
Desplegar en Vercel/Netlify (gratis, sin configuración de firewall)

---

## 🎊 DESPUÉS DE ESTO

Tu Dashboard estará 100% funcional y accesible desde cualquier lugar del mundo.
