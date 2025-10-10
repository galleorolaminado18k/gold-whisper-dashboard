#!/bin/bash
# Script para actualizar registros DNS en Hostinger usando su API

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===========================================================${NC}"
echo -e "${YELLOW}      ACTUALIZACIÓN DE REGISTROS DNS EN HOSTINGER      ${NC}"
echo -e "${YELLOW}===========================================================${NC}"
echo -e "${GREEN}Este script usará la API de Hostinger para actualizar tus registros DNS${NC}"
echo -e ""

# Variables que debes configurar
API_TOKEN=""  # Necesitarás tu token de API de Hostinger
DOMAIN_ID=""  # El ID de tu dominio en Hostinger
DOMAIN_NAME="galle18k.com"

# Solicitar token si no está configurado
if [ -z "$API_TOKEN" ]; then
    echo -e "${BLUE}Introduce tu token de API de Hostinger:${NC}"
    read -p "> " API_TOKEN
fi

# Solicitar ID de dominio si no está configurado
if [ -z "$DOMAIN_ID" ]; then
    echo -e "${BLUE}Introduce el ID de tu dominio en Hostinger (si no lo conoces, déjalo en blanco para intentar obtenerlo):${NC}"
    read -p "> " DOMAIN_ID
    
    if [ -z "$DOMAIN_ID" ]; then
        echo -e "${YELLOW}Intentando obtener el ID de dominio para $DOMAIN_NAME...${NC}"
        
        DOMAIN_ID=$(curl -s -X GET \
            "https://api.hostinger.com/v1/domains" \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json" | grep -o "\"id\":[0-9]*,\"name\":\"$DOMAIN_NAME\"" | grep -o "[0-9]*")
            
        if [ -z "$DOMAIN_ID" ]; then
            echo -e "${RED}No se pudo obtener el ID de dominio. Por favor, consíguelo manualmente desde Hostinger.${NC}"
            exit 1
        else
            echo -e "${GREEN}ID de dominio obtenido: $DOMAIN_ID${NC}"
        fi
    fi
fi

# Función para actualizar un registro DNS
update_dns_record() {
    local subdomain=$1
    local record_type=$2
    local content=$3
    local ttl=$4
    
    echo -e "${YELLOW}Actualizando registro DNS para $subdomain.$DOMAIN_NAME...${NC}"
    
    # Primero buscar si el registro ya existe
    RECORD_ID=$(curl -s -X GET \
        "https://api.hostinger.com/v1/domains/$DOMAIN_ID/dns" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" | grep -o "\"id\":[0-9]*,\"name\":\"$subdomain\"" | grep -o "[0-9]*")
        
    if [ -n "$RECORD_ID" ]; then
        # Actualizar registro existente
        echo -e "${BLUE}Registro encontrado con ID $RECORD_ID, actualizando...${NC}"
        
        RESPONSE=$(curl -s -X PUT \
            "https://api.hostinger.com/v1/domains/$DOMAIN_ID/dns/$RECORD_ID" \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"$record_type\",\"name\":\"$subdomain\",\"content\":\"$content\",\"ttl\":$ttl}")
            
        if [[ $RESPONSE == *"success"* ]]; then
            echo -e "${GREEN}✓ Registro actualizado correctamente para $subdomain.$DOMAIN_NAME${NC}"
        else
            echo -e "${RED}✗ Error al actualizar el registro: $RESPONSE${NC}"
        fi
        
    else
        # Crear nuevo registro
        echo -e "${BLUE}Registro no encontrado, creando nuevo...${NC}"
        
        RESPONSE=$(curl -s -X POST \
            "https://api.hostinger.com/v1/domains/$DOMAIN_ID/dns" \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"$record_type\",\"name\":\"$subdomain\",\"content\":\"$content\",\"ttl\":$ttl}")
            
        if [[ $RESPONSE == *"success"* ]]; then
            echo -e "${GREEN}✓ Registro creado correctamente para $subdomain.$DOMAIN_NAME${NC}"
        else
            echo -e "${RED}✗ Error al crear el registro: $RESPONSE${NC}"
        fi
    fi
}

# Actualizar los tres subdominios
echo -e "${BLUE}Actualizando registros DNS para apuntar a tu VPS (85.31.235.37)...${NC}"

# Actualizar dashboard.galle18k.com
update_dns_record "dashboard" "A" "85.31.235.37" 14400

# Actualizar api.galle18k.com
update_dns_record "api" "A" "85.31.235.37" 14400

# Actualizar chatwoot.galle18k.com
update_dns_record "chatwoot" "A" "85.31.235.37" 14400

echo -e "\n${GREEN}Proceso completado. Los registros DNS pueden tardar hasta 24 horas en propagarse.${NC}"
echo -e "${BLUE}Continúa con la configuración de Nginx en tu servidor según las instrucciones de CONFIGURACION-DNS-FINAL.md${NC}"
echo -e "${YELLOW}===========================================================${NC}"

# Nota: Para obtener tu token de API de Hostinger:
# 1. Inicia sesión en el panel de Hostinger
# 2. Ve a tu perfil o configuración
# 3. Busca la sección de "API" o "Tokens API"
# 4. Genera un nuevo token con permisos para administrar DNS
