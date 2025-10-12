# 🚀 Configuración Final de DNS para los Subdominios

¡Excelente! Veo que has creado correctamente los subdominios en Hostinger. Ahora necesitamos asegurarnos de que los registros DNS estén configurados correctamente.

## Registros DNS actuales (según las imágenes)

Actualmente parece que tienes varios registros para los subdominios:

1. **dashboard.galle18k.com**:
   - Un registro ALIAS apuntando a dashboard.galle18k.com.cdn.hstgr.net

2. **api.galle18k.com**:
   - Un registro A apuntando a 85.31.235.37
   - Un registro A apuntando a 82.29.87.3

3. **chatwoot.galle18k.com**:
   - Un registro A apuntando a 2a02:4780:b:666:0:1dc8:51e9:2
   - Un registro A apuntando a 82.29.87.3

## Correcciones necesarias

Para que todo funcione correctamente con tu VPS, necesitamos que cada subdominio tenga un registro A apuntando a 85.31.235.37.

### 1. Editar o agregar registros DNS

Elimina o edita los registros existentes para que queden así:

| Nombre      | Tipo | Contenido    | TTL   |
|-------------|------|--------------|-------|
| dashboard   | A    | 85.31.235.37 | 14400 |
| api         | A    | 85.31.235.37 | 14400 |
| chatwoot    | A    | 85.31.235.37 | 14400 |

Para cada subdominio:
1. Haz clic en "Editar" (o agrega un nuevo registro si es necesario)
2. Selecciona el tipo "A"
3. En el campo "Contenido" o "Apunta a", ingresa: 85.31.235.37
4. Guarda los cambios

### 2. Eliminar registros innecesarios o conflictivos

Si hay registros duplicados o que apuntan a otras direcciones (como 82.29.87.3), deberías eliminarlos para evitar conflictos.

## Configuración en el servidor VPS

Después de configurar correctamente los DNS, necesitas configurar Nginx en tu servidor. Recuerda ejecutar estos comandos:

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

## Verificación

Una vez completados todos los pasos, visita en tu navegador:
- dashboard.galle18k.com
- api.galle18k.com
- chatwoot.galle18k.com

La propagación de los cambios DNS puede tardar hasta 24 horas, pero generalmente ocurre en menos de una hora.
