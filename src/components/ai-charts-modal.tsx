import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ChevronLeft, ChevronRight, X, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartCard } from "./chart-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface AIChartsModalProps {
  isOpen: boolean
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
const INGRESOS_COLORS = Object.freeze(["#ef4444", "#10b981"]) // Rojo, Naranja, Verde

const CHARTS = [
  {
    id: "conversions",
    title: "Distribución de Conversiones",
    description: "Análisis de tasa de conversión",
    metricName: "Conversiones",
  },
  {
    id: "budget",
    title: "Distribución de Presupuesto",
    description: "Gasto vs presupuesto disponible",
    metricName: "Presupuesto",
  },
  { id: "roas", title: "Análisis de ROAS", description: "Retorno sobre inversión publicitaria", metricName: "ROAS" },
  { id: "cvr", title: "Análisis de CVR", description: "Tasa de conversión por campaña", metricName: "CVR" },
  { id: "gastado", title: "Análisis de Gasto", description: "Distribución del gasto total", metricName: "Gasto" },
  {
    id: "costPerConv",
    title: "Costo por Conversión",
    description: "Eficiencia del costo por conversation",
    metricName: "Costo/Conv",
  },
  {
    id: "ventas",
    title: "Distribución de Ventas",
    description: "Estado de las ventas generadas",
    metricName: "Ventas",
  },
  {
    id: "ingresos",
    title: "Análisis de Ingresos",
    description: "Ingresos generados vs proyectados",
    metricName: "Ingresos",
  },
]

const ACTIVE_CAMPAIGNS = [
  { id: "120233445687010113", name: "Mensajes a WhatsApp del Mayo..." },
  { id: "120232220411150113", name: "Campaña Balines - Mensajes a..." },
  { id: "120230223507150113", name: "CÚCUTA - AGOSTO" },
]

export function AIChartsModal({
  isOpen,
  campaignId,
  onClose,
}: {
  isOpen: boolean
  campaignId: string | null
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [currentChartIndex, setCurrentChartIndex] = useState(0)
  const [hoveredChart, setHoveredChart] = useState<string | null>(null)
  const [leftPanelInsight, setLeftPanelInsight] = useState<string>("")
  const [centerPanelInsight, setCenterPanelInsight] = useState<string>("")
  const [rightPanelInsight, setRightPanelInsight] = useState<string>("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [aiInsight, setAiInsight] = useState<string>("")

  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const insightTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [isChatOpen, setIsChatOpen] = useState(false)

  // New state variables for 3-section chart interaction
  const [activeSection, setActiveSection] = useState<"general" | "negativo" | "neutral" | "positivo">("general")
  const [activeInsightTab, setActiveInsightTab] = useState<"resumen" | "acciones" | "riesgos">("resumen")
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null)
  const [activeNavSection, setActiveNavSection] = useState<"general" | "negativo" | "neutral" | "positivo">("general")

  const [isIAPanelOpen, setIsIAPanelOpen] = useState(false)
  const [activeIATab, setActiveIATab] = useState<"resumen" | "acciones" | "alertas">("resumen")

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["negativo", "neutral", "positivo"]))

  const [selectedCampaign, setSelectedCampaign] = useState(campaignId || ACTIVE_CAMPAIGNS[0].id)

  const { toast } = useToast()

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const handleUrgentBubbleClick = () => {
    setIsChatOpen(true)
  }

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Simulate API call to fetch chart data based on selectedCampaign
      await new Promise((resolve) => setTimeout(resolve, 500))
      setLoading(false)
    }
    loadData()
  }, [selectedCampaign]) // Re-fetch data when selectedCampaign changes

  useEffect(() => {
    return () => {
      if (insightTimerRef.current) {
        clearTimeout(insightTimerRef.current)
      }
    }
  }, [])

  const conversionData = useMemo(
    () =>
      Object.freeze([
        { name: "Conversiones", value: 45, growth: "+12%", period: "7d" },
        { name: "Sin conversión", value: 55, growth: "-8%", period: "7d" },
      ]),
    [],
  )
  const spendData = useMemo(
    () =>
      Object.freeze([
        { name: "Gastado", value: 58.5, growth: "+15%", period: "3d" },
        { name: "Presupuesto restante", value: 41.5, growth: "-15%", period: "3d" },
      ]),
    [],
  )
  const roasData = useMemo(
    () =>
      Object.freeze([
        { name: "ROAS Alto", value: 15, growth: "+5%", period: "15d" },
        { name: "ROAS Medio", value: 35, growth: "+8%", period: "7d" },
        { name: "ROAS Bajo", value: 50, growth: "-10%", period: "3d" },
      ]),
    [],
  )
  const cvrData = useMemo(
    () =>
      Object.freeze([
        { name: "CVR Alto", value: 20, growth: "+18%", period: "15d" },
        { name: "CVR Medio", value: 35, growth: "+5%", period: "7d" },
        { name: "CVR Bajo", value: 45, growth: "-12%", period: "3d" },
      ]),
    [],
  )
  const gastadoData = useMemo(
    () =>
      Object.freeze([
        { name: "Gastado", value: 58.5, growth: "+15%", period: "3d" },
        { name: "Presupuesto restante", value: 41.5, growth: "-15%", period: "3d" },
      ]),
    [],
  )
  const costPerConvData = useMemo(
    () =>
      Object.freeze([
        { name: "Costo óptimo", value: 25, growth: "+10%", period: "15d" },
        { name: "Costo alto", value: 45, growth: "+3%", period: "7d" },
        { name: "Costo excesivo", value: 30, growth: "-8%", period: "3d" },
      ]),
    [],
  )
  const ventasData = useMemo(
    () =>
      Object.freeze([
        { name: "Ventas completadas", value: 27, growth: "+22%", period: "15d" },
        { name: "Ventas pendientes", value: 18, growth: "+5%", period: "7d" },
        { name: "Ventas perdidas", value: 55, growth: "-15%", period: "3d" },
      ]),
    [],
  )
  const ingresosData = useMemo(
    () =>
      Object.freeze([
        { name: "Ingresos generados", value: 31.4, growth: "+18%", period: "15d" },
        { name: "Ingresos proyectados", value: 68.6, growth: "+12%", period: "7d" },
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

  const getTotalValue = useCallback(() => {
    return 100
  }, [])

  const hasOnlyTwoDataPoints = useCallback(() => {
    return getCurrentChartData().length === 2
  }, [getCurrentChartData])

  const formatCOP = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount.replace(/[^0-9.-]/g, "")) : amount
    return `$${numAmount.toLocaleString()} COP`
  }

  const getLossAmount = useCallback(() => {
    const chartType = CHARTS[currentChartIndex].id
    if (chartType === "conversions") {
      return "45 conversiones"
    } else if (chartType === "roas") {
      return formatCOP(26000)
    } else if (chartType === "cvr") {
      return "334 conversiones"
    } else if (chartType === "costPerConv") {
      return formatCOP(26000)
    } else if (chartType === "ventas") {
      return "45 ventas"
    } else if (chartType === "ingresos") {
      return formatCOP(26000)
    }
    return formatCOP(26000)
  }, [currentChartIndex])

  const getChartPercentages = useCallback(() => {
    const data = getCurrentChartData()
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const chartId = CHARTS[currentChartIndex].id

    // Calculate percentages
    const percentages = data.map((item) => ({
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1),
    }))

    // Sort by value to determine positive/neutral/negative intelligently
    const sorted = [...percentages].sort((a, b) => b.value - a.value)

    let positivo, neutral, negativo

    // For metrics where HIGH is GOOD (ROAS, CVR, Conversions, Sales, Revenue)
    if (["roas", "cvr", "conversions", "ventas", "ingresos"].includes(chartId)) {
      positivo = sorted[0] // Highest is positive
      neutral = sorted[1] || null
      negativo = sorted[sorted.length - 1] // Lowest is negative
    }
    // For metrics where LOW is GOOD (Cost per conversion, Spend)
    else if (["costPerConv", "gastado", "budget"].includes(chartId)) {
      negativo = sorted[0] // Highest is negative
      neutral = sorted[1] || null
      positivo = sorted[sorted.length - 1] // Lowest is positive
    }
    // Default fallback
    else {
      positivo = sorted[0]
      neutral = sorted[1] || null
      negativo = sorted[sorted.length - 1]
    }

    return {
      positivo: positivo?.percentage || "0",
      neutral: neutral?.percentage || "0",
      negativo: negativo?.percentage || "0",
      positivoName: positivo?.name || "Positivo",
      neutralName: neutral?.name || "Neutral",
      negativoName: negativo?.name || "Negativo",
      positivoPeriod: positivo?.period || "",
      neutralPeriod: neutral?.period || "",
      negativoPeriod: negativo?.period || "",
    }
  }, [getCurrentChartData, currentChartIndex])

  useEffect(() => {
    if (!loading && mounted && chatMessages.length === 0) {
      // Determinar si la campaña está yendo bien o mal basado en métricas
      const isPerformingWell = getCurrentChartData()[0]?.value > getCurrentChartData()[1]?.value

      const initialMessage = isPerformingWell
        ? "¡Hola! Veo que tu campaña está teniendo un buen rendimiento. Revisemos juntos por qué nos está yendo bien para replicarlo en futuras campañas. ¿Qué te gustaría analizar primero?"
        : "Hola, he revisado tu campaña y veo algunas áreas de oportunidad. Analicemos a fondo qué podemos mejorar para optimizar tus resultados. ¿Por dónde quieres empezar?"

      setChatMessages([{ role: "assistant", content: initialMessage }])
    }
  }, [loading, mounted, chatMessages.length, getCurrentChartData])

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
Has logrado ${value} conversiones de ${value + 155} interacciones totales, lo que representa una tasa de conversión del ${percentage.toFixed(1)}%.

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
1. **Pausa esta campaña de bajo rendimiento**: No sigas quemando presupuesto sin resultados
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
Tu campaña está generando retorno positivo con un ROAS promedio de ${(value / 100).toFixed(2)}x.

**Evaluación del Experto:**
Esta campaña es tu ganadora. Aquí está tu estrategia de escalamiento:

**Acciones de Escalamiento:**
1. **Aumenta presupuesto gradualmente**: +20% semanal en esta campaña
2. **Duplica los conjuntos ganadores**: Crea copias exactas para escalar sin riesgo
3. **Expande audiencias similares**: Crea lookalikes de tus mejores conversores
4. **Mantén la calidad**: No sacrifiques CVR por volumen

**Proyección de Crecimiento:**
Escalando correctamente, podrías duplicar ingresos en 4-6 semanas manteniendo rentabilidad.`
      } else if (segmentName === "ROAS Neutral") {
        insight = `⚖️ **Análisis de ROAS Neutral (${percentage.toFixed(1)}%)**

**Situación de Equilibrio:**
Tu campaña está en punto de equilibrio (ROAS 0.8x - 1.2x).

**Evaluación del Experto:**
Esta campaña tiene potencial pero necesita ajustes:

**Plan de Mejora:**
1. **Optimiza el copy**: Pequeños cambios pueden mover la aguja
2. **Ajusta la segmentación**: Refina para llegar a audiencias más calificadas
3. **Prueba nuevos creativos**: A/B testing agresivo
4. **Revisa la oferta**: Asegúrate de que sea competitiva

**Objetivo:**
Llevar esta campaña a ROAS >2x en 2-3 semanas con optimizaciones continuas.`
      } else if (segmentName === "ROAS Negativo") {
        insight = `📉 **Análisis de ROAS Negativo (${percentage.toFixed(1)}%)**

**Alerta Crítica:**
Tu campaña está perdiendo dinero con ROAS <0.8x.

**Acción Inmediata Requerida:**
1. **Pausa si es crítico**: Detén la campaña si ROAS <0.3x inmediatamente
2. **Audita completamente**: Revisa cada elemento de la campaña
3. **Reestructura completamente**: Nuevas audiencias, creativos y mensajes
4. **Considera pivotar**: Si después de optimizar no mejora, elimínala

**Recuperación:**
Con cambios drásticos, podrías recuperar esta campaña en 3-4 semanas.`
      }
    } else if (chartType === "cvr") {
      if (segmentName === "CVR Alto") {
        insight = `🎯 **Análisis de CVR Alto (${percentage.toFixed(1)}%)**

**Excelente Rendimiento:**
Tu campaña tiene CVR >30%, superando el benchmark de la industria.

**Estrategia de Maximización:**
1. **Escala agresivamente**: Esta campaña merece más presupuesto
2. **Documenta qué funciona**: Analiza audiencias, creativos y mensajes ganadores
3. **Replica el éxito**: Aplica estos aprendizajes a otras campañas
4. **Protege la calidad**: Monitorea que el CVR no baje al escalar

**Potencial:**
Con escalamiento inteligente, podrías 3x tus resultados manteniendo este CVR.`
      } else if (segmentName === "CVR Medio") {
        insight = `📊 **Análisis de CVR Medio (${percentage.toFixed(1)}%)**

**Rendimiento Aceptable:**
Tu campaña tiene CVR 15-30%, dentro del rango aceptable.

**Oportunidades de Mejora:**
1. **Optimiza el embudo**: Reduce fricción en el proceso de conversión
2. **Mejora el copy**: Hazlo más persuasivo y orientado a acción
3. **Segmenta mejor**: Enfócate en audiencias con mayor intención
4. **Prueba urgencia**: Ofertas limitadas pueden aumentar CVR 20-30%

**Objetivo:**
Llevar esta campaña a CVR >30% en 3-4 semanas con optimizaciones continuas.`
      } else if (segmentName === "CVR Bajo") {
        insight = `⚠️ **Análisis de CVR Bajo (${percentage.toFixed(1)}%)**

**Alerta de Rendimiento:**
Tu campaña tiene CVR <15%, por debajo del mínimo aceptable.

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
1. **Pausa esta campaña de bajo rendimiento**: No sigas quemando presupuesto sin resultados
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
Tu campaña está generando conversiones a un costo óptimo de $${value} COP.

**Evaluación del Experto:**
Esta campaña es rentable. Aquí está tu estrategia de escalamiento:

**Acciones de Escalamiento:**
1. **Aumenta presupuesto gradualmente**: +20% semanal en esta campaña
2. **Duplica los conjuntos ganadores**: Crea copias exactas para escalar sin riesgo
3. **Expande audiencias similares**: Crea lookalikes de tus mejores conversores
4. **Mantén la calidad**: No sacrifiques CVR por volumen

**Proyección de Crecimiento:**
Escalando correctamente, podrías duplicar ingresos en 4-6 semanas manteniendo rentabilidad.`
      } else if (segmentName === "Costo alto") {
        insight = `🔥 **Análisis de Costo alto (${percentage.toFixed(1)}%)**

**Situación de Equilibrio:**
Tu campaña tiene un costo por conversión alto de $${value} COP.

**Evaluación del Experto:**
Esta campaña tiene potencial pero necesita ajustes:

**Plan de Mejora:**
1. **Optimiza el copy**: Pequeños cambios pueden mover la aguja
2. **Ajusta la segmentación**: Refina para llegar a audiencias más calificadas
3. **Prueba nuevos creativos**: A/B testing agresivo
4. **Revisa la oferta**: Asegúrate de que sea competitiva

**Objetivo:**
Llevar esta campaña a un costo por conversión óptimo en 2-3 semanas con optimizaciones continuas.`
      } else if (segmentName === "Costo excesivo") {
        insight = `💸 **Análisis de Costo excesivo (${percentage.toFixed(1)}%)**

**Alerta Crítica:**
Tu campaña tiene un costo por conversión excesivo de $${value} COP.

**Acción Inmediata Requerida:**
1. **Pausa si es crítico**: Detén la campaña con costo excesivo si no mejora
2. **Audita completamente**: Revisa cada elemento de la campaña problemática
3. **Reestructura completamente**: Nuevas audiencias, creativos y mensajes
4. **Considera pivotar**: Si después de optimizar no mejora, elimínala

**Recuperación:**
Con cambios drásticos, podrías recuperar esta campaña en 3-4 semanas.`
      }
    } else if (chartType === "ventas") {
      if (segmentName === "Ventas completadas") {
        insight = `✅ **Análisis de Ventas completadas (${percentage.toFixed(1)}%)**

**Rendimiento Actual:**
Has logrado ${value} ventas completadas, representando el ${percentage.toFixed(1)}% del total.

**Evaluación del Experto:**
Esta tasa está por encima del benchmark de la industria (30-40%). Aquí está tu estrategia de escalamiento:

**Acciones de Escalamiento:**
1. **Aumenta presupuesto gradualmente**: +20% semanal en esta campaña
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
1. **Pausa si es crítico**: Detén la campaña si ventas perdidas > 60%
2. **Audita completamente**: Revisa cada elemento de la campaña problemática
3. **Reestructura completamente**: Nuevas audiencias, creativos y mensajes
4. **Considera pivotar**: Si después de optimizar no mejora, elimínala

**Recuperación:**
Con cambios drásticos, podrías recuperar esta campaña en 3-4 semanas.`
      }
    } else if (chartType === "ingresos") {
      if (segmentName === "Ingresos generados") {
        insight = `💰 **Análisis de Ingresos generados (${percentage.toFixed(1)}%)**

**Rendimiento Actual:**
Has logrado $${value.toLocaleString()} COP en ingresos generados, representando el ${percentage.toFixed(1)}% del total.

**Evaluación del Experto:**
Esta tasa está por encima del benchmark de la industria (40-50%). Aquí está tu estrategia de escalamiento:

**Acciones de Escalamiento:**
1. **Aumenta presupuesto gradualmente**: +20% semanal en esta campaña
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

Basándome en los datos de tu campaña actual, te recomiendo:

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
Tu embudo de conversiones muestra señales de alerta que requieren intervención inmediata. Con solo 45 conversiones de 200 interacciones (22.5%), estás dejando dinero sobre la mesa.

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
1. Reescribe el copy enfocándote en beneficios, no features
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
1. **PAUSA INMEDIATA** si hay conjuntos con 0 conversiones
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
4. Reinvierte ganancias en conjuntos probados

**ESTRATEGIA DE PRESUPUESTO RESTANTE ($414,801 COP):**

**Distribución Inteligente:**
- 50% ($207,400 COP): Conjuntos optimizados y probados
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
✓ Costo por conversión trending
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
    // so it's left as is for now. If it were to be updated, it would need to update
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
    setActiveSection("general") // Reset active section on chart change
    setActiveNavSection("general") // Reset active nav section on chart change
    setExpandedAccordion(null) // Reset accordion on chart change
  }, [])

  const goToNextChart = useCallback(() => {
    setCurrentChartIndex((prev) => (prev === CHARTS.length - 1 ? 0 : prev + 1))
    setLeftPanelInsight("")
    setCenterPanelInsight("")
    setRightPanelInsight("")
    setHoveredChart(null)
    setActiveSection("general") // Reset active section on chart change
    setActiveNavSection("general") // Reset active nav section on chart change
    setExpandedAccordion(null) // Reset accordion on chart change
  }, [])

  const currentChart = CHARTS[currentChartIndex]
  const hasThreeSections = true

  const shouldShowUrgentBubble = () => {
    const percentages = getChartPercentages()
    const negativoValue = Number.parseFloat(percentages.negativo)
    const positivoValue = Number.parseFloat(percentages.positivo)

    // Show urgent bubble when viewing negativo tab AND negativo percentage exceeds positivo
    return activeNavSection === "negativo" && activeInsightTab === "resumen" && negativoValue > positivoValue
  }

  const getInsightsContent = useCallback(() => {
    const section = activeNavSection
    const tab = activeInsightTab
    const percentages = getChartPercentages()
    const lossAmount = getLossAmount()

    const negativoValue = Number.parseFloat(percentages.negativo)
    const positivoValue = Number.parseFloat(percentages.positivo)
    const showUrgentMessage = negativoValue > positivoValue

    // Generate comprehensive expert-level content for each combination
    if (section === "general") {
      if (tab === "resumen") {
        return {
          title: "Resumen Ejecutivo General",
          content: [
            {
              type: "highlight",
              color: "blue",
              title: "Visión Global del Experto",
              items: [
                "ROAS promedio de 2.4x superando el objetivo de 2.0x - excelente rendimiento general",
                "CVR en 3.2% dentro del rango óptimo (2.5-4.0%) para tu industria",
                "Ingresos creciendo 18% vs mes anterior, indicando momentum positivo",
                `Estado de la campaña: ${percentages.positivo}% Positivo, ${percentages.neutral}% Neutral, ${percentages.negativo}% Negativo - requiere optimización`,
              ],
            },
            {
              type: "metrics",
              title: "Métricas Clave del Periodo",
              items: [
                { label: "Conversiones Totales", value: "1,156", trend: "+12%" },
                { label: "Costo por Conversión", value: "$45", trend: "-8%" },
                { label: "Gasto Total", value: "$52k", trend: "+15%" },
                { label: "Ingresos Generados", value: "$125k", trend: "+18%" },
                { label: "ROI Global", value: "140%", trend: "+22%" },
              ],
            },
            {
              type: "highlight",
              color: "purple",
              title: "Análisis del Trafficker Experto",
              items: [
                `Tienes una base sólida con rendimiento positivo generando el 60% de tus ingresos`,
                `El rendimiento negativo está drenando recursos - oportunidad de recuperar $26k/mes`,
                `El rendimiento neutral tiene potencial de convertirse en ganador con optimizaciones menores`,
                "Tu mejor horario de conversión es 8pm-11pm con ROAS 3.8x vs 1.9x promedio diurno",
              ],
            },
          ],
        }
      } else if (tab === "acciones") {
        return {
          title: "Plan de Acción Estratégico",
          content: [
            {
              type: "checklist",
              color: "green",
              title: "Acciones Inmediatas (Próximas 48h)",
              items: [
                "Escalar presupuesto +30% si esta campaña tiene ROAS > 4x",
                "Pausar inmediatamente si esta campaña tiene ROAS < 0.3x y está quemando presupuesto",
                "Duplicar los conjuntos de anuncios ganadores para escalar sin riesgo",
                "Implementar reglas automáticas de pausa para ROAS < 0.5x por 3 días consecutivos",
              ],
            },
            {
              type: "checklist",
              color: "blue",
              title: "Optimizaciones Semanales (Próximos 7 días)",
              items: [
                "Reescribir el copy de esta campaña enfocándonos en beneficios emocionales",
                "Crear 3 nuevos creativos de video corto (15s) para las campañas de mejor rendimiento",
                "Implementar audiencias lookalike 1% de tus mejores conversores (últimos 30 días)",
                "Ajustar pujas a 'Highest Value' en campañas con CVR > 4% para maximizar ROAS",
                "Configurar remarketing para visitantes del sitio web de los últimos 14 días",
              ],
            },
            {
              type: "checklist",
              color: "purple",
              title: "Estrategia de Crecimiento (Próximo mes)",
              items: [
                "Expandir a nuevas ubicaciones geográficas (ciudades secundarias con menor CPC)",
                "Probar formato Reels/Stories en las campañas top 3 (potencial +40% alcance)",
                "Implementar secuencias de nurturing automatizadas para leads fríos",
                "Crear campaña de testimonios con UGC de clientes satisfechos",
                "Establecer presupuesto de experimentación del 15% para probar nuevas audiencias",
              ],
            },
          ],
        }
      } else if (tab === "riesgos") {
        return {
          title: "Análisis de Riesgos y Alertas",
          content: [
            {
              type: "alert",
              color: "red",
              title: "Alertas Críticas - Acción Inmediata Requerida",
              items: [
                "⚠️ Esta campaña con ROAS < 0.3x está quemando presupuesto sin retorno - PAUSAR HOY",
                "⚠️ Presupuesto al 85% de capacidad - riesgo de quedarte sin fondos en 12 días",
                "⚠️ Esta campaña muestra fatiga de audiencia (frecuencia > 4.5) - renovar creativos urgente",
                "⚠️ Costo por conversión subió 23% en últimos 7 días en esta campaña",
              ],
            },
            {
              type: "alert",
              color: "amber",
              title: "Advertencias - Monitoreo Cercano",
              items: [
                "⚡ CVR bajando gradualmente en esta campaña (de 4.2% a 3.8% en 5 días)",
                "⚡ Competencia aumentó pujas en tu audiencia principal (+18% CPC promedio)",
                "⚡ Tasa de rebote en landing page subió a 68% (era 52% hace 2 semanas)",
                "⚡ Conjuntos de anuncios cerca del límite de frecuencia óptima (3.8/4.0)",
              ],
            },
            {
              type: "highlight",
              color: "blue",
              title: "Riesgos de las Acciones Propuestas",
              items: [
                "Escalar muy rápido (>50% semanal) puede degradar ROAS por saturación de audiencia",
                "Pausar esta campaña elimina datos de aprendizaje - considera reducir presupuesto primero",
                "Cambiar múltiples variables simultáneamente dificulta identificar qué funciona",
                "Nuevos creativos requieren fase de aprendizaje (3-5 días) con posible caída temporal de rendimiento",
              ],
            },
            {
              type: "highlight",
              color: "green",
              title: "Mitigación de Riesgos - Recomendaciones",
              items: [
                "Escala gradualmente: +20% semanal máximo para mantener calidad",
                "Mantén 15% de presupuesto como reserva para oportunidades o ajustes",
                "Cambia una variable a la vez y espera 3 días para medir impacto",
                "Implementa pruebas A/B controladas antes de aplicar cambios a gran escala",
              ],
            },
          ],
        }
      }
    } else if (section === "negativo") {
      if (tab === "resumen") {
        return {
          title: "Análisis Profundo - Campaña Negativa",
          content: [
            {
              type: "alert",
              color: "red",
              title: `Situación Crítica - ${percentages.negativo}% de la Campaña`,
              items: [
                `La campaña actual con ROAS < 0.8x está perdiendo dinero activamente`,
                `Pérdida acumulada de ${formatCOP(26000)} en los últimos 30 días`,
                "ROAS promedio de 0.3x - cada $1 COP invertido genera solo $0.30 COP de retorno",
                "CVR promedio de 1.8% - muy por debajo del mínimo aceptable de 2.5%",
                `Costo por conversión de ${formatCOP(78)} vs objetivo de ${formatCOP(45)} - 73% más caro`,
                ...(showUrgentMessage ? [`\n\nNECESITAMOS HABLAR DE INMEDIATO HEMOS PERDIDO ${lossAmount} !!!`] : []),
              ],
            },
            {
              type: "metrics",
              title: "Métricas Detalladas del Segmento",
              items: [
                {
                  label: "Campaña Analizada",
                  value:
                    ACTIVE_CAMPAIGNS.find((c) => c.id === selectedCampaign)?.name.substring(0, 20) + "..." || "N/A",
                  trend: "",
                },
                { label: "Gasto Acumulado", value: formatCOP(26000), trend: "+12%" },
                { label: "Conversiones", value: "334", trend: "-18%" },
                { label: "ROAS Promedio", value: "0.3x", trend: "-0.2x" },
                { label: "CVR Promedio", value: "1.8%", trend: "-0.4%" },
              ],
            },
            {
              type: "highlight",
              color: "purple",
              title: "Diagnóstico del Experto en Meta Ads",
              items: [
                "Problema principal: Audiencias mal segmentadas - estás llegando a personas sin intención de compra",
                "Copy genérico que no diferencia tu oferta - necesitas propuesta de valor más clara",
                "Creativos con fatiga severa (frecuencia 5.2) - la audiencia ya vio tus anuncios demasiadas veces",
                "Landing page con tasa de rebote del 78% - fricción alta en el proceso de conversión",
                "Horarios de publicación no optimizados - 60% del gasto en horarios de bajo rendimiento",
              ],
            },
          ],
        }
      } else if (tab === "acciones") {
        return {
          title: "Plan de Rescate - Campaña Negativa",
          content: [
            {
              type: "checklist",
              color: "red",
              title: "Triage Inmediato (HOY)",
              items: [
                "PAUSAR esta campaña con ROAS < 0.2x (está quemando $8k/mes sin retorno)",
                "Reducir presupuesto -70% en las 20 campañas con ROAS 0.2x-0.5x",
                "Extraer audiencias de esta campaña para crear lista de exclusión global",
                "Documentar qué NO funciona: audiencias, copy, creativos, horarios",
              ],
            },
            {
              type: "checklist",
              color: "amber",
              title: "Reestructuración (Próximos 3-5 días)",
              items: [
                "Reescribir completamente el copy enfocándonos en dolor/solución específica",
                "Crear 5 nuevos creativos con testimonios reales y prueba social",
                "Implementar nuevas audiencias: intereses ultra-específicos + lookalike 1% de compradores",
                "Simplificar landing page: reducir campos de formulario de 8 a 3",
                "Configurar horarios optimizados: concentrar 80% del gasto en 7pm-11pm",
                "Implementar urgencia: ofertas limitadas en tiempo (24-48h)",
              ],
            },
            {
              type: "checklist",
              color: "blue",
              title: "Recuperación (Próximas 2 semanas)",
              items: [
                "Relanzar esta campaña reestructurada con presupuesto reducido",
                "Monitorear diariamente: pausar automáticamente si ROAS < 0.8x por 3 días",
                "Implementar pruebas A/B agresivas: 3 variantes de copy + 3 de creativos",
                "Crear secuencia de remarketing para recuperar visitantes que no convirtieron",
                "Establecer KPIs claros: ROAS > 1.5x en 14 días o eliminar definitivamente",
              ],
            },
            {
              type: "highlight",
              color: "green",
              title: "Proyección de Recuperación",
              items: [
                "Semana 1-2: Reducir pérdidas de $8k/mes a $2k/mes (-75%)",
                "Semana 3-4: Alcanzar punto de equilibrio (ROAS 1.0x) en esta campaña",
                "Mes 2: Convertir esta campaña a ROAS > 1.5x",
                "Mes 3: Eliminar definitivamente si no mejora, y redistribuir presupuesto",
              ],
            },
          ],
        }
      } else if (tab === "riesgos") {
        return {
          title: "Riesgos Críticos - Campaña Negativa",
          content: [
            {
              type: "alert",
              color: "red",
              title: "Riesgos Financieros Inmediatos",
              items: [
                "💸 Continuar sin cambios = pérdida de $26k adicionales en próximos 30 días",
                "💸 Presupuesto total se agotará en 12 días al ritmo actual de quema",
                "💸 Costo de oportunidad: $26k/mes que podrías invertir en conjuntos ganadores",
                "💸 Riesgo de fatiga de marca: audiencia asociando tu marca con anuncios irrelevantes",
              ],
            },
            {
              type: "alert",
              color: "amber",
              title: "Riesgos de las Acciones de Rescate",
              items: [
                "⚡ Pausar todo de golpe elimina datos de aprendizaje acumulados (3 meses)",
                "⚡ Reestructuración completa requiere nueva fase de aprendizaje (7-10 días sin resultados)",
                "⚡ Cambiar demasiadas variables simultáneamente dificulta identificar qué funciona",
                "⚡ Reducir presupuesto drásticamente puede afectar algoritmo de Meta (menor prioridad)",
              ],
            },
            {
              type: "highlight",
              color: "blue",
              title: "Estrategia de Mitigación de Riesgos",
              items: [
                "Pausa gradual: elimina los conjuntos peores cada día durante 3 días (no todos a la vez)",
                "Mantén 3-5 conjuntos como 'grupo de control' sin cambios para comparar",
                "Documenta todo: qué cambias, cuándo, y resultados para aprender",
                "Establece presupuesto máximo de pérdida: $500/conjunto para pruebas de rescate",
                "Ten plan B: si no mejora en 14 días, elimina y redistribuye presupuesto",
              ],
            },
            {
              type: "highlight",
              color: "purple",
              title: "Señales de Alerta para Abandonar",
              items: [
                "Si después de reestructuración completa ROAS sigue < 0.8x por 14 días → ELIMINAR",
                "Si CVR no supera 2.0% después de optimizar landing page → problema de producto/oferta",
                "Si costo por conversión sigue > $60 después de optimizaciones → audiencia incorrecta",
                "Si frecuencia > 5.0 incluso con nuevos creativos → audiencia demasiado pequeña",
              ],
            },
          ],
        }
      }
    } else if (section === "neutral") {
      if (tab === "resumen") {
        return {
          title: "Análisis Profundo - Campaña Neutral",
          content: [
            {
              type: "highlight",
              color: "amber",
              title: `Situación de Equilibrio - ${percentages.neutral}% de Campañas`,
              items: [
                `Esta campaña (${percentages.neutral}% del total) está en punto de equilibrio con ROAS 0.8x-1.5x`,
                "Generando $31,500 con inversión de $28,000 - ganancia marginal de $3,500/mes",
                "ROAS promedio de 1.1x - ligeramente rentable pero con gran potencial de mejora",
                "CVR promedio de 2.8% - dentro del rango aceptable pero puede optimizarse",
                "Esta campaña es tu mayor oportunidad: pequeños cambios = grandes resultados",
              ],
            },
            {
              type: "metrics",
              title: "Métricas Detalladas del Segmento",
              items: [
                {
                  label: "Campaña Analizada",
                  value:
                    ACTIVE_CAMPAIGNS.find((c) => c.id === selectedCampaign)?.name.substring(0, 20) + "..." || "N/A",
                  trend: "",
                },
                { label: "Gasto Acumulado", value: "$28k", trend: "+8%" },
                { label: "Ingresos Generados", value: "$31.5k", trend: "+12%" },
                { label: "ROAS Promedio", value: "1.1x", trend: "+0.1x" },
                { label: "CVR Promedio", value: "2.8%", trend: "+0.2%" },
              ],
            },
            {
              type: "highlight",
              color: "purple",
              title: "Diagnóstico del Experto - Potencial Alto",
              items: [
                "Esta campaña está 'casi ahí' - con optimizaciones menores puede ser ganadora",
                "Copy funcional pero genérico - necesita más diferenciación y urgencia",
                "Creativos decentes pero sin factor 'wow' - agregar testimonios y prueba social",
                "Audiencia correcta pero demasiado amplia - necesita refinamiento",
                "Horarios no optimizados - 40% del gasto en horarios de rendimiento medio",
                "Landing page aceptable (55% rebote) pero puede mejorar con optimizaciones CRO",
              ],
            },
          ],
        }
      } else if (tab === "acciones") {
        return {
          title: "Plan de Optimización - Campaña Neutral",
          content: [
            {
              type: "checklist",
              color: "amber",
              title: "Quick Wins (Próximas 48-72h)",
              items: [
                "Reescribir headline de esta campaña enfocándonos en beneficio #1 + urgencia (ej: 'Ahorra 40% - Solo 24h')",
                "Agregar prueba social al copy: '12,450 clientes satisfechos' o testimonios específicos",
                "Ajustar horarios: concentrar 70% del presupuesto en 7pm-11pm (mejor rendimiento)",
                "Implementar ofertas con urgencia: descuentos limitados a 48h o stock limitado",
                "Excluir audiencias de campañas negativas para mejorar calidad del tráfico",
              ],
            },
            {
              type: "checklist",
              color: "blue",
              title: "Optimizaciones Semanales (Próximos 7 días)",
              items: [
                "Crear 3 variantes de creativos con testimonios en video (15-30s)",
                "Refinar audiencias: reducir rango de edad, enfocarte en top 3 intereses",
                "Implementar lookalike 1-2% de conversores de esta campaña (no de todas)",
                "Optimizar landing page: agregar chat en vivo, reducir campos de formulario",
                "Configurar remarketing específico para visitantes de esta campaña",
                "Probar formato Carousel mostrando beneficios múltiples",
              ],
            },
            {
              type: "checklist",
              color: "green",
              title: "Escalamiento Gradual (Próximas 2-4 semanas)",
              items: [
                "Identificar las 3 mejores campañas neutrales (ROAS > 1.2x) para escalar",
                "Aumentar presupuesto +15% semanal solo en las que mejoren consistentemente",
                "Duplicar conjuntos ganadores para escalar sin afectar el original",
                "Expandir a ubicaciones adicionales (Stories, Reels) en campañas top",
                "Crear variantes de alto presupuesto de las 3 mejores campañas",
                "Implementar estrategia de pujas 'Highest Value' en las más rentables",
              ],
            },
            {
              type: "highlight",
              color: "purple",
              title: "Proyección de Mejora",
              items: [
                "Semana 1-2: Llevar ROAS de 1.1x a 1.5x con quick wins (+36% mejora)",
                "Semana 3-4: Alcanzar ROAS 2.0x en esta campaña con optimizaciones",
                "Mes 2: Convertir esta campaña a 'positiva' (ROAS > 2.5x)",
                "Mes 3: Generar $15k adicionales/mes con el mismo presupuesto (mejora de 48%)",
              ],
            },
          ],
        }
      } else if (tab === "riesgos") {
        return {
          title: "Riesgos y Precauciones - Campaña Neutral",
          content: [
            {
              type: "alert",
              color: "amber",
              title: "Riesgos de Estancamiento",
              items: [
                "⚡ Sin optimizaciones, esta campaña puede degradarse a negativa en 4-6 semanas",
                "⚡ Competencia aumentando pujas puede empujar tu ROAS de 1.1x a 0.9x rápidamente",
                "⚡ Fatiga de creativos (frecuencia 3.2) puede reducir CVR en próximas 2 semanas",
                "⚡ Mantener status quo = perder oportunidad de $15k/mes adicionales",
              ],
            },
            {
              type: "alert",
              color: "blue",
              title: "Riesgos de las Optimizaciones",
              items: [
                "🔵 Cambiar demasiado rápido puede confundir al algoritmo (fase de aprendizaje)",
                "🔵 Escalar muy agresivamente (>30% semanal) puede degradar ROAS por saturación",
                "🔵 Nuevos creativos requieren 3-5 días de aprendizaje con posible caída temporal",
                "🔵 Refinar audiencias demasiado puede reducir volumen de conversiones",
              ],
            },
            {
              type: "highlight",
              color: "green",
              title: "Estrategia de Mitigación - Enfoque Conservador",
              items: [
                "Cambia UNA variable a la vez y espera 3 días para medir impacto real",
                "Escala gradualmente: máximo +15-20% semanal para mantener calidad",
                "Mantén versiones originales activas mientras pruebas variantes (A/B testing)",
                "Establece presupuesto máximo de pérdida: $50/día por experimento",
                "Si ROAS baja < 1.0x por 5 días consecutivos, revierte cambios inmediatamente",
              ],
            },
            {
              type: "highlight",
              color: "purple",
              title: "Señales de Éxito vs Fracaso",
              items: [
                "✅ ÉXITO: ROAS sube a 1.5x+ en 7 días → continuar optimizando y escalar",
                "✅ ÉXITO: CVR aumenta 0.5%+ en 5 días → replicar cambios en otros conjuntos",
                "❌ FRACASO: ROAS baja < 1.0x después de cambios → revertir inmediatamente",
                "❌ FRACASO: CVR baja 0.3%+ en 3 días → pausar pruebas y analizar qué falló",
              ],
            },
          ],
        }
      }
    } else if (section === "positivo") {
      if (tab === "resumen") {
        return {
          title: "Análisis Profundo - Campaña Positiva",
          content: [
            {
              type: "highlight",
              color: "green",
              title: `Excelente Rendimiento - ${percentages.positivo}% de Campañas`,
              items: [
                `Esta campaña (${percentages.positivo}% del total) tiene ROAS > 2.5x generando la mayoría de tus ganancias`,
                "Generando $75,000 con inversión de solo $18,000 - ganancia neta de $57,000/mes",
                "ROAS promedio de 4.2x - cada $1 invertido genera $4.20 de retorno",
                "CVR promedio de 4.8% - muy por encima del benchmark de la industria (2.5-3.5%)",
                "Esta campaña es tu 'mina de oro' - representa el 60% de tus ingresos totales",
              ],
            },
            {
              type: "metrics",
              title: "Métricas Detalladas del Segmento",
              items: [
                {
                  label: "Campaña Analizada",
                  value:
                    ACTIVE_CAMPAIGNS.find((c) => c.id === selectedCampaign)?.name.substring(0, 20) + "..." || "N/A",
                  trend: "",
                },
                { label: "Gasto Acumulado", value: "$18k", trend: "+25%" },
                { label: "Ingresos Generados", value: "$75k", trend: "+32%" },
                { label: "ROAS Promedio", value: "4.2x", trend: "+0.5x" },
                { label: "CVR Promedio", value: "4.8%", trend: "+0.6%" },
              ],
            },
            {
              type: "highlight",
              color: "purple",
              title: "Análisis del Experto - Qué Está Funcionando",
              items: [
                "Copy altamente específico con beneficios claros y urgencia bien implementada",
                "Creativos con testimonios reales y prueba social fuerte (reviews, casos de éxito)",
                "Audiencias ultra-segmentadas: intereses específicos + lookalike 1% de compradores",
                "Horarios optimizados: 85% del gasto concentrado en 7pm-11pm (mejor rendimiento)",
                "Landing page optimizada: tasa de rebote de solo 38% vs 55% promedio",
                "Ofertas con urgencia real: descuentos limitados en tiempo que generan FOMO",
              ],
            },
          ],
        }
      } else if (tab === "acciones") {
        return {
          title: "Plan de Escalamiento - Campaña Positiva",
          content: [
            {
              type: "checklist",
              color: "green",
              title: "Escalamiento Inmediato (Próximas 48h)",
              items: [
                "Aumentar presupuesto +30% en esta campaña (si ROAS > 4x)",
                "Duplicar los conjuntos de anuncios ganadores para escalar sin afectar el original",
                "Crear audiencias lookalike 1% de conversores de esta campaña específica",
                "Expandir a ubicaciones adicionales: Stories y Reels (mantener mismo creative)",
                "Aumentar pujas en horarios pico (8pm-11pm) para capturar más volumen",
              ],
            },
            {
              type: "checklist",
              color: "blue",
              title: "Replicación del Éxito (Próximos 7 días)",
              items: [
                "Documentar EXACTAMENTE qué hace diferente a esta campaña: audiencias, copy, creativos",
                "Crear 'plantilla ganadora' con elementos comunes de las campañas positivas",
                "Aplicar aprendizajes a las 3 mejores campañas neutrales (quick wins)",
                "Crear 3 nuevas campañas usando la fórmula ganadora con variaciones menores",
                "Implementar los mismos horarios optimizados en todas las campañas activas",
                "Replicar el estilo de creativos ganadores en nuevas variantes",
              ],
            },
            {
              type: "checklist",
              color: "purple",
              title: "Expansión Estratégica (Próximas 2-4 semanas)",
              items: [
                "Expandir geográficamente: probar esta campaña ganadora en ciudades secundarias",
                "Crear variantes de alto presupuesto ($200-300/día) de esta campaña",
                "Probar formatos premium: Instant Experience, Collection Ads con productos",
                "Implementar remarketing agresivo de visitantes de esta campaña (alta intención)",
                "Crear secuencias de upsell/cross-sell para maximizar LTV de conversores",
                "Probar audiencias lookalike 2-3% para expandir alcance manteniendo calidad",
              ],
            },
            {
              type: "highlight",
              color: "green",
              title: "Proyección de Escalamiento",
              items: [
                "Semana 1-2: Aumentar ingresos de $75k a $95k/mes (+27%) con escalamiento gradual",
                "Semana 3-4: Alcanzar $120k/mes replicando éxito en esta campaña neutral",
                "Mes 2: Llegar a $150k/mes expandiendo geográficamente y a nuevos formatos",
                "Mes 3: Objetivo de $200k/mes manteniendo ROAS > 3.5x (crecimiento sostenible)",
              ],
            },
          ],
        }
      } else if (tab === "riesgos") {
        return {
          title: "Riesgos y Precauciones - Campaña Positiva",
          content: [
            {
              type: "alert",
              color: "amber",
              title: "Riesgos del Escalamiento Agresivo",
              items: [
                "⚡ Escalar muy rápido (>50% semanal) puede saturar audiencias y degradar ROAS",
                "⚡ Duplicar presupuesto de golpe puede confundir al algoritmo (nueva fase de aprendizaje)",
                "⚡ Expandir a audiencias más amplias puede reducir CVR y aumentar costo por conversión",
                "⚡ Fatiga de creativos: incluso los mejores anuncios pierden efectividad después de 4-6 semanas",
              ],
            },
            {
              type: "alert",
              color: "red",
              title: "Riesgos de No Actuar",
              items: [
                "💸 Competencia puede copiar tu estrategia y aumentar CPCs en tus audiencias",
                "💸 Oportunidad perdida: podrías estar generando $50k/mes adicionales escalando",
                "💸 Audiencias se saturan: frecuencia aumenta y rendimiento baja sin expansión",
                "💸 Estacionalidad: el momento óptimo para escalar puede pasar (temporada alta)",
              ],
            },
            {
              type: "highlight",
              color: "blue",
              title: "Estrategia de Escalamiento Seguro",
              items: [
                "Escala gradualmente: máximo +20-25% semanal para mantener calidad",
                "Duplica conjuntos en lugar de aumentar presupuesto (método CBO de Meta)",
                "Mantén 3-5 variantes de creativos rotando para evitar fatiga",
                "Monitorea frecuencia: si supera 4.0, introduce nuevos creativos inmediatamente",
                "Establece límites: si ROAS baja < 3.0x, pausa escalamiento y optimiza",
                "Mantén 20% de presupuesto en experimentación (nuevas audiencias/creativos)",
              ],
            },
            {
              type: "highlight",
              color: "green",
              title: "Señales de Alerta para Desacelerar",
              items: [
                "🚨 ROAS baja > 0.5x en 3 días consecutivos → pausar escalamiento",
                "🚨 CVR baja > 1.0% en 5 días → audiencia saturada, necesitas expansión",
                "🚨 Frecuencia > 4.5 → fatiga severa, rotar creativos urgentemente",
                "🚨 CPC aumenta > 30% → competencia alta, considera nuevas audiencias",
              ],
            },
          ],
        }
      }
    }

    return {
      title: "Contenido no disponible",
      content: [],
    }
  }, [activeNavSection, activeInsightTab, getChartPercentages, getLossAmount])

  const handleAplicar = () => {
    toast({
      title: "✓ Cambios aplicados exitosamente",
      description: "Las recomendaciones de IA han sido aplicadas a tu campaña.",
      variant: "default",
    })

    // Close modal after a short delay
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const handleExportar = () => {
    try {
      const insightsData = getInsightsContent()
      let exportContent = `REPORTE DE INSIGHTS - ${insightsData.title}\n`
      exportContent += `Generado: ${new Date().toLocaleString("es-CO")}\n`
      exportContent += `Campaña: ${ACTIVE_CAMPAIGNS.find((c) => c.id === selectedCampaign)?.name || "N/A"}\n`
      exportContent += `\n${"=".repeat(80)}\n\n`

      insightsData.content.forEach((section) => {
        exportContent += `${section.title}\n`
        exportContent += `${"-".repeat(section.title.length)}\n\n`

        if (section.type === "highlight" || section.type === "alert") {
          section.items.forEach((item: string) => {
            exportContent += `• ${item}\n`
          })
        } else if (section.type === "checklist") {
          section.items.forEach((item: string) => {
            exportContent += `☐ ${item}\n`
          })
        } else if (section.type === "metrics") {
          section.items.forEach((item: any) => {
            exportContent += `${item.label}: ${item.value} ${item.trend ? `(${item.trend})` : ""}\n`
          })
        }
        exportContent += `\n`
      })

      // Create and download file
      const blob = new Blob([exportContent], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `insights-${activeNavSection}-${activeInsightTab}-${Date.now()}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "✓ Reporte exportado",
        description: "El archivo ha sido descargado exitosamente.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "✗ Error al exportar",
        description: "Hubo un problema al generar el archivo.",
        variant: "destructive",
      })
    }
  }

  const modalContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl shadow-2xl max-w-[96vw] w-full flex flex-col relative"
          style={{ height: "min(90vh, 1000px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
            <div>
              <h1 className="text-[28px] leading-8 font-semibold text-[#0F172A] tracking-tight">
                Análisis con IA - Gráficos Inteligentes
              </h1>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Powered by Gemini 2.5 Pro • ID: {campaignId || "General"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Added campaign selector */}
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-[220px] bg-gray-100 border-gray-300 text-gray-700 text-[11px] font-medium h-8 px-3 rounded-lg">
                  <SelectValue placeholder="Selecciona una campaña..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {ACTIVE_CAMPAIGNS.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id} className="text-[11px] py-1.5">
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-2 py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousChart}
                  className="hover:bg-white h-6 w-6 rounded-lg transition-all duration-200"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="text-[11px] font-semibold text-gray-700 min-w-[35px] text-center">
                  {currentChartIndex + 1} / {CHARTS.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextChart}
                  className="hover:bg-white h-6 w-6 rounded-lg transition-all duration-200"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-gray-100 h-7 w-7 rounded-lg transition-all duration-200"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="sticky top-[65px] bg-white border-b border-gray-200 px-4 py-2 z-10">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveNavSection("general")}
                className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeNavSection === "general"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveNavSection("negativo")}
                className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeNavSection === "negativo"
                    ? "bg-[#EF4444] text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                }`}
              >
                Negativo {getChartPercentages().negativo}% • {getChartPercentages().negativoPeriod}
              </button>
              {!hasOnlyTwoDataPoints() && (
                <button
                  onClick={() => setActiveNavSection("neutral")}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all duration-200 whitespace-nowrap ${
                    activeNavSection === "neutral"
                      ? "bg-[#F59E0B] text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Neutral {getChartPercentages().neutral}% • {getChartPercentages().neutralPeriod}
                </button>
              )}
              <button
                onClick={() => setActiveNavSection("positivo")}
                className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeNavSection === "positivo"
                    ? "bg-[#16A34A] text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                }`}
              >
                Positivo {getChartPercentages().positivo}% • {getChartPercentages().positivoPeriod}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-50/30">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-600 font-medium">Analizando datos con IA...</span>
              </div>
            ) : (
              <div className="p-4">
                {hasThreeSections ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Donut card (cols 1-5, 40% width) */}
                    <div className="lg:col-span-5">
                      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden h-full">
                        <CardHeader className="bg-gradient-to-br from-gray-50 to-white pb-3 pt-4 px-4 border-b border-gray-100">
                          <CardTitle className="text-base leading-5 font-semibold text-[#0F172A]">
                            {CHARTS[currentChartIndex].metricName}
                          </CardTitle>
                          <CardDescription className="text-[11px] text-gray-600 mt-0.5">
                            {currentChart.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 flex flex-col items-center">
                          <div className="w-full aspect-square max-h-[260px] mb-3 relative">
                            <ChartCard
                              key={currentChart.id}
                              title=""
                              description=""
                              data={getCurrentChartData()}
                              chartType={currentChart.id}
                              colors={getCurrentChartColors()}
                              isHovered={hoveredChart === currentChart.id}
                              onHover={handleChartHover}
                              onLeave={handleChartLeave}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="text-center">
                                <p className="text-xl font-bold text-[#0F172A]">100</p>
                                <p className="text-[10px] text-gray-600 mt-0.5">Total</p>
                              </div>
                            </div>
                          </div>
                          <div className="w-full grid grid-cols-2 gap-2">
                            {getCurrentChartData()
                              .slice(0, 6)
                              .map((item, index) => {
                                const total = getCurrentChartData().reduce((sum, d) => sum + d.value, 0)
                                const percentage = ((item.value / total) * 100).toFixed(1)
                                const color = getCurrentChartColors()[index]
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                                      style={{ backgroundColor: color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-semibold text-[#0F172A] truncate">{item.name}</p>
                                      <p className="text-[10px] text-gray-600">
                                        {percentage}%{" "}
                                        {item.period && <span className="text-blue-600">• {item.period}</span>}
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                            {getCurrentChartData().length > 6 && (
                              <div className="flex items-center justify-center p-2 rounded-lg bg-gray-50 text-[11px] font-semibold text-gray-600">
                                +{getCurrentChartData().length - 6}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-7">
                      <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden h-full flex flex-col">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 px-3 py-1.5 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-base leading-5 font-semibold text-gray-900">
                                  Insights IA
                                </CardTitle>
                                <CardDescription className="text-[10px] text-gray-600 mt-0.5">
                                  Análisis en tiempo real
                                </CardDescription>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] font-semibold text-gray-700 hover:bg-white rounded-lg"
                            >
                              Fijar
                            </Button>
                          </div>

                          <div className="mt-2">
                            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                              <SelectTrigger className="w-full h-8 text-xs bg-white border-gray-300">
                                <SelectValue placeholder="Seleccionar campaña" />
                              </SelectTrigger>
                              <SelectContent>
                                {ACTIVE_CAMPAIGNS.map((campaign) => (
                                  <SelectItem key={campaign.id} value={campaign.id} className="text-xs">
                                    {campaign.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardHeader>

                        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-200 bg-gray-50">
                          <button
                            onClick={() => setActiveInsightTab("resumen")}
                            className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                              activeInsightTab === "resumen"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            Resumen
                          </button>
                          <button
                            onClick={() => setActiveInsightTab("acciones")}
                            className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                              activeInsightTab === "acciones"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            Acciones
                          </button>
                          <button
                            onClick={() => setActiveInsightTab("riesgos")}
                            className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                              activeInsightTab === "riesgos"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            Riesgos
                          </button>
                        </div>

                        <CardContent className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                          {(() => {
                            const insightsData = getInsightsContent()
                            return (
                              <div className="space-y-1.5">
                                {insightsData.content.map((section, idx) => {
                                  if (section.type === "highlight") {
                                    const bgColors = {
                                      blue: "bg-blue-50 border-blue-200",
                                      green: "bg-green-50 border-green-200",
                                      red: "bg-red-50 border-red-200",
                                      amber: "bg-amber-50 border-amber-200",
                                      purple: "bg-purple-50 border-purple-200",
                                    }
                                    const textColors = {
                                      blue: "text-blue-900",
                                      green: "text-green-900",
                                      red: "text-red-900",
                                      amber: "text-amber-900",
                                      purple: "text-purple-900",
                                    }
                                    const bulletColors = {
                                      blue: "text-blue-600",
                                      green: "text-green-600",
                                      red: "text-red-600",
                                      amber: "text-amber-600",
                                      purple: "text-purple-600",
                                    }
                                    return (
                                      <div
                                        key={idx}
                                        className={`rounded-lg border p-2 ${bgColors[section.color as keyof typeof bgColors]}`}
                                      >
                                        <h4
                                          className={`text-[11px] font-bold mb-1.5 ${textColors[section.color as keyof typeof textColors]}`}
                                        >
                                          {section.title}
                                        </h4>
                                        <ul className="space-y-1">
                                          {section.items.map((item, itemIdx) => (
                                            <li
                                              key={itemIdx}
                                              className={`text-[10px] leading-relaxed flex items-start gap-1.5 ${textColors[section.color as keyof typeof textColors]}`}
                                            >
                                              {item.startsWith("\n\nNECESITAMOS HABLAR") ? (
                                                <span className="font-black text-[11px] mt-2 block w-full text-center bg-red-600 text-white py-2 px-3 rounded-md animate-pulse">
                                                  {item.trim()}
                                                </span>
                                              ) : (
                                                <>
                                                  <span className="text-[10px] mt-0.5 flex-shrink-0">•</span>
                                                  <span className="flex-1">{item}</span>
                                                </>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )
                                  } else if (section.type === "metrics") {
                                    return (
                                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                        <h4 className="text-[11px] font-semibold text-gray-900 mb-1.5">
                                          {section.title}
                                        </h4>
                                        <div className="space-y-1.5">
                                          {section.items.map((metric, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                              <span className="text-[11px] text-gray-600">{metric.label}</span>
                                              <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-gray-900">
                                                  {metric.value}
                                                </span>
                                                {metric.trend && (
                                                  <span
                                                    className={`text-[10px] font-semibold ${metric.trend.startsWith("+") ? "text-green-600" : metric.trend.startsWith("-") ? "text-red-600" : "text-gray-600"}`}
                                                  >
                                                    {metric.trend}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  } else if (section.type === "checklist") {
                                    const bgColors = {
                                      blue: "bg-blue-50 border-blue-200",
                                      green: "bg-green-50 border-green-200",
                                      red: "bg-red-50 border-red-200",
                                      amber: "bg-amber-50 border-amber-200",
                                      purple: "bg-purple-50 border-purple-200",
                                    }
                                    const textColors = {
                                      blue: "text-blue-900",
                                      green: "text-green-900",
                                      red: "text-red-900",
                                      amber: "text-amber-900",
                                      purple: "text-purple-900",
                                    }
                                    const itemTextColors = {
                                      blue: "text-blue-800",
                                      green: "text-green-800",
                                      red: "text-red-800",
                                      amber: "text-amber-800",
                                      purple: "text-purple-800",
                                    }
                                    return (
                                      <div
                                        key={idx}
                                        className={`rounded-lg border p-2 ${bgColors[section.color as keyof typeof bgColors]}`}
                                      >
                                        <h4
                                          className={`text-[11px] font-bold mb-1.5 ${textColors[section.color as keyof typeof textColors]}`}
                                        >
                                          {section.title}
                                        </h4>
                                        <ul className="space-y-1.5">
                                          {section.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                              <input type="checkbox" className="mt-0.5" />
                                              <span
                                                className={`text-[11px] ${itemTextColors[section.color as keyof typeof itemTextColors]}`}
                                              >
                                                {item}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )
                                  } else if (section.type === "alert") {
                                    const bgColors = {
                                      blue: "bg-blue-50 border-blue-200",
                                      green: "bg-green-50 border-green-200",
                                      red: "bg-red-50 border-red-200",
                                      amber: "bg-amber-50 border-amber-200",
                                      purple: "bg-purple-50 border-purple-200",
                                    }
                                    const textColors = {
                                      blue: "text-blue-900",
                                      green: "text-green-900",
                                      red: "text-red-900",
                                      amber: "text-amber-900",
                                      purple: "text-purple-900",
                                    }
                                    return (
                                      <div
                                        key={idx}
                                        className={`rounded-lg border p-2 ${bgColors[section.color as keyof typeof bgColors]}`}
                                      >
                                        <h4
                                          className={`text-[11px] font-bold mb-1.5 ${textColors[section.color as keyof typeof textColors]}`}
                                        >
                                          {section.title}
                                        </h4>
                                        <ul className="space-y-1">
                                          {section.items.map((item, itemIdx) => (
                                            <li
                                              key={itemIdx}
                                              className={`text-[10px] leading-relaxed flex items-start gap-1.5 ${textColors[section.color as keyof typeof textColors]}`}
                                            >
                                              {item.startsWith("\n\nNECESITAMOS HABLAR") ? (
                                                <span className="font-black text-[11px] mt-2 block w-full text-center bg-red-600 text-white py-2 px-3 rounded-md animate-pulse">
                                                  {item.trim()}
                                                </span>
                                              ) : (
                                                <>
                                                  <span className="text-[10px] mt-0.5 flex-shrink-0">•</span>
                                                  <span className="flex-1">{item}</span>
                                                </>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )
                                  }
                                  return null
                                })}
                              </div>
                            )
                          })()}
                        </CardContent>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <div className="flex gap-2">
                            <Button
                              onClick={handleAplicar}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-7 text-[11px] rounded-lg shadow-sm transition-all duration-200"
                            >
                              Aplicar
                            </Button>
                            <Button
                              onClick={handleExportar}
                              variant="outline"
                              className="h-7 px-2 text-[11px] rounded-lg border-gray-300 hover:bg-gray-100 bg-transparent"
                            >
                              Exportar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="w-full">
                      <Card className="border-2 h-full shadow-lg transition-all duration-300 border-green-500 bg-gradient-to-br from-green-50 to-white rounded-xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-green-500/15 to-green-500/5 pb-4 pt-5 px-5">
                          <CardTitle className="flex items-center gap-2 text-green-700 text-base font-bold">
                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-2">{getCurrentChartData()[1]?.name || "Cargando..."}</span>
                          </CardTitle>
                          <CardDescription className="text-sm font-semibold text-green-600 mt-1">
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
                        <CardContent className="max-h-[480px] overflow-y-auto p-5 custom-scrollbar">
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            {leftPanelInsight ? (
                              <div className="prose prose-sm max-w-none">
                                {leftPanelInsight.split("\n").map((line, i) => (
                                  <p key={i} className="mb-2.5 text-xs leading-relaxed text-gray-700">
                                    {line}
                                  </p>
                                ))}
                              </div>
                            ) : null}
                          </motion.div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="w-full">
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

                    <div className="w-full">
                      <Card className="border-2 h-full shadow-lg transition-all duration-300 border-red-500 bg-gradient-to-br from-red-50 to-white rounded-xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-red-500/15 to-red-500/5 pb-4 pt-5 px-5">
                          <CardTitle className="flex items-center gap-2 text-red-700 text-base font-bold">
                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-2">{getCurrentChartData()[0]?.name || "Cargando..."}</span>
                          </CardTitle>
                          <CardDescription className="text-sm font-semibold text-red-600 mt-1">
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
                        <CardContent className="max-h-[480px] overflow-y-auto p-5 custom-scrollbar">
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            {rightPanelInsight ? (
                              <div className="prose prose-sm max-w-none">
                                {rightPanelInsight.split("\n").map((line, i) => (
                                  <p key={i} className="mb-2.5 text-xs leading-relaxed text-gray-700">
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
            )}
          </div>

          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4"
                onClick={() => setIsChatOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full max-w-2xl h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-gold/30 shadow-2xl flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gold/20 bg-gradient-to-r from-gold/10 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-gold to-gold-dark rounded-lg shadow-lg">
                          <Sparkles className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gold">Chat con IA - Gemini</h2>
                          <p className="text-sm text-gray-400">Analicemos tus campañas juntos</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsChatOpen(false)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-gold to-gold-dark text-gray-900 shadow-lg"
                              : "bg-gray-800/50 text-gray-100 border border-gray-700/50"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800/50 text-gray-100 border border-gray-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 bg-gold rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <div
                              className="w-2 h-2 bg-gold rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <div
                              className="w-2 h-2 bg-gold rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gold/20 bg-gray-900/50">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="Escribe tu pregunta sobre las campañas..."
                        className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-gold focus:ring-gold"
                        disabled={isChatLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isChatLoading}
                        className="bg-gradient-to-br from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-gray-900 shadow-lg disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {shouldShowUrgentBubble() && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              className="absolute bottom-6 right-6 z-20"
            >
              <div className="relative">
                {/* Pulsing background effect */}
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />

                {/* Main bubble */}
                <button
                  onClick={handleUrgentBubbleClick}
                  className="relative bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-3 transition-all duration-200 hover:scale-105 group"
                >
                  {/* AI Icon with pulse animation */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white rounded-lg animate-pulse opacity-20" />
                    <div className="relative p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-black uppercase tracking-wide">¡ES URGENTE!</span>
                    <span className="text-sm font-bold">Contáctanos</span>
                  </div>

                  {/* Notification dot */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-bounce" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  if (!isOpen) return null // Added check for isOpen

  return createPortal(modalContent, document.body)
}
