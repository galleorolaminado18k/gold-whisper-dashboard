# ⚙️ Configuración Automática de Chatwoot

## 🚀 Para Mantener Chatwoot Siempre Activo

### Paso 1: Configurar Docker Desktop para Inicio Automático

1. **Abrir Docker Desktop**
2. **Ir a Settings** (⚙️ en la esquina superior derecha)
3. **En la sección General:**
   - ✅ Activar: **"Start Docker Desktop when you log in"**
   - ✅ Activar: **"Use Docker Compose V2"**
4. **En la sección Resources:**
   - Asignar al menos 4 GB de RAM
   - Asignar al menos 2 CPUs
5. **Aplicar y Reiniciar**

### Paso 2: Configurar Arranque Automático de los Contenedores

El `docker-compose.yml` ya tiene configurado `restart: always` en todos los servicios, lo que significa que:

✅ Los contenedores se reiniciarán automáticamente si se detienen
✅ Los contenedores se iniciarán automáticamente cuando Docker Desktop se inicie
✅ Los contenedores sobrevivirán a reinicios del PC

### Paso 3: Solucionar Error Actual de Chatwoot

El error actual es que la imagen de Chatwoot no puede encontrar `/bin/bash`. Opciones:

#### Opción A: Actualizar la imagen de Chatwoot

```bash
cd gold-whisper-dash-main
docker-compose pull
docker-compose down -v
docker-compose up -d
```

#### Opción B: Modificar el entrypoint en docker-compose.yml

Cambiar la línea:
```yaml
entrypoint: ["/bin/bash", "-lc"]
```

Por:
```yaml
entrypoint: ["/bin/sh", "-c"]
```

#### Opción C: Usar una versión específica estable

En `docker-compose.yml`, cambiar:
```yaml
image: chatwoot/chatwoot:latest
```

Por:
```yaml
image: chatwoot/chatwoot:v3.0.0
```

### Paso 4: Verificar que Todo Está Activo

```bash
# Ver estado de los contenedores
cd gold-whisper-dash-main
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver solo logs de Chatwoot
docker-compose logs -f chatwoot
```

### Paso 5: Acceso a Chatwoot

Una vez que los contenedores estén corriendo:
- **URL**: http://localhost:3020
- **Configuración inicial**: Crear cuenta de administrador en primer acceso

## 🔄 Comandos Útiles

```bash
# Reiniciar todos los servicios
docker-compose restart

# Detener todos los servicios
docker-compose stop

# Iniciar todos los servicios
docker-compose start

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Limpiar y reiniciar desde cero (CUIDADO: Borra la BD)
docker-compose down -v
docker-compose up -d
```

## 🖥️ Configuración para Inicio Automático en Windows

### Método 1: Crear Tarea Programada (Task Scheduler)

1. Presiona `Win + R`, escribe `taskschd.msc` y presiona Enter
2. Clic en "Crear tarea básica"
3. Nombre: "Iniciar Chatwoot"
4. Trigger: "Al iniciar el equipo"
5. Acción: "Iniciar programa"
6. Programa: `C:\Program Files\Docker\Docker\Docker Desktop.exe`
7. Guardar

### Método 2: Script de Inicio Automático

Crear archivo `iniciar-chatwoot.bat`:

```batch
@echo off
echo Iniciando Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Esperando a que Docker Desktop inicie...
timeout /t 30 /nobreak

echo Iniciando servicios de Chatwoot...
cd /d "C:\Users\USUARIO\Downloads\gold-whisper-dash-main nuevo2.0\gold-whisper-dash-main"
docker-compose up -d

echo Chatwoot iniciado!
pause
```

**Para que se ejecute al iniciar Windows:**
1. Presiona `Win + R`
2. Escribe `shell:startup`
3. Copia el archivo `.bat` en esa carpeta

## ✅ Verificación de Configuración Automática

Para verificar que todo está configurado correctamente:

1. Reinicia tu PC
2. Docker Desktop debería iniciarse automáticamente
3. Los contenedores de Chatwoot deberían iniciarse automáticamente
4. Ve a http://localhost:3020 y verifica que Chatwoot esté funcionando

## 🔒 Nota Importante Sobre PC Apagado

⚠️ **IMPORTANTE**: Una aplicación web NO puede funcionar si el PC está apagado.

Para tener acceso 24/7 desde cualquier lugar, necesitas:

### Opción 1: Mantener el PC Siempre Encendido
- Configurar plan de energía para que nunca se apague
- Desactivar suspensión automática
- ✅ Con esta configuración, Chatwoot estará siempre disponible

### Opción 2: Servidor en la Nube (Recomendado para Producción)
- Desplegar en un VPS (DigitalOcean, AWS, Google Cloud, etc.)
- Costos desde $5-10 USD/mes
- Acceso 24/7 garantizado desde cualquier lugar
- Mayor seguridad y respaldos automáticos

### Opción 3: PC como Servidor Local
- Dejar el PC encendido 24/7
- Configurar IP estática
- Configurar port forwarding en el router (puerto 3020)
- ⚠️ Considerar costos de electricidad

## 📊 Monitoreo

Para monitorear que Chatwoot esté siempre activo:

```bash
# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f chatwoot

# Verificar que los contenedores estén corriendo
docker-compose ps
```

## 🆘 Solución de Problemas

### Si los contenedores no inician al reiniciar el PC:

1. Verificar que Docker Desktop esté configurado para inicio automático
2. Verificar que los servicios tengan `restart: always` en docker-compose.yml
3. Verificar los logs: `docker-compose logs`

### Si Chatwoot no responde:

```bash
# Reiniciar servicios
cd gold-whisper-dash-main
docker-compose restart

# Si el problema persiste, recrear contenedores
docker-compose down
docker-compose up -d
```

### Si hay errores de base de datos:

```bash
# Limpiar y reiniciar (CUIDADO: Borra la BD)
docker-compose down -v
docker-compose up -d
```

## 📝 Resumen

1. ✅ Docker Desktop configurado para inicio automático
2. ✅ `restart: always` en docker-compose.yml
3. ✅ Contenedores se reinician automáticamente
4. ✅ PC debe estar encendido para que funcione
5. ✅ Para acceso 24/7 real, considerar servidor en la nube
