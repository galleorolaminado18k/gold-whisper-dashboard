#!/bin/bash
# Script para verificar IP y sugerir soluciones al problema de DNS de Hostinger
# Guarda este script y ejecútalo con: bash hostinger-dns-problem.sh

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

clear
echo -e "${YELLOW}===========================================================${NC}"
echo -e "${YELLOW}      DIAGNÓSTICO DE PROBLEMAS DNS EN HOSTINGER      ${NC}"
echo -e "${YELLOW}===========================================================${NC}"
echo -e "${GREEN}Este script diagnosticará los problemas con la validación de IP${NC}"
echo -e "${GREEN}y te dará opciones para resolverlos.${NC}"
echo -e ""

# Verificar formato de IP
IP="85.31.235.37"
echo -e "${BLUE}Verificando formato de IP: $IP${NC}"

if [[ $IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    # Verificar cada octeto
    IFS='.' read -r -a octets <<< "$IP"
    valid=true
    
    for octet in "${octets[@]}"; do
        if [[ $octet -gt 255 ]]; then
            valid=false
            break
        fi
    done
    
    if [ "$valid" = true ]; then
        echo -e "${GREEN}✓ La IP $IP tiene un formato válido${NC}"
    else
        echo -e "${RED}✗ La IP $IP no es válida (algún octeto es mayor a 255)${NC}"
    fi
else
    echo -e "${RED}✗ La IP $IP no tiene un formato válido${NC}"
fi

echo -e "\n${PURPLE}SOLUCIONES PARA HOSTINGER:${NC}"
echo -e "${YELLOW}1. Solución: Usar editor de zona DNS avanzado${NC}"
echo -e "   En lugar de la interfaz gráfica, accede al editor de zona DNS y añade:"
echo -e "   ${BLUE}dashboard  14400  IN  A  85.31.235.37${NC}"
echo -e "   ${BLUE}api        14400  IN  A  85.31.235.37${NC}"
echo -e "   ${BLUE}chatwoot   14400  IN  A  85.31.235.37${NC}"

echo -e "\n${YELLOW}2. Solución: Usar registros CNAME${NC}"
echo -e "   1) Crea un registro A para 'vps.galle18k.com' → 85.31.235.37"
echo -e "   2) Luego crea CNAMEs para tus subdominios apuntando a vps.galle18k.com"

echo -e "\n${YELLOW}3. Solución: Intenta con formato alternativo${NC}"
echo -e "   Algunos sistemas requieren formato específico. Prueba estas variantes:"
echo -e "   ${BLUE}85.31.235.37${NC} (estándar)"
echo -e "   ${BLUE}085.031.235.037${NC} (con ceros)"
echo -e "   Nota: Intenta escribir la IP manualmente en lugar de copiar y pegar"

echo -e "\n${YELLOW}4. Solución: Verifica si el CDN está interfiriendo${NC}"
echo -e "   Si ves el botón 'Activar' en la sección CDN, significa que está desactivado."
echo -e "   Esto es bueno para esta configuración inicial."

echo -e "\n${PURPLE}VERIFICACIÓN:${NC}"
echo -e "Después de configurar los DNS, verifica que estén propagados:"
echo -e "${BLUE}dig dashboard.galle18k.com${NC}"
echo -e "${BLUE}dig api.galle18k.com${NC}"
echo -e "${BLUE}dig chatwoot.galle18k.com${NC}"
echo -e "O visita: ${BLUE}https://dnschecker.org${NC}"
echo -e ""
echo -e "${YELLOW}===========================================================${NC}"
echo -e "Si los problemas persisten, contacta al soporte de Hostinger para"
echo -e "que te ayuden con la validación de IP o intenta crear los registros"
echo -e "usando las herramientas de línea de comandos de tu sistema."
echo -e "${YELLOW}===========================================================${NC}"
