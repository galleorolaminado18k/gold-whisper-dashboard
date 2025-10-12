# 🌐 Configuración de Subdominios en Hostinger para Gold Whisper Dashboard

## Paso 1: Crear los subdominios en Hostinger

En la sección que estás viendo (Crear un nuevo subdominio), necesitas crear estos tres subdominios:

1. **dashboard** (dashboard.galle18k.com)
2. **api** (api.galle18k.com)
3. **chatwoot** (chatwoot.galle18k.com)

Para cada uno:
- Escribe el nombre del subdominio (sin el .galle18k.com) en el campo "Subdominio"
- Deja seleccionado "galle18k.com" en el campo de dominio
- Haz clic en "Crear"

## Paso 2: Configurar cada subdominio para apuntar a tu VPS

Una vez creados los subdominios, debes configurarlos para que apunten a la IP de tu VPS:

1. Ve a la sección "DNS" o "Zona DNS" de Hostinger
2. Para cada subdominio, crea o edita un registro tipo A:

| Nombre      | Tipo | Contenido    | TTL   |
|-------------|------|--------------|-------|
| dashboard   | A    | 85.31.235.37 | 14400 |
| api         | A    | 85.31.235.37 | 14400 |
| chatwoot    | A    | 85.31.235.37 | 14400 |

## Paso 3: Configurar tu VPS para manejar los subdominios

Ejecuta estos comandos en tu servidor (uno por uno):

```bash
ssh root@85.31.235.37
```

Después de ingresar la contraseña, ejecuta:

```bash
# 1. Crear copia de seguridad de configuraciones existentes
cp /etc/nginx/sites-available/gold-whisper.conf /etc/nginx/sites-available/gold-whisper.conf.backup 2>/dev/null
cp /etc/nginx/sites-available/n8n /etc/nginx/sites-available/n8n.backup 2>/dev/null

# 2. Crear nueva configuración simplificada
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

## Paso 4: Comprobar que las aplicaciones estén activas en los puertos correctos

Comprueba que tus aplicaciones estén corriendo en los puertos correctos:

```bash
# Revisar puertos activos
ss -tulpn | grep -E ':(8081|3001|3020)'

# Si necesitas iniciar alguna aplicación, puedes usar:
# Dashboard (puerto 8081)
cd /opt/gold-whisper-dash
npm run dev -- --port 8081

# API (puerto 3001) 
cd /opt/gold-whisper-dash/api
node index.js --port 3001

# Chatwoot (puerto 3020)
# Consulta la documentación específica de Chatwoot para iniciarla
```

## Paso 5: Verificar los subdominios

Una vez completados todos los pasos, visita en tu navegador:

- https://dashboard.galle18k.com
- https://api.galle18k.com
- https://chatwoot.galle18k.com

Si alguno no funciona, revisa:
1. Que la DNS esté correctamente propagada (puede tardar hasta 24 horas)
2. Que la aplicación correspondiente esté activa en el puerto correcto
3. Que Nginx esté correctamente configurado y ejecutándose
