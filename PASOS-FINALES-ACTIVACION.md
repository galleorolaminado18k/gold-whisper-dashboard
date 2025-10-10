# ✅ Pasos Finales para Activar el Servicio 24/7

Buenas noticias! Después de analizar tu servidor, veo que:

1. ✅ La configuración de Nginx está correctamente instalada
2. ✅ Los dominios están correctamente configurados
3. ✅ Nginx está activo y funcionando
4. ❌ Solo falta iniciar las aplicaciones en los puertos correctos

## Lo que hay que hacer ahora (copiar y pegar estos comandos en el servidor)

Necesitamos iniciar tus aplicaciones en los puertos correctos para que Nginx pueda redirigir el tráfico. Copia estos comandos uno por uno en tu terminal SSH (donde estás conectado al servidor):

### 1. Iniciar el Dashboard en el puerto 8081

```bash
cd /opt/gold-whisper-dash
nohup npm run dev -- --port 8081 > dashboard.log 2>&1 &
echo "Dashboard iniciado en puerto 8081"
```

### 2. Iniciar la API en el puerto 3001

```bash
cd /opt/gold-whisper-dash/api
nohup node index.js > api.log 2>&1 &
echo "API iniciada en puerto 3001"
```

### 3. Comprobar que las aplicaciones estén ejecutándose

```bash
ss -tulpn | grep -E ':(8081|3001|3020)'
ps aux | grep -E 'npm|node'
```

### 4. Hacer que las aplicaciones inicien automáticamente cuando reinicies el servidor

```bash
cat > /etc/systemd/system/gold-whisper-dashboard.service << 'EOL'
[Unit]
Description=Gold Whisper Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gold-whisper-dash
ExecStart=/usr/bin/npm run dev -- --port 8081
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOL

cat > /etc/systemd/system/gold-whisper-api.service << 'EOL'
[Unit]
Description=Gold Whisper API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gold-whisper-dash/api
ExecStart=/usr/bin/node index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl enable gold-whisper-dashboard.service
systemctl enable gold-whisper-api.service
echo "Servicios configurados para iniciar automáticamente"
```

## Verificar que todo funcione

Una vez que hayas ejecutado todos los comandos:

1. Verifica que los puertos estén activos: `ss -tulpn | grep -E ':(8081|3001|3020)'`
2. Espera unos minutos para que los cambios de DNS se propaguen (esto puede tardar hasta 24 horas)
3. Visita estos sitios en tu navegador:
   - dashboard.galle18k.com
   - api.galle18k.com
   - chatwoot.galle18k.com

## Solución de problemas comunes

Si alguna de las aplicaciones no inicia correctamente:

1. Verifica los registros: `cat /opt/gold-whisper-dash/dashboard.log` o `cat /opt/gold-whisper-dash/api/api.log`
2. Reinicia los servicios: `systemctl restart gold-whisper-dashboard.service` o `systemctl restart gold-whisper-api.service`
3. Verifica el estado: `systemctl status gold-whisper-dashboard.service` o `systemctl status gold-whisper-api.service`

## Información sobre tu configuración

- Tu servidor Nginx está correctamente configurado para los subdominios
- El servicio n8n está corriendo en el puerto 5678
- Los enlaces simbólicos están correctamente configurados
- Tu servidor tiene estos servicios configurados:
  - gold-whisper.conf (tus aplicaciones)
  - miapp
  - n8n (audio.galle18k.com)
  - silvana
