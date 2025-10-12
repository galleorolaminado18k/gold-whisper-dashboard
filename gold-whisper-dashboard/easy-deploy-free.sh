#!/bin/bash
# Script para despliegue 100% GRATUITO de Gold Whisper Dashboard
# Este script te ayudará a desplegar en Netlify (frontend) y Render (backend)

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Encabezado
clear
echo -e "${YELLOW}==============================================${NC}"
echo -e "${YELLOW}  DESPLIEGUE 100% GRATUITO DE GOLD WHISPER   ${NC}"
echo -e "${YELLOW}==============================================${NC}"
echo -e "${GREEN}Este script te guiará para desplegar tu aplicación${NC}"
echo -e "${GREEN}usando servicios 100% GRATUITOS con SSL incluido${NC}"
echo -e ""

# Verificar dependencias necesarias
echo -e "${BLUE}Verificando dependencias...${NC}"
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm no está instalado. Por favor instálalo e intenta de nuevo.${NC}"; exit 1; }
command -v npx >/dev/null 2>&1 || { echo -e "${RED}❌ npx no está instalado. Por favor instálalo e intenta de nuevo.${NC}"; exit 1; }
command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ git no está instalado. Por favor instálalo e intenta de nuevo.${NC}"; exit 1; }
echo -e "${GREEN}✅ Todas las dependencias están instaladas${NC}"
echo -e ""

# Preparar el proyecto para despliegue
echo -e "${YELLOW}PASO 1: Preparando el proyecto para despliegue${NC}"

# Preparar el frontend para Netlify
echo -e "${BLUE}Preparando el frontend para Netlify...${NC}"
cd "$(dirname "$0")"

# Crear archivo netlify.toml si no existe
if [ ! -f "netlify.toml" ]; then
    echo -e "${BLUE}Creando archivo netlify.toml...${NC}"
    cat > netlify.toml << EOL
[build]
  command = "npm install && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOL
    echo -e "${GREEN}✅ Archivo netlify.toml creado${NC}"
else
    echo -e "${GREEN}✅ Archivo netlify.toml ya existe${NC}"
fi

# Verificar si tiene cuenta de Netlify
echo -e "${YELLOW}"
echo -e "¿Tienes una cuenta en Netlify? (s/n)"
read -r has_netlify
echo -e "${NC}"

if [ "$has_netlify" = "n" ]; then
    echo -e "${BLUE}📝 Para crear una cuenta en Netlify:${NC}"
    echo -e "1. Ve a ${YELLOW}https://app.netlify.com/signup${NC}"
    echo -e "2. Puedes registrarte con GitHub, GitLab o email"
    echo -e "3. Es completamente gratuito"
    echo -e ""
    echo -e "${YELLOW}Presiona cualquier tecla cuando hayas creado tu cuenta...${NC}"
    read -n 1 -s
fi

# Preparar para Render
echo -e "${BLUE}Preparando para Render...${NC}"

# Verificar si tiene cuenta de Render
echo -e "${YELLOW}"
echo -e "¿Tienes una cuenta en Render.com? (s/n)"
read -r has_render
echo -e "${NC}"

if [ "$has_render" = "n" ]; then
    echo -e "${BLUE}📝 Para crear una cuenta en Render:${NC}"
    echo -e "1. Ve a ${YELLOW}https://dashboard.render.com/register${NC}"
    echo -e "2. Puedes registrarte con GitHub o email"
    echo -e "3. Es completamente gratuito"
    echo -e ""
    echo -e "${YELLOW}Presiona cualquier tecla cuando hayas creado tu cuenta...${NC}"
    read -n 1 -s
fi

# Opciones de despliegue
echo -e "${YELLOW}PASO 2: Opciones de despliegue${NC}"
echo -e ""
echo -e "${BLUE}Selecciona la opción de despliegue:${NC}"
echo -e "1) Netlify CLI (más rápido, requiere CLI)"
echo -e "2) Netlify Drag & Drop (más sencillo, manual)"
echo -e "3) Render Web Services (requiere GitHub)"

echo -e "${YELLOW}"
echo -e "Selecciona una opción (1-3):"
read -r deploy_option
echo -e "${NC}"

case $deploy_option in
    1)
        # Despliegue con Netlify CLI
        echo -e "${BLUE}Instalando Netlify CLI...${NC}"
        npm install -g netlify-cli
        
        echo -e "${BLUE}Preparando build del frontend...${NC}"
        npm install
        npm run build
        
        echo -e "${BLUE}Desplegando en Netlify...${NC}"
        npx netlify deploy --prod
        
        echo -e "${GREEN}✅ Frontend desplegado en Netlify${NC}"
        echo -e "${YELLOW}Ahora necesitas desplegar la API y Chatwoot en Render:${NC}"
        echo -e "1. Ve a ${YELLOW}https://dashboard.render.com/select-repo${NC}"
        echo -e "2. Conecta tu repositorio de GitHub"
        echo -e "3. Configura dos Web Services:"
        echo -e "   - Para API: Root Directory '/api', Start Command: 'node index.js'"
        echo -e "   - Para Chatwoot: Root Directory '/api', Start Command: 'node chatwoot.js'"
        ;;
    2)
        # Despliegue manual en Netlify
        echo -e "${BLUE}Preparando build del frontend...${NC}"
        npm install
        npm run build
        
        echo -e "${BLUE}Creando archivo _redirects para Netlify...${NC}"
        echo "/* /index.html 200" > dist/_redirects
        
        echo -e "${GREEN}✅ Build completado. Ahora sigue estos pasos:${NC}"
        echo -e "1. Ve a ${YELLOW}https://app.netlify.com/drop${NC}"
        echo -e "2. Arrastra y suelta la carpeta ${YELLOW}dist${NC} a la página"
        echo -e "3. Espera a que se complete el despliegue"
        echo -e ""
        echo -e "${YELLOW}Presiona cualquier tecla cuando hayas completado esto...${NC}"
        read -n 1 -s
        
        echo -e "${YELLOW}Ahora necesitas desplegar la API y Chatwoot en Render:${NC}"
        echo -e "1. Ve a ${YELLOW}https://dashboard.render.com/web/create${NC}"
        echo -e "2. Selecciona 'Build and deploy from a Git repository'"
        echo -e "3. Configura dos Web Services como se describe en DESPLIEGUE-100-GRATIS.md"
        ;;
    3)
        # Instrucciones para Render
        echo -e "${BLUE}Para desplegar en Render, sigue estos pasos:${NC}"
        echo -e "1. Asegúrate que tu repositorio está en GitHub"
        echo -e "2. Ve a ${YELLOW}https://dashboard.render.com/select-repo${NC}"
        echo -e "3. Conecta tu repositorio y configura tres Web Services:"
        echo -e "   - Para Frontend: Root Directory '/', Build Command 'npm install && npm run build'"
        echo -e "   - Para API: Root Directory '/api', Start Command 'node index.js'"
        echo -e "   - Para Chatwoot: Root Directory '/api', Start Command 'node chatwoot.js'"
        ;;
    *)
        echo -e "${RED}❌ Opción inválida.${NC}"
        exit 1
        ;;
esac

# Instrucciones para mantener activos los servicios
echo -e "${YELLOW}PASO 3: Mantener activos tus servicios gratuitos${NC}"
echo -e ""
echo -e "${BLUE}Para evitar la hibernación de tus servicios en Render:${NC}"
echo -e "1. Regístrate en ${YELLOW}https://cron-job.org${NC} (gratis)"
echo -e "2. Crea un nuevo cron job para cada URL (API y Chatwoot)"
echo -e "3. Configura el intervalo para cada 14 minutos"
echo -e "4. Esto mantendrá tus servicios activos 24/7 de forma gratuita"

# Configuración de dominio
echo -e "${YELLOW}PASO 4: Configuración de dominios personalizados${NC}"
echo -e ""
echo -e "${BLUE}Para configurar tus subdominios en Hostinger:${NC}"
echo -e "1. Ve al panel de control de Hostinger"
echo -e "2. Accede a la sección DNS/Nameservers"
echo -e "3. Añade registros CNAME para cada subdominio:"
echo -e "   - ${YELLOW}dashboard.galle18k.com${NC} → Tu URL de Netlify"
echo -e "   - ${YELLOW}api.galle18k.com${NC} → Tu URL de Render para la API"
echo -e "   - ${YELLOW}chatwoot.galle18k.com${NC} → Tu URL de Render para Chatwoot"

# Finalización
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}  ¡DESPLIEGUE GRATUITO CONFIGURADO CON ÉXITO! ${NC}"
echo -e "${GREEN}=============================================${NC}"
echo -e ""
echo -e "${YELLOW}Tus URLs de aplicación (una vez configurados los DNS):${NC}"
echo -e "- Dashboard: ${BLUE}https://dashboard.galle18k.com${NC}"
echo -e "- API: ${BLUE}https://api.galle18k.com${NC}"
echo -e "- Chatwoot: ${BLUE}https://chatwoot.galle18k.com${NC}"
echo -e ""
echo -e "${GREEN}¡Todo está configurado para funcionar 24/7 y 100% GRATIS!${NC}"
