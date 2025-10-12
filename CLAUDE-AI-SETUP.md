# 🤖 Configuración de Claude AI - Integración con Anthropic

## 📋 Descripción General

Este documento describe la integración de Claude AI (Anthropic) en el dashboard de Gold Whisper para mejorar la clasificación inteligente de conversaciones y análisis automático de mensajes de clientes.

## 🎯 Características

### Clasificación Inteligente
- **Clasificación automática de conversaciones**: Usa IA para determinar automáticamente en qué etapa del embudo de ventas se encuentra cada conversación
- **Fallback automático**: Si Claude no está disponible, el sistema usa clasificación basada en reglas
- **5 etapas soportadas**:
  - `por_contestar` - Cliente esperando respuesta
  - `pendiente_datos` - Recopilando información del cliente
  - `por_confirmar` - Esperando confirmación del pedido
  - `pendiente_guia` - Generando guía de envío
  - `pedido_completo` - Pedido completado

### Análisis Adicional
- **Análisis de sentimiento**: Detecta si el cliente está positivo, neutral o negativo
- **Categorización de productos**: Identifica si el interés es en balinería o joyería
- **Resúmenes automáticos**: Genera resúmenes concisos de conversaciones largas

## 🔧 Configuración

### 1. Obtener API Key de Anthropic

1. Visita [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Inicia sesión o crea una cuenta
3. Genera una nueva API key
4. Copia la clave (empieza con `sk-ant-api03-...`)

### 2. Configurar Variables de Entorno

Edita tu archivo `.env.local` (o crea uno basado en `.env.local.example`):

```env
# Claude AI Configuration
VITE_CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
VITE_CLAUDE_MODEL=claude-3-5-sonnet-20241022
VITE_CLAUDE_ENABLED=true
```

### 3. Configurar desde la Interfaz

1. Ve a **Configuración** en el menú lateral
2. Selecciona la pestaña **Inteligencia Artificial**
3. Ingresa tu API key
4. Haz clic en **Probar** para validar la conexión
5. Activa el switch **Habilitar Claude AI**
6. Guarda la configuración

## 📁 Archivos Modificados/Creados

### Nuevos Archivos

- **`src/lib/claude.ts`**: Servicio principal para integración con Claude AI
  - Configuración y validación de API key
  - Funciones para clasificación y análisis
  - Manejo de errores y fallbacks

- **`.env.local.example`**: Plantilla de configuración
  - Variables de entorno documentadas
  - Valores de ejemplo

- **`CLAUDE-AI-SETUP.md`**: Esta documentación

### Archivos Modificados

- **`src/pages/Settings.tsx`**: Página de configuración completamente rediseñada
  - UI moderna con tabs
  - Formulario de configuración de Claude AI
  - Validación en tiempo real de API key
  - Indicadores de estado

- **`src/lib/classifier.ts`**: Clasificador mejorado
  - Nueva función `classifyStageWithAI()` para clasificación con IA
  - Integración con Claude AI
  - Fallback automático a reglas si Claude no está disponible

- **`.env.production`**: Variables de producción
  - Añadidas variables de Claude AI (vacías por defecto)

## 🔒 Seguridad

### Mejores Prácticas Implementadas

✅ **API Key nunca en el código fuente**: Se usa variables de entorno  
✅ **Input con tipo password**: La API key se oculta por defecto  
✅ **Toggle para mostrar/ocultar**: Control manual de visibilidad  
✅ **Validación antes de usar**: Prueba la API key antes de activar  
✅ **Fallback seguro**: Sistema sigue funcionando sin Claude  

### ⚠️ Importante

- **NO commitees** tu `.env.local` al repositorio
- **NO compartas** tu API key públicamente
- **Rota** tu API key si se compromete
- En producción, usa variables de entorno del hosting (Vercel, Netlify, etc.)

## 💰 Costos

### Modelo Recomendado: Claude 3.5 Sonnet

- **Costo de entrada**: $3 por millón de tokens (~750K palabras)
- **Costo de salida**: $15 por millón de tokens
- **Caso de uso**: Clasificación de conversaciones
  - Conversación típica: ~200 tokens entrada + 10 tokens salida
  - Costo aproximado: $0.0006-0.001 por clasificación
  - 1,000 clasificaciones: ~$0.60-1.00

### Optimización de Costos

1. **Caché inteligente**: No reclasificar conversaciones ya procesadas
2. **Clasificación por lotes**: Procesar múltiples conversaciones a la vez
3. **Fallback a reglas**: Usar reglas simples cuando sea posible
4. **Límites de uso**: Configurar límites en Anthropic Console

## 🧪 Pruebas

### Probar la Integración

1. **Desde la UI de Configuración**:
   - Ve a Configuración → Inteligencia Artificial
   - Ingresa tu API key
   - Haz clic en "Probar"
   - Verifica que aparezca "✅ API Key Válida"

2. **Probar Clasificación (Consola del Navegador)**:
   ```javascript
   import { classifyStageWithAI } from '@/lib/classifier';
   
   const messages = [
     { content: "Hola, me interesa un balín de oro" },
     { content: "Claro! Te puedo ayudar. ¿De cuántos gramos lo buscas?" }
   ];
   
   const stage = await classifyStageWithAI(messages);
   console.log('Etapa:', stage);
   ```

### Casos de Prueba

| Conversación | Etapa Esperada |
|--------------|----------------|
| Cliente pregunta y no hay respuesta | `por_contestar` |
| Vendedor pide nombre y dirección | `pendiente_datos` |
| Vendedor envía resumen del pedido | `por_confirmar` |
| Cliente confirmó pago | `pendiente_guia` |
| Vendedor envió guía #123456 | `pedido_completo` |

## 🚀 Uso en Producción

### Configuración en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade las siguientes variables:
   ```
   VITE_CLAUDE_API_KEY = sk-ant-api03-xxxxx
   VITE_CLAUDE_MODEL = claude-3-5-sonnet-20241022
   VITE_CLAUDE_ENABLED = true
   ```
4. Redeploy el proyecto

### Configuración en Netlify

1. Site settings → Environment variables
2. Añade las mismas variables que en Vercel
3. Redeploy el sitio

## 📊 Monitoreo

### Logs y Debugging

- Los errores de Claude se registran en la consola del navegador
- El sistema cae automáticamente a clasificación por reglas si falla
- Usa las herramientas de desarrollo del navegador para ver las llamadas a la API

### Métricas Recomendadas

- Tasa de éxito de llamadas a Claude
- Tiempo de respuesta promedio
- Comparación de precisión: Claude vs Reglas
- Costos acumulados (revisar en Anthropic Console)

## 🔄 Roadmap Futuro

### Mejoras Planeadas

- [ ] Caché de clasificaciones para reducir costos
- [ ] Procesamiento por lotes de múltiples conversaciones
- [ ] Entrenamiento con ejemplos específicos del negocio
- [ ] Integración con análisis de sentimiento en tiempo real
- [ ] Dashboard de métricas de uso de Claude
- [ ] Configuración de límites de uso por día/mes
- [ ] Soporte para otros modelos de IA (GPT-4, etc.)

## 📞 Soporte

Si tienes problemas con la integración:

1. **Verifica la configuración**: Revisa que las variables de entorno estén correctas
2. **Prueba la API key**: Usa el botón "Probar" en Configuración
3. **Revisa los logs**: Abre la consola del navegador (F12)
4. **Fallback activo**: El sistema debe seguir funcionando con reglas

## 📚 Referencias

- [Documentación de Claude API](https://docs.anthropic.com/)
- [Console de Anthropic](https://console.anthropic.com/)
- [Pricing de Claude](https://www.anthropic.com/pricing)
- [Guía de Prompts](https://docs.anthropic.com/en/docs/prompt-library)

---

**Última actualización**: 2025-10-12  
**Versión**: 1.0.0  
**Autor**: Gold Whisper Dashboard Team
