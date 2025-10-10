#!/bin/bash
set -e

echo "🔧 SOLUCIÓN DEFINITIVA - Limpiando y configurando todo"

# 1. Limpiar configs viejas de nginx
echo "1️⃣ Eliminando configuraciones viejas de nginx..."
rm -f /etc/nginx/sites-enabled/miapp
rm -f /etc/nginx/sites-enabled/n8n
rm -f /etc/nginx/sites-enabled/silvana

# 2. Matar procesos que ocupan puerto 8081
echo "2️⃣ Liberando puerto 8081..."
pkill -9 -f 'python.*8081' 2>/dev/null || true
fuser -k 8081/tcp 2>/dev/null || true

# 3. Reinstalar dependencias del Dashboard
echo "3️⃣ Reinstalando dependencias del Dashboard..."
cd /opt/gold-whisper-dash/gold-whisper-dash-main
npm install --force

# 4. Actualizar servicio Dashboard con configuración correcta
echo "4️⃣ Configurando servicio Dashboard..."
cat > /etc/systemd/system/gold-whisper-dashboard.service << 'EOF'
[Unit]
Description=Gold Whisper Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gold-whisper-dash/gold-whisper-dash-main
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/gold-whisper-dash/gold-whisper-dash-main/node_modules/.bin"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 8081
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 5. Recargar systemd
echo "5️⃣ Recargando systemd..."
systemctl daemon-reload

# 6. Reiniciar servicios
echo "6️⃣ Reiniciando servicios..."
systemctl restart gold-whisper-api
systemctl restart gold-whisper-dashboard

# 7. Esperar a que inicien
echo "7️⃣ Esperando inicio de servicios..."
sleep 10

# 8. Verificar nginx
echo "8️⃣ Verificando y recargando nginx..."
nginx -t && systemctl reload nginx

# 9. Verificar estado
echo ""
echo "============================================"
echo "✅ VERIFICACIÓN FINAL"
echo "============================================"
systemctl status gold-whisper-api --no-pager | head -10
echo ""
systemctl status gold-whisper-dashboard --no-pager | head -10
echo ""
echo "=== PUERTOS ACTIVOS ==="
ss -tlnp | grep -E ':(80|443|4000|8081|3000)\s'
echo ""
echo "=== TEST API LOCAL ==="
curl -s http://localhost:4000 | head -5 || echo "API no responde localmente"
echo ""
echo "=== TEST DASHBOARD LOCAL ==="
curl -s -o /dev/null -w "Dashboard Status: %{http_code}\n" http://localhost:8081
echo ""
echo "=== TEST URL PÚBLICA API ==="
curl -I http://api.galle18k.com 2>&1 | head -5
echo ""
echo "============================================"
echo "✅ PROCESO COMPLETADO"
echo "============================================"
echo "URLs disponibles:"
echo "  - https://api.galle18k.com (puerto 4000)"
echo "  - https://dashboard.galle18k.com (puerto 8081)"
echo "  - https://chatwoot.galle18k.com (puerto 3000)"
echo "============================================"
