import { getAIScore } from "@/lib/gemini";
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
import { analyzeWithGemini } from "@/lib/gemini"
import type { Campaign } from "@/services/metaAdsService"

const sectionBgColors = {
  blue: "bg-blue-50 border-blue-200",
  green: "bg-green-50 border-green-200",
  red: "bg-red-50 border-red-200",
  amber: "bg-amber-50 border-amber-200",
  purple: "bg-purple-50 border-purple-200",
} as const

const sectionTextColors = {
  blue: "text-blue-900",
  green: "text-green-900",
  red: "text-red-900",
  amber: "text-amber-900",
  purple: "text-purple-900",
} as const

const itemTextColorsMap = {
  blue: "text-blue-800",
  green: "text-green-800",
  red: "text-red-800",
  amber: "text-amber-800",
  purple: "text-purple-800",
} as const

function SectionBox(props: Readonly<{ variant: "highlight" | "alert" | "checklist"; color?: keyof typeof sectionBgColors; title: string; children: React.ReactNode }>) {
  const { title, children, color: _c, variant: _variant } = props
  const color = _c ?? "blue"
  return (
    <div className={`rounded-lg border p-2 ${sectionBgColors[color]}`}>
      <h4 className={`text-[11px] font-bold mb-1.5 ${sectionTextColors[color]}`}>{title}</h4>
      {children}
    </div>
  )
}

type InsightSection =
  | { type: "highlight" | "alert"; color: "blue" | "green" | "red" | "amber" | "purple"; title: string; items: string[] }
  | { type: "checklist"; color: "blue" | "green" | "red" | "amber" | "purple"; title: string; items: string[] }
  | { type: "metrics"; title: string; items: Array<{ label: string; value: string; trend?: string }> }

type InsightsContext = {
  section: "general" | "negativo" | "neutral" | "positivo"
  tab: "resumen" | "acciones" | "riesgos"
  percentages: {
    positivo: string
    neutral: string
    negativo: string
    positivoName: string
    neutralName: string
    negativoName: string
    positivoPeriod: string
    neutralPeriod: string
    negativoPeriod: string
  }
  lossAmount: string
  selectedCampaignName: string
  formatCOP: (a: number | string) => string
}

function buildGeneralContent(ctx: InsightsContext): { title: string; content: InsightSection[] } {
  const { tab, percentages } = ctx
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
  }
  if (tab === "acciones") {
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
  }
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

function buildNegativoContent(ctx: InsightsContext): { title: string; content: InsightSection[] } {
  const { tab, percentages, selectedCampaignName, lossAmount, formatCOP } = ctx
  const showUrgentMessage = Number.parseFloat(percentages.negativo) > Number.parseFloat(percentages.positivo)
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
              value: selectedCampaignName ? selectedCampaignName.substring(0, 20) + "..." : "N/A",
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
  }
  if (tab === "acciones") {
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
  }
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

function buildNeutralContent(ctx: InsightsContext): { title: string; content: InsightSection[] } {
  const { tab, percentages, selectedCampaignName } = ctx
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
              value: selectedCampaignName ? selectedCampaignName.substring(0, 20) + "..." : "N/A",
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
  }
  if (tab === "acciones") {
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
  }
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

function buildPositivoContent(ctx: InsightsContext): { title: string; content: InsightSection[] } {
  const { tab, percentages, selectedCampaignName } = ctx
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
              value: selectedCampaignName ? selectedCampaignName.substring(0, 20) + "..." : "N/A",
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
  }
  if (tab === "acciones") {
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
  }
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

function AIChartsModalInner({
  isOpen,
  campaignId,
  campaigns,
  onClose,
}: {
  isOpen: boolean
  campaignId: string | null
  campaigns?: Campaign[]
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [rightPanelInsight, setRightPanelInsight] = useState<string>("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)
  // Reserved for future full-analysis feature
  // const [aiInsight] = useState<string>("") // removed: unused future feature

  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const insightTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [isChatOpen, setIsChatOpen] = useState(false)

  // New state variables for 3-section chart interaction
  const [activeInsightTab, setActiveInsightTab] = useState<"resumen" | "acciones" | "riesgos">("resumen")
  const [activeNavSection, setActiveNavSection] = useState<"general" | "negativo" | "neutral" | "positivo">("general")
  // Removed unused UI states to simplify component

  // Charts catalog and colors used in this modal
  const CHARTS = useMemo(
    () =>
      [
        {
          id: "conversions",
          title: "Embudo de conversiones",
          metricName: "Conversiones",
          description: "Conversiones vs. no conversión en los últimos 30 días",
        },
        {
          id: "budget",
          title: "Uso de presupuesto",
          metricName: "Presupuesto",
          description: "Porcentaje gastado vs. restante del presupuesto total",
        },
        {
          id: "roas",
          title: "Progreso de ROAS",
          metricName: "ROAS",
          description: "Avance hacia el objetivo 3x de rentabilidad",
        },
        {
          id: "cvr",
          title: "Tasa de conversión (CVR)",
          metricName: "CVR",
          description: "Progreso hacia un CVR de referencia del 20%",
        },
        {
          id: "gastado",
          title: "Gasto acumulado",
          metricName: "Gastado",
          description: "Gasto vs. presupuesto total estimado",
        },
        {
          id: "costPerConv",
          title: "Costo por conversación",
          metricName: "Costo/Conv",
          description: "Relación entre costo actual y objetivo",
        },
        {
          id: "ventas",
          title: "Ventas tras conversación",
          metricName: "Ventas",
          description: "Confirmadas vs. no compran tras chat",
        },
        {
          id: "ingresos",
          title: "Cobertura del gasto",
          metricName: "Ingresos",
          description: "Ingresos vs. gasto (breakeven)",
        },
      ] as const,
    [],
  )

  const CONVERSION_COLORS = useMemo(() => ["#16a34a", "#ef4444"] as const, [])
  const BUDGET_COLORS = useMemo(() => ["#3b82f6", "#93c5fd"] as const, [])
  const ROAS_COLORS = useMemo(() => ["#10b981", "#fbbf24"] as const, [])
  const CVR_COLORS = useMemo(() => ["#8b5cf6", "#c4b5fd"] as const, [])
  const GASTADO_COLORS = useMemo(() => ["#3b82f6", "#93c5fd"] as const, [])
  const COST_PER_CONV_COLORS = useMemo(() => ["#10b981", "#ef4444"] as const, [])
  const VENTAS_COLORS = useMemo(() => ["#0ea5e9", "#f59e0b"] as const, [])
  const INGRESOS_COLORS = useMemo(() => ["#22c55e", "#ef4444"] as const, [])

  // Missing state used later in the file
  const [currentChartIndex, setCurrentChartIndex] = useState(0)
  const [hoveredChart, setHoveredChart] = useState<string | null>(null)
  const [leftPanelInsight, setLeftPanelInsight] = useState<string>("")
  // Only left/right are used in the 2-panel layout

  const campaignsList = useMemo(() => campaigns || [], [campaigns])
  const [selectedCampaign, setSelectedCampaign] = useState<string>(campaignId || campaignsList[0]?.id || "")

  useEffect(() => {
    if (campaignId) {
      setSelectedCampaign(campaignId)
    } else if (!selectedCampaign && campaignsList.length > 0) {
      setSelectedCampaign(campaignsList[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, campaignsList.length])

  const selectedCampaignData = useMemo(() => {
    return campaignsList.find((c) => c.id === selectedCampaign)
  }, [campaignsList, selectedCampaign])

  const { toast } = useToast()

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

  // Helpers
  const clampPct = (n: number) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0))
  const to2 = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(2)) : 0)

  const conversionData = useMemo(() => {
    const cvrPct = clampPct(selectedCampaignData?.cvr ?? 0)
    const noConv = clampPct(100 - cvrPct)
    return Object.freeze([
      { name: "Conversiones", value: to2(cvrPct), growth: "", period: "30d" },
      { name: "Sin conversión", value: to2(noConv), growth: "", period: "30d" },
    ])
  }, [selectedCampaignData])

  // Generate context insights for left/right panels based on current donut segments
  const generatePanelInsight = useCallback(
    (
      chartType: string,
      segmentName: string,
      _value: number,
      percentage: number,
      panel: "left" | "center" | "right" = "left",
    ) => {
      if (isTransitioning) return
      setIsTransitioning(true)

      if (insightTimerRef.current) {
        clearTimeout(insightTimerRef.current)
      }

      const seg = segmentName.toLowerCase()
      const pct = percentage.toFixed(1)
      const T: Record<string, (s: string) => string> = {
        conversions: (s) => (s.includes("conversiones") ? `📊 Conversiones: ${pct}% del total.\nAcción: duplica variantes que mejor cierran.` : `⚠️ Sin conversión: ${pct}% del total.\nAcción: simplifica inicio de chat y refina audiencias.`),
        budget: (s) => (s.includes("gastado") ? `💰 Gastado: ${pct}%.\nAcción: concentra en conjuntos con mejor CVR.` : `💵 Presupuesto restante: ${pct}%.\nAcción: 30% testing, 70% en ganadores.`),
        gastado: (s) => (s.includes("gastado") ? `💰 Gastado: ${pct}%.\nAcción: concentra en conjuntos con mejor CVR.` : `💵 Presupuesto restante: ${pct}%.\nAcción: 30% testing, 70% en ganadores.`),
        roas: (s) => (s.includes("alcanzado") ? `📈 ROAS alcanzado: ${pct}% del objetivo.\nEscala +15-20% cuidando calidad.` : `🟡 Falta para 3x: ${pct}%.\nOptimiza copy/creativos antes de invertir más.`),
        cvr: (s) => (s.includes("alcanzado") ? `🎯 CVR alcanzado: ${pct}%.\nMantén consistencia, evita cambios bruscos.` : `🎯 Falta CVR: ${pct}%.\nPrueba mensajes de mayor intención y reduce fricción.`),
        costPerConv: (s) => (s.includes("objetivo") ? `✅ Costo dentro de objetivo: ${pct}%.\nEscala gradualmente.` : `💸 Costo sobre objetivo: ${pct}%.\nRecorta audiencias caras y renueva creativos.`),
        ventas: (s) => (s.includes("confirmadas") ? `✅ Ventas confirmadas: ${pct}%.\nRefuerza seguimiento y testimonios.` : `🕑 No compran tras chat: ${pct}%.\nSecuencia de seguimiento + oferta clara.`),
        ingresos: (s) => (s.includes("cubre") ? `💹 Cubre gasto: ${pct}%.\nMantén ROAS ≥ breakeven para escalar.` : `🧮 Falta por cubrir: ${pct}%.\nOptimiza embudo antes de subir inversión.`),
      }

      const generator = T[chartType] || (() => "")
      const insight = generator(seg)

      if (panel === "left") setLeftPanelInsight(insight)
      else setRightPanelInsight(insight)

      setIsTransitioning(false)
      insightTimerRef.current = setTimeout(() => {}, 10000)
    }, [isTransitioning])

  const spendData = useMemo(() => {
    const c = selectedCampaignData
    const spent = c?.spent ?? 0
    let totalBudget = 0
    if (c?.lifetime_budget && c.lifetime_budget > 0) {
      totalBudget = c.lifetime_budget
    } else if (c?.daily_budget) {
      totalBudget = c.daily_budget * 30
    }
    const spentPct = totalBudget > 0 ? clampPct((spent / totalBudget) * 100) : 0
    const remainingPct = clampPct(100 - spentPct)
    return Object.freeze([
      { name: "Gastado", value: to2(spentPct), growth: "", period: "30d" },
      { name: "Presupuesto restante", value: to2(remainingPct), growth: "", period: "30d" },
    ])
  }, [selectedCampaignData])

  const roasData = useMemo(() => {
    const roas = selectedCampaignData?.roas ?? 0
    const target = 3 // mínimo aceptable
    const achieved = clampPct(Math.min(roas / target, 1) * 100)
    const remaining = clampPct(100 - achieved)
    return Object.freeze([
      { name: "ROAS alcanzado", value: to2(achieved), growth: "", period: "30d" },
      { name: "Falta para 3x", value: to2(remaining), growth: "", period: "30d" },
    ])
  }, [selectedCampaignData])

  const cvrData = useMemo(() => {
    const cvr = selectedCampaignData?.cvr ?? 0
    const target = 20 // % ideal mínimo
    const achieved = clampPct(Math.min(cvr / target, 1) * 100)
    const remaining = clampPct(100 - achieved)
    return Object.freeze([
      { name: "CVR alcanzado", value: to2(achieved), growth: "", period: "30d" },
      { name: "Falta para 20%", value: to2(remaining), growth: "", period: "30d" },
    ])
  }, [selectedCampaignData])

  const gastadoData = spendData

  const costPerConvData = useMemo(() => {
    const c = selectedCampaignData
    const costPerConv = c && c.conversations > 0 ? c.spent / c.conversations : 0
    const target = 15000 // COP objetivo
    const achieved = clampPct(costPerConv > 0 ? Math.min(target / costPerConv, 1) * 100 : 0)
    const over = clampPct(100 - achieved)
    return Object.freeze([
      { name: "Dentro de objetivo", value: to2(achieved), growth: "", period: "30d" },
      { name: "Sobre objetivo", value: to2(over), growth: "", period: "30d" },
    ])
  }, [selectedCampaignData])

  const ventasData = useMemo(() => {
    const conv = selectedCampaignData?.conversations ?? 0
    const sales = selectedCampaignData?.sales ?? 0
    const completed = clampPct(conv > 0 ? (sales / conv) * 100 : 0)
    const notBought = clampPct(100 - completed)
    return Object.freeze([
      { name: "Ventas confirmadas", value: to2(completed), growth: "", period: "30d" },
      { name: "No compran tras chat", value: to2(notBought), growth: "", period: "30d" },
    ])
  }, [selectedCampaignData])

  const ingresosData = useMemo(() => {
    const spent = selectedCampaignData?.spent ?? 0
    const revenue = selectedCampaignData?.revenue ?? 0
    const breakeven = spent
    const covered = breakeven > 0 ? clampPct(Math.min(revenue / breakeven, 1) * 100) : 0
    const missing = clampPct(100 - covered)
    return Object.freeze([
      { name: "Cubre gasto (breakeven)", value: to2(covered), growth: "", period: "30d" },
      { name: "Falta por cubrir", value: to2(missing), growth: "", period: "30d" },
    ])
  }, [selectedCampaignData])

  const getCurrentChartData = useCallback((): ReadonlyArray<{ name: string; value: number; growth: string; period: string }> => {
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
    CHARTS,
  ])

  const getCurrentChartColors = useCallback((): ReadonlyArray<string> => {
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
  }, [currentChartIndex, CHARTS, CONVERSION_COLORS, BUDGET_COLORS, ROAS_COLORS, CVR_COLORS, GASTADO_COLORS, COST_PER_CONV_COLORS, VENTAS_COLORS, INGRESOS_COLORS])

  // total is always 100 for donut charts; helper removed as unused

  const hasOnlyTwoDataPoints = useCallback(() => {
    return getCurrentChartData().length === 2
  }, [getCurrentChartData])

  const formatCOP = useCallback((amount: number | string) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount.replace(/[^0-9.-]/g, "")) : amount
    return `$${numAmount.toLocaleString()} COP`
  }, [])

  const getLossAmount = useCallback(() => {
    const chartType = CHARTS[currentChartIndex].id
    const spent = selectedCampaignData?.spent ?? 0
    const revenue = selectedCampaignData?.revenue ?? 0
    const conv = selectedCampaignData?.conversations ?? 0
    const sales = selectedCampaignData?.sales ?? 0
    if (chartType === "conversions" || chartType === "ventas") {
      const pending = Math.max(0, conv - sales)
      return `${pending} ventas potenciales`
    }
    if (["roas", "gastado", "budget", "ingresos", "costPerConv"].includes(chartType)) {
      return formatCOP(Math.max(0, spent - revenue))
    }
    return formatCOP(0)
  }, [currentChartIndex, selectedCampaignData, CHARTS, formatCOP])

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
    const highIsGood = ["roas", "cvr", "conversions", "ventas", "ingresos"].includes(chartId)
    const lowIsGood = ["costPerConv", "gastado", "budget"].includes(chartId)
    if (highIsGood || !lowIsGood) {
      positivo = sorted[0]
      neutral = sorted[1] || null
      negativo = sorted[sorted.length - 1]
    } else {
      negativo = sorted[0]
      neutral = sorted[1] || null
      positivo = sorted[sorted.length - 1]
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
  }, [getCurrentChartData, currentChartIndex, CHARTS])

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

  // Generate left/right insights for the current chart based on its two slices
  useEffect(() => {
    if (loading || !mounted) return
    const data = getCurrentChartData()
    if (!data || data.length === 0) {
      setLeftPanelInsight("")
      setRightPanelInsight("")
      return
    }
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1
    if (data.length >= 2) {
      const leftPct = (data[1].value / total) * 100
      generatePanelInsight(CHARTS[currentChartIndex].id, data[1].name, data[1].value, leftPct, "left")
      const rightPct = (data[0].value / total) * 100
      generatePanelInsight(CHARTS[currentChartIndex].id, data[0].name, data[0].value, rightPct, "right")
    } else {
      const onlyPct = (data[0].value / total) * 100
      setLeftPanelInsight("")
      generatePanelInsight(CHARTS[currentChartIndex].id, data[0].name, data[0].value, onlyPct, "right")
    }
  }, [loading, mounted, currentChartIndex, CHARTS, getCurrentChartData, generatePanelInsight])

  // removed stray legacy text block

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsChatLoading(true)

    try {
      const c = selectedCampaignData
      const context = `Campaña seleccionada: ${c?.name || "(sin nombre)"} (ID ${c?.id || selectedCampaign})\n` +
        `Cuenta: ${c?.detail || "N/A"} | Estado: ${c?.status || "desconocido"}\n` +
        `Métricas 30d => Gasto: ${c ? formatCOP(c.spent) : "$0"}, Conversaciones: ${c?.conversations ?? 0}, Ventas: ${c?.sales ?? 0}, Ingresos: ${c ? formatCOP(c.revenue) : "$0"}, ROAS: ${(c?.roas ?? 0).toFixed(2)}x, CVR: ${(c?.cvr ?? 0).toFixed(2)}%\n` +
        `Pregunta del usuario: ${userMessage}\n` +
        `Responde en español colombiano, tono experto y concreto (<= 180 palabras).`
      const aiText = await analyzeWithGemini(context)
      setChatMessages((prev) => [...prev, { role: "assistant", content: aiText }])
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

  // Removed old full-analysis generator (not used in dual-panel flow)

  const handleChartHover = useCallback((chartType: string, index: number, segment: { name: string; value: number }, percentage: number) => {
    setHoveredChart(chartType)
    // No regenerar insights en hover - solo efecto visual
  }, [])

  const handleChartLeave = useCallback(() => {
    setHoveredChart(null)
  }, [])

  const goToPreviousChart = useCallback(() => {
    setCurrentChartIndex((prev) => (prev === 0 ? CHARTS.length - 1 : prev - 1))
    setLeftPanelInsight("")
    setRightPanelInsight("")
    setHoveredChart(null)
    setActiveNavSection("general") // Reset active nav section on chart change
  }, [CHARTS.length])

  const goToNextChart = useCallback(() => {
    setCurrentChartIndex((prev) => (prev === CHARTS.length - 1 ? 0 : prev + 1))
    setLeftPanelInsight("")
    setRightPanelInsight("")
    setHoveredChart(null)
    setActiveNavSection("general") // Reset active nav section on chart change
  }, [CHARTS.length])

  const currentChart = CHARTS[currentChartIndex]
  const hasThreeSections = true

  const shouldShowUrgentBubble = () => {
    const percentages = getChartPercentages()
    const negativoValue = Number.parseFloat(percentages.negativo)
    const positivoValue = Number.parseFloat(percentages.positivo)

    // Show urgent bubble when viewing negativo tab AND negativo percentage exceeds positivo
    return activeNavSection === "negativo" && activeInsightTab === "resumen" && negativoValue > positivoValue
  }

  type InsightSection =
    | { type: "highlight" | "alert"; color: "blue" | "green" | "red" | "amber" | "purple"; title: string; items: string[] }
    | { type: "checklist"; color: "blue" | "green" | "red" | "amber" | "purple"; title: string; items: string[] }
    | { type: "metrics"; title: string; items: Array<{ label: string; value: string; trend?: string }> }

  const getInsightsContent = useCallback((): { title: string; content: InsightSection[] } => {
    const ctx: InsightsContext = {
      section: activeNavSection,
      tab: activeInsightTab,
      percentages: getChartPercentages(),
      lossAmount: getLossAmount(),
      selectedCampaignName: selectedCampaignData?.name || "",
      formatCOP,
    }
    if (ctx.section === "general") return buildGeneralContent(ctx)
    if (ctx.section === "negativo") return buildNegativoContent(ctx)
    if (ctx.section === "neutral") return buildNeutralContent(ctx)
    if (ctx.section === "positivo") return buildPositivoContent(ctx)
    return { title: "Contenido no disponible", content: [] }
  }, [activeNavSection, activeInsightTab, getChartPercentages, getLossAmount, selectedCampaignData?.name, formatCOP])

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
    const insightsData = getInsightsContent()
    let exportContent = `REPORTE DE INSIGHTS - ${insightsData.title}\n`
    exportContent += `Generado: ${new Date().toLocaleString("es-CO")}\n`
    exportContent += `Campaña: ${selectedCampaignData?.name || "N/A"}\n`
    exportContent += `\n${"=".repeat(80)}\n\n`

    insightsData.content.forEach((section) => {
      exportContent += `${section.title}\n`
      exportContent += `${"-".repeat(section.title.length)}\n\n`

      if (section.type === "highlight" || section.type === "alert") {
        section.items.forEach((item) => {
          exportContent += `• ${item}\n`
        })
      } else if (section.type === "checklist") {
        section.items.forEach((item) => {
          exportContent += `☐ ${item}\n`
        })
      } else if (section.type === "metrics") {
        section.items.forEach((item) => {
          const trendText = item.trend ? `(${item.trend})` : ""
          exportContent += `${item.label}: ${item.value} ${trendText}\n`
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
                  {campaignsList.map((campaign) => (
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
                              .map((item) => {
                                const total = getCurrentChartData().reduce((sum, d) => sum + d.value, 0)
                                const percentage = ((item.value / total) * 100).toFixed(1)
                                const idx = getCurrentChartData().findIndex((d) => d.name === item.name)
                                const color = getCurrentChartColors()[idx]
                                return (
                                  <div
                                    key={item.name}
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
                                  {selectedCampaignData?.name || "Selecciona una campaña"}
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
                                {campaignsList.map((campaign) => (
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
                                  if (section.type === "highlight" || section.type === "alert") {
                                    return (
                                      <SectionBox key={`${section.title}-${idx}`} variant={section.type} color={section.color} title={section.title}>
                                        <ul className="space-y-1">
                                          {section.items.map((item, itemIdx) => (
                                            <li
                                              key={`${item}-${itemIdx}`}
                                              className={`text-[10px] leading-relaxed flex items-start gap-1.5 ${sectionTextColors[section.color]}`}
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
                                      </SectionBox>
                                    )
                                  } else if (section.type === "metrics") {
                                    return (
                                      <div key={`${section.title}-${idx}`} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                        <h4 className="text-[11px] font-semibold text-gray-900 mb-1.5">
                                          {section.title}
                                        </h4>
                                        <div className="text-[12px] text-gray-500">
                                          Powered by Gemini 2.5 Pro • CI: {getAIScore()} • ID: {campaignId || "General"}
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                          {section.items.map((metric) => (
                                            <div key={metric.label} className="p-2 bg-white rounded-md border border-gray-200 flex items-center justify-between">
                                              <span className="text-[11px] text-gray-600">{metric.label}</span>
                                              <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-gray-900">{metric.value}</span>
                                                {metric.trend && (
                                                  <span className="text-[10px] font-semibold text-gray-600">{metric.trend}</span>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  } else if (section.type === "checklist") {
                                    return (
                                      <SectionBox key={`${section.title}-${idx}`} variant="checklist" color={section.color} title={section.title}>
                                        <ul className="space-y-1.5">
                                          {section.items.map((item) => (
                                            <li key={item} className="flex items-start gap-2">
                                              <input type="checkbox" className="mt-0.5" />
                                              <span className={`text-[11px] ${itemTextColorsMap[section.color]}`}>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </SectionBox>
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
                                {leftPanelInsight.split("\n").map((line) => (
                                  <p key={line} className="mb-2.5 text-xs leading-relaxed text-gray-700">
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
                                {rightPanelInsight.split("\n").map((line) => (
                                  <p key={line} className="mb-2.5 text-xs leading-relaxed text-gray-700">
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
                      <div key={`${index}-${message.role}-${message.content.slice(0,10)}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
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
                        onKeyDown={(e) => {
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

export function AIChartsModal(props: Readonly<{ isOpen: boolean; campaignId: string | null; campaigns?: Campaign[]; onClose: () => void }>) {
  return <AIChartsModalInner {...props} />
}
