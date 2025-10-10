# 🌐 Gold Whisper Dashboard - Despliegue 24/7 en Hostinger VPS

Este documento contiene las instrucciones completas para desplegar y mantener tu aplicación Gold Whisper Dashboard en un VPS de Hostinger, asegurando un funcionamiento continuo 24/7.

## 📋 Archivos creados

Se han creado los siguientes archivos para facilitar el despliegue y mantenimiento:

1. **`hostinger-deploy.sh`**: Script principal para desplegar la aplicación en el VPS
2. **`update-hostinger.sh`**: Script para actualizar la aplicación sin perder configuraciones
3. **`nginx-hostinger.conf`**: Configuración de Nginx para exponer los servicios al público
4. **`HOSTINGER-VPS-SETUP.md`**: Guía detallada de la configuración
5. **`SERVICIO-ACTIVO-24-7.md`**: Documentación general sobre mantener servicios activos 24/7
6. **`ecosystem.config.js`**: Configuración de PM2 para el manejo de servicios
7. **`startup.sh`**: Script de inicio para los servicios

## 🚀 Instrucciones de despliegue

### 1. Despliegue inicial en VPS Hostinger

Para desplegar por primera vez en el VPS de Hostinger:

1. Asegúrate de tener acceso al VPS de Hostinger (IP: 31.70.131.9)
2. Abre una terminal Git Bash o WSL en Windows (o terminal normal en macOS/Linux)
3. Ejecuta el script de despliegue:
   ```bash
   # En sistemas Unix/Linux/macOS o Git Bash en Windows
   chmod +x hostinger-deploy.sh
   ./hostinger-deploy.sh
   ```

   > **Nota para usuarios Windows**: Si no tienes Git Bash o WSL, puedes subir los archivos manualmente al VPS vía SFTP y luego ejecutar `startup.sh` en el servidor.

### 2. Actualizar la aplicación en el VPS

Para actualizar la aplicación después de cambios:

1. Realiza tus cambios en el código local
2. Ejecuta el script de actualización:
   ```bash
   # En sistemas Unix/Linux/macOS o Git Bash en Windows
   chmod +x update-hostinger.sh
   ./update-hostinger.sh
   ```

## 🔍 Verificación de servicios

Para verificar que todos los servicios estén funcionando correctamente:

1. **Conexión SSH al VPS**:
   ```bash
   ssh root@31.70.131.9
   ```

2. **Verificar servicios con PM2**:
   ```bash
   cd /opt/gold-whisper-dash
   pm2 status
   ```

3. **Verificar contenedores Docker**:
   ```bash
   docker ps
   ```

4. **Verificar logs en tiempo real**:
   ```bash
   pm2 logs
   ```

## 🌐 Acceso a las aplicaciones

Una vez desplegado, puedes acceder a las aplicaciones en:

- **Dashboard**: `http://31.70.131.9:8081` (o tu dominio configurado)
- **API**: `http://31.70.131.9:4000` (o tu dominio configurado)
- **Chatwoot**: `http://31.70.131.9:3020` (o tu dominio configurado)

## 🔧 Solución de problemas comunes

### Si los servicios no están activos:

```bash
# Reinicia los servicios
pm2 restart all

# Si eso no funciona, vuelve a ejecutar el script de inicio
cd /opt/gold-whisper-dash
chmod +x startup.sh
./startup.sh
```

### Si Chatwoot no responde:

```bash
# Reinicia los contenedores de Docker
cd /opt/gold-whisper-dash
docker-compose down
docker-compose up -d
```

### Si necesitas recuperar un respaldo anterior:

```bash
# Lista todos los respaldos
ls -la /opt/backups/

# Restaura un respaldo específico
cd /opt/gold-whisper-dash
tar -xzf /opt/backups/gold-whisper-backup-[TIMESTAMP].tar.gz -C /opt/gold-whisper-dash
```

## 🔐 Configuración de seguridad adicional (opcional)

Para mayor seguridad, considera:

1. **Configurar HTTPS con Let's Encrypt**:
   ```bash
   apt-get update
   apt-get install certbot python3-certbot-nginx
   certbot --nginx -d tudominio.com
   ```

2. **Configurar Firewall (UFW)**:
   ```bash
   apt-get install ufw
   ufw allow ssh
   ufw allow http
   ufw allow https
   ufw enable
   ```

3. **Cambiar la contraseña de root**:
   ```bash
   passwd
   ```

## ✅ Notas finales

- Todos los servicios están configurados para reiniciarse automáticamente si fallan
- PM2 está configurado para iniciar los servicios durante el arranque del sistema
- Docker está configurado para reiniciar contenedores automáticamente
- Se crean respaldos automáticos antes de cada actualización

Con esta configuración, tu aplicación Gold Whisper Dashboard funcionará de manera ininterrumpida 24/7 en tu VPS de Hostinger, incluso si tu PC está apagado.
