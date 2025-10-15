"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Sparkles, ChevronLeft, ChevronRight, Send, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChartCard } from "./chart-card"

interface AIChartsModalProps {
  campaignId: string | null
  onClose: () => void
}

const CONVERSION_COLORS = Object.freeze(["#ef4444", "#10b981"]) // Rojo, Verde
const BUDGET_COLORS = Object.freeze(["#ef4444", "#10b981"]) // Rojo, Verde
const ROAS_COLORS = Object.freeze(["#ef4444", "#f59e0b", "#10b981"]) // Rojo, Naranja, Verde
const CVR_COLORS = Object.freeze(["#ef4444", "#f59e0b", "#10b981"]) // Rojo, Naranja, Verde
const GASTADO_COLORS = Object.freeze(["#ef4444", "#10b981"]) // Rojo, Verde
const COST_PER_CONV_COLORS = Object.freeze(["#ef4444", "#f59e0b", "#10b981"]) // Rojo, Naranja, Verde
const VENTAS_COLORS = Object.freeze(["#ef4444", "#f59e0b", "#10b981"]) // Rojo, Naranja, Verde
const INGRESOS_COLORS = Object.freeze(["#ef4444", "#10b981"]) // Rojo, Verde

const CHARTS = [
  { id: "conversions", title: "Distribución de Conversiones", description: "Análisis de tasa de conversión" },
  { id: "budget", title: "Distribución de Presupuesto", description: "Gasto vs presupuesto disponible" },
  { id: "roas", title: "Análisis de ROAS", description: "Retorno sobre inversión publicitaria" },
  { id: "cvr", title: "Análisis de CVR", description: "Tasa de conversión por campaña" },
  { id: "gastado", title: "Análisis de Gasto", description: "Distribución del gasto total" },
  { id: "costPerConv", title: "Costo por Conversación", description: "Eficiencia del costo por conversación" },
  { id: "ventas", title: "Distribución de Ventas", description: "Estado de las ventas generadas" },
  { id: "ingresos", title: "Análisis de Ingresos", description: "Ingresos generados vs proyectados" },
]

export function AIChartsModal({ campaignId, onClose }: AIChartsModalProps) {
  const [loading, setLoading] = useState(true)
  const [currentChartIndex, setCurrentChartIndex] = useState(0)
  const [hoveredChart, setHoveredChart] = useState<string | null>(null)
  const [leftPanelInsight, setLeftPanelInsight] = useState<string>("")
  const [centerPanelInsight, setCenterPanelInsight] = useState<string>("")
  const [rightPanelInsight, setRightPanelInsight] = useState<string>("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [aiInsight, setAiInsight] = useState<string>("") // Declare setAiInsight variable

  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const insightTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setLoading(false)
    }
    loadData()
  }, [campaignId])

  useEffect(() => {
    return () => {
      if (insightTimerRef.current) {
        clearTimeout(insightTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!loading && mounted && chatMessages.length === 0) {
      // Determinar si las campañas están yendo bien o mal basado en métricas
      const isPerformingWell = getCurrentChartData()[0]?.value > getCurrentChartData()[1]?.value

      const initialMessage = isPerformingWell
        ? "¡Hola! Veo que tus campañas están teniendo un buen rendimiento. Revisemos juntos por qué nos está yendo bien para replicarlo en futuras campañas. ¿Qué te gustaría analizar primero?"
        : "Hola, he revisado tus campañas y veo algunas áreas de oportunidad. Analicemos a fondo qué podemos mejorar para optimizar tus resultados. ¿Por dónde quieres empezar?"

      setChatMessages([{ role: "assistant", content: initialMessage }])
    }
  }, [loading, mounted, chatMessages.length, getCurrentChartData])

  const conversionData = useMemo(
    () =>
      Object.freeze([
        { name: "Conversiones", value: 45 },
        { name: "Sin conversión", value: 155 },
      ]),
    [],
  )
  const spendData = useMemo(
    () =>
      Object.freeze([
        { name: "Gastado", value: 585199 },
        { name: "Presupuesto restante", value: 414801 },
      ]),
    [],
  )
  const roasData = useMemo(
    () =>
      Object.freeze([
        { name: "ROAS Positivo", value: 15 },
        { name: "ROAS Neutral", value: 35 },
        { name: "ROAS Negativo", value: 50 },
      ]),
    [],
  )
  const cvrData = useMemo(
    () =>
      Object.freeze([
        { name: "CVR Alto", value: 20 },
        { name: "CVR Medio", value: 35 },
        { name: "CVR Bajo", value: 45 },
      ]),
    [],
  )
  const gastadoData = useMemo(
    () =>
      Object.freeze([
        { name: "Gastado", value: 585199 },
        { name: "Presupuesto restante", value: 414801 },
      ]),
    [],
  )
  const costPerConvData = useMemo(
    () =>
      Object.freeze([
        { name: "Costo óptimo", value: 25 },
        { name: "Costo alto", value: 45 },
        { name: "Costo excesivo", value: 30 },
      ]),
    [],
  )
  const ventasData = useMemo(
    () =>
      Object.freeze([
        { name: "Ventas completadas", value: 27 },
        { name: "Ventas pendientes", value: 18 },
        { name: "Ventas perdidas", value: 54 },
      ]),
    [],
  )
  const ingresosData = useMemo(
    () =>
      Object.freeze([
        { name: "Ingresos generados", value: 1099 },
        { name: "Ingresos proyectados", value: 2401 },
      ]),
    [],
  )

  const getCurrentChartData = useCallback(() => {
    const chartId = CHARTS[currentChartIndex].id
    switch (chartId) {
      case "conversions":
        return conversionData
      case "budget":
        return spendData
      case "roas":
        return roasData
      case "cvr":
        return cvrData
      case "gastado":
        return gastadoData
      case "costPerConv":
        return costPerConvData
      case "ventas":
        return ventasData
      case "ingresos":
        return ingresosData
      default:
        return conversionData
    }
  }, [
    currentChartIndex,
    conversionData,
    spendData,
    roasData,
    cvrData,
    gastadoData,
    costPerConvData,
    ventasData,
    ingresosData,
  ])

  const getCurrentChartColors = useCallback(() => {
    const chartId = CHARTS[currentChartIndex].id
    switch (chartId) {
      case "conversions":
        return CONVERSION_COLORS
      case "budget":
        return BUDGET_COLORS
      case "roas":
        return ROAS_COLORS
      case "cvr":
        return CVR_COLORS
      case "gastado":
        return GASTADO_COLORS
      case "costPerConv":
        return COST_PER_CONV_COLORS
      case "ventas":
        return VENTAS_COLORS
      case "ingresos":
        return INGRESOS_COLORS
      default:
        return CONVERSION_COLORS
    }
  }, [currentChartIndex])

  useEffect(() => {
    if (!loading && mounted) {
      const data = getCurrentChartData()
      const total = data.reduce((sum, item) => sum + item.value, 0)

      if (data.length === 3) {
        // Gráfico de 3 secciones: generar 3 insights
        // Panel izquierdo: sección 2 (última)
        const section2Percentage = (data[2].value / total) * 100
        generateContextualInsight(CHARTS[currentChartIndex].id, data[2].name, data[2].value, section2Percentage, "left")

        // Panel central: sección 1 (medio)
        const section1Percentage = (data[1].value / total) * 100
        generateContextualInsight(
          CHARTS[currentChartIndex].id,
          data[1].name,
          data[1].value,
          section1Percentage,
          "center",
        )

        // Panel derecho: sección 0 (primera)
        const section0Percentage = (data[0].value / total) * 100
        generateContextualInsight(
          CHARTS[currentChartIndex].id,
          data[0].name,
          data[0].value,
          section0Percentage,
          "right",
        )
      } else if (data.length === 2) {
        // Gráfico de 2 secciones: generar 2 insights
        // Panel izquierdo: sección 1 (segunda)
        const secondPercentage = (data[1].value / total) * 100
        generateContextualInsight(CHARTS[currentChartIndex].id, data[1].name, data[1].value, secondPercentage, "left")

        // Panel derecho: sección 0 (primera)
        const firstPercentage = (data[0].value / total) * 100
        generateContextualInsight(CHARTS[currentChartIndex].id, data[0].name, data[0].value, firstPercentage, "right")
      }
    }
  }, [loading, mounted, currentChartIndex])

  const generateContextualInsight = async (
    chartType: string,
    segmentName: string,
    value: number,
    percentage: number,
    panel: "left" | "center" | "right" = "left",
  ) => {
    if (isTransitioning) return
    setIsTransitioning(true)

    if (insightTimerRef.current) {
      clearTimeout(insightTimerRef.current)
    }

    // No mostrar "Analizando con IA..." - ir directo al análisis

    let insight = ""

    if (chartType === "conversions") {
      if (segmentName === "Conversiones") {
        insight = `📊 **Análisis de Conversiones (${percentage.toFixed(1)}%)**

**Rendimiento Actual:**
Has logrado ${value} conversaciones de ${value + 155} interacciones totales, lo que representa una tasa de conversión del ${percentage.toFixed(1)}%.

**Evaluación del Trafficker:**
Esta tasa está por debajo del benchmark de la industria (5-10%). Como experto en Meta Ads, te recomiendo:

**Acciones Inmediatas:**
1. **Optimiza tu copy**: Revisa el mensaje de tus anuncios para hacerlo más persuasivo
2. **Mejora la segmentación**: Enfócate en audiencias con mayor intención de compra
3. **Prueba nuevos creativos**: Los visuales impactantes pueden aumentar conversiones hasta un 40%
4. **Revisa tu landing page**: Asegúrate de que la experiencia post-clic sea fluida

**Proyección:**
Con estas optimizaciones, podrías aumentar tu tasa de conversión a 6-8% en las próximas 2 semanas.`
      } else if (segmentName === "Sin conversión") {
        insight = `⚠️ **Análisis de No Conversiones (${percentage.toFixed(1)}%)**

**Situación Actual:**
${value} interacciones no resultaron en conversaciones, representando el ${percentage.toFixed(1)}% de tu tráfico.

**Diagnóstico del Community Manager:**
Este alto porcentaje indica oportunidades de mejora significativas:

**Causas Probables:**
1. **Audiencia poco calificada**: Estás llegando a personas sin interés real
2. **Mensaje desalineado**: Tu propuesta de valor no resuena con tu público
3. **Fricción en el proceso**: Demasiados pasos para iniciar conversación
4. **Timing incorrecto**: Anuncios mostrados en momentos no óptimos

**Estrategia de Recuperación:**
- Implementa remarketing para recuperar este tráfico
- Crea secuencias de nurturing para educar a la audiencia
- Ajusta tu targeting para enfocarte en audiencias más cálidas`
      }
    } else if (chartType === "budget") {
      if (segmentName === "Gastado") {
        insight = `💰 **Análisis de Gasto (${percentage.toFixed(1)}%)**

**Inversión Actual:**
Has invertido $${value.toLocaleString()} COP de tu presupuesto total, utilizando el ${percentage.toFixed(1)}% de tus fondos disponibles.

**Evaluación Financiera del Experto:**
Con un ROAS de 0.00x, cada peso invertido no está generando retorno. Esto requiere acción inmediata.

**Recomendaciones Críticas:**
1. **Pausa campañas de bajo rendimiento**: No sigas quemando presupuesto sin resultados
2. **Redistribuye el gasto**: Concentra recursos en los conjuntos de anuncios con mejor CVR
3. **Reduce el presupuesto diario**: Mientras optimizas, baja la inversión a 30-40% del actual
4. **Implementa pruebas A/B**: Invierte 20% del presupuesto en experimentación

**Proyección de ROI:**
Con estas optimizaciones, podrías alcanzar un ROAS de 2-3x en 3-4 semanas, recuperando parte de la inversión inicial.`
      } else if (segmentName === "Presupuesto restante") {
        insight = `💵 **Análisis de Presupuesto Restante (${percentage.toFixed(1)}%)**

**Fondos Disponibles:**
Tienes $${value.toLocaleString()} COP disponibles, representando el ${percentage.toFixed(1)}% de tu presupuesto total.

**Estrategia del Trafficker Profesional:**
Este presupuesto restante es tu oportunidad para implementar mejoras sin comprometer más capital.

**Plan de Acción Inteligente:**
1. **No gastes todo inmediatamente**: Usa este presupuesto estratégicamente
2. **Invierte en aprendizaje**: Destina 30% a probar nuevas audiencias y creativos
3. **Escala lo que funciona**: Una vez identifiques ganadores, invierte el 70% restante
4. **Mantén reserva**: Guarda 10-15% para oportunidades o ajustes de última hora`
      }
    } else if (chartType === "roas") {
      if (segmentName === "ROAS Positivo") {
        insight = `📈 **Análisis de ROAS Positivo (${percentage.toFixed(1)}%)**

**Rendimiento Financiero:**
El ${percentage.toFixed(1)}% de tus campañas están generando retorno positivo con un ROAS promedio de ${(value / 100).toFixed(2)}x.

**Evaluación del Experto:**
Estas campañas son tus ganadoras. Aquí está tu estrategia de escalamiento:

**Acciones de Escalamiento:**
1. **Aumenta presupuesto gradualmente**: +20% semanal en estas campañas
2. **Duplica los conjuntos ganadores**: Crea copias exactas para escalar sin riesgo
3. **Expande audiencias similares**: Crea lookalikes de tus mejores conversores
4. **Mantén la calidad**: No sacrifiques CVR por volumen

**Proyección de Crecimiento:**
Escalando correctamente, podrías duplicar ingresos en 4-6 semanas manteniendo rentabilidad.`
      } else if (segmentName === "ROAS Neutral") {
        insight = `⚖️ **Análisis de ROAS Neutral (${percentage.toFixed(1)}%)**

**Situación de Equilibrio:**
El ${percentage.toFixed(1)}% de tus campañas están en punto de equilibrio (ROAS 0.8x - 1.2x).

**Evaluación del Experto:**
Estas campañas tienen potencial pero necesitan ajustes:

**Plan de Mejora:**
1. **Optimiza el copy**: Pequeños cambios pueden mover la aguja
2. **Ajusta la segmentación**: Refina para llegar a audiencias más calificadas
3. **Prueba nuevos creativos**: A/B testing agresivo
4. **Revisa la oferta**: Asegúrate de que sea competitiva

**Objetivo:**
Llevar estas campañas a ROAS >2x en 2-3 semanas con optimizaciones continuas.`
      } else if (segmentName === "ROAS Negativo") {
        insight = `📉 **Análisis de ROAS Negativo (${percentage.toFixed(1)}%)**

**Alerta Crítica:**
El ${percentage.toFixed(1)}% de tus campañas están perdiendo dinero con ROAS <0.8x.

**Acción Inmediata Requerida:**
1. **Pausa las peores**: Detén campañas con ROAS <0.3x inmediatamente
2. **Audita las demás**: Revisa cada elemento de las campañas con ROAS 0.3x-0.8x
3. **Reestructura completamente**: Nuevas audiencias, creativos y mensajes
4. **Considera pivotar**: Si después de optimizar no mejoran, elimínalas

**Recuperación:**
Con cambios drásticos, podrías recuperar 50-70% de estas campañas en 3-4 semanas.`
      }
    } else if (chartType === "cvr") {
      if (segmentName === "CVR Alto") {
        insight = `🎯 **Análisis de CVR Alto (${percentage.toFixed(1)}%)**

**Excelente Rendimiento:**
El ${percentage.toFixed(1)}% de tus campañas tienen CVR >30%, superando el benchmark de la industria.

**Estrategia de Maximización:**
1. **Escala agresivamente**: Estas campañas merecen más presupuesto
2. **Documenta qué funciona**: Analiza audiencias, creativos y mensajes ganadores
3. **Replica el éxito**: Aplica estos aprendizajes a otras campañas
4. **Protege la calidad**: Monitorea que el CVR no baje al escalar

**Potencial:**
Con escalamiento inteligente, podrías 3x tus resultados manteniendo este CVR.`
      } else if (segmentName === "CVR Medio") {
        insight = `📊 **Análisis de CVR Medio (${percentage.toFixed(1)}%)**

**Rendimiento Aceptable:**
El ${percentage.toFixed(1)}% de tus campañas tienen CVR 15-30%, dentro del rango aceptable.

**Oportunidades de Mejora:**
1. **Optimiza el embudo**: Reduce fricción en el proceso de conversión
2. **Mejora el copy**: Hazlo más persuasivo y orientado a acción
3. **Segmenta mejor**: Enfócate en audiencias con mayor intención
4. **Prueba urgencia**: Ofertas limitadas pueden aumentar CVR 20-30%

**Objetivo:**
Llevar estas campañas a CVR >30% en 3-4 semanas con optimizaciones continuas.`
      } else if (segmentName === "CVR Bajo") {
        insight = `⚠️ **Análisis de CVR Bajo (${percentage.toFixed(1)}%)**

**Alerta de Rendimiento:**
El ${percentage.toFixed(1)}% de tus campañas tienen CVR <15%, por debajo del mínimo aceptable.

**Diagnóstico y Solución:**
1. **Problema de audiencia**: Estás llegando a personas equivocadas
2. **Mensaje desalineado**: Tu propuesta no resuena con el público
3. **Fricción alta**: Demasiados pasos o proceso confuso
4. **Timing incorrecto**: Anuncios en momentos no óptimos

**Plan de Rescate:**
- Pausa y reestructura completamente
- Nuevas audiencias desde cero
- Copy y creativos completamente nuevos
- Simplifica el proceso de conversión al máximo`
      }
    } else if (chartType === "gastado") {
      if (segmentName === "Gastado") {
        insight = `💰 **Análisis de Gasto (${percentage.toFixed(1)}%)**

**Inversión Actual:**
Has invertido $${value.toLocaleString()} COP de tu presupuesto total, utilizando el ${percentage.toFixed(1)}% de tus fondos disponibles.

**Evaluación Financiera del Experto:**
Con un ROAS de 0.00x, cada peso invertido no está generando retorno. Esto requiere acción inmediata.

**Recomendaciones Críticas:**
1. **Pausa campañas de bajo rendimiento**: No sigas quemando presupuesto sin resultados
2. **Redistribuye el gasto**: Concentra recursos en los conjuntos de anuncios con mejor CVR
3. **Reduce el presupuesto diario**: Mientras optimizas, baja la inversión a 30-40% del actual
4. **Implementa pruebas A/B**: Invierte 20% del presupuesto en experimentación

**Proyección de ROI:**
Con estas optimizaciones, podrías alcanzar un ROAS de 2-3x en 3-4 semanas, recuperando parte de la inversión inicial.`
      } else if (segmentName === "Presupuesto restante") {
        insight = `💵 **Análisis de Presupuesto Restante (${percentage.toFixed(1)}%)**

**Fondos Disponibles:**
Tienes $${value.toLocaleString()} COP disponibles, representando el ${percentage.toFixed(1)}% de tu presupuesto total.

**Estrategia del Trafficker Profesional:**
Este presupuesto restante es tu oportunidad para implementar mejoras sin comprometer más capital.

**Plan de Acción Inteligente:**
1. **No gastes todo inmediatamente**: Usa este presupuesto estratégicamente
2. **Invierte en aprendizaje**: Destina 30% a probar nuevas audiencias y creativos
3. **Escala lo que funciona**: Una vez identifiques ganadores, invierte el 70% restante
4. **Mantén reserva**: Guarda 10-15% para oportunidades o ajustes de última hora`
      }
    } else if (chartType === "costPerConv") {
      if (segmentName === "Costo óptimo") {
        insight = `🌟 **Análisis de Costo óptimo (${percentage.toFixed(1)}%)**

**Rendimiento Financiero:**
El ${percentage.toFixed(1)}% de tus campañas están generando conversiones a un costo óptimo de $${value} COP.

**Evaluación del Experto:**
Estas campañas son rentables. Aquí está tu estrategia de escalamiento:

**Acciones de Escalamiento:**
1. **Aumenta presupuesto gradualmente**: +20% semanal en estas campañas
2. **Duplica los conjuntos ganadores**: Crea copias exactas para escalar sin riesgo
3. **Expande audiencias similares**: Crea lookalikes de tus mejores conversores
4. **Mantén la calidad**: No sacrifiques CVR por volumen

**Proyección de Crecimiento:**
Escalando correctamente, podrías duplicar ingresos en 4-6 semanas manteniendo rentabilidad.`
      } else if (segmentName === "Costo alto") {
        insight = `🔥 **Análisis de Costo alto (${percentage.toFixed(1)}%)**

**Situación de Equilibrio:**
El ${percentage.toFixed(1)}% de tus campañas tienen un costo por conversión alto de $${value} COP.

**Evaluación del Experto:**
Estas campañas tienen potencial pero necesitan ajustes:

**Plan de Mejora:**
1. **Optimiza el copy**: Pequeños cambios pueden mover la aguja
2. **Ajusta la segmentación**: Refina para llegar a audiencias más calificadas
3. **Prueba nuevos creativos**: A/B testing agresivo
4. **Revisa la oferta**: Asegúrate de que sea competitiva

**Objetivo:**
Llevar estas campañas a un costo por conversión óptimo en 2-3 semanas con optimizaciones continuas.`
      } else if (segmentName === "Costo excesivo") {
        insight = `💸 **Análisis de Costo excesivo (${percentage.toFixed(1)}%)**

**Alerta Crítica:**
El ${percentage.toFixed(1)}% de tus campañas tienen un costo por conversión excesivo de $${value} COP.

**Acción Inmediata Requerida:**
1. **Pausa las peores**: Detén campañas con costo excesivo inmediatamente
2. **Audita las demás**: Revisa cada elemento de las campañas problemáticas
3. **Reestructura completamente**: Nuevas audiencias, creativos y mensajes
4. **Considera pivotar**: Si después de optimizar no mejoran, elimínalas

**Recuperación:**
Con cambios drásticos, podrías recuperar 50-70% de estas campañas en 3-4 semanas.`
      }
    } else if (chartType === "ventas") {
      if (segmentName === "Ventas completadas") {
        insight = `✅ **Análisis de Ventas completadas (${percentage.toFixed(1)}%)**

**Rendimiento Actual:**
Has logrado ${value} ventas completadas, representando el ${percentage.toFixed(1)}% del total.

**Evaluación del Experto:**
Esta tasa está por encima del benchmark de la industria (30-40%). Aquí está tu estrategia de escalamiento:

**Acciones de Escalamiento:**
1. **Aumenta presupuesto gradualmente**: +20% semanal en estas campañas
2. **Duplica los conjuntos ganadores**: Crea copias exactas para escalar sin riesgo
3. **Expande audiencias similares**: Crea lookalikes de tus mejores conversores
4. **Mantén la calidad**: No sacrifiques CVR por volumen

**Proyección de Crecimiento:**
Escalando correctamente, podrías duplicar ingresos en 4-6 semanas manteniendo rentabilidad.`
      } else if (segmentName === "Ventas pendientes") {
        insight = `🕒 **Análisis de Ventas pendientes (${percentage.toFixed(1)}%)**

**Situación de Equilibrio:**
El ${percentage.toFixed(1)}% de tus ventas están pendientes de confirmación.

**Evaluación del Experto:**
Estas ventas tienen potencial pero necesitan seguimiento:

**Plan de Mejora:**
1. **Optimiza el embudo**: Reduce fricción en el proceso de conversión
2. **Mejora el copy**: Hazlo más persuasivo y orientado a acción
3. **Segmenta mejor**: Enfócate en audiencias con mayor intención
4. **Prueba urgencia**: Ofertas limitadas pueden aumentar CVR 20-30%

**Objetivo:**
Llevar estas ventas a una tasa de confirmación > 50% en 3-4 semanas con optimizaciones continuas.`
      } else if (segmentName === "Ventas perdidas") {
        insight = `❌ **Análisis de Ventas perdidas (${percentage.toFixed(1)}%)**

**Alerta Crítica:**
El ${percentage.toFixed(1)}% de tus ventas se han perdido.

**Acción Inmediata Requerida:**
1. **Pausa las peores**: Detén campañas con ventas perdidas > 60% inmediatamente
2. **Audita las demás**: Revisa cada elemento de las campañas problemáticas
3. **Reestructura completamente**: Nuevas audiencias, creativos y mensajes
4. **Considera pivotar**: Si después de optimizar no mejoran, elimínalas

**Recuperación:**
Con cambios drásticos, podrías recuperar 50-70% de estas campañas en 3-4 semanas.`
      }
    } else if (chartType === "ingresos") {
      if (segmentName === "Ingresos generados") {
        insight = `💰 **Análisis de Ingresos generados (${percentage.toFixed(1)}%)**

**Rendimiento Actual:**
Has logrado $${value.toLocaleString()} COP en ingresos generados, representando el ${percentage.toFixed(1)}% del total.

**Evaluación del Experto:**
Esta tasa está por encima del benchmark de la industria (40-50%). Aquí está tu estrategia de escalamiento:

**Acciones de Escalamiento:**
1. **Aumenta presupuesto gradualmente**: +20% semanal en estas campañas
2. **Duplica los conjuntos ganadores**: Crea copias exactas para escalar sin riesgo
3. **Expande audiencias similares**: Crea lookalikes de tus mejores conversores
4. **Mantén la calidad**: No sacrifiques CVR por volumen

**Proyección de Crecimiento:**
Escalando correctamente, podrías duplicar ingresos en 4-6 semanas manteniendo rentabilidad.`
      } else if (segmentName === "Ingresos proyectados") {
        insight = `🔮 **Análisis de Ingresos proyectados (${percentage.toFixed(1)}%)**

**Situación de Equilibrio:**
Tienes $${value.toLocaleString()} COP proyectados, representando el ${percentage.toFixed(1)}% de tus ingresos totales.

**Estrategia del Experto:**
Este ingreso proyectado es tu oportunidad para implementar mejoras sin comprometer más capital.

**Plan de Acción Inteligente:**
1. **No gastes todo inmediatamente**: Usa este presupuesto estratégicamente
2. **Invierte en aprendizaje**: Destina 30% a probar nuevas audiencias y creativos
3. **Escala lo que funciona**: Una vez identifiques ganadores, invierte el 70% restante
4. **Mantén reserva**: Guarda 10-15% para oportunidades o ajustes de última hora`
      }
    }

    if (panel === "left") {
      setLeftPanelInsight(insight)
    } else if (panel === "center") {
      setCenterPanelInsight(insight)
    } else {
      setRightPanelInsight(insight)
    }

    setIsTransitioning(false)

    insightTimerRef.current = setTimeout(() => {
      // No limpiar el insight automáticamente - mantenerlo visible
    }, 10000)
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsChatLoading(true)

    try {
      // Simular respuesta de IA (en producción, esto llamaría a la API de Gemini)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const response = `Como experto en Marketing Digital con más de 15 años trabajando con marcas mundiales como Nike, Coca-Cola y Amazon, te puedo decir que ${userMessage.toLowerCase().includes("mejorar") ? "hay varias estrategias probadas que podemos implementar" : "es una excelente pregunta"}. 

Basándome en los datos de tus campañas actuales, te recomiendo:

1. **Optimización de Audiencias**: Enfócate en los segmentos que están generando mejor ROAS
2. **Creativos de Alto Impacto**: Prueba formatos de video corto que están dominando Meta Ads
3. **Estrategia de Pujas**: Ajusta tus pujas según el rendimiento horario

¿Te gustaría que profundice en alguno de estos puntos?`

      setChatMessages((prev) => [...prev, { role: "assistant", content: response }])
    } catch (error) {
      console.error("Error al generar respuesta:", error)
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo." },
      ])
    } finally {
      setIsChatLoading(false)
    }
  }

  const generateFullAnalysis = async (chartType: string) => {
    // No changes needed here for the two-panel update
    // This function is not directly used in the current UI for generating panel insights,
    // but it might be used elsewhere or for future enhancements.
    // If it were to be updated, it would need logic to generate insights for both panels.

    // For now, we'll keep it as is, assuming it's not the primary driver for the dual panel display.
    setAiInsight("Generando análisis completo con IA...") // This line uses the old state, but it's not critical for the current functionality.

    await new Promise((resolve) => setTimeout(resolve, 1200))

    let analysis = ""

    if (chartType === "conversions") {
      analysis = `🎯 **ANÁLISIS COMPLETO: EMBUDO DE CONVERSIONES**

**Visión General del Trafficker Experto:**
Tu embudo de conversiones muestra señales de alerta que requieren intervención inmediata. Con solo 45 conversaciones de 200 interacciones (22.5%), estás dejando dinero sobre la mesa.

**DIAGNÓSTICO PROFUNDO:**

**1. Análisis de Audiencia:**
- Tasa de conversión: 22.5% (Objetivo: 35-45%)
- Calidad del tráfico: Media-Baja
- Intención de compra: Moderada

**2. Análisis del Mensaje:**
- Relevancia del copy: Necesita optimización
- Claridad de la propuesta: Puede mejorar
- Call-to-action: Requiere fortalecimiento

**3. Análisis de Fricción:**
- Pasos hasta conversación: Probablemente demasiados
- Experiencia móvil: Revisar urgentemente
- Tiempo de respuesta: Crítico para conversión

**PLAN DE ACCIÓN INTEGRAL:**

**Fase 1 - Optimización Inmediata (Semana 1-2):**
1. Reescribe el copy enfocándote en beneficios, no características
2. Simplifica el proceso de inicio de conversación
3. Implementa respuestas automáticas instantáneas
4. Crea urgencia con ofertas limitadas en tiempo

**Fase 2 - Mejora de Audiencia (Semana 3-4):**
1. Crea audiencias lookalike de tus mejores conversaciones
2. Excluye audiencias que no convierten
3. Implementa retargeting para visitantes del sitio web
4. Prueba intereses más específicos y nichos

**Fase 3 - Escalamiento (Semana 5+):**
1. Duplica presupuesto en conjuntos ganadores
2. Expande a nuevas ubicaciones geográficas
3. Prueba formatos de anuncios adicionales
4. Implementa secuencias de nurturing automatizadas

**PROYECCIONES CON OPTIMIZACIONES:**
- Mes 1: CVR 30-35% (+7-12 puntos)
- Mes 2: CVR 40-45% (+17-22 puntos)
- Mes 3: CVR 50%+ (+27 puntos)

**INVERSIÓN RECOMENDADA:**
- Mantén presupuesto actual mientras optimizas
- Aumenta 20% cuando CVR supere 35%
- Escala agresivamente al alcanzar 45%+

**MÉTRICAS A MONITOREAR:**
✓ Tasa de conversación por hora del día
✓ Dispositivo con mejor rendimiento
✓ Ubicación geográfica más rentable
✓ Edad y género de mejores conversores
✓ Tiempo promedio hasta conversación`
    } else if (chartType === "budget") {
      analysis = `💰 **ANÁLISIS COMPLETO: GESTIÓN DE PRESUPUESTO**

**Visión Estratégica del Experto en Meta Ads:**
Has invertido $585,199 COP (58.5% del presupuesto) con un ROAS de 0.00x. Esta situación requiere una reestructuración completa de tu estrategia de inversión.

**DIAGNÓSTICO FINANCIERO PROFUNDO:**

**1. Análisis de Eficiencia del Gasto:**
- Gasto actual: $585,199 COP
- Retorno: $0
- Eficiencia: 0% (Crítico)
- Costo por conversación: $13,004 COP (Extremadamente alto)

**2. Análisis de Distribución:**
- Presupuesto utilizado: 58.5%
- Presupuesto restante: 41.5% ($414,801 COP)
- Velocidad de gasto: Muy alta
- Días restantes estimados: 21 días al ritmo actual

**3. Análisis de ROI:**
- ROAS actual: 0.00x (Objetivo: 3-5x)
- Punto de equilibrio: Necesitas $585,199 COP en ventas
- Brecha de rentabilidad: 100%

**PLAN DE RECUPERACIÓN FINANCIERA:**

**Fase 1 - STOP & AUDIT (Días 1-3):**
1. **PAUSA INMEDIATA** de campañas con 0 conversiones
2. Audita cada conjunto de anuncios individualmente
3. Identifica los 20% de anuncios que generan 80% de conversaciones
4. Elimina despiadadamente lo que no funciona

**Fase 2 - REESTRUCTURACIÓN (Días 4-7):**
1. Reduce presupuesto diario a 40% del actual
2. Concentra 80% del gasto en top performers
3. Destina 20% a pruebas controladas
4. Implementa límites de gasto por conjunto

**Fase 3 - OPTIMIZACIÓN (Semana 2-4):**
1. Aumenta presupuesto solo en conjuntos con ROAS >2x
2. Implementa reglas automáticas de pausa
3. Optimiza horarios de publicación
4. Ajusta pujas según rendimiento horario

**Fase 4 - ESCALAMIENTO RENTABLE (Mes 2+):**
1. Escala solo cuando ROAS sea consistentemente >3x
2. Aumenta presupuesto 20% semanal en ganadores
3. Mantén 15% de presupuesto para experimentación
4. Reinvierte ganancias en campañas probadas

**ESTRATEGIA DE PRESUPUESTO RESTANTE ($414,801 COP):**

**Distribución Inteligente:**
- 50% ($207,400 COP): Campañas optimizadas y probadas
- 30% ($124,440 COP): Pruebas de nuevas audiencias/creativos
- 15% ($62,220 COP): Remarketing y retargeting
- 5% ($20,740 COP): Reserva para oportunidades

**PROYECCIONES FINANCIERAS:**

**Escenario Conservador:**
- Mes 1: ROAS 1.5x → Recuperas $207,400 COP
- Mes 2: ROAS 2.5x → Recuperas $345,667 COP
- Mes 3: ROAS 3.5x → Recuperas $483,934 COP

**Escenario Optimista:**
- Mes 1: ROAS 2.5x → Recuperas $345,667 COP
- Mes 2: ROAS 4.0x → Recuperas $553,067 COP
- Mes 3: ROAS 5.5x → Recuperas $760,467 COP

**MÉTRICAS CRÍTICAS A MONITOREAR:**
✓ ROAS diario por campaña
✓ Costo por conversación trending
✓ Tasa de quema de presupuesto
✓ Punto de equilibrio por conjunto
✓ Lifetime value de conversaciones

**ALERTAS AUTOMÁTICAS A CONFIGURAR:**
🚨 ROAS < 1.0x por 3 días → Pausa automática
🚨 Gasto > $50 COP/día sin conversaciones → Pausa
🚨 CVR < 15% por 5 días → Revisión urgente
🚨 Presupuesto restante < 20% → Alerta de fondos`
    } else if (chartType === "roas") {
      analysis = `📈 **ANÁLISIS COMPLETO: ROAS**

**Visión Estratégica del Experto en Meta Ads:**
Tu ROAS actual es de 0.00x, lo que indica que cada peso invertido no está generando retorno. Es crucial tomar medidas para mejorar esta situación.`
    } else if (chartType === "cvr") {
      analysis = `🎯 **ANÁLISIS COMPLETO: CVR**

**Visión General del Trafficker Experto:**
Tu CVR actual es de 22.5%, lo que está por debajo del benchmark de la industria (35-45%). Es necesario tomar medidas para mejorar esta tasa de conversión.`
    } else if (chartType === "gastado") {
      analysis = `💰 **ANÁLISIS COMPLETO: GASTO**

**Visión Estratégica del Experto en Meta Ads:**
Has invertido $585,199 COP (58.5% del presupuesto) con un ROAS de 0.00x. Esta situación requiere una reestructuración completa de tu estrategia de inversión.`
    } else if (chartType === "costPerConv") {
      analysis = `🌟 **ANÁLISIS COMPLETO: COSTO POR CONVERSIÓN**

**Visión General del Trafficker Experto:**
Tu costo por conversión actual es de $13,004 COP, lo que está por encima del benchmark de la industria (10-15%). Es necesario tomar medidas para mejorar esta eficiencia.`
    } else if (chartType === "ventas") {
      analysis = `✅ **ANÁLISIS COMPLETO: VENTAS**

**Visión General del Trafficker Experto:**
Tu tasa de ventas completadas actual es de 27%, lo que está por encima del benchmark de la industria (30-40%). Sin embargo, aún hay oportunidades para mejorar.`
    } else if (chartType === "ingresos") {
      analysis = `💰 **ANÁLISIS COMPLETO: INGRESOS**

**Visión General del Trafficker Experto:**
Tu ingreso actual es de $1,099 COP, lo que está por encima del benchmark de la industria (1,500-2,000 COP). Sin embargo, aún hay oportunidades para mejorar.`
    }

    // This part of the function is not directly used for the dual panel display,
    // so it's left as is for now. If it were to be used, it would need to update
    // leftPanelInsight and rightPanelInsight.
    setAiInsight(analysis) // This uses the old state, which is okay for now.
    setIsTransitioning(false)

    insightTimerRef.current = setTimeout(() => {
      // No limpiar el insight automáticamente - mantenerlo visible
    }, 10000)
  }

  const handleChartHover = useCallback((chartType: string, index: number, segment: any, percentage: number) => {
    setHoveredChart(chartType)
    // No regenerar insights en hover - solo efecto visual
  }, [])

  const handleChartLeave = useCallback(() => {
    setHoveredChart(null)
  }, [])

  const goToPreviousChart = useCallback(() => {
    setCurrentChartIndex((prev) => (prev === 0 ? CHARTS.length - 1 : prev - 1))
    setLeftPanelInsight("")
    setCenterPanelInsight("")
    setRightPanelInsight("")
    setHoveredChart(null)
  }, [])

  const goToNextChart = useCallback(() => {
    setCurrentChartIndex((prev) => (prev === CHARTS.length - 1 ? 0 : prev + 1))
    setLeftPanelInsight("")
    setCenterPanelInsight("")
    setRightPanelInsight("")
    setHoveredChart(null)
  }, [])

  const currentChart = CHARTS[currentChartIndex]
  const hasThreeSections = getCurrentChartData().length === 3

  // Modificado layout para incluir el chat a la derecha
  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-xl shadow-2xl max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Análisis con IA - Gráficos Inteligentes</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Powered by Gemini 2.5 Pro • ID: {campaignId || "General"}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousChart}
                  className="hover:bg-muted bg-transparent"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  {currentChartIndex + 1} / {CHARTS.length}
                </span>
                <Button variant="outline" size="icon" onClick={goToNextChart} className="hover:bg-muted bg-transparent">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Contenido principal de gráficos */}
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gold" />
                  <span className="ml-3 text-muted-foreground">Analizando datos con IA...</span>
                </div>
              ) : (
                <div className={`grid grid-cols-1 ${hasThreeSections ? "lg:grid-cols-16" : "lg:grid-cols-12"} gap-6`}>
                  {/* Panel Izquierdo */}
                  <div className={hasThreeSections ? "lg:col-span-3" : "lg:col-span-3"}>
                    <Card
                      className={`border-2 h-full shadow-xl transition-all duration-300 ${
                        hoveredChart === currentChart.id ? "shadow-2xl scale-[1.02]" : ""
                      } border-green-500 bg-gradient-to-br from-green-50/50 to-white`}
                    >
                      <CardHeader className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                        <CardTitle className="flex items-center gap-2 text-green-600 text-base">
                          <Sparkles className="w-4 h-4" />
                          {getCurrentChartData()[hasThreeSections ? 2 : 1]?.name || "Cargando..."}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {getCurrentChartData()[hasThreeSections ? 2 : 1]?.value.toLocaleString() || "0"} •{" "}
                          {getCurrentChartData()[hasThreeSections ? 2 : 1]
                            ? (
                                (getCurrentChartData()[hasThreeSections ? 2 : 1].value /
                                  getCurrentChartData().reduce((sum, item) => sum + item.value, 0)) *
                                100
                              ).toFixed(1)
                            : "0"}
                          %
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="max-h-[500px] overflow-y-auto p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                          {leftPanelInsight ? (
                            <div className="prose prose-sm max-w-none">
                              {leftPanelInsight.split("\n").map((line, i) => (
                                <p key={i} className="mb-2 text-xs leading-relaxed text-foreground">
                                  {line}
                                </p>
                              ))}
                            </div>
                          ) : null}
                        </motion.div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráfico Central */}
                  <div className={hasThreeSections ? "lg:col-span-5" : "lg:col-span-6"}>
                    <ChartCard
                      key={currentChart.id}
                      title={currentChart.title}
                      description={currentChart.description}
                      data={getCurrentChartData()}
                      chartType={currentChart.id}
                      colors={getCurrentChartColors()}
                      isHovered={hoveredChart === currentChart.id}
                      onHover={handleChartHover}
                      onLeave={handleChartLeave}
                    />
                  </div>

                  {hasThreeSections && (
                    <div className="lg:col-span-3">
                      <Card
                        className={`border-2 h-full shadow-xl transition-all duration-300 ${
                          hoveredChart === currentChart.id ? "shadow-2xl scale-[1.02]" : ""
                        } border-orange-500 bg-gradient-to-br from-orange-50/50 to-white`}
                      >
                        <CardHeader className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                          <CardTitle className="flex items-center gap-2 text-orange-600 text-base">
                            <Sparkles className="w-4 h-4" />
                            {getCurrentChartData()[1]?.name || "Cargando..."}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {getCurrentChartData()[1]?.value.toLocaleString() || "0"} •{" "}
                            {getCurrentChartData()[1]
                              ? (
                                  (getCurrentChartData()[1].value /
                                    getCurrentChartData().reduce((sum, item) => sum + item.value, 0)) *
                                  100
                                ).toFixed(1)
                              : "0"}
                            %
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[500px] overflow-y-auto p-4">
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            {centerPanelInsight ? (
                              <div className="prose prose-sm max-w-none">
                                {centerPanelInsight.split("\n").map((line, i) => (
                                  <p key={i} className="mb-2 text-xs leading-relaxed text-foreground">
                                    {line}
                                  </p>
                                ))}
                              </div>
                            ) : null}
                          </motion.div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Panel Derecho */}
                  <div className={hasThreeSections ? "lg:col-span-5" : "lg:col-span-3"}>
                    <Card
                      className={`border-2 h-full shadow-xl transition-all duration-300 ${
                        hoveredChart === currentChart.id ? "shadow-2xl scale-[1.02]" : ""
                      } border-red-500 bg-gradient-to-br from-red-50/50 to-white`}
                    >
                      <CardHeader className="bg-gradient-to-br from-red-500/10 to-red-500/5">
                        <CardTitle className="flex items-center gap-2 text-red-600 text-base">
                          <Sparkles className="w-4 h-4" />
                          {getCurrentChartData()[0]?.name || "Cargando..."}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {getCurrentChartData()[0]?.value.toLocaleString() || "0"} •{" "}
                          {getCurrentChartData()[0]
                            ? (
                                (getCurrentChartData()[0].value /
                                  getCurrentChartData().reduce((sum, item) => sum + item.value, 0)) *
                                100
                              ).toFixed(1)
                            : "0"}
                          %
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="max-h-[500px] overflow-y-auto p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                          {rightPanelInsight ? (
                            <div className="prose prose-sm max-w-none">
                              {rightPanelInsight.split("\n").map((line, i) => (
                                <p key={i} className="mb-2 text-xs leading-relaxed text-foreground">
                                  {line}
                                </p>
                              ))}
                            </div>
                          ) : null}
                        </motion.div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            <div className="w-[400px] border-l border-border flex flex-col bg-gradient-to-br from-gold/5 to-white">
              {/* Header del chat */}
              <div className="p-4 border-b border-border bg-gradient-to-r from-gold/10 to-gold/5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gold" />
                  <h3 className="font-bold text-foreground">Analicemos las campañas juntos</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Experto en Marketing Digital • 15+ años de experiencia
                </p>
              </div>

              {/* Mensajes del chat */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-gold text-white"
                          : "bg-white border border-border text-foreground shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-border rounded-lg p-3 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-gold" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input del chat */}
              <div className="p-4 border-t border-border bg-white">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Pregunta sobre tus campañas..."
                    className="flex-1"
                    disabled={isChatLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="bg-gold hover:bg-gold/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  if (!mounted) return null
  return createPortal(modalContent, document.body)
}
