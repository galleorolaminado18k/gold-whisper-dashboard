# Instrucciones para Ejecutar el Script de Despliegue del Dashboard

Sigue estos pasos para desplegar el Dashboard Gold Whisper con disponibilidad 24/7 en el servidor VPS:

## 1. Subir el script al servidor

Primero, debes subir el script `deploy-dashboard-24-7.sh` al servidor. Puedes hacerlo usando SCP:

```bash
scp gold-whisper-dash-main/deploy-dashboard-24-7.sh root@85.31.235.37:/root/
```

O también puedes copiar el contenido del script y crearlo directamente en el servidor:

```bash
# Conéctate al servidor
ssh root@85.31.235.37

# Crea el archivo
nano /root/deploy-dashboard-24-7.sh

# (Pega el contenido del script y guarda con Ctrl+O, luego Ctrl+X)
```

## 2. Hacer el script ejecutable

Una vez que el script está en el servidor, debes hacerlo ejecutable:

```bash
chmod +x /root/deploy-dashboard-24-7.sh
```

## 3. Ejecutar el script

Ahora puedes ejecutar el script:

```bash
cd /root
./deploy-dashboard-24-7.sh
```

Durante la ejecución, verás información detallada sobre cada paso del proceso. El script:

1. Instalará las dependencias necesarias (si no están instaladas)
2. Configurará el servicio systemd para el Dashboard
3. Configurará un respaldo con cron
4. Instalará y configurará Nginx como proxy inverso
5. Configurará SSL con Let's Encrypt
6. Implementará monitoreo automático

## 4. Verificar el despliegue

Una vez que el script termine de ejecutarse, puedes verificar que todo esté funcionando correctamente:

```bash
# Verificar el estado del servicio
systemctl status gold-whisper-dashboard.service

# Verificar que el dashboard responde
curl -I http://localhost:8081

# Verificar que Nginx está configurado correctamente
nginx -t

# Verificar logs del dashboard
tail -f /var/log/gold-whisper-dashboard.log
```

## 5. Acceder al Dashboard

Ahora deberías poder acceder al Dashboard desde tu navegador visitando:

```
https://dashboard.galle18k.com
```

## Solución de problemas

Si encuentras algún problema durante o después del despliegue:

1. **Revisar logs de despliegue**:
   ```bash
   cat /var/log/deploy-dashboard.log
   ```

2. **Revisar logs del Dashboard**:
   ```bash
   tail -f /var/log/gold-whisper-dashboard.log
   ```

3. **Revisar logs de Nginx**:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

4. **Reiniciar el Dashboard manualmente**:
   ```bash
   systemctl restart gold-whisper-dashboard.service
   ```
   o
   ```bash
   /opt/gold-whisper-dash/start-dashboard.sh
   ```

5. **Verificar que el script de monitoreo funciona**:
   ```bash
   cat /var/log/monitor-dashboard.log
   ```

Con estos pasos, tu Dashboard estará disponible 24/7, reiniciándose automáticamente si hay algún problema y sobreviviendo a reinicios del servidor.
