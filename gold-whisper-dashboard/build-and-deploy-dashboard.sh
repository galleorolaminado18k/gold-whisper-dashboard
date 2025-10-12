#!/bin/bash
set -e

echo "🏗️  CONSTRUYENDO DASHBOARD PARA PRODUCCIÓN"

cd /opt/gold-whisper-dash/gold-whisper-dash-main

# 1. Build de producción
echo "1️⃣ Creando build de producción..."
npm run build

# 2. Crear directorio para archivos estáticos
echo "2️⃣ Creando directorio web..."
mkdir -p /var/www/dashboard.galle18k.com

# 3. Copiar archivos construidos
echo "3️⃣ Copiando archivos..."
cp -r dist/* /var/www/dashboard.galle18k.com/

# 4. Configurar nginx para servir archivos estáticos
echo "4️⃣ Configurando nginx..."
cat > /etc/nginx/sites-available/dashboard.galle18k.com << 'EOF'
server {
    listen 80;
    server_name dashboard.galle18k.com;
    
    root /var/www/dashboard.galle18k.com;
    index index.html;
    
    # Configuración para Single Page Application
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 5. Recargar nginx
echo "5️⃣ Recargando nginx..."
nginx -t && systemctl reload nginx

# 6. Detener servicio de desarrollo (ya no necesario)
echo "6️⃣ Deteniendo servicio de desarrollo..."
systemctl stop gold-whisper-dashboard
systemctl disable gold-whisper-dashboard

echo ""
echo "============================================"
echo "✅ DASHBOARD DESPLEGADO EN PRODUCCIÓN"
echo "============================================"
echo "URL: http://dashboard.galle18k.com"
echo "Archivos en: /var/www/dashboard.galle18k.com"
echo "============================================"
