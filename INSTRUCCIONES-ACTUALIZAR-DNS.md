# Instrucciones para Actualizar los Registros DNS de Hostinger

Este documento proporciona instrucciones detalladas para actualizar tus registros DNS en Hostinger, de modo que tus subdominios apunten correctamente a tu VPS (85.31.235.37).

## Opción 1: Usando la API de Hostinger (Recomendado)

Hemos creado un script que automatiza el proceso de actualización de los registros DNS usando la API de Hostinger.

### Requisitos previos

1. **Obtener un token de API de Hostinger:**
   - Inicia sesión en tu cuenta de Hostinger
   - Ve a tu perfil o configuración
   - Busca la sección "API" o "Tokens API"
   - Genera un nuevo token con permisos para administrar DNS

2. **Ejecutar el script desde un entorno compatible:**
   
   El script debe ejecutarse en un entorno Linux/Unix o similar. Puedes usar:

   - **En Windows:**
     - Git Bash (instalado con Git para Windows)
     - WSL (Windows Subsystem for Linux)
     - Cualquier otro terminal con soporte para Bash

   - **En macOS/Linux:**
     - Terminal por defecto

### Ejecutar el script

1. **En Git Bash (Windows):**
   ```bash
   cd "c:/Users/USUARIO/Downloads/gold-whisper-dash-main nuevo2.0"
   bash gold-whisper-dash-main/actualizar-dns-hostinger.sh
   ```

2. **En WSL (Windows):**
   ```bash
   cd /mnt/c/Users/USUARIO/Downloads/gold-whisper-dash-main\ nuevo2.0
   bash gold-whisper-dash-main/actualizar-dns-hostinger.sh
   ```

3. **En macOS/Linux:**
   ```bash
   cd /ruta/a/tu/directorio
   bash gold-whisper-dash-main/actualizar-dns-hostinger.sh
   ```

4. **Cuando el script se ejecute, te pedirá:**
   - Tu token de API de Hostinger
   - El ID de tu dominio (si no lo sabes, el script intentará determinarlo)

5. **El script actualizará automáticamente los registros DNS para:**
   - dashboard.galle18k.com → 85.31.235.37
   - api.galle18k.com → 85.31.235.37
   - chatwoot.galle18k.com → 85.31.235.37

## Opción 2: Manualmente desde el Panel de Hostinger

Si prefieres no usar la API, puedes actualizar los registros manualmente:

1. Inicia sesión en tu Panel de Hostinger
2. Ve a la sección "DNS" o "Zona DNS" de tu dominio galle18k.com
3. Busca los registros para los subdominios y actualízalos:

   Para **dashboard.galle18k.com**:
   - Elimina cualquier registro existente para "dashboard"
   - Crea un nuevo registro tipo A:
     - Nombre: dashboard
     - Contenido: 85.31.235.37
     - TTL: 14400

   Para **api.galle18k.com**:
   - Elimina cualquier registro existente para "api"
   - Crea un nuevo registro tipo A:
     - Nombre: api
     - Contenido: 85.31.235.37
     - TTL: 14400

   Para **chatwoot.galle18k.com**:
   - Elimina cualquier registro existente para "chatwoot"
   - Crea un nuevo registro tipo A:
     - Nombre: chatwoot
     - Contenido: 85.31.235.37
     - TTL: 14400

## Paso final: Configurar Nginx en tu servidor VPS

Después de actualizar los registros DNS, necesitas configurar Nginx en tu VPS:

1. Conéctate a tu VPS:
   ```bash
   ssh root@85.31.235.37
   ```

2. Ejecuta los siguientes comandos:
   ```bash
   # 1. Crear copia de seguridad
   cp /etc/nginx/sites-available/gold-whisper.conf /etc/nginx/sites-available/gold-whisper.conf.backup 2>/dev/null
   cp /etc/nginx/sites-available/n8n /etc/nginx/sites-available/n8n.backup 2>/dev/null

   # 2. Crear nueva configuración
   cat > /etc/nginx/sites-available/gold-whisper.conf << 'EOL'
   server {
       listen 80;
       server_name dashboard.galle18k.com;
       
       location / {
           proxy_pass http://localhost:8081;
       }
   }

   server {
       listen 80;
       server_name api.galle18k.com;
       
       location / {
           proxy_pass http://localhost:3001;
       }
   }

   server {
       listen 80;
       server_name chatwoot.galle18k.com;
       
       location / {
           proxy_pass http://localhost:3020;
       }
   }
   EOL

   # 3. Activar configuración
   ln -sf /etc/nginx/sites-available/gold-whisper.conf /etc/nginx/sites-enabled/

   # 4. Verificar y reiniciar
   nginx -t && systemctl restart nginx
   ```

## Verificación

Los cambios DNS pueden tardar hasta 24 horas en propagarse, pero generalmente ocurre en menos de una hora.

Visita estos URLs en tu navegador para verificar:
- dashboard.galle18k.com
- api.galle18k.com
- chatwoot.galle18k.com
