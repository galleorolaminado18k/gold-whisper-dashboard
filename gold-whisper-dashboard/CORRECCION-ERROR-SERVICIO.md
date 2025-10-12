# Solución para el Error del Servicio API

Veo que al intentar iniciar el servicio systemd para la API, aparece un error `code-exited, status=1/FAILURE`. Esto indica que el servicio está correctamente configurado, pero el programa (node index.js) está fallando al ejecutarse.

## Diagnóstico del problema

El error `code-exited, status=1/FAILURE` significa que Node.js intentó ejecutar el archivo index.js pero encontró un error en el código o en su entorno que le impidió iniciarse correctamente.

Las causas más comunes son:

1. Ruta incorrecta al archivo index.js
2. Dependencias faltantes (módulos de Node.js no instalados)
3. Error en el código de index.js
4. Variables de entorno necesarias no definidas
5. Permisos insuficientes

## Solución paso a paso

### 1. Verificar que el archivo index.js existe en la ruta correcta

```bash
# Verificar que el archivo existe
ls -la /opt/gold-whisper-dash/gold-whisper-dash-main/api/index.js

# Verificar el contenido del archivo
cat /opt/gold-whisper-dash/gold-whisper-dash-main/api/index.js
```

### 2. Probar la ejecución manual para ver el error exacto

```bash
# Ir al directorio
cd /opt/gold-whisper-dash/gold-whisper-dash-main/api

# Ejecutar el archivo para ver el error específico
node index.js
```

### 3. Alternativa: Usar la API simplificada que ya creamos

Ya que habíamos creado una API simplificada en /opt/api-simple que sabemos que funciona correctamente, podemos modificar el servicio para usar esa API en su lugar:

```bash
# Editar el servicio para usar la API simplificada
cat > /etc/systemd/system/gold-whisper-api.service << 'EOL'
[Unit]
Description=Gold Whisper API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/api-simple
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

# Recargar la configuración de systemd
systemctl daemon-reload

# Reiniciar el servicio
systemctl restart gold-whisper-api.service

# Verificar el estado
systemctl status gold-whisper-api.service
```

### 4. Verificar logs para diagnóstico detallado

Si continúa el problema, revisa los logs para un diagnóstico más detallado:

```bash
# Ver los logs del servicio
journalctl -u gold-whisper-api.service -n 50
```

### 5. Verificar las dependencias de Node.js

Asegúrate de que todas las dependencias estén instaladas:

```bash
# Si usas la API original
cd /opt/gold-whisper-dash/gold-whisper-dash-main/api
npm install

# Si usas la API simplificada
cd /opt/api-simple
npm install express cors
```

## Solución alternativa: Usar PM2 en lugar de systemd

Si sigues teniendo problemas con systemd, una alternativa es usar PM2, que es un gestor de procesos para aplicaciones Node.js:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la API con PM2
cd /opt/api-simple
pm2 start index.js --name gold-whisper-api

# Configurar PM2 para iniciar automáticamente al arrancar el sistema
pm2 startup
# Ejecutar el comando que te indique el paso anterior

# Guardar la configuración actual
pm2 save

# Verificar estado
pm2 status
```

Con PM2, incluso si la aplicación falla, intentará reiniciarla automáticamente.

## Verificación final

Una vez que el servicio esté funcionando correctamente:

1. Verifica que la API responde correctamente:
   ```bash
   curl http://localhost:3001/
   ```

2. Verifica que Nginx está redirigiendo correctamente:
   ```bash
   curl -I -H "Host: api.galle18k.com" http://127.0.0.1
   ```

3. Reinicia el servidor para asegurarte de que todo se inicia automáticamente:
   ```bash
   # ¡Cuidado! Esto reiniciará tu servidor
   # Solo hazlo si estás seguro y es un buen momento
   reboot
   ```

Si todo funciona correctamente después del reinicio, tu API estará disponible 24/7.
