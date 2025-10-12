# Comandos Exactos para Git Bash - Gold Whisper 24/7

## Para ejecutar el script de actualización de DNS en Git Bash

Copia y pega estos comandos exactamente como aparecen:

```bash
# 1. Navegar al directorio correcto
cd /c/Users/USUARIO/Downloads/gold-whisper-dash-main\ nuevo2.0

# 2. Ver el contenido del script para verificar
cat gold-whisper-dash-main/actualizar-dns-hostinger.sh

# 3. Ejecutar el script usando bash
bash gold-whisper-dash-main/actualizar-dns-hostinger.sh
```

## Si prefieres ejecutar directamente los comandos de la API

Copia y pega estos comandos en Git Bash. Reemplaza los valores entre corchetes con tus datos:

```bash
# Definir variables
API_TOKEN="[TU_TOKEN_API_DE_HOSTINGER]"
DOMAIN_ID="[ID_DE_TU_DOMINIO]"  # Si no lo sabes, deja en blanco
DOMAIN_NAME="galle18k.com"

# Si no conoces el ID de dominio, obtenerlo automáticamente
if [ -z "$DOMAIN_ID" ]; then
    echo "Buscando ID de dominio para $DOMAIN_NAME..."
    DOMAIN_ID=$(curl -s -X GET \
        "https://api.hostinger.com/v1/domains" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" | grep -o "\"id\":[0-9]*,\"name\":\"$DOMAIN_NAME\"" | grep -o "[0-9]*")
    echo "ID de dominio encontrado: $DOMAIN_ID"
fi

# Actualizar registro para dashboard
echo "Actualizando registro DNS para dashboard.$DOMAIN_NAME..."
curl -X POST \
    "https://api.hostinger.com/v1/domains/$DOMAIN_ID/dns" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"A\",\"name\":\"dashboard\",\"content\":\"85.31.235.37\",\"ttl\":14400}"

# Actualizar registro para api
echo "Actualizando registro DNS para api.$DOMAIN_NAME..."
curl -X POST \
    "https://api.hostinger.com/v1/domains/$DOMAIN_ID/dns" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"A\",\"name\":\"api\",\"content\":\"85.31.235.37\",\"ttl\":14400}"

# Actualizar registro para chatwoot
echo "Actualizando registro DNS para chatwoot.$DOMAIN_NAME..."
curl -X POST \
    "https://api.hostinger.com/v1/domains/$DOMAIN_ID/dns" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"A\",\"name\":\"chatwoot\",\"content\":\"85.31.235.37\",\"ttl\":14400}"
```

## Comandos para configurar Nginx en el servidor

Copia y pega estos comandos cuando te hayas conectado a tu VPS:

```bash
# Conectarse al servidor (en una nueva ventana de Git Bash)
ssh root@85.31.235.37

# Una vez conectado, pega estos comandos:

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

# 5. Ver los puertos activos
ss -tulpn | grep -E ':(8081|3001|3020)'
```

## Comprobar que las aplicaciones estén en ejecución

Si las aplicaciones no están en ejecución, ejecuta estos comandos en el servidor:

```bash
# Para el Dashboard (puerto 8081)
cd /opt/gold-whisper-dash
npm run dev -- --port 8081 &

# Para la API (puerto 3001)
cd /opt/gold-whisper-dash/api
node index.js --port 3001 &

# Para verificar procesos en ejecución
ps aux | grep -E 'npm|node'
```

Todos los comandos anteriores son para copiar y pegar directamente en Git Bash.
