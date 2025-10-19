import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { ArrowUpDown, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

// Helpers de formato para COP
const fmtCOP0 = (v: number) => Number(v || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })
const fmtCOP2 = (v: number) => Number(v || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const campaignsData = [
  {
    id: "120233445687010113",
    name: "Mensajes a WhatsApp del Mayo...",
    initials: "ME",
    status: "active",
    delivery: "Activa",
    detail: "GALLE 18K DETAIL",
    budget: 0,
    spent: 585199,
    spentPercent: 0,
    conversations: 0,
    costPerConv: 0,
    sales: 0,
    revenue: 0,
    roas: 0,
    cvr: 3.05,
  },
  {
    id: "120232220411150113",
    name: "Campaña Balines - Mensajes a...",
    initials: "CA",
    status: "paused",
    delivery: "Pausada",
    detail: "GALLE 18K DETAIL",
    budget: 0,
    spent: 0,
    spentPercent: 0,
    conversations: 0,
    costPerConv: 0,
    sales: 0,
    revenue: 0,
    roas: 0,
    cvr: 0,
  },
  {
    id: "120230223507150113",
    name: "CÚCUTA - AGOSTO",
    initials: "CÚ",
    status: "paused",
    delivery: "Pausada",
    detail: "GALLE 18K DETAIL",
    budget: 0,
    spent: 0,
    spentPercent: 0,
    conversations: 0,
    costPerConv: 0,
    sales: 0,
    revenue: 0,
    roas: 0,
    cvr: 0,
  },
]

export const adsetsData = [
  {
    id: "120233445687010114",
    name: "Conjunto de anuncios 1",
    campaignId: "120233445687010113",
    initials: "C1",
    status: "active",
    delivery: "Activa",
    budget: 50,
    spent: 45,
    spentPercent: 90,
    conversations: 12,
    costPerConv: 3.75,
    sales: 3,
    revenue: 450,
    roas: 10,
    cvr: 25,
  },
]

export const adsData = [
  {
    id: "120233445687010115",
    adsetId: "120233445687010114",
    name: "Anuncio WhatsApp Mayo",
    initials: "AW",
    status: "active",
    delivery: "Activa",
    spent: 45,
    conversations: 12,
    costPerConv: 3.75,
    sales: 3,
    revenue: 450,
    roas: 10,
    cvr: 25,
  },
]

const metricsInfo = {
  presup: {
    name: "Presupuesto",
    description:
      "Presupuesto diario asignado a la campaña. Define cuánto estás dispuesto a invertir por día en esta campaña publicitaria.",
  },
  gastado: {
    name: "Gastado",
    description:
      "Monto total gastado en la campaña hasta el momento. Incluye todos los costos de publicidad acumulados.",
  },
  conv: {
    name: "Conversaciones",
    description:
      "Número total de conversaciones iniciadas a través de esta campaña. Indica el nivel de interacción con tu audiencia.",
  },
  costPerConv: {
    name: "Costo por Conversación",
    description:
      "Costo promedio por cada conversación generada. Se calcula dividiendo el gasto total entre el número de conversaciones.",
  },
  ventas: {
    name: "Ventas",
    description:
      "Número de ventas completadas que resultaron de las conversaciones. Representa las conversiones finales exitosas.",
  },
  ingresos: {
    name: "Ingresos",
    description:
      "Ingresos totales generados por las ventas de esta campaña. Suma del valor monetario de todas las transacciones completadas.",
  },
  roas: {
    name: "ROAS (Return on Ad Spend)",
    description:
      "Retorno de inversión publicitaria. Indica cuántos pesos colombianos generas por cada peso invertido. Un ROAS de 3x significa que por cada $1 COP gastado, generas $3 COP en ingresos.",
  },
  cvr: {
    name: "CVR (Conversion Rate)",
    description:
      "Tasa de conversión de ventas. Porcentaje de conversaciones que se convierten en ventas. Se calcula dividiendo las ventas entre las conversaciones.",
  },
}

interface CampaignsTableProps {
  activeTab: "campaigns" | "adsets" | "ads"
  statusFilter: "all" | "active" | "paused"
  onSelectCampaign: (id: string | null) => void
  onShowAICharts: (id: string) => void
  // NEW: Accept real data from parent
  campaignsData?: any[]
  adsetsData?: any[]
  adsData?: any[]
  loading?: boolean
}

export function CampaignsTable({ activeTab, statusFilter, onSelectCampaign, onShowAICharts, campaignsData: propCampaignsData, adsetsData: propAdsetsData, adsData: propAdsData, loading }: CampaignsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Use prop data if provided, otherwise fall back to mock data (for backward compatibility)
  const rawData = activeTab === "campaigns" 
    ? (propCampaignsData || campaignsData) 
    : activeTab === "adsets" 
    ? (propAdsetsData || adsetsData) 
    : (propAdsData || adsData)

  const data = statusFilter === "all" ? rawData : rawData.filter((item: any) => item.status === statusFilter)

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    console.log("[v0] Checkbox changed:", itemId, checked)
    if (checked) {
      setSelectedId(itemId)
      onSelectCampaign(itemId)
      console.log("[v0] Campaign selected:", itemId)
    } else {
      setSelectedId(null)
      onSelectCampaign(null)
      console.log("[v0] Campaign deselected")
    }
  }

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="w-10 px-2 py-2">
                  <Checkbox />
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {activeTab === "campaigns" ? "Campaña" : activeTab === "adsets" ? "Conjunto" : "Anuncio"}
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Entrega
                </th>
                {activeTab === "campaigns" && (
                  <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <button className="flex items-center gap-1 hover:text-foreground">
                        Presup. <ArrowUpDown className="w-3 h-3" />
                      </button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-gold cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-semibold text-sm mb-1">{metricsInfo.presup.name}</p>
                          <p className="text-xs text-muted-foreground">{metricsInfo.presup.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </th>
                )}
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Gastado <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-gold cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold text-sm mb-1">{metricsInfo.gastado.name}</p>
                        <p className="text-xs text-muted-foreground">{metricsInfo.gastado.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Conv. <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-gold cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold text-sm mb-1">{metricsInfo.conv.name}</p>
                        <p className="text-xs text-muted-foreground">{metricsInfo.conv.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      $/Conv. <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-gold cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold text-sm mb-1">{metricsInfo.costPerConv.name}</p>
                        <p className="text-xs text-muted-foreground">{metricsInfo.costPerConv.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Ventas <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-gold cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold text-sm mb-1">{metricsInfo.ventas.name}</p>
                        <p className="text-xs text-muted-foreground">{metricsInfo.ventas.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Ingresos <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-gold cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold text-sm mb-1">{metricsInfo.ingresos.name}</p>
                        <p className="text-xs text-muted-foreground">{metricsInfo.ingresos.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      ROAS <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-gold cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold text-sm mb-1">{metricsInfo.roas.name}</p>
                        <p className="text-xs text-muted-foreground">{metricsInfo.roas.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      CVR <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-gold cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold text-sm mb-1">{metricsInfo.cvr.name}</p>
                        <p className="text-xs text-muted-foreground">{metricsInfo.cvr.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-muted-foreground">Cargando datos desde Meta Ads...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-4xl">📊</div>
                      <p className="text-lg font-semibold text-foreground">No se encontraron {activeTab === "campaigns" ? "campañas" : activeTab === "adsets" ? "conjuntos de anuncios" : "anuncios"}</p>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Verifica que tu cuenta de Meta Ads tenga {activeTab === "campaigns" ? "campañas activas" : activeTab === "adsets" ? "conjuntos de anuncios" : "anuncios"} 
                        {statusFilter !== "all" && ` con estado "${statusFilter}"`}.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Abre la consola del navegador (F12) para ver logs detallados.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item: any) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-2 py-3">
                    <Checkbox
                      checked={selectedId === item.id}
                      onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <Switch checked={item.status === "active"} className="data-[state=checked]:bg-emerald-500" />
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.name}</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">ID: {item.id}</span>
                        {item.detail && (
                          <span className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                            • {item.detail}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <Badge
                      variant={item.status === "active" ? "default" : "secondary"}
                      className={
                        item.status === "active"
                          ? "bg-emerald-500 text-white hover:bg-emerald-600 text-xs"
                          : "bg-amber-500 text-white hover:bg-amber-600 text-xs"
                      }
                    >
                      {item.status === "active" ? "✓ Activa" : "⏸ Pausada"}
                    </Badge>
                  </td>
                  {activeTab === "campaigns" && (
                    <td className="px-2 py-3 text-foreground text-sm">
                      ${fmtCOP0((item.daily_budget ?? item.lifetime_budget ?? item.budget ?? 0) as number)}
                    </td>
                  )}
                  <td className="px-2 py-3">
                    <div>
                      <div className="font-semibold text-foreground text-sm">${fmtCOP0(item.spent ?? 0)}</div>
                      {(item.spentPercent ?? 0) > 0 && (
                        <div className="text-xs text-muted-foreground">{item.spentPercent}%</div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-foreground text-sm">{item.conversations}</td>
                  <td className="px-2 py-3 text-foreground text-sm">${fmtCOP2((item.spent ?? 0) / ((item.conversations ?? 0) || 1))}</td>
                  <td className="px-2 py-3 text-emerald-600 font-semibold text-sm">{item.sales}</td>
                  <td className="px-2 py-3 text-foreground text-sm">${fmtCOP0(item.revenue ?? 0)}</td>
                  <td className="px-2 py-3">
                    <span className="text-red-600 font-semibold text-sm">{(item.roas ?? 0).toFixed(2)}x</span>
                  </td>
                  <td className="px-2 py-3 text-foreground text-sm">{item.cvr}%</td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  )
}
