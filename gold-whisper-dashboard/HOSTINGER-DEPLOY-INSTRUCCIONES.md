# 🚀 Instrucciones de Despliegue en Hostinger VPS

Estas instrucciones te guiarán para desplegar la aplicación Gold Whisper Dashboard en tu VPS de Hostinger con los subdominios:
- **dashboard.galle18k.com** (Dashboard)
- **api.galle18k.com** (API)
- **chatwoot.galle18k.com** (Chatwoot)

Este enfoque con subdominios permite separar completamente tu aplicación del sitio WordPress existente.

## 📋 Archivos Preparados

Se han preparado todos los archivos necesarios con la configuración específica para tu VPS de Hostinger y tu dominio galle18k.com:

1. `hostinger-deploy.sh` - Script principal de despliegue
2. `nginx-hostinger.conf` - Configuración de Nginx para tu dominio
3. `ecosystem.config.js` - Configuración de PM2 para mantener servicios activos
4. `startup.sh` - Script de inicio para servicios

## 📋 Requisitos Previos

1. **Crear registros DNS**: Antes de ejecutar el despliegue, necesitas crear los siguientes registros DNS en tu panel de Hostinger:
   - Tipo A: **dashboard.galle18k.com** → Apuntando a la IP de tu VPS (31.70.131.9)
   - Tipo A: **api.galle18k.com** → Apuntando a la IP de tu VPS (31.70.131.9)
   - Tipo A: **chatwoot.galle18k.com** → Apuntando a la IP de tu VPS (31.70.131.9)

   > **Nota**: Los cambios DNS pueden tardar hasta 48 horas en propagarse completamente, aunque normalmente son efectivos en 15-30 minutos.

## 🔄 Pasos para el Despliegue

Para realizar el despliegue, **recomendamos la opción de Git Bash** ya que funciona mejor en Windows y es la más confiable:

### Opción 1: Usando Git Bash en Windows (RECOMENDADA)

1. Descarga e instala Git Bash desde: https://git-scm.com/download/win
2. Abre Git Bash (busca "Git Bash" en el menú inicio)
3. Navega a la carpeta del proyecto:
   ```bash
   cd /c/Users/USUARIO/Downloads/gold-whisper-dash-main\ nuevo2.0/
   ```
4. Dale permisos de ejecución al script:
   ```bash
   chmod +x gold-whisper-dash-main/hostinger-deploy.sh
   ```
5. Ejecuta el script:
   ```bash
   ./gold-whisper-dash-main/hostinger-deploy.sh
   ```

### Opción 2: Usando WSL en Windows

1. Abre WSL (Windows Subsystem for Linux)
2. Navega a la carpeta:
   ```bash
   cd /mnt/c/Users/USUARIO/Downloads/gold-whisper-dash-main\ nuevo2.0/
   ```
3. Dale permisos de ejecución:
   ```bash
   chmod +x gold-whisper-dash-main/hostinger-deploy.sh
   ```
4. Ejecuta el script:
   ```bash
   ./gold-whisper-dash-main/hostinger-deploy.sh
   ```

### Opción 3: Despliegue Manual vía SSH (si las opciones anteriores fallan)

1. Conecta al VPS vía SSH:
   ```bash
   ssh root@31.70.131.9
   ```

2. Crea los directorios necesarios:
   ```bash
   mkdir -p /opt/gold-whisper-dash
   ```

3. En tu PC local, comprime la carpeta `gold-whisper-dash-main`:
   - Usa 7-Zip o WinRAR para crear un archivo ZIP de la carpeta

4. Sube el archivo a tu VPS usando un cliente SFTP como FileZilla:
   - Host: 31.70.131.9
   - Usuario: root
   - Contraseña: tu contraseña de Hostinger
   - Sube a la carpeta: `/opt/`

5. Vuelve a la sesión SSH y descomprime:
   ```bash
   cd /opt
   unzip gold-whisper-dash-main.zip -d /opt/gold-whisper-dash
   ```

6. Configura Nginx:
   ```bash
   apt-get update
   apt-get install -y nginx
   cp /opt/gold-whisper-dash/nginx-hostinger.conf /etc/nginx/sites-available/gold-whisper
   ln -s /etc/nginx/sites-available/gold-whisper /etc/nginx/sites-enabled/
   rm -f /etc/nginx/sites-enabled/default
   nginx -t && systemctl reload nginx
   ```

7. Instala dependencias:
   ```bash
   apt-get install -y docker.io docker-compose nodejs npm
   systemctl enable docker && systemctl start docker
   npm install -g pm2
   ```

8. Inicia servicios:
   ```bash
   cd /opt/gold-whisper-dash
   chmod +x startup.sh
   ./startup.sh
   pm2 save
   pm2 startup
   ```

## 🌐 Acceso a las Aplicaciones

Una vez completado el despliegue, podrás acceder a las aplicaciones en los subdominios:

- **Dashboard**: http://dashboard.galle18k.com
- **API**: http://api.galle18k.com
- **Chatwoot**: http://chatwoot.galle18k.com

### 👤 Acceso como Usuario Normal

Para acceder como usuario normal y no como administrador:

1. **Para el Dashboard**: 
   - Abre http://dashboard.galle18k.com en una ventana de incógnito o en otro navegador
   - El dashboard está configurado para mostrar la interfaz de usuario normal por defecto

2. **Para Chatwoot**:
   - Visita http://chatwoot.galle18k.com en una ventana de incógnito
   - Si se requiere inicio de sesión, utiliza credenciales de usuario (no de administrador)

## 🔍 Verificación de Despliegue

Para verificar que todo esté funcionando correctamente:

1. **Verificar servicios**:
   ```bash
   ssh root@31.70.131.9
   cd /opt/gold-whisper-dash
   pm2 status
   ```

2. **Verificar Docker**:
   ```bash
   docker ps
   ```

3. **Verificar Nginx**:
   ```bash
   systemctl status nginx
   ```

## ⚠️ Solución de Problemas

Si encuentras algún problema:

1. **Si el sitio web no carga**:
   ```bash
   # Verificar configuración de Nginx
   nginx -t
   # Reiniciar Nginx
   systemctl restart nginx
   ```

2. **Si los servicios no están activos**:
   ```bash
   # Reiniciar servicios
   pm2 restart all
   ```

3. **Si Chatwoot no responde**:
   ```bash
   # Reiniciar contenedores
   cd /opt/gold-whisper-dash
   docker-compose down
   docker-compose up -d
   ```

## 🔐 Configuración de HTTPS (Opcional)

Para habilitar HTTPS con Let's Encrypt:

```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d galle18k.com -d www.galle18k.com
