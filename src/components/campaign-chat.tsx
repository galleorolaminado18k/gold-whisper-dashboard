"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles, TrendingUp, TrendingDown } from "lucide-react"
import { generateText } from "ai"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface CampaignChatProps {
  metrics: {
    spent: number
    conversions: number
    sales: number
    roas: number
    cvr: number
  }
}

export function CampaignChat({ metrics }: CampaignChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Determinar si las campañas están yendo bien o mal
  const isPerformingWell = metrics.roas > 2.0 && metrics.cvr > 2.5 && metrics.conversions > 50

  // Generar mensaje inicial
  useEffect(() => {
    const initialMessage = isPerformingWell
      ? "¡Hola! Veo que tus campañas están teniendo un excelente rendimiento. Revisemos por qué nos está yendo bien para replicarlo en futuras campañas. ¿Qué te gustaría analizar primero?"
      : "Hola, he revisado tus campañas y veo algunas áreas de oportunidad. Revisemos a fondo y analicemos qué tenemos que mejorar para optimizar tus resultados. ¿Por dónde quieres empezar?"

    setMessages([
      {
        role: "assistant",
        content: initialMessage,
      },
    ])
  }, [isPerformingWell])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const systemPrompt = `Eres un experto en Marketing Digital, Trafficker y Community Manager con más de 15 años de experiencia trabajando con marcas mundiales como Nike, Coca-Cola, Apple, y Amazon. Has gestionado presupuestos de millones de dólares y has optimizado miles de campañas publicitarias en Meta Ads, Google Ads, TikTok Ads y otras plataformas.

Tu experiencia incluye:
- Estrategia de marketing digital y growth hacking
- Optimización de campañas publicitarias (ROAS, CVR, CPC, CPM)
- Análisis de audiencias y segmentación avanzada
- Copywriting persuasivo y creatividad publicitaria
- Análisis de datos y métricas de rendimiento
- A/B testing y experimentación continua
- Gestión de presupuestos y escalamiento de campañas

Contexto de las campañas actuales:
- Gasto total: $${metrics.spent.toLocaleString()}
- Conversaciones: ${metrics.conversions}
- Ventas: ${metrics.sales}
- ROAS: ${metrics.roas.toFixed(2)}x
- CVR Promedio: ${metrics.cvr.toFixed(2)}%

Rendimiento general: ${isPerformingWell ? "BUENO - Las campañas están superando los benchmarks de la industria" : "NECESITA MEJORA - Las campañas están por debajo de los benchmarks esperados"}

Tu objetivo es proporcionar análisis profundos, recomendaciones accionables y estrategias específicas basadas en tu vasta experiencia. Sé directo, profesional y enfócate en resultados medibles. Usa tu conocimiento de las mejores prácticas de la industria para dar consejos que realmente funcionen.

Responde en español de manera conversacional pero profesional, como un consultor experto que está revisando las campañas en tiempo real.`

      const { text } = await generateText({
        model: "openai/gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        maxTokens: 500,
      })

      setMessages((prev) => [...prev, { role: "assistant", content: text }])
    } catch (error) {
      console.error("[v0] Error generating AI response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Disculpa, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-gold/20 bg-gradient-to-r from-gold/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gold to-gold-dark rounded-lg shadow-lg">
            <Sparkles className="w-5 h-5 text-gray-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gold">Analicemos las campañas juntos</h2>
            <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
              {isPerformingWell ? (
                <>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Rendimiento excelente</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span>Oportunidades de mejora</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
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
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 text-gray-100 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gold/20 bg-gray-900/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta sobre las campañas..."
            className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-gold focus:ring-gold"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-br from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-gray-900 shadow-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
