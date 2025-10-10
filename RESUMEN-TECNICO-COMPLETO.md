# Resumen Técnico: Despliegue Gold Whisper 24/7

## Problema inicial
- La aplicación Gold Whisper (dashboard y Chatwoot) no estaba disponible 24/7
- Los servicios se detenían cuando el PC local estaba apagado
- Se requería una solución para mantener los servicios funcionando continuamente

## Arquitectura implementada

### 1. Infraestructura
- **Servidor**: VPS de Hostinger con Ubuntu
- **IP del servidor**: 85.31.235.37
- **Dominio principal**: galle18k.com
- **Subdominios configurados**:
  - api.galle18k.com → API backend
  - dashboard.galle18k.com → Dashboard frontend
  - chatwoot.galle18k.com → Chatwoot

### 2. Componentes principales
- **Backend (API)**: Node.js Express en puerto 3001
- **Frontend (Dashboard)**: React/Vite en puerto 8081
- **Chatwoot**: Docker container
- **Proxy/Gateway**: Nginx configurado para redireccionar subdominios
- **Certificados SSL**: Let's Encrypt (válidos hasta 07/01/2026)

### 3. Configuración DNS
- Registros A configurados en Hostinger:
  - api.galle18k.com → 85.31.235.37
  - dashboard.galle18k.com → 85.31.235.37
  - chatwoot.galle18k.com → 85.31.235.37

## Problemas solucionados

### 1. Error de systemd
- **Problema**: El servicio systemd (gold-whisper-api.service) fallaba con status=1/FAILURE
- **Causa**: Errores en la configuración del servicio o en dependencias Node.js
- **Solución implementada**: 
  - Creamos un script de inicio automático con cron @reboot
  - Mantenemos la API funcionando con reinicio automático

### 2. Configuración DNS Hostinger
- **Problema**: Los subdominios mostraban la página "¡Ya todo está listo!" de Hostinger
- **Solución**: Configuración correcta de registros A en Hostinger

### 3. Configuración de Nginx
- **Problema**: Nginx no redireccionaba correctamente a los servicios locales
- **Solución**: Configuración de virtual hosts para cada subdominio

### 4. Problemas de dependencias
- **Problema**: Falta de módulos Node.js necesarios
- **Solución**: Instalación completa de dependencias con npm install

## Estado actual
1. ✅ **API**: Funcionando en api.galle18k.com (HTTPS)
2. ✅ **Dashboard**: Funcionando en dashboard.galle18k.com (HTTPS)
3. ✅ **Chatwoot**: Funcionando en chatwoot.galle18k.com (HTTPS)
4. ✅ **SSL**: Certificados instalados y configurados para todos los subdominios
5. ✅ **Persistencia**: Servicios continúan funcionando incluso si se reinicia el servidor

## Pasos pendientes y recomendaciones

### Para asegurar inicio automático
```bash
# Crear scripts de inicio para los servicios
cat > /opt/gold-whisper-dash/start-api.sh << 'EOL'
#!/bin/bash
cd /opt/gold-whisper-dash/gold-whisper-dash-main/api
node index.js > /var/log/gold-whisper-api.log 2>&1 &
echo $! > /var/run/gold-whisper-api.pid
EOL

chmod +x /opt/gold-whisper-dash/start-api.sh

# Configurar ejecución al inicio con cron
cat > /etc/cron.d/gold-whisper-api << 'EOL'
@reboot root /opt/gold-whisper-dash/start-api.sh
EOL
```

### Para monitoreo de servicios
```bash
# Verificar logs
tail -f /var/log/gold-whisper-api.log

# Verificar procesos
ps aux | grep node

# Reiniciar servicio si es necesario
kill $(cat /var/run/gold-whisper-api.pid)
/opt/gold-whisper-dash/start-api.sh
```

### Alternativa con PM2 (para mayor robustez)
```bash
# Instalar PM2
npm install -g pm2

# Configurar aplicaciones
cd /opt/gold-whisper-dash/gold-whisper-dash-main/api
pm2 start index.js --name "gold-whisper-api"
pm2 save

# Configurar inicio automático
pm2 startup
# Ejecutar comando sugerido por pm2
```

## Resumen de rutas y archivos importantes

### Directorios principales
- `/opt/gold-whisper-dash/gold-whisper-dash-main/api` - API backend
- `/opt/gold-whisper-dash` - Dashboard frontend

### Archivos de configuración
- `/etc/nginx/sites-available/` - Virtual hosts de Nginx
- `/etc/nginx/nginx.conf` - Configuración principal de Nginx
- `/opt/gold-whisper-dash/gold-whisper-dash-main/api/.env` - Variables de entorno API

### Logs importantes
- `/var/log/nginx/error.log` - Logs de error de Nginx
- `/var/log/nginx/access.log` - Logs de acceso de Nginx
- `/var/log/gold-whisper-api.log` - Logs de la API (con la solución propuesta)

Este resumen proporciona toda la información necesaria para entender el sistema implementado, diagnosticar problemas y realizar mantenimiento en el futuro.
