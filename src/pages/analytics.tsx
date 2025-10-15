import { Sidebar } from "@/components/sidebar"
import { AIInsightsChart } from "@/components/ai-insights-chart"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  const spendingData = [
    { name: "Campaña Mayo", value: 585199, color: "#3b82f6" },
    { name: "Campaña Balines", value: 0, color: "#8b5cf6" },
    { name: "Cúcuta Agosto", value: 0, color: "#10b981" },
    { name: "Joyería", value: 0, color: "#f59e0b" },
  ]

  const conversationsData = [
    { name: "WhatsApp", value: 0, color: "#10b981" },
    { name: "Messenger", value: 0, color: "#3b82f6" },
    { name: "Instagram", value: 0, color: "#ec4899" },
  ]

  const salesData = [
    { name: "Completadas", value: 0, color: "#10b981" },
    { name: "Pendientes", value: 0, color: "#f59e0b" },
    { name: "Canceladas", value: 0, color: "#ef4444" },
  ]

  const roasData = [
    { name: "Positivo", value: 0, color: "#10b981" },
    { name: "Neutral", value: 0, color: "#f59e0b" },
    { name: "Negativo", value: 100, color: "#ef4444" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Análisis con IA</h1>
              <p className="text-muted-foreground mt-1">Insights inteligentes de tus campañas publicitarias</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIInsightsChart title="Distribución de Gasto" data={spendingData} metric="Gasto Total por Campaña" />

            <AIInsightsChart
              title="Conversaciones por Canal"
              data={conversationsData}
              metric="Conversaciones por Canal de Comunicación"
            />

            <AIInsightsChart title="Estado de Ventas" data={salesData} metric="Estado de Ventas por Campaña" />

            <AIInsightsChart title="Rendimiento ROAS" data={roasData} metric="Retorno de Inversión Publicitaria" />
          </div>
        </div>
      </main>
    </div>
  )
}
