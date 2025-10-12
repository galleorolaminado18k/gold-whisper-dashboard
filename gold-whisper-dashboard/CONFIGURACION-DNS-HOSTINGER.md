# 🌐 Configuración de DNS en Hostinger para Múltiples Subdominios

## Problema: Error "El registro ya existe"

Si estás viendo el mensaje "El registro ya existe" al intentar agregar múltiples subdominios que apuntan a la misma IP, puede deberse a la **protección de proxy** de Cloudflare o configuraciones similares que están activadas.

## Solución: Desactivar Proxy/Protección de Cloudflare

### Opción 1: Si estás utilizando Cloudflare

1. Inicia sesión en tu cuenta de Cloudflare
2. Selecciona tu dominio (galle18k.com)
3. Ve a la sección "DNS"
4. Busca el registro existente (probablemente para el dominio principal o www)
5. Desactiva la opción "Proxy" (nubes naranjas) para que aparezcan como "DNS only" (nubes grises)
6. Guarda los cambios

### Opción 2: En Hostinger (si tienes Cloudflare integrado)

1. En el panel de Hostinger, ve a la sección "Dominios"
2. Selecciona tu dominio (galle18k.com)
3. Busca la opción "Cloudflare" o "Protección"
4. Desactiva temporalmente la opción "Proxy" o "Protección" 
5. Algunos paneles tienen una casilla específica que dice "Permitir múltiples registros con la misma IP"

### Opción 3: Eliminar registros existentes que causan conflicto

Si tienes registros comodín (wildcard) como `*.galle18k.com` o registros que pueden estar interfiriendo:

1. Identifica y elimina temporalmente el registro que causa el conflicto
2. Agrega tus nuevos subdominios específicos
3. Luego puedes restaurar el registro eliminado si es necesario

## Pasos para Configurar Correctamente los Subdominios

1. **Asegúrate de que la opción proxy/protección está desactivada** (como se explicó arriba)

2. **Agrega los registros uno por uno:**

   | Tipo | Nombre | Valor | TTL |
   |------|--------|-------|-----|
   | A    | dashboard | 85.31.235.37 | 14400 |
   | A    | api | 85.31.235.37 | 14400 |
   | A    | chatwoot | 85.31.235.37 | 14400 |

3. **Si sigues teniendo problemas**, intenta estos métodos alternativos:

   a) **Usa el editor de zona DNS avanzado** (si está disponible):
   - En algunos paneles, puedes editar directamente el archivo de zona DNS
   - Agrega estas líneas:
   ```
   dashboard  14400  IN  A  85.31.235.37
   api        14400  IN  A  85.31.235.37
   chatwoot   14400  IN  A  85.31.235.37
   ```

   b) **Contacta al soporte de Hostinger** y pide que desactiven la restricción que impide tener múltiples subdominios apuntando a la misma IP.

## Verificación

Después de configurar los registros DNS, puedes verificar si están funcionando correctamente:

```bash
dig dashboard.galle18k.com
dig api.galle18k.com
dig chatwoot.galle18k.com
```

O usando herramientas web como [DNSChecker](https://dnschecker.org).

## Importante: Reactivar la Protección

Una vez que hayas configurado todos tus subdominios, puedes volver a activar la protección de Cloudflare u otras características de seguridad que hayas desactivado.

Si decides mantener la protección de Cloudflare activada, asegúrate de:

1. Configurar correctamente las reglas de Cloudflare para permitir WebSockets (necesarios para algunas funcionalidades del dashboard)
2. Configurar los certificados SSL en Cloudflare (no necesitarás configurarlos en tu VPS si usas Cloudflare para SSL)
