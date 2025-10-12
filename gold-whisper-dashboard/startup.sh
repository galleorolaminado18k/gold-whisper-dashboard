#!/bin/bash
# Script de inicio automático para Gold Whisper Dashboard
# Debe colocarse como servicio del sistema para garantizar funcionamiento 24/7

# Definir ruta base
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$BASE_DIR"

# Asegurarse de que PM2 esté instalado globalmente
if ! command -v pm2 &> /dev/null; then
    echo "Instalando PM2 globalmente..."
    npm install -g pm2
fi

# Verificar si Docker está en ejecución
if ! docker info > /dev/null 2>&1; then
    echo "Docker no está en ejecución. Intentando iniciar Docker..."
    systemctl start docker || service docker start || echo "No se pudo iniciar Docker automáticamente. Por favor, inicie Docker manualmente."
fi

# Instalar PM2 como servicio de sistema si no está ya instalado
pm2 startup

# Iniciar todas las aplicaciones con PM2 usando la configuración de ecosystem.config.js
echo "Iniciando aplicaciones con PM2..."
pm2 delete all || true  # Eliminar aplicaciones anteriores si existen
pm2 start ecosystem.config.js

# Guardar la configuración actual de PM2 para que se restaure en el reinicio
pm2 save

echo "✅ Servicios iniciados exitosamente en modo 24/7"
echo "- Gold Whisper Dashboard está en ejecución"
echo "- API Bridge está en ejecución"
echo "- Chatwoot está en ejecución (vía Docker)"

echo "Para verificar el estado de los servicios, ejecute: pm2 status"
echo "Para ver los logs en tiempo real, ejecute: pm2 logs"
