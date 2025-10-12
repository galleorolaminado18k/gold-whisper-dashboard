# 🌟 Gold Whisper Dashboard - Despliegue 24/7 en Subdominios

## ✅ Configuración Completada

He completado la configuración para desplegar tu dashboard y Chatwoot en subdominios de galle18k.com para que funcionen 24/7 en tu VPS de Hostinger. Esta solución es **totalmente compatible** con tu sitio WordPress existente.

## 📋 Cambios Realizados

1. **Configuración para subdominios:**
   - Dashboard: `dashboard.galle18k.com`
   - API: `api.galle18k.com` 
   - Chatwoot: `chatwoot.galle18k.com`

2. **Archivos creados/modificados:**
   - `nginx-hostinger.conf`: Configuración Nginx para subdominios
   - `hostinger-deploy.sh`: Script de despliegue actualizado
   - `ecosystem.config.js`: PM2 para mantener servicios 24/7
   - `startup.sh`: Inicio automático de servicios
   - `update-hostinger.sh`: Actualizaciones futuras sin perder configuraciones
   - Varios archivos de documentación

## 🚀 Cómo Implementar

### 1️⃣ Configurar registros DNS

Primero debes crear los registros DNS en tu panel de Hostinger:

1. Inicia sesión en tu panel de Hostinger
2. Ve a "DNS / Nameservers" o similar
3. Añade estos registros:
   - Tipo A: **dashboard.galle18k.com** → 31.70.131.9
   - Tipo A: **api.galle18k.com** → 31.70.131.9
   - Tipo A: **chatwoot.galle18k.com** → 31.70.131.9

### 2️⃣ Ejecutar el script de despliegue

**La opción recomendada es usar Git Bash:**

1. Descarga Git Bash desde [git-scm.com/download/win](https://git-scm.com/download/win)
2. Abre Git Bash y navega a la carpeta del proyecto:
   ```bash
   cd /c/Users/USUARIO/Downloads/gold-whisper-dash-main\ nuevo2.0/
   ```
3. Ejecuta:
   ```bash
   chmod +x gold-whisper-dash-main/hostinger-deploy.sh
   ./gold-whisper-dash-main/hostinger-deploy.sh
   ```

### 3️⃣ Verificar el despliegue

Una vez completado, podrás acceder a:
- **Dashboard**: http://dashboard.galle18k.com
- **API**: http://api.galle18k.com
- **Chatwoot**: http://chatwoot.galle18k.com

## 👤 Acceso como Usuario Normal

Para acceder como usuario normal (no como administrador):

1. **Para el Dashboard**: 
   - Abre http://dashboard.galle18k.com en una ventana de incógnito
   - El dashboard muestra automáticamente la interfaz de usuario normal

2. **Para Chatwoot**:
   - Visita http://chatwoot.galle18k.com en una ventana de incógnito
   - Utiliza credenciales de usuario regular (no administrador)

## 🔄 Ventajas de esta Configuración

- **Separación completa**: Tu sitio WordPress y el dashboard no interfieren entre sí
- **Servicio 24/7**: Configurado para reinicio automático si falla o se reinicia el servidor
- **Fácil actualización**: Script `update-hostinger.sh` para actualizar sin perder configuraciones
- **Respaldos automáticos**: Se crean copias de seguridad antes de cada actualización
- **Mejor organización**: Cada componente tiene su propio subdominio
- **SEO-friendly**: No afecta al SEO de tu sitio principal galle18k.com

## 📚 Documentación Completa

Para más detalles, consulta:
- `HOSTINGER-DEPLOY-INSTRUCCIONES.md` - Guía de despliegue paso a paso
- `README-HOSTINGER.md` - Información general del proyecto
- `SERVICIO-ACTIVO-24-7.md` - Explicación del funcionamiento 24/7

## 🌟 Archivos Principales de Configuración

Todos estos archivos están configurados específicamente para tu dominio galle18k.com y tus subdominios:

| Archivo | Descripción |
|---------|-------------|
| hostinger-deploy.sh | Script principal para desplegar todo |
| nginx-hostinger.conf | Configuración Nginx para subdominios |
| ecosystem.config.js | Configuración de PM2 (mantiene servicios activos) |
| startup.sh | Script de inicio de servicios |
