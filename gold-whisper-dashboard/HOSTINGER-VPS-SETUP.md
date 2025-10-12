# 🌟 Configuración del Gold Whisper Dashboard en Hostinger VPS

Este documento te guía a través del proceso de despliegue y configuración de Gold Whisper Dashboard en tu VPS de Hostinger para que funcione 24/7, incluso con tu PC apagado.

## 📋 Requisitos previos

- VPS de Hostinger activo (ya configurado)
- Token de API de Hostinger (ZaB83b4QuV3YyaUuVZVl0v9XlQhfaDvke659jZmM1c68484f)
- Acceso SSH al VPS

## 🔄 Proceso automatizado

Se ha creado un script automático que maneja todo el proceso de despliegue. Este script:

1. Se conecta a tu VPS de Hostinger
2. Instala todas las dependencias necesarias
3. Configura los servicios para que se ejecuten 24/7
4. Establece el reinicio automático en caso de fallos o reinicios del sistema

### Para ejecutar el despliegue automatizado:

```bash
# 1. Hacer el script ejecutable
chmod +x hostinger-deploy.sh

# 2. Ejecutar el script
./hostinger-deploy.sh
```

## 🔍 Verificación post-despliegue

Después de ejecutar el script, puedes verificar que todo esté funcionando correctamente:

### Opción 1: Verificar por SSH

```bash
# Conectarse al VPS
ssh root@31.70.131.9

# Una vez dentro del VPS:
cd /opt/gold-whisper-dash
pm2 status  # Verifica que todos los servicios estén activos
```

### Opción 2: Acceder a las URLs

- Dashboard: `http://31.70.131.9:8081`
- API: `http://31.70.131.9:4000`
- Chatwoot: `http://31.70.131.9:3020`

## ⚙️ Configuración manual (si el script automático falla)

Si necesitas configurar manualmente, sigue estos pasos:

1. Conecta al VPS por SSH:
   ```bash
   ssh root@31.70.131.9
   ```

2. Instala las dependencias:
   ```bash
   apt-get update
   apt-get install -y docker.io docker-compose nodejs npm
   ```

3. Instala PM2 globalmente:
   ```bash
   npm install -g pm2
   ```

4. Clona el repositorio o sube los archivos al VPS:
   ```bash
   mkdir -p /opt/gold-whisper-dash
   # Aquí debes subir todos los archivos a esta carpeta
   ```

5. Configura e inicia los servicios:
   ```bash
   cd /opt/gold-whisper-dash
   chmod +x startup.sh
   ./startup.sh
   ```

6. Configura PM2 para iniciar con el sistema:
   ```bash
   pm2 startup
   pm2 save
   ```

## 🔧 Solución de problemas

Si encuentras algún problema después del despliegue, verifica:

1. **Servicios no iniciados**:
   ```bash
   pm2 status
   # Reiniciar servicios si es necesario
   pm2 restart all
   ```

2. **Problemas con Docker**:
   ```bash
   docker ps
   # Si no hay contenedores en ejecución:
   systemctl restart docker
   cd /opt/gold-whisper-dash
   docker-compose up -d
   ```

3. **Logs para depuración**:
   ```bash
   # Ver logs de PM2
   pm2 logs
   
   # Ver logs de Docker
   docker logs $(docker ps -q --filter "name=chatwoot")
   ```

## 📝 Notas importantes

- Todos los servicios están configurados para reiniciarse automáticamente si fallan
- PM2 está configurado para iniciar los servicios durante el arranque del sistema
- Docker está configurado para reiniciar contenedores automáticamente

## 🔐 Seguridad

Para mejorar la seguridad del servidor:

1. Cambia la contraseña de root
2. Configura un firewall (UFW)
3. Considera configurar SSL/HTTPS para acceso seguro

## ✅ Verificación final

Tu aplicación debería estar funcionando 24/7 en el VPS de Hostinger. Para confirmarlo, los servicios deberían:

- Estar activos incluso después de reiniciar el servidor
- Reiniciarse automáticamente en caso de fallos
- Ser accesibles desde las URLs mencionadas

¡Listo! Ahora tienes tu Gold Whisper Dashboard funcionando en el VPS de Hostinger 24/7, independientemente de si tu PC está encendido o apagado.
