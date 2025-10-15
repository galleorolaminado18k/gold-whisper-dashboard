import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Search,
  Plus,
  Copy,
  Edit,
  MoreHorizontal,
  Download,
  BarChart3,
  Filter,
  Calendar,
  Settings2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pause,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  GripVertical
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { 
  fetchAllAccountsCampaigns, 
  MetaCampaign, 
  MetaAdSet,
  updateCampaignStatus, 
  updateAdSetStatus,
  fetchCampaignAdSets,
  getAdAccounts 
} from "@/lib/metaAds";
import { toast } from "sonner";

interface MetaAd {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
}

// Interfaz para campañas transformadas
interface CampaignData {
  id: string;
  nombre: string;
  estado: "activa" | "pausada" | "finalizada";
  entrega: "activa" | "pausada" | "completada";
  recomendaciones: number;
  presupuesto: number;
  gastado: number;
  conversaciones: number;
  costePorConv: number;
  ventas: number;
  ingresos: number;
  roas: number;
  alcance: number;
  impresiones: number;
  cvr: number;
  ctr: number;
  cpc: number;
  account_name?: string;
}

// Función para transformar datos de Meta a formato de vista
function transformMetaCampaign(metaCampaign: MetaCampaign): CampaignData {
  const insights = metaCampaign.insights;
  const gastado = insights?.spend || 0;
  const clicks = insights?.clicks || 0;
  const impresiones = insights?.impressions || 0;
  
  // Estimaciones basadas en datos reales
  // En producción, estas ventas e ingresos vendrían de eventos de conversión personalizados
  const conversaciones = clicks;
  const costePorConv = conversaciones > 0 ? gastado / conversaciones : 0;
  const ventas = Math.round(conversaciones * 0.22); // 22% tasa de conversión estimada
  const ingresos = ventas * 28500; // Ticket promedio $28,500
  const roas = gastado > 0 ? (ingresos / gastado) : 0;
  
  // CVR (Conversion Rate): ventas / conversaciones * 100
  const cvr = conversaciones > 0 ? (ventas / conversaciones) * 100 : 0;

  // IMPORTANTE: Usar effective_status que indica el estado REAL de entrega
  // effective_status = "ACTIVE" significa que la campaña está entregando anuncios realmente
  // Si no es "ACTIVE", la campaña NO está entregando (pausada, completada por fecha, etc.)
  const isReallyActive = metaCampaign.effective_status === 'ACTIVE';
  
  return {
    id: metaCampaign.id,
    nombre: metaCampaign.name,
    estado: isReallyActive ? 'activa' : 'pausada', // Switch basado en entrega real
    entrega: isReallyActive ? 'activa' : 'pausada', // Entrega basada en estado real
    recomendaciones: 0,
    presupuesto: metaCampaign.daily_budget ? metaCampaign.daily_budget / 100 : (metaCampaign.lifetime_budget ? metaCampaign.lifetime_budget / 100 : 0),
    gastado,
    conversaciones,
    costePorConv,
    ventas,
    ingresos,
    roas: roas * 100,
    alcance: insights?.reach || 0,
    impresiones,
    cvr,
    ctr: insights?.ctr || 0,
    cpc: insights?.cpc || 0,
  };
}

// Datos de ejemplo SOLO para fallback si la API falla
const mockCampaigns: CampaignData[] = [
  {
    id: "1",
    nombre: "Black Friday 2024 - Balinería Premium",
    estado: "activa",
    entrega: "activa",
    recomendaciones: 4,
    presupuesto: 50000,
    gastado: 38750,
    conversaciones: 450,
    costePorConv: 86,
    ventas: 127,
    ingresos: 3850000,
    roas: 99.35,
    alcance: 125000,
    impresiones: 485000,
    cvr: 28.22,
    ctr: 2.8,
    cpc: 95
  },
  {
    id: "2",
    nombre: "Campaña Día de la Madre - Joyería",
    estado: "pausada",
    entrega: "pausada",
    recomendaciones: 0,
    presupuesto: 35000,
    gastado: 28400,
    conversaciones: 320,
    costePorConv: 89,
    ventas: 85,
    ingresos: 2340000,
    roas: 82.39,
    alcance: 89000,
    impresiones: 342000,
    cvr: 26.56,
    ctr: 2.4,
    cpc: 83
  },
  {
    id: "3",
    nombre: "San Valentín - Conversión WhatsApp",
    estado: "finalizada",
    entrega: "completada",
    recomendaciones: 0,
    presupuesto: 60000,
    gastado: 60000,
    conversaciones: 580,
    costePorConv: 103,
    ventas: 195,
    ingresos: 5670000,
    roas: 94.50,
    alcance: 156000,
    impresiones: 628000,
    cvr: 33.62,
    ctr: 3.1,
    cpc: 96
  },
  {
    id: "4",
    nombre: "Tráfico Web - Catálogo Balines",
    estado: "activa",
    entrega: "activa",
    recomendaciones: 2,
    presupuesto: 25000,
    gastado: 18200,
    conversaciones: 234,
    costePorConv: 78,
    ventas: 52,
    ingresos: 1450000,
    roas: 79.67,
    alcance: 78000,
    impresiones: 295000,
    cvr: 22.22,
    ctr: 2.1,
    cpc: 62
  },
  {
    id: "5",
    nombre: "Remarketing Carritos Abandonados",
    estado: "activa",
    entrega: "activa",
    recomendaciones: 1,
    presupuesto: 15000,
    gastado: 12300,
    conversaciones: 145,
    costePorConv: 85,
    ventas: 48,
    ingresos: 1280000,
    roas: 104.07,
    alcance: 45000,
    impresiones: 178000,
    cvr: 33.10,
    ctr: 3.8,
    cpc: 69
  },
];

const Advertising = () => {
  const [vistaActual, setVistaActual] = React.useState<"campañas" | "conjuntos" | "anuncios">("campañas");
  const [filtroEstado, setFiltroEstado] = React.useState("todos");
  const [busqueda, setBusqueda] = React.useState("");
  const [campaigns, setCampaigns] = useState<CampaignData[]>(mockCampaigns);
  const [loading, setLoading] = useState(false);
  const [datePreset, setDatePreset] = useState("last_30d");
  const [usingRealData, setUsingRealData] = useState(false);
  const [sortField, setSortField] = useState<keyof CampaignData | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [selectedAdSets, setSelectedAdSets] = useState<Set<string>>(new Set());
  const [adSetsData, setAdSetsData] = useState<Map<string, MetaAdSet[]>>(new Map());
  const [adsData, setAdsData] = useState<Map<string, MetaAd[]>>(new Map());
  const [loadingAdSets, setLoadingAdSets] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);

  // Guardar campañas originales de Meta para poder actualizar su estado
  const [originalMetaCampaigns, setOriginalMetaCampaigns] = useState<MetaCampaign[]>([]);

  // Cargar datos reales de Meta Ads (ambas cuentas)
  const loadRealData = async () => {
    setLoading(true);
    try {
      const metaCampaigns = await fetchAllAccountsCampaigns(datePreset);
      
      if (metaCampaigns && metaCampaigns.length > 0) {
        setOriginalMetaCampaigns(metaCampaigns); // Guardar originales
        const transformedCampaigns = metaCampaigns.map(transformMetaCampaign);
        
        // Budget fallback: si una campaña tiene presupuesto = 0, sumar los presupuestos de sus Ad Sets
        const withBudgets = await Promise.all(
          transformedCampaigns.map(async (c) => {
            if (c.presupuesto && c.presupuesto > 0) return c;
            try {
              const sets = await fetchCampaignAdSets(c.id, datePreset);
              const sum = (sets || []).reduce((acc, s) => acc + (Number((s as any).daily_budget) || 0), 0);
              const budget = sum > 0 ? sum / 100 : 0;
              return { ...c, presupuesto: budget };
            } catch {
              return c;
            }
          })
        );
        
        setCampaigns(withBudgets);
        setUsingRealData(true);
        console.log(`✅ ${withBudgets.length} campañas cargadas desde Meta Ads`);
      } else {
        console.warn("⚠️ No se encontraron campañas activas en Meta Ads");
        // Aún así marcar como datos reales, solo que vacío
        setCampaigns([]);
        setUsingRealData(true);
      }
    } catch (error) {
      console.error("❌ Error loading Meta campaigns:", error);
      // En caso de error crítico, mostrar datos demo pero seguir intentando
      setCampaigns(mockCampaigns);
      setUsingRealData(false);
      
      // Reintentar en 10 segundos
      setTimeout(() => {
        console.log("🔄 Reintentando conexión con Meta Ads...");
        loadRealData();
      }, 10000);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos reales al montar el componente
  useEffect(() => {
    loadRealData();
    
    // Auto-actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadRealData();
    }, 30 * 1000); // 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  // Recargar cuando cambie el período
  useEffect(() => {
    loadRealData();
  }, [datePreset]);

  // Seleccionar/deseleccionar campaña
  const toggleCampaignSelection = (campaignId: string) => {
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId);
    } else {
      newSelected.add(campaignId);
    }
    setSelectedCampaigns(newSelected);
  };

  // Seleccionar/deseleccionar conjunto de anuncios
  const toggleAdSetSelection = (adSetId: string) => {
    const newSelected = new Set(selectedAdSets);
    if (newSelected.has(adSetId)) {
      newSelected.delete(adSetId);
    } else {
      newSelected.add(adSetId);
    }
    setSelectedAdSets(newSelected);
  };

  // Cargar conjuntos de anuncios cuando se cambia al tab
  useEffect(() => {
    if (vistaActual === "conjuntos" && selectedCampaigns.size > 0 && usingRealData) {
      setLoadingAdSets(true);
      Promise.all(
        Array.from(selectedCampaigns).map(async (campaignId) => {
          if (!adSetsData.has(campaignId)) {
            const adSets = await fetchCampaignAdSets(campaignId, datePreset);
            return { campaignId, adSets };
          }
          return null;
        })
      ).then((results) => {
        const newAdSetsData = new Map(adSetsData);
        results.forEach((result) => {
          if (result) {
            newAdSetsData.set(result.campaignId, result.adSets);
          }
        });
        setAdSetsData(newAdSetsData);
        setLoadingAdSets(false);
      });
    }
  }, [vistaActual, selectedCampaigns]);

  // Obtener conjuntos de anuncios de campañas seleccionadas
  const adSetsFromSelectedCampaigns = Array.from(selectedCampaigns).flatMap(
    (campaignId) => adSetsData.get(campaignId) || []
  );

  // Obtener anuncios de conjuntos seleccionados
  const adsFromSelectedAdSets = Array.from(selectedAdSets).flatMap(
    (adSetId) => adsData.get(adSetId) || []
  );

  // Manejar cambio de estado de campaña
  const handleToggleCampaign = async (campaignId: string, currentStatus: "activa" | "pausada" | "finalizada") => {
    if (!usingRealData) {
      toast.info("Esta función solo está disponible con datos reales");
      return;
    }

    // Encontrar la campaña original para obtener su status real de Meta
    const originalCampaign = originalMetaCampaigns.find(c => c.id === campaignId);
    
    if (!originalCampaign) {
      toast.error("No se encontró la campaña");
      return;
    }

    // Determinar el nuevo estado basado en el status REAL de Meta (no el effective_status)
    const newStatus = originalCampaign.status === 'ACTIVE' ? "PAUSED" : "ACTIVE";
    
    const success = await updateCampaignStatus(campaignId, newStatus);
    
    if (success) {
      toast.success(`Campaña ${newStatus === "ACTIVE" ? "activada" : "pausada"} exitosamente`);
      loadRealData(); // Recargar datos
    } else {
      toast.error("Error al actualizar el estado de la campaña");
    }
  };

  // Manejar cambio de estado de ad set
  const handleToggleAdSet = async (adSetId: string, currentStatus: "ACTIVE" | "PAUSED") => {
    if (!usingRealData) {
      toast.info("Esta función solo está disponible con datos reales");
      return;
    }

    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    const success = await updateAdSetStatus(adSetId, newStatus);
    
    if (success) {
      toast.success(`Conjunto ${newStatus === "ACTIVE" ? "activado" : "pausado"} exitosamente`);
      // Recargar ad sets de la campaña
      const campaignId = Array.from(adSetsData.entries())
        .find(([_, sets]) => sets.some(s => s.id === adSetId))?.[0];
      
      if (campaignId) {
        const adSets = await fetchCampaignAdSets(campaignId, datePreset);
        setAdSetsData(new Map(adSetsData).set(campaignId, adSets));
      }
    } else {
      toast.error("Error al actualizar el estado del conjunto");
    }
  };

  // Cálculos de totales y promedios
  const totales = campaigns.reduce((acc, camp) => ({
    gastado: acc.gastado + camp.gastado,
    conversaciones: acc.conversaciones + camp.conversaciones,
    ventas: acc.ventas + camp.ventas,
    ingresos: acc.ingresos + camp.ingresos,
    alcance: acc.alcance + camp.alcance,
    impresiones: acc.impresiones + camp.impresiones,
  }), { gastado: 0, conversaciones: 0, ventas: 0, ingresos: 0, alcance: 0, impresiones: 0 });

  const promedios = {
    costePorConv: totales.gastado / totales.conversaciones,
    roas: (totales.ingresos / totales.gastado) * 100,
    tasaConversion: (totales.ventas / totales.conversaciones) * 100,
    ctr: ((totales.conversaciones / totales.impresiones) * 100).toFixed(2),
  };

  // Función para ordenar
  const handleSort = (field: keyof CampaignData) => {
    if (sortField === field) {
      // Si ya está ordenado por este campo, cambiar dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo, ordenar ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para renderizar el icono de ordenamiento
  const SortIcon = ({ field }: { field: keyof CampaignData }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const campaniasFiltradas = campaigns
    .filter(camp => {
      const coincideBusqueda = camp.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activas" && camp.estado === "activa") ||
        (filtroEstado === "pausadas" && camp.estado === "pausada") ||
        (filtroEstado === "finalizadas" && camp.estado === "finalizada");
      return coincideBusqueda && coincideEstado;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Ordenamiento para strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      // Ordenamiento para números
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header Professional */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administrador de anuncios</h1>
              <p className="text-sm text-gray-500 mt-1">Gestiona tus campañas publicitarias</p>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={datePreset} 
                onValueChange={(value) => {
                  setDatePreset(value);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="yesterday">Ayer</SelectItem>
                  <SelectItem value="last_7d">Últimos 7 días</SelectItem>
                  <SelectItem value="last_30d">Últimos 30 días</SelectItem>
                  <SelectItem value="this_month">Este mes</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadRealData}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Settings2 className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>

          {/* Indicador de datos reales - SIEMPRE visible */}
          <div className="mb-3 flex items-center gap-2 text-sm">
            {loading ? (
              <>
                <Badge variant="default" className="bg-blue-500">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Actualizando datos desde Meta Ads...
                </Badge>
              </>
            ) : usingRealData ? (
              <>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  En vivo desde Meta Ads
                </Badge>
                <span className="text-gray-500 text-xs">
                  {campaigns.length} campañas • Última actualización: {new Date().toLocaleTimeString()}
                </span>
              </>
            ) : (
              <>
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Reconectando con Meta Ads...
                </Badge>
                <span className="text-gray-500 text-xs">
                  Reintentando automáticamente
                </span>
              </>
            )}
          </div>

          {/* KPIs superiores (diseño anterior con CVR) */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg border p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">Gasto Total</p>
              <p className="text-2xl font-bold mt-1">${totales.gastado.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">Conversaciones</p>
              <p className="text-2xl font-bold mt-1">{totales.conversaciones.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">Ventas</p>
              <p className="text-2xl font-bold mt-1">{totales.ventas.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">CVR Promedio</p>
              <p className="text-2xl font-bold mt-1">{promedios.tasaConversion.toFixed(2)}%</p>
            </div>
          </div>

          {/* Título + botón actualizar */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Campañas</h2>
            <button onClick={loadRealData} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-3 py-1 rounded">
              Actualizar
            </button>
          </div>
        </div>

        {/* Barra de herramientas - Estilo Meta Ads */}
        <div className="bg-gray-50 border-b px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, identificador o métricas"
                  className="pl-10 w-[400px]"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="activas">Activas</SelectItem>
                  <SelectItem value="pausadas">Pausadas</SelectItem>
                  <SelectItem value="finalizadas">Finalizadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Vista selector */}
            <Tabs value={vistaActual} onValueChange={(v) => setVistaActual(v as "campañas" | "conjuntos" | "anuncios")} className="w-auto">
              <TabsList className="bg-white">
                <TabsTrigger value="campañas" className="data-[state=active]:bg-blue-50">
                  Campañas
                </TabsTrigger>
                <TabsTrigger value="conjuntos" className="data-[state=active]:bg-blue-50">
                  Conjuntos de anuncios
                </TabsTrigger>
                <TabsTrigger value="anuncios" className="data-[state=active]:bg-blue-50">
                  Anuncios
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Settings2 className="w-4 h-4 mr-2" />
                Columnas
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Gráficos
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla principal - Estilo profesional Meta */}
        <div className="flex-1 bg-white relative" style={{ overflowX: 'scroll', overflowY: 'auto' }}>
          <Table className="w-full" style={{ minWidth: '2000px' }}>
            <TableHeader className="sticky top-0 bg-gray-50 z-10">
              <TableRow className="border-b-2">
                <TableHead className="w-[50px]">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead className="w-[80px]">
                  <button 
                    onClick={() => handleSort('estado')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Estado
                    <SortIcon field="estado" />
                  </button>
                </TableHead>
                <TableHead className="min-w-[300px]">
                  <button 
                    onClick={() => handleSort('nombre')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Campaña
                    <SortIcon field="nombre" />
                  </button>
                </TableHead>
                <TableHead className="text-center">
                  <button 
                    onClick={() => handleSort('entrega')}
                    className="flex items-center gap-1 hover:text-blue-600 mx-auto"
                  >
                    Entrega
                    <SortIcon field="entrega" />
                  </button>
                </TableHead>
                <TableHead className="text-center">Rec.</TableHead>
                <TableHead className="text-right w-[100px]">
                  <button 
                    onClick={() => handleSort('presupuesto')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    Presup.
                    <SortIcon field="presupuesto" />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[100px]">
                  <button 
                    onClick={() => handleSort('gastado')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    Gastado
                    <SortIcon field="gastado" />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[80px]">
                  <button 
                    onClick={() => handleSort('conversaciones')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    Conv.
                    <SortIcon field="conversaciones" />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[90px]">
                  <button 
                    onClick={() => handleSort('costePorConv')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    $/Conv.
                    <SortIcon field="costePorConv" />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[70px]">
                  <button 
                    onClick={() => handleSort('ventas')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    Ventas
                    <SortIcon field="ventas" />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[90px]">
                  <button 
                    onClick={() => handleSort('ingresos')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    Ingresos
                    <SortIcon field="ingresos" />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[70px]">
                  <button 
                    onClick={() => handleSort('roas')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    ROAS
                    <SortIcon field="roas" />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[60px]">
                  <button 
                    onClick={() => handleSort('cvr')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    CVR
                    <SortIcon field="cvr" />
                  </button>
                </TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vistaActual === "campañas" && campaniasFiltradas.map((campaign) => (
                <TableRow key={campaign.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={selectedCampaigns.has(campaign.id)}
                      onChange={() => toggleCampaignSelection(campaign.id)}
                    />
                  </TableCell>
                    <TableCell>
                    <Switch 
                      checked={campaign.estado === "activa"} 
                      onCheckedChange={() => handleToggleCampaign(campaign.id, campaign.estado)}
                      disabled={!usingRealData}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {campaign.nombre.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{campaign.nombre}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-2">
                                  <p className="font-semibold">{campaign.nombre}</p>
                                  <p className="text-xs text-gray-500">
                                    Esta campaña publicitaria rastrea conversaciones generadas desde anuncios, 
                                    mide el ROAS y conecta ventas con la inversión publicitaria para optimizar 
                                    el rendimiento.
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-xs text-gray-500">
                          ID: {campaign.id}
                          {campaign.account_name && (
                            <span className="ml-2 text-blue-600">• {campaign.account_name}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {campaign.entrega === "activa" ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Activa
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Pause className="w-3 h-3 mr-1" />
                        Pausada
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {campaign.recomendaciones > 0 ? (
                      <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center w-full">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {campaign.recomendaciones}
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${campaign.presupuesto.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <p className="font-semibold">${campaign.gastado.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {(() => {
                          const pct = campaign.presupuesto > 0 ? (campaign.gastado / campaign.presupuesto) * 100 : 0;
                          return Number.isFinite(pct) ? pct.toFixed(0) : '0';
                        })()}%
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {campaign.conversaciones.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    ${campaign.costePorConv.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <p className="font-semibold text-green-600">{campaign.ventas}</p>
                      <p className="text-xs text-gray-500">
                        {((campaign.ventas / campaign.conversaciones) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    ${(campaign.ingresos / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold text-lg ${
                      campaign.roas >= 90 ? 'text-green-600' :
                      campaign.roas >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(campaign.roas / 100).toFixed(2)}x
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-medium">
                      {campaign.cvr ? campaign.cvr.toFixed(2) : 0}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {vistaActual === "conjuntos" && (
                <>
                  {loadingAdSets ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-700 font-medium">Cargando conjuntos de anuncios...</p>
                      </TableCell>
                    </TableRow>
                  ) : selectedCampaigns.size === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-12">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-700 font-medium mb-2">Selecciona una campaña</p>
                        <p className="text-gray-500 text-sm">
                          Ve a la pestaña "Campañas" y selecciona al menos una campaña para ver sus conjuntos de anuncios
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    adSetsFromSelectedCampaigns.map((adSet) => (
                      <TableRow key={adSet.id} className="hover:bg-gray-50">
                        <TableCell>
                          <input 
                            type="checkbox" 
                            className="rounded" 
                            checked={selectedAdSets.has(adSet.id)}
                            onChange={() => toggleAdSetSelection(adSet.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={adSet.status === "ACTIVE"} 
                            onCheckedChange={() => handleToggleAdSet(adSet.id, adSet.status as "ACTIVE" | "PAUSED")}
                            disabled={!usingRealData}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Folder className="w-10 h-10 p-2 rounded-full bg-blue-100 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{adSet.name}</p>
                              <p className="text-xs text-gray-500">Conjunto de anuncios • ID: {adSet.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={adSet.status === "ACTIVE" ? "default" : "secondary"} className={adSet.status === "ACTIVE" ? "bg-green-500" : ""}>
                            {adSet.status === "ACTIVE" ? "Activa" : "Pausada"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">—</TableCell>
                        <TableCell className="text-right font-medium">
                          ${(adSet.daily_budget ? adSet.daily_budget / 100 : 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-semibold">${(adSet.insights?.spend || 0).toLocaleString()}</p>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {adSet.insights?.clicks || 0}
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          ${adSet.insights?.cpc ? adSet.insights.cpc.toFixed(2) : '0'}
                        </TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-medium">{adSet.insights?.ctr ? adSet.insights.ctr.toFixed(2) : '0'}%</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </>
              )}

              {vistaActual === "anuncios" && (
                <>
                  {selectedAdSets.size === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-12">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-700 font-medium mb-2">Selecciona un conjunto de anuncios</p>
                        <p className="text-gray-500 text-sm">
                          Ve a la pestaña "Conjuntos de anuncios" y selecciona al menos uno para ver sus anuncios
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    adsFromSelectedAdSets.map((ad) => (
                      <TableRow key={ad.id} className="hover:bg-gray-50">
                        <TableCell>
                          <input type="checkbox" className="rounded" />
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={ad.status === "ACTIVE"} 
                            disabled={!usingRealData}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-semibold">
                              AD
                            </div>
                            <div>
                              <p className="font-medium text-sm">{ad.name}</p>
                              <p className="text-xs text-gray-500">Anuncio • ID: {ad.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={ad.status === "ACTIVE" ? "default" : "secondary"} className={ad.status === "ACTIVE" ? "bg-green-500" : ""}>
                            {ad.status === "ACTIVE" ? "Activo" : "Pausado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">—</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell className="text-right">—</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </>
              )}
            </TableBody>
          </Table>

          {loading && campaniasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-700 font-medium">Cargando campañas desde Meta Ads...</p>
              <p className="text-gray-500 text-sm mt-2">
                Conectando con {getAdAccounts().length} cuentas publicitarias
              </p>
            </div>
          )}
          
          {!loading && campaniasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700 font-medium mb-2">No se encontraron campañas</p>
              <p className="text-gray-500 text-sm">
                {busqueda || filtroEstado !== "todos" 
                  ? "Intenta ajustar tus filtros de búsqueda" 
                  : "No hay campañas activas en tu cuenta de Meta Ads"}
              </p>
            </div>
          )}
        </div>

        {/* Footer con totales */}
        <div className="bg-gray-50 border-t px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              Mostrando <span className="font-semibold">{campaniasFiltradas.length}</span> de <span className="font-semibold">{campaigns.length}</span> campañas
            </p>
            <div className="flex items-center gap-6 text-gray-700">
              <div>
                <span className="text-gray-500">Total gastado: </span>
                <span className="font-bold">${totales.gastado.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Total conversaciones: </span>
                <span className="font-bold">{totales.conversaciones.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Total ventas: </span>
                <span className="font-bold text-green-600">{totales.ventas}</span>
              </div>
              <div>
                <span className="text-gray-500">ROAS promedio: </span>
                <span className="font-bold text-green-600">{(promedios.roas / 100).toFixed(2)}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Advertising;
