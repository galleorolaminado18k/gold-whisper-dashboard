# 🚀 SERVICIO ACTIVO 24/7: NUNCA SE APAGARÁ

Este documento explica cómo garantizar que tus servicios (Dashboard y Chatwoot) estén **siempre activos** (24/7), incluso cuando tu PC esté apagado. Ya se han configurado las herramientas necesarias para esto.

## 🔄 OPCIONES DISPONIBLES

Tienes **tres opciones principales** para mantener tus servicios 24/7:

### 1️⃣ OPCIÓN LOCAL CON PM2 (RECOMENDADO SI TIENES UN SERVIDOR)

Si tienes un servidor o un ordenador que puede estar siempre encendido:

1. **Instala PM2 globalmente**:
   ```bash
   npm install -g pm2
   ```

2. **Ejecuta el script de inicio automático**:
   ```bash
   chmod +x startup.sh
   ./startup.sh
   ```

3. Este script:
   - Inicia todos tus servicios con PM2
   - Configura PM2 para iniciar automáticamente con el sistema
   - Reinicia automáticamente los servicios en caso de fallo

4. **Para verificar el estado**:
   ```bash
   pm2 status
   ```

### 2️⃣ OPCIÓN RAILWAY (RECOMENDADO PARA DESPLIEGUE EN LA NUBE)

Railway es la opción más sencilla para despliegue en la nube:

1. Crea una cuenta en [Railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Despliega el proyecto usando el archivo `railway.json` existente
4. Railway mantendrá tus servicios siempre activos automáticamente

Railway ofrece $5 USD de crédito gratuito mensual, lo que puede ser suficiente para tu aplicación.

### 3️⃣ OPCIÓN FLY.IO (ALTERNATIVA EN LA NUBE)

Otra excelente alternativa para despliegue en la nube:

1. Crea una cuenta en [Fly.io](https://fly.io)
2. Instala la CLI de Fly: `curl -L https://fly.io/install.sh | sh`
3. Inicia sesión: `fly auth login`
4. Despliega el dashboard: `fly deploy` (usa el archivo `fly.toml` existente)
5. Despliega la API: `cd api && fly deploy` (usa el archivo `api/fly.toml` existente)

Fly.io también tiene una capa gratuita que puede cubrir tus necesidades básicas.

## 🔧 ¿QUÉ ARCHIVOS SE HAN MODIFICADO?

Se han configurado todos estos archivos para garantizar el funcionamiento 24/7:

1. `docker-compose.yml`: Se cambió la política de reinicio a `always` para todos los servicios
2. `fly.toml` y `api/fly.toml`: Se configuraron con `auto_start_machines = true` y `auto_stop_machines = 'off'`
3. `railway.json`: Se configuró con `sleepApplication: false` para evitar que la aplicación se duerma
4. `ecosystem.config.js`: Archivo de configuración para PM2 con políticas de reinicio automático
5. `startup.sh`: Script de inicio para configurar todo automáticamente

## 🔍 VERIFICACIÓN DEL ESTADO

### Para la opción con PM2:
```bash
# Ver estado de todos los servicios
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar todos los servicios
pm2 restart all
```

### Para Railway/Fly.io:
Visita el panel de control de la plataforma respectiva para ver el estado de tus servicios.

## ⚠️ SOLUCIÓN DE PROBLEMAS

Si encuentras algún problema:

1. **PM2**: Verifica los logs con `pm2 logs` para identificar errores
2. **Docker**: Usa `docker ps` y `docker logs [container-id]` para depurar
3. **Railway/Fly.io**: Revisa los logs en el panel de control de la plataforma

## 📋 RESUMEN DE PASOS RECOMENDADOS

1. **Opción local**: Ejecuta `./startup.sh` y verifica con `pm2 status`
2. **Opción en la nube**: Despliega en Railway.app usando la configuración existente
3. **Verifica URLs**: Asegúrate de actualizar las URLs en la configuración si cambias de entorno

Con estas configuraciones, tus servicios permanecerán **activos 24/7**, incluso si tu PC se apaga.

---

## 🔐 NOTAS DE SEGURIDAD

- Mantén tus credenciales seguras, especialmente para servicios en la nube
- Considera usar variables de entorno para información sensible
- Revisa periódicamente los logs para detectar actividad inusual

¡Listo! Ahora tu dashboard y Chatwoot funcionarán sin interrupciones, 24 horas al día, 7 días a la semana.
