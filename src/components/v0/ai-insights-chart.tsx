import { useState } from "react"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Sparkles, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ChartData {
  name: string
  value: number
  color: string
}

interface AIInsightsChartProps {
  title: string
  data: ChartData[]
  metric: string
}

export function AIInsightsChart({ title, data, metric }: AIInsightsChartProps) {
  const [aiInsight, setAiInsight] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState("AIzaSyDf9n-nERTfTC3G4WRf7msqQP1gjZkZST0")
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash-exp")

  const generateInsight = async () => {
    setIsLoading(true)

    const prompt = `Como experto en marketing digital, trafficker y community manager, analiza estos datos de campaña publicitaria:

Métrica: ${metric}
Datos: ${JSON.stringify(data)}

Proporciona un análisis profesional que incluya:
1. Interpretación de los datos (positivo o negativo)
2. Posibles causas del rendimiento actual
3. Recomendaciones específicas y accionables para mejorar
4. Comparación con benchmarks de la industria si es relevante

Sé conciso pero específico. Máximo 4-5 líneas.`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      )

      const result = await response.json()
      const insight = result.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el análisis."
      setAiInsight(insight)
    } catch (error) {
      console.error("[v0] Error generating AI insight:", error)
      setAiInsight("Error al generar el análisis. Verifica tu API key y conexión.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-white border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="w-4 h-4 mr-2" />
              Configurar IA
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuración de IA</DialogTitle>
              <DialogDescription>Configura el modelo de IA y la API key para análisis inteligentes</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="model">Modelo de IA</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Recomendado)</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apikey">API Key de Google AI</Label>
                <Input
                  id="apikey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-3">
        <Button onClick={generateInsight} disabled={isLoading} className="w-full bg-gold hover:bg-gold-light">
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Analizando con IA..." : "Generar análisis con IA"}
        </Button>

        {aiInsight && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-foreground leading-relaxed">{aiInsight}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
