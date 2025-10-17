import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { MetricsCard } from "@/components/metrics-card"
import { CampaignsTable } from "@/components/campaigns-table"
import { AIChartsModal } from "@/components/ai-charts-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, RefreshCw, Search, BarChart3, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchMetaCampaigns, fetchMetaAdSets, fetchMetaAds, fetchMonthlySpend, clearCache, type Campaign, type AdSet, type Ad } from "@/services/metaAdsService"

type TabType = "campaigns" | "adsets" | "ads"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("campaigns")
  const [lastUpdate, setLastUpdate] = useState(0)
  const [showAICharts, setShowAICharts] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("active")
  
  // Datos reales de Meta API
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [adsets, setAdsets] = useState<AdSet[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlySpend, setMonthlySpend] = useState<number>(0)

  const { toast } = useToast()

  // Función para cargar datos desde Meta API
  const loadMetaData = async () => {
    setLoading(true)
    try {
      console.log('🔄 Cargando datos desde Meta Ads API...')
      const [campaignsData, adsetsData, adsData, monthSpend] = await Promise.all([
        fetchMetaCampaigns(),
        fetchMetaAdSets(),
        fetchMetaAds(),
        fetchMonthlySpend()
      ])
      
      setCampaigns(campaignsData)
      setAdsets(adsetsData)
  setAds(adsData)
  setMonthlySpend(monthSpend)
      
      console.log('✅ Datos cargados desde Meta API:', {
        campaigns: campaignsData.length,
        adsets: adsetsData.length,
        ads: adsData.length
      })
    } catch (error) {
      console.error('❌ Error cargando datos de Meta:', error)
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron obtener los datos de Meta Ads. Verifica tus credenciales.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar y cada 2 minutos (usa cache si está disponible)
  useEffect(() => {
    loadMetaData()
    
    const interval = setInterval(() => {
      setLastUpdate((prev) => prev + 120) // Actualizar contador cada 2 minutos
      loadMetaData() // Recargar datos (usará cache si es válido)
    }, 120000) // 2 minutos

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
        // Filter to only the selected campaign - USING REAL DATA
        data = campaigns.filter((c) => c.id === selectedCampaign)
        campaignName = data[0]?.name || "campaña"
        headers =
          "ID,Nombre,Estado,Presupuesto Diario,Presupuesto Total,Gastado,Conversaciones,Ventas,Ingresos,ROAS,CVR\n"
        rows = data
          .map(
            (item) =>
              `"${item.id}","${item.name}","${item.status}","${item.daily_budget || 'N/A'}","${item.lifetime_budget || 'N/A'}","${item.spent}","${item.conversations}","${item.sales}","${item.revenue}","${item.roas.toFixed(2)}","${item.cvr}"`,
          )
          .join("\n")
      } else if (activeTab === "adsets") {
        // Filter adsets that belong to the selected campaign - USING REAL DATA
        data = adsets.filter((a) => a.campaignId === selectedCampaign)
        const campaign = campaigns.find((c) => c.id === selectedCampaign)
        campaignName = campaign?.name || "campaña"
        headers =
          "ID,Nombre,Estado,Presupuesto Diario,Presupuesto Total,Gastado,Conversaciones,Ventas,Ingresos,ROAS,CVR\n"
        rows = data
          .map(
            (item) =>
              `"${item.id}","${item.name}","${item.status}","${item.daily_budget || 'N/A'}","${item.lifetime_budget || 'N/A'}","${item.spent}","${item.conversations}","${item.sales}","${item.revenue}","${item.roas.toFixed(2)}","${item.cvr}"`,
          )
          .join("\n")
      } else {
        // Filter ads that belong to adsets of the selected campaign - USING REAL DATA
        const campaignAdsets = adsets.filter((a) => a.campaignId === selectedCampaign)
        const adsetIds = campaignAdsets.map((a) => a.id)
        data = ads.filter((ad) => adsetIds.includes(ad.adsetId))
        const campaign = campaigns.find((c) => c.id === selectedCampaign)
        campaignName = campaign?.name || "campaña"
        headers = "ID,Nombre,Estado,Gastado,Conversaciones,Ventas,Ingresos,ROAS,CVR\n"
        rows = data
          .map(
            (item) =>
              `"${item.id}","${item.name}","${item.status}","${item.spent}","${item.conversations}","${item.sales}","${item.revenue}","${item.roas.toFixed(2)}","${item.cvr}"`,
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

              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white" 
                onClick={() => {
                  setLastUpdate(0)
                  clearCache() // Limpiar cache para forzar recarga
                  loadMetaData() // Recargar inmediatamente
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Metrics - CALCULATED FROM REAL META DATA */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricsCard
              title="GASTO DEL MES"
              value={loading ? "Cargando..." : `$${monthlySpend.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`}
              subtitle="Este mes"
              trend="up"
              borderColor="border-l-blue-500"
            />
            <MetricsCard
              title="CONVERSACIONES"
              value={loading ? "..." : campaigns.reduce((sum, c) => sum + c.conversations, 0).toString()}
              subtitle={loading ? "..." : `$${(campaigns.reduce((sum, c) => sum + c.spent, 0) / (campaigns.reduce((sum, c) => sum + c.conversations, 0) || 1)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por conv.`}
              borderColor="border-l-purple-500"
            />
            <MetricsCard 
              title="VENTAS" 
              value={loading ? "..." : campaigns.reduce((sum, c) => sum + c.sales, 0).toString()} 
              subtitle={loading ? "..." : `${((campaigns.reduce((sum, c) => sum + c.sales, 0) / (campaigns.reduce((sum, c) => sum + c.conversations, 0) || 1)) * 100).toFixed(1)}% tasa conversión`} 
              borderColor="border-l-emerald-500" 
            />
            <MetricsCard 
              title="ROAS" 
              value={loading ? "..." : `${((campaigns.reduce((sum, c) => sum + c.revenue, 0) / (campaigns.reduce((sum, c) => sum + c.spent, 0) || 1))).toFixed(2)}x`}
              subtitle={loading ? "..." : `$${campaigns.reduce((sum, c) => sum + c.revenue, 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ingresos`} 
              borderColor="border-l-amber-500" 
            />
            <MetricsCard
              title="CVR PROMEDIO"
              value={loading ? "..." : `${(campaigns.reduce((sum, c) => sum + c.cvr, 0) / (campaigns.length || 1)).toFixed(2)}%`}
              subtitle="De todas las campañas"
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
            campaignsData={campaigns}
            adsetsData={adsets}
            adsData={ads}
            loading={loading}
          />
        </div>
      </main>

      {showAICharts && (
        <AIChartsModal
          isOpen={showAICharts}
          campaignId={selectedCampaign}
          campaigns={campaigns}
          onClose={() => {
            setShowAICharts(false)
            setSelectedCampaign(null)
          }}
        />
      )}
    </div>
  )
}
