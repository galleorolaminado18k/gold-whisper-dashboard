import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { MetricsCard } from "@/components/metrics-card"
import { CampaignsTable, campaignsData, adsetsData, adsData } from "@/components/campaigns-table"
import { AIChartsModal } from "@/components/ai-charts-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, RefreshCw, Search, BarChart3, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type TabType = "campaigns" | "adsets" | "ads"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("campaigns")
  const [lastUpdate, setLastUpdate] = useState(0)
  const [showAICharts, setShowAICharts] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("active")

  const { toast } = useToast()

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate((prev) => prev + 30)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleExportCampaigns = () => {
    console.log("[v0] Export clicked. Selected campaign:", selectedCampaign)

    if (!selectedCampaign || selectedCampaign === "") {
      console.log("[v0] No campaign selected, showing toast")
      toast({
        title: "Selecciona una campaña",
        description: "Debe seleccionar una campaña para exportar.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Campaign selected, proceeding with export")

    try {
      let headers = ""
      let rows = ""
      let data: any[] = []
      let campaignName = ""

      if (activeTab === "campaigns") {
        // Filter to only the selected campaign
        data = campaignsData.filter((c) => c.id === selectedCampaign)
        campaignName = data[0]?.name || "campaña"
        headers =
          "ID,Nombre,Estado,Entrega,Presupuesto,Gastado,Conversaciones,Costo por Conv.,Ventas,Ingresos,ROAS,CVR\n"
        rows = data
          .map(
            (item) =>
              `"${item.id}","${item.name}","${item.status}","${item.delivery}","${item.budget}","${item.spent}","${item.conversations}","${item.costPerConv}","${item.sales}","${item.revenue}","${item.roas.toFixed(2)}","${item.cvr}"`,
          )
          .join("\n")
      } else if (activeTab === "adsets") {
        // Filter adsets that belong to the selected campaign
        data = adsetsData.filter((a) => a.campaignId === selectedCampaign)
        const campaign = campaignsData.find((c) => c.id === selectedCampaign)
        campaignName = campaign?.name || "campaña"
        headers =
          "ID,Nombre,Estado,Entrega,Presupuesto,Gastado,Conversaciones,Costo por Conv.,Ventas,Ingresos,ROAS,CVR\n"
        rows = data
          .map(
            (item) =>
              `"${item.id}","${item.name}","${item.status}","${item.delivery}","${item.budget}","${item.spent}","${item.conversations}","${item.costPerConv}","${item.sales}","${item.revenue}","${item.roas.toFixed(2)}","${item.cvr}"`,
          )
          .join("\n")
      } else {
        // Filter ads that belong to adsets of the selected campaign
        const campaignAdsets = adsetsData.filter((a) => a.campaignId === selectedCampaign)
        const adsetIds = campaignAdsets.map((a) => a.id)
        data = adsData.filter((ad) => adsetIds.includes(ad.adsetId))
        const campaign = campaignsData.find((c) => c.id === selectedCampaign)
        campaignName = campaign?.name || "campaña"
        headers = "ID,Nombre,Estado,Entrega,Gastado,Conversaciones,Costo por Conv.,Ventas,Ingresos,ROAS,CVR\n"
        rows = data
          .map(
            (item) =>
              `"${item.id}","${item.name}","${item.status}","${item.delivery}","${item.spent}","${item.conversations}","${item.costPerConv}","${item.sales}","${item.revenue}","${item.roas.toFixed(2)}","${item.cvr}"`,
          )
          .join("\n")
      }

      console.log("[v0] Data to export:", data.length, "records")

      if (data.length === 0) {
        toast({
          title: "Sin datos",
          description: `No hay ${activeTab === "campaigns" ? "campaña" : activeTab === "adsets" ? "conjuntos de anuncios" : "anuncios"} para exportar.`,
          variant: "destructive",
        })
        return
      }

      const csvContent = headers + rows
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${campaignName.substring(0, 20)}-${activeTab}-${Date.now()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("[v0] Export successful")

      toast({
        title: "Datos exportados",
        description: `${data.length} registro(s) de la campaña exportados como CSV.`,
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Export error:", error)
      toast({
        title: "Error al exportar",
        description: "Hubo un problema al generar el archivo CSV.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">Administrador de anuncios</h1>
                <span className="text-sm text-muted-foreground">Actualizado hace {lastUpdate}s</span>
              </div>
              <p className="text-muted-foreground mt-1">Gestiona tus campañas publicitarias</p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-md text-sm font-medium">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                En vivo desde Meta Ads
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select defaultValue="30">
                <SelectTrigger className="w-[180px] bg-white border-border">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="yesterday">Ayer</SelectItem>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="bg-white" onClick={() => setLastUpdate(0)}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricsCard
              title="GASTO TOTAL"
              value="$585,199"
              subtitle="+12.3% vs anterior"
              trend="up"
              borderColor="border-l-blue-500"
            />
            <MetricsCard
              title="CONVERSACIONES"
              value="0"
              subtitle="$0.00 por conv."
              borderColor="border-l-purple-500"
            />
            <MetricsCard title="VENTAS" value="0" subtitle="0.0% tasa conversión" borderColor="border-l-emerald-500" />
            <MetricsCard title="ROAS" value="0.00x" subtitle="$0 ingresos" borderColor="border-l-amber-500" />
            <MetricsCard
              title="CVR PROMEDIO"
              value="3.05%"
              subtitle="132,710 impresiones"
              borderColor="border-l-indigo-500"
            />
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, identificador o métricas" className="pl-10 bg-white" />
            </div>

            <Select
              defaultValue="active"
              onValueChange={(value) => setStatusFilter(value as "all" | "active" | "paused")}
            >
              <SelectTrigger className="w-[140px] bg-white border-2 border-gold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="paused">Pausadas</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="bg-white" onClick={() => setShowAICharts(true)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Gráficos
            </Button>

            <Button variant="outline" size="sm" className="bg-white" onClick={handleExportCampaigns}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="flex items-center gap-6 border-b border-border">
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`pb-3 px-1 border-b-2 font-semibold transition-colors ${
                activeTab === "campaigns"
                  ? "border-gold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Campañas
            </button>
            <button
              onClick={() => setActiveTab("adsets")}
              className={`pb-3 px-1 border-b-2 font-semibold transition-colors ${
                activeTab === "adsets"
                  ? "border-gold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Conjuntos de anuncios
            </button>
            <button
              onClick={() => setActiveTab("ads")}
              className={`pb-3 px-1 border-b-2 font-semibold transition-colors ${
                activeTab === "ads"
                  ? "border-gold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Anuncios
            </button>
          </div>

          <CampaignsTable
            activeTab={activeTab}
            statusFilter={statusFilter}
            onSelectCampaign={setSelectedCampaign}
            onShowAICharts={(campaignId) => {
              setSelectedCampaign(campaignId)
              setShowAICharts(true)
            }}
          />
        </div>
      </main>

      {showAICharts && (
        <AIChartsModal
          isOpen={showAICharts}
          campaignId={selectedCampaign}
          onClose={() => {
            setShowAICharts(false)
            setSelectedCampaign(null)
          }}
        />
      )}
    </div>
  )
}
