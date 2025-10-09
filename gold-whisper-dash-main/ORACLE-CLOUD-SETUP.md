# 🏆 ORACLE CLOUD - SETUP COMPLETO PASO A PASO

## ¿POR QUÉ ORACLE CLOUD?

Como experto, esta es MI elección para tu proyecto porque:

✅ **Gratis PARA SIEMPRE** (Always Free Tier confirmado)
✅ **200 GB almacenamiento** - Suficiente para años de crecimiento
✅ **Hasta 24GB RAM** (4 cores ARM) - Más que suficiente
✅ **10 TB transferencia mensual** - Sin preocupaciones
✅ **99.9% uptime** - Confiable para producción
✅ **Control total** - Puedes optimizar todo
✅ **Escalable** - Si creces, puedes pagar por más sin migrar
✅ **IP pública estática** - Tu propia URL permanente
✅ **No se apaga nunca** - Verdadero 24/7

---

## 📋 PARTE 1: CREAR CUENTA EN ORACLE CLOUD (10 minutos)

### Paso 1.1: Registro
1. Ve a: https://www.oracle.com/cloud/free/
2. Haz clic en **"Start for free"**
3. Completa el formulario:
   - **Email**: Tu email
   - **País**: Colombia
   - **Nombre**: Tu nombre completo

### Paso 1.2: Verificación
1. Revisa tu email y verifica la cuenta
2. Completa el perfil:
   - Elige **"Individual/Developer"** como tipo de cuenta
   - **IMPORTANTE**: Selecciona región **"Brazil East (São Paulo)"** (la más cercana a Colombia)

### Paso 1.3: Verificación de tarjeta
- Oracle requiere tarjeta para verificar identidad
- **NO TE COBRARÁN** nada si usas solo Always Free
- Puedes usar tarjeta de débito o crédito
- Solo hacen cargo de $1 USD que devuelven inmediatamente

### Paso 1.4: Acceder al Dashboard
- Después del registro, entrarás al **OCI Console**
- Espera 2-3 minutos para que todo se active

---

## 🖥️ PARTE 2: CREAR SERVIDOR UBUNTU (15 minutos)

### Paso 2.1: Crear instancia
1. En el menú de Oracle Cloud, ve a: **Compute → Instances**
2. Haz clic en **"Create Instance"**

### Paso 2.2: Configuración de la instancia
```
Name: gold-whisper-server

Image and Shape:
- Image: Ubuntu 22.04 (click "Change Image" y selecciona Ubuntu)
- Shape: VM.Standard.E2.1.Micro (Always Free) - 1GB RAM, 1 OCPU
  
  💡 TIP: Si quieres más recursos (GRATIS), puedes elegir:
     VM.Standard.A1.Flex (ARM Ampere)
     - 4 OCPU
     - 24 GB RAM
     - También Always Free!
```

### Paso 2.3: Configurar red
```
Primary VNIC:
- Automatically assign public IPv4 address: ✅ (ACTIVADO)
- Network: Create new Virtual Cloud Network (VCN)
- Subnet: Create new public subnet
```

### Paso 2.4: Generar claves SSH
```
Add SSH keys:
- Selecciona: "Generate a key pair for me"
- Haz clic en: "Save Private Key" (IMPORTANTE: guarda este archivo)
- Haz clic en: "Save Public Key" (también guárdalo)
```

### Paso 2.5: Crear la instancia
- Haz clic en **"Create"**
- Espera 2-3 minutos
- El estado cambiará a: **RUNNING** (verde)

### Paso 2.6: Obtener IP pública
1. En la página de tu instancia, copia la **Public IP Address**
2. **Guárdala** - la necesitarás para todo

Ejemplo: `129.154.xxx.xxx`

---

## 🔐 PARTE 3: CONFIGURAR FIREWALL (5 minutos)

### Paso 3.1: Abrir puertos en Oracle Cloud
1. En tu instancia, ve a: **Subnet Details** (haz clic en el nombre del subnet)
2. Ve a: **Security Lists → Default Security List**
3. Haz clic en: **Add Ingress Rules**

### Paso 3.2: Añadir reglas (una por una)

**Regla 1: HTTP (puerto 80)**
```
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: (dejar vacío)
Destination Port Range: 80
Description: HTTP
```

**Regla 2: HTTPS (puerto 443)**
```
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port Range: 443
Description: HTTPS
```

**Regla 3: Chatwoot (puerto 3000)**
```
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port Range: 3000
Description: Chatwoot
```

**Regla 4: API (puerto 4000)**
```
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port Range: 4000
Description: API
```

**Regla 5: Dashboard (puerto 8081)**
```
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port Range: 8081
Description: Dashboard
```

---

## 💻 PARTE 4: CONECTARSE AL SERVIDOR (5 minutos)

### Opción A: Desde Windows con PowerShell

```powershell
# 1. Abre PowerShell
# 2. Navega donde guardaste la clave privada
cd C:\Users\TU_USUARIO\Downloads

# 3. Conéctate (reemplaza TU-IP con tu IP pública)
ssh -i .\ssh-key-2024-xx-xx.key ubuntu@TU-IP-PUBLICA
```

### Opción B: Usar PuTTY (Windows)

1. Descarga PuTTY: https://www.putty.org/
2. Descarga PuTTYgen para convertir la clave
3. Abre PuTTYgen → Load → Selecciona tu clave → Save private key (formato .ppk)
4. Abre PuTTY:
   - Host: `ubuntu@TU-IP-PUBLICA`
   - Port: 22
   - Connection → SSH → Auth → Browse → Selecciona tu .ppk
   - Open

### Primera vez conectado
```bash
# Te preguntará si confías en la clave, escribe: yes
# Deberías ver algo como:
ubuntu@gold-whisper-server:~$
```

---

## 🔧 PARTE 5: CONFIGURAR EL SERVIDOR (20 minutos)

### Paso 5.1: Configurar firewall en Ubuntu
```bash
# Configurar reglas de firewall en Ubuntu (además de Oracle Cloud)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 4000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8081 -j ACCEPT

# Guardar reglas
sudo netfilter-persistent save
```

### Paso 5.2: Actualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Paso 5.3: Instalar Docker
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER

# Aplicar cambios (importante)
newgrp docker

# Verificar instalación
docker --version
```

### Paso 5.4: Instalar Docker Compose
```bash
sudo apt install docker-compose -y

# Verificar
docker-compose --version
```

### Paso 5.5: Instalar Node.js y PM2
```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Verificar
node --version
npm --version

# Instalar PM2 (process manager)
sudo npm install -g pm2

# Verificar
pm2 --version
```

### Paso 5.6: Instalar Git
```bash
sudo apt install git -y
git --version
```

### Paso 5.7: Instalar Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📦 PARTE 6: CLONAR Y CONFIGURAR TU PROYECTO (10 minutos)

### Paso 6.1: Clonar repositorio
```bash
# Si aún no has subido a GitHub, primero súbelo desde tu PC:
# En tu PC:
cd "c:\Users\USUARIO\Downloads\gold-whisper-dash-main nuevo2.0\gold-whisper-dash-main"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU-USUARIO/gold-whisper-dashboard.git
git push -u origin main

# En el servidor Oracle:
cd ~
git clone https://github.com/TU-USUARIO/gold-whisper-dashboard.git
cd gold-whisper-dashboard
```

### Paso 6.2: Configurar Docker Compose para Chatwoot
```bash
cd gold-whisper-dash-main

# Editar docker-compose.yml
nano docker-compose.yml
```

**Actualizar estas líneas:**
```yaml
FRONTEND_URL: http://TU-IP-PUBLICA:3000
# Reemplaza TU-IP-PUBLICA con tu IP real
```

Guardar: `Ctrl+X`, luego `Y`, luego `Enter`

### Paso 6.3: Levantar Chatwoot
```bash
docker-compose up -d

# Ver logs (espera 2-3 minutos para que inicie)
docker-compose logs -f chatwoot
# Ctrl+C para salir de los logs
```

### Paso 6.4: Configurar la API
```bash
cd api

# Instalar dependencias
npm install

# Crear archivo .env
nano .env
```

**Contenido del .env:**
```env
PORT=4000
NODE_ENV=production
CHATWOOT_URL=http://localhost:3020
CHATWOOT_API_TOKEN=TU_TOKEN_AQUI
CHATWOOT_ACCOUNT_ID=1
FRONTEND_URL=http://TU-IP-PUBLICA:8081
ALLOWED_ORIGINS=http://TU-IP-PUBLICA:8081,http://TU-IP-PUBLICA
```

Guardar: `Ctrl+X`, luego `Y`, luego `Enter`

### Paso 6.5: Iniciar API con PM2
```bash
pm2 start chatwoot.js --name api
pm2 save
pm2 startup
# Copia y ejecuta el comando que te muestra
```

### Paso 6.6: Build y servir Dashboard
```bash
cd ~/gold-whisper-dashboard/gold-whisper-dash-main

# Crear .env.production
nano .env.production
```

**Contenido:**
```env
VITE_SUPABASE_URL=https://dcnmswdvvgpqofxoyjop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjbm1zd2R2dmdwcW9meG95am9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5MjI3ODYsImV4cCI6MjA0MzQ5ODc4Nn0.mq7V9Hh79PRdqGg9d--HRExG2CvGlywVWRWQUiYTsD0

VITE_CHATWOOT_URL=http://TU-IP-PUBLICA:4000
VITE_CHATWOOT_ACCOUNT_ID=1
VITE_CHATWOOT_USER_TOKEN=TU_TOKEN_CHATWOOT

VITE_META_BUSINESS_ID=1067806144007153
VITE_META_ACCESS_TOKEN=EAAC4zHE6iMYBPt67m4GY5ML3mWCGeBPiO6N6i6i751ZCOfdSSytbfrXnQ6mRcZBHhJXZBmZCWmgZB4V9Ws4oBpQTTMO6zequoZBNBRuXgHGggZCMNWAaMB3L2ubFyBieDeMj5WLP01AZB04Q7vC0DOs1SGkUUszktaBiXcVKapvGwXwotsTyy0MHZA1I52fZB4Rv4DVQZDZD
VITE_META_AD_ACCOUNT_IDS=360084149294973,5518735214914409
VITE_META_AD_ACCOUNT_NAMES=orolaminado18kcucuta,GALLE 18K DETAL
VITE_META_AD_ACCOUNT_ID=360084149294973
VITE_META_AD_ACCOUNT_NAME=orolaminado18kcucuta
```

**Build:**
```bash
npm install
npm run build

# Servir con PM2
pm2 serve dist 8081 --name dashboard --spa
pm2 save
```

---

## ✅ PARTE 7: VERIFICACIÓN (5 minutos)

### Verificar que todo esté corriendo:
```bash
pm2 list
# Deberías ver: api y dashboard (status: online)

docker ps
# Deberías ver: chatwoot, postgres, redis, sidekiq (status: Up)
```

### Probar acceso desde tu navegador:

1. **Chatwoot**: `http://TU-IP-PUBLICA:3000`
2. **API**: `http://TU-IP-PUBLICA:4000/health`
3. **Dashboard**: `http://TU-IP-PUBLICA:8081`

---

## 🔒 PARTE 8: CONFIGURAR DOMINIO (OPCIONAL - 10 minutos)

Si tienes un dominio (ej: tudominio.com):

### En tu proveedor de dominio:
```
Añade estos registros DNS:

A Record:
- Name: @ (o tudominio.com)
- Value: TU-IP-PUBLICA

A Record:
- Name: www
- Value: TU-IP-PUBLICA

A Record:
- Name: api
- Value: TU-IP-PUBLICA

A Record:
- Name: chatwoot
- Value: TU-IP-PUBLICA
```

### Configurar Nginx con dominio:
```bash
sudo nano /etc/nginx/sites-available/default
```

**Contenido:**
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name chatwoot.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔐 PARTE 9: SSL/HTTPS CON CERTBOT (OPCIONAL - 5 minutos)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL (GRATIS)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com -d api.tudominio.com -d chatwoot.tudominio.com

# Renovación automática ya está configurada
```

---

## 📊 MONITOREO Y MANTENIMIENTO

### Ver estado de servicios:
```bash
pm2 status                    # API y Dashboard
docker-compose ps             # Chatwoot
sudo systemctl status nginx   # Nginx
```

### Ver logs:
```bash
pm2 logs api              # Logs de API
pm2 logs dashboard        # Logs de Dashboard
docker-compose logs -f    # Logs de Chatwoot
sudo tail -f /var/log/nginx/error.log  # Nginx errors
```

### Reiniciar servicios:
```bash
pm2 restart all
docker-compose restart
sudo systemctl restart nginx
```

### Actualizar aplicación:
```bash
cd ~/gold-whisper-dashboard
git pull
cd gold-whisper-dash-main
npm run build
pm2 restart dashboard
```

---

## 💾 BACKUPS AUTOMÁTICOS

```bash
# Crear script de backup
nano ~/backup.sh
```

**Contenido:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups/$DATE

mkdir -p $BACKUP_DIR

# Backup de PostgreSQL
docker exec gold-whisper-dash-main-postgres-1 pg_dump -U chatwoot chatwoot_production > $BACKUP_DIR/chatwoot_db.sql

# Backup de código
cp -r ~/gold-whisper-dashboard $BACKUP_DIR/

echo "Backup completed: $BACKUP_DIR"
```

```bash
chmod +x ~/backup.sh

# Programar backup diario a las 3 AM
crontab -e
# Añade esta línea:
0 3 * * * ~/backup.sh
```

---

## 🎉 ¡COMPLETADO!

### URLs finales:
- **Dashboard**: http://TU-IP-PUBLICA:8081
- **Chatwoot**: http://TU-IP-PUBLICA:3000
- **API**: http://TU-IP-PUBLICA:4000

### Beneficios alcanzados:
✅ Funcionando 24/7 sin apagar nunca
✅ 100% GRATIS permanentemente
✅ 200GB almacenamiento para crecer
✅ Control total del servidor
✅ Backups configurados
✅ Monitoreo en tiempo real
✅ Escalable cuando necesites

**¡Tu aplicación profesional está en producción GRATIS para siempre!** 🚀
