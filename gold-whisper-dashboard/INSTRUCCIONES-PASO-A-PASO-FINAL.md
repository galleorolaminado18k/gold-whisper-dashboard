# Instrucciones Paso a Paso FINALES - Servicios 24/7

## ¿Qué está pasando?

Veo que el script para actualizar DNS encontró errores (error 1016). Este es un error común de la API de Hostinger. A pesar de esto, podemos continuar con la configuración del servidor.

## Siguiente paso: Configurar el servidor

Ahora necesitamos configurar tu servidor para que reciba y muestre las aplicaciones correctas cuando alguien visite los subdominios. Estos pasos son muy importantes.

### Paso 1: Conectar al servidor VPS

1. Abre una nueva ventana de Git Bash
2. Copia y pega este comando exacto:
   ```
   ssh root@85.31.235.37
   ```
3. Te pedirá una contraseña. Escribe la contraseña de tu VPS y presiona Enter
4. Verás que cambia el texto a algo como `root@srv1011841:~#` lo que significa que estás conectado al servidor

### Paso 2: Configurar Nginx (copia y pega este bloque completo)

Una vez conectado al servidor, copia TODO este bloque de comandos y pégalo en la terminal:

```bash
# 1. Crear copia de seguridad de las configuraciones existentes
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

# 4. Verificar y reiniciar Nginx
nginx -t && systemctl restart nginx

# 5. Ver si las aplicaciones están funcionando
echo "Verificando puertos activos..."
ss -tulpn | grep -E ':(8081|3001|3020)'
```

### Paso 3: Iniciar las aplicaciones (si no están corriendo)

Si después del último comando no ves todas las aplicaciones ejecutándose, copia y pega estos comandos uno por uno:

```bash
# Para el Dashboard (puerto 8081)
cd /opt/gold-whisper-dash
nohup npm run dev -- --port 8081 > dashboard.log 2>&1 &
echo "Dashboard iniciado en puerto 8081"
```

```bash
# Para la API (puerto 3001)
cd /opt/gold-whisper-dash/api
nohup node index.js > api.log 2>&1 &
echo "API iniciada en puerto 3001"
```

### Paso 4: Verificar que todo esté funcionando

```bash
# Ver si las aplicaciones están corriendo ahora
ss -tulpn | grep -E ':(8081|3001|3020)'
```

### Paso 5: Configurar manualmente los DNS en Hostinger (ya que la API dio error)

1. Ve a tu panel de control de Hostinger
2. Entra en la sección "DNS" o "Zona DNS" para tu dominio galle18k.com
3. Elimina cualquier registro existente para "dashboard", "api" y "chatwoot"
4. Crea tres nuevos registros tipo A:

   Para dashboard:
   - Tipo: A
   - Nombre: dashboard
   - Contenido: 85.31.235.37
   - TTL: 14400 (o el valor por defecto)

   Para api:
   - Tipo: A
   - Nombre: api
   - Contenido: 85.31.235.37
   - TTL: 14400 (o el valor por defecto)

   Para chatwoot:
   - Tipo: A
   - Nombre: chatwoot
   - Contenido: 85.31.235.37
   - TTL: 14400 (o el valor por defecto)

### Paso 6: Esperar y verificar

1. Espera aproximadamente 15-30 minutos para que los cambios de DNS se propaguen
2. Visita estos enlaces en tu navegador:
   - dashboard.galle18k.com
   - api.galle18k.com
   - chatwoot.galle18k.com

## ¿Qué hemos hecho?

1. Configurado el servidor Nginx para que dirija el tráfico a las aplicaciones correctas
2. Verificado o iniciado las aplicaciones necesarias
3. Configurado manualmente los DNS (ya que la API dio error)

Con esto, tus aplicaciones estarán disponibles 24/7 a través de los subdominios.

## Solución de problemas

Si tienes algún problema, verifica:
- Si las aplicaciones están corriendo en el servidor (usando el comando `ss -tulpn | grep -E ':(8081|3001|3020)'`)
- Si los registros DNS están configurados correctamente en Hostinger
- Si el servidor Nginx está funcionando (`systemctl status nginx`)
