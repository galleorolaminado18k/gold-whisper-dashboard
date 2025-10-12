# Configuración Final Chatwoot 24/7

## Resumen del Despliegue Completo

Hemos logrado establecer una infraestructura completa con disponibilidad 24/7 para Gold Whisper, que incluye:

1. ✅ **API** - Funcionando en api.galle18k.com
2. ✅ **Dashboard** - Funcionando en dashboard.galle18k.com 
3. ✅ **Chatwoot** - Funcionando en chatwoot.galle18k.com

Todos los servicios están configurados con HTTPS y permanecerán activos incluso cuando el PC local esté apagado, gracias al despliegue en el VPS de Hostinger.

## Configuración específica para Chatwoot

A continuación, los pasos recomendados para garantizar que Chatwoot permanezca funcionando 24/7:

### 1. Verificar que Docker está configurado para iniciar automáticamente

```bash
# Verificar que Docker inicia automáticamente
systemctl is-enabled docker

# Si no está habilitado, habilitarlo
systemctl enable docker
```

### 2. Configurar Docker Compose para reinicio automático

Edita el archivo docker-compose.yml para Chatwoot para asegurar que tiene la configuración `restart: always`:

```bash
cd /opt/gold-whisper-dash/gold-whisper-dash-main
nano docker-compose.yml
```

Asegúrate de que los servicios de Chatwoot tienen la siguiente configuración:

```yaml
services:
  chatwoot:
    image: chatwoot/chatwoot:latest
    restart: always
    # Resto de la configuración...
```

### 3. Crear script de inicio automático para Chatwoot

```bash
cat > /opt/gold-whisper-dash/start-chatwoot.sh << 'EOL'
#!/bin/bash
cd /opt/gold-whisper-dash/gold-whisper-dash-main
docker-compose up -d
EOL

chmod +x /opt/gold-whisper-dash/start-chatwoot.sh
```

### 4. Configurar ejecución del script al inicio del sistema

```bash
cat > /etc/cron.d/gold-whisper-chatwoot << 'EOL'
@reboot root /opt/gold-whisper-dash/start-chatwoot.sh
EOL
```

### 5. Monitoreo de Chatwoot

Para verificar el estado de Chatwoot:

```bash
# Ver logs de Chatwoot
cd /opt/gold-whisper-dash/gold-whisper-dash-main
docker-compose logs -f chatwoot

# Verificar si los contenedores están funcionando
docker ps | grep chatwoot

# Reiniciar Chatwoot si es necesario
docker-compose restart chatwoot
```

## Comandos de mantenimiento para todos los servicios

Para un mantenimiento efectivo del sistema completo:

### Reinicio completo de los servicios

```bash
# Reiniciar API
kill $(cat /var/run/gold-whisper-api.pid)
/opt/gold-whisper-dash/start-api.sh

# Reiniciar Dashboard
kill $(cat /var/run/gold-whisper-dashboard.pid)
/opt/gold-whisper-dash/start-dashboard.sh

# Reiniciar Chatwoot
cd /opt/gold-whisper-dash/gold-whisper-dash-main
docker-compose down
docker-compose up -d
```

### Verificación de estado general

```bash
# Estado de Nginx
systemctl status nginx

# Verificar puertos en uso
netstat -tuln | grep -E '3001|8081|80|443'

# Verificar procesos Node.js
ps aux | grep node

# Verificar contenedores Docker
docker ps

# Verificar logs de Nginx
tail -f /var/log/nginx/error.log
```

## Plan de actualización y backup

Para mantener el sistema actualizado y seguro:

1. **Backup regular**:
   ```bash
   # Backup de configuraciones
   mkdir -p /opt/backups/$(date +%Y%m%d)
   cp -r /etc/nginx/sites-available /opt/backups/$(date +%Y%m%d)/
   cp /opt/gold-whisper-dash/gold-whisper-dash-main/api/.env /opt/backups/$(date +%Y%m%d)/
   cp /opt/gold-whisper-dash/gold-whisper-dash-main/docker-compose.yml /opt/backups/$(date +%Y%m%d)/
   ```

2. **Actualización de Chatwoot**:
   ```bash
   cd /opt/gold-whisper-dash/gold-whisper-dash-main
   docker-compose pull
   docker-compose down
   docker-compose up -d
   ```

## Resolución de problemas comunes

### Si Chatwoot no se inicia correctamente:

1. Verificar logs:
   ```bash
   docker-compose logs -f chatwoot
   ```

2. Verificar configuraciones:
   ```bash
   cat /opt/gold-whisper-dash/gold-whisper-dash-main/.env
   ```

3. Reiniciar contenedores:
   ```bash
   docker-compose down
   docker system prune -f  # Eliminar recursos no utilizados
   docker-compose up -d
   ```

### Si Nginx muestra error:

```bash
# Verificar sintaxis
nginx -t

# Reiniciar servicio
systemctl restart nginx
```

Con esta configuración, todos los componentes (API, Dashboard y Chatwoot) permanecerán funcionando 24/7, incluso después de reinicios del servidor, con el mínimo mantenimiento requerido.
