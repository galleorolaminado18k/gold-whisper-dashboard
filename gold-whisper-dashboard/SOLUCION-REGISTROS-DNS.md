# 🔧 Solución para Registros DNS en Hostinger

## Problema Identificado

Según la pantalla que muestras, el problema parece ser que Hostinger está rechazando la dirección IP que intentas ingresar con un mensaje de validación: **"El valor debe ser una dirección IPv4 válida"**. 

## Soluciones Paso a Paso

### Solución 1: Formato de IP correcto
Asegúrate de que no haya espacios extras o caracteres invisibles al copiar la IP. Intenta escribirla manualmente:

```
85.31.235.37
```

### Solución 2: Editor de Zona DNS Avanzado
En lugar de usar la interfaz gráfica, intenta usar el editor de zona DNS avanzado:

1. Ve a Hostinger > Dominio > galle18k.com
2. Busca "Zona DNS" o "Editor avanzado de DNS"
3. Añade manualmente las líneas:
   ```
   dashboard  14400  IN  A  85.31.235.37
   api        14400  IN  A  85.31.235.37
   chatwoot   14400  IN  A  85.31.235.37
   ```

### Solución 3: Usar registros CNAME (alternativa)

Si los registros A siguen dando problemas, puedes usar registros CNAME:

1. Crea un registro A principal para un subdominio (por ejemplo, `vps.galle18k.com`)
   ```
   Tipo: A
   Nombre: vps
   Valor: 85.31.235.37
   TTL: 14400
   ```

2. Luego crea los subdominios como registros CNAME apuntando al registro A:
   ```
   Tipo: CNAME
   Nombre: dashboard
   Valor: vps.galle18k.com
   TTL: 14400
   ```

   ```
   Tipo: CNAME
   Nombre: api
   Valor: vps.galle18k.com
   TTL: 14400
   ```

   ```
   Tipo: CNAME
   Nombre: chatwoot
   Valor: vps.galle18k.com
   TTL: 14400
   ```

### Solución 4: Desactivación temporal de protección DDOS

En algunos paneles de hosting, hay protecciones contra DDOS que pueden limitar la creación de múltiples registros hacia la misma IP:

1. Busca en la sección "Seguridad" o "Protección" del panel
2. Desactiva temporalmente opciones como "Protección DDOS"
3. Añade tus registros DNS
4. Vuelve a activar la protección

### Solución 5: Soporte técnico

Si nada de lo anterior funciona:
1. Contacta al soporte técnico de Hostinger por chat
2. Explica que necesitas crear varios subdominios que apunten a la misma dirección IP
3. Pide que desactiven cualquier validación que esté impidiendo esto

## Verificación

Una vez añadidos los registros, puedes verificarlos con:

```bash
dig dashboard.galle18k.com
dig api.galle18k.com
dig chatwoot.galle18k.com
```

## Siguiente paso después de configurar DNS

Después de resolver los registros DNS, continúa con la configuración de SSL en tu VPS:

```bash
ssh root@85.31.235.37
certbot --nginx -d dashboard.galle18k.com -d api.galle18k.com -d chatwoot.galle18k.com
```

Recuerda que la propagación DNS puede tardar hasta 24 horas, pero normalmente ocurre en menos de una hora.
