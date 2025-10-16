import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Search,
  Edit,
  Download,
  BarChart3,
  Filter,
  Calendar,
  Settings2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pause,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Folder,
  X
} from "lucide-react";
// Resizable imports not used here
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
import { 
  fetchAllAccountsCampaigns, 
  MetaCampaign, 
  MetaAdSet,
  updateCampaignStatus, 
  updateAdSetStatus,
  fetchCampaignAdSets,
  getAdAccounts, 
  fetchCampaignConversions
} from "@/lib/metaAds";
import { toast } from "sonner";
import { fetchConversationsByLabel, fetchMessages } from "@/lib/chatwoot";
import classifyStage from "@/lib/classifier";
import { getCategoryLabelForMessages } from "@/lib/campaignAttribution";
import { getTotalsByCampaignFromSupabase } from "@/lib/sales";
import { getAIScore } from "@/lib/gemini";

interface MetaAd {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
  adset_id?: string;
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
  cpc: number;
  account_name?: string;
}


// Limite de caracteres visibles para nombres largos en tabla
const NAME_MAX = 28;
const clampName = (s: string) => (s && s.length > NAME_MAX ? s.slice(0, NAME_MAX) + "..." : s);

function SortIcon({ field, activeField, direction }: Readonly<{ field: keyof CampaignData; activeField: keyof CampaignData | null; direction: 'asc' | 'desc' }>) {
  if (activeField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
  return direction === 'asc' ? (
    <ArrowUp className="w-4 h-4 text-blue-600" />
  ) : (
    <ArrowDown className="w-4 h-4 text-blue-600" />
  );
}
// Función para transformar datos de Meta a formato de vista
function transformMetaCampaign(metaCampaign: MetaCampaign): CampaignData {
  const insights = metaCampaign.insights;
  const gastado = insights?.spend || 0;
  const impresiones = insights?.impressions || 0;
  
  // Estimaciones basadas en datos reales
  // En producción, estas ventas e ingresos vendrían de eventos de conversión personalizados
  // Estimaciones iniciales (se enriquecerán con datos de CRM y Supabase)
  // Se inicializan a 0 o valores de Meta para asegurar que siempre haya un número
  const conversaciones = insights?.clicks || 0; // Usar clicks como proxy inicial para conversaciones
  const ventas = 0; // Se calculará con CRM
  const ingresos = 0; // Se calculará con CRM/Supabase
  const costePorConv = conversaciones > 0 ? gastado / conversaciones : 0;
  const roas = gastado > 0 ? (ingresos / gastado) : 0;
  const cvr = conversaciones > 0 ? (ventas / conversaciones) * 100 : 0; // CVR = Ventas / Conversaciones (según solicitud del usuario)

  // IMPORTANTE: Usar effective_status que indica el estado REAL de entrega
  // effective_status = "ACTIVE" significa que la campaña está entregando anuncios realmente
  // Si no es "ACTIVE", la campaña NO está entregando (pausada, completada por fecha, etc.)
  const isReallyActive = metaCampaign.effective_status === 'ACTIVE';
  
  // Presupuesto: usa nivel campaña si existe; se ajustará luego con ad sets si falta
  let budgetCampaign = 0;
  if (typeof metaCampaign.daily_budget === 'number' && metaCampaign.daily_budget > 0) {
    budgetCampaign = metaCampaign.daily_budget / 100;
  } else if (typeof metaCampaign.lifetime_budget === 'number' && metaCampaign.lifetime_budget > 0) {
    budgetCampaign = metaCampaign.lifetime_budget / 100;
  }

  return {
    id: metaCampaign.id,
    nombre: metaCampaign.name,
    estado: isReallyActive ? 'activa' : 'pausada', // Switch basado en entrega real
    entrega: isReallyActive ? 'activa' : 'pausada', // Entrega basada en estado real
    recomendaciones: 0,
    presupuesto: budgetCampaign,
    gastado,
    conversaciones,
    costePorConv,
    ventas,
    ingresos,
    roas,
    alcance: insights?.reach || 0,
    impresiones,
    cvr,
    cpc: insights?.cpc || 0,
    account_name: metaCampaign.account_name,
  };
}

// Helper: enrich one campaign with CRM conversations, sales estimate, and optional DB totals
async function enrichCampaignWithCRMAndSales(c: CampaignData, datePreset: string): Promise<CampaignData> {
  try {
    const label = `campaign:${c.id}`;
    const convs = await fetchConversationsByLabel(label);
    let conversaciones = Array.isArray(convs) ? convs.length : 0;

    if (conversaciones === 0) {
      try {
        const convData = await fetchCampaignConversions(c.id, datePreset).catch(() => null);
        const actions: Array<{ action_type?: string; value?: string | number }> =
          (convData && (convData.actions as Array<{ action_type?: string; value?: string | number }>)) || [];
        const msgAction = (actions || []).find(
          (a) => typeof a?.action_type === 'string' && String(a.action_type).includes('messaging')
        );
        const v = msgAction?.value;
        const n = Number(v);
        if (Number.isFinite(n)) conversaciones = n;
      } catch {
        // silent; keep conversaciones as-is
      }
    }

    // Count sales and estimate ingresos by product category
    let ventas = 0;
    let ingresosEstimado = 0;
    const AOV_DEFAULT = Number(import.meta.env.VITE_DEFAULT_AOV) || 285000;
    const AOV_BAL = Number(import.meta.env.VITE_AOV_BALINERIA) || AOV_DEFAULT;
    const AOV_JOY = Number(import.meta.env.VITE_AOV_JOYERIA) || AOV_DEFAULT;
    for (const conv of convs) {
      const msgs = await fetchMessages(conv.id).catch(() => []);
      const stage = classifyStage(msgs);
      if (stage === "pedido_completo") {
        ventas++;
        const cat = getCategoryLabelForMessages(msgs);
        if (cat === 'category:balineria') ingresosEstimado += AOV_BAL;
        else if (cat === 'category:joyeria') ingresosEstimado += AOV_JOY;
        else ingresosEstimado += AOV_DEFAULT;
      }
    }

    // Try real ingresos from DB
    let ingresos = ingresosEstimado;
    try {
      const db = await getTotalsByCampaignFromSupabase(c.id);
      if (db && typeof db.ingresos === 'number' && db.ingresos > 0) ingresos = db.ingresos;
    } catch {
      // ignore
    }

    const gastado = c.gastado || 0;
    const costePorConv = conversaciones > 0 ? gastado / conversaciones : 0;
    const roas = gastado > 0 ? ingresos / gastado : 0;
    const cvr = conversaciones > 0 ? (ventas / conversaciones) * 100 : 0;
    return { ...c, conversaciones, ventas, ingresos, costePorConv, roas, cvr } as CampaignData;
  } catch {
    return c;
  }
}

// Datos de ejemplo SOLO para fallback si la API falla
const mockCampaigns: CampaignData[] = [
  { id: "1", nombre: "Black Friday 2024 - Balinería Premium", estado: "activa", entrega: "activa", recomendaciones: 4, presupuesto: 50000, gastado: 38750, conversaciones: 450, costePorConv: 86.11, ventas: 127, ingresos: 3850000, roas: 99.35, alcance: 125000, impresiones: 485000, cvr: (127 / 450) * 100, cpc: 95 },
  { id: "2", nombre: "Campaña Día de la Madre - Joyería", estado: "pausada", entrega: "pausada", recomendaciones: 0, presupuesto: 35000, gastado: 28400, conversaciones: 320, costePorConv: 88.75, ventas: 85, ingresos: 2340000, roas: 82.39, alcance: 89000, impresiones: 342000, cvr: (85 / 320) * 100, cpc: 83 },
  { id: "3", nombre: "San Valentín - Conversión WhatsApp", estado: "finalizada", entrega: "completada", recomendaciones: 0, presupuesto: 60000, gastado: 60000, conversaciones: 580, costePorConv: 103.45, ventas: 195, ingresos: 5670000, roas: 94.50, alcance: 156000, impresiones: 628000, cvr: (195 / 580) * 100, cpc: 96 },
  { id: "4", nombre: "Tráfico Web - Catálogo Balines", estado: "activa", entrega: "activa", recomendaciones: 2, presupuesto: 25000, gastado: 18200, conversaciones: 234, costePorConv: 77.78, ventas: 52, ingresos: 1450000, roas: 79.67, alcance: 78000, impresiones: 295000, cvr: (52 / 234) * 100, cpc: 62 },
  { id: "5", nombre: "Remarketing Carritos Abandonados", estado: "activa", entrega: "activa", recomendaciones: 1, presupuesto: 15000, gastado: 12300, conversaciones: 145, costePorConv: 84.83, ventas: 48, ingresos: 1280000, roas: 104.07, alcance: 45000, impresiones: 178000, cvr: (48 / 145) * 100, cpc: 69 },
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Guardar campañas originales de Meta para poder actualizar su estado
  const [originalMetaCampaigns, setOriginalMetaCampaigns] = useState<MetaCampaign[]>([]);

  // Cargar datos reales de Meta Ads (ambas cuentas)
  const loadRealData = React.useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Iniciando carga de datos desde Meta Ads...');
      const metaCampaigns = await fetchAllAccountsCampaigns(datePreset);
      console.log(`📊 Campañas recibidas de Meta Ads:`, metaCampaigns?.length || 0);
      
      if (metaCampaigns && metaCampaigns.length > 0) {
        console.log('✅ Datos de Meta Ads recibidos:', metaCampaigns);
        setOriginalMetaCampaigns(metaCampaigns); // Guardar originales
        const transformedCampaigns = metaCampaigns.map(transformMetaCampaign);

        // Fallback de presupuesto: si la campaña no tiene presupuesto a nivel campaña,
        // sumar daily_budget de sus ad sets.
        const withBudgets = await Promise.all(
          transformedCampaigns.map(async (c) => {
            if (c.presupuesto && c.presupuesto > 0) return c;
            try {
              const sets = await fetchCampaignAdSets(c.id, datePreset);
              const sum = (sets || []).reduce((acc, s) => acc + (Number(s?.daily_budget) || 0), 0);
              const budget = sum > 0 ? sum / 100 : 0;
              return { ...c, presupuesto: budget } as CampaignData;
            } catch (error) {
              console.error(`Error fetching ad sets for campaign ${c.id}:`, error);
              return c;
            }
          })
        );

        // Enriquecer con datos del CRM (conversaciones y ventas por campaña) usando etiquetas
        const enriched = await Promise.all(withBudgets.map((c) => enrichCampaignWithCRMAndSales(c, datePreset)));

        setCampaigns(enriched);
        setUsingRealData(true);
        setLastUpdated(new Date());
        console.log(`✅ ${transformedCampaigns.length} campañas cargadas desde Meta Ads`);
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
  }, [datePreset]);

  // Cargar datos reales al montar el componente
  useEffect(() => {
    loadRealData();
    // Auto-actualizar cada 30 segundos para datos en tiempo real
    const interval = setInterval(() => {
      loadRealData();
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [loadRealData]);

  // loadRealData already depends on datePreset

  // Actualizar el contador de "hace X segundos" cada segundo
  useEffect(() => {
    if (!lastUpdated) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Seleccionar/deseleccionar campaña
  const toggleCampaignSelection = (campaignId: string) => {
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId);
    } else {
      newSelected.add(campaignId);
    }
    setSelectedCampaigns(newSelected);
    // Nota: Ya no auto-navegamos. Solo navegar al hacer clic en el nombre de la campaña.
    // Si no hay ninguna seleccionada y estamos en vistas profundas, regresar a campañas
    if (newSelected.size === 0 && vistaActual !== "campañas") {
      setVistaActual("campañas");
    }
  };

  // Abrir la vista de Conjuntos solo cuando se cliquee la campaña
  const openAdSetsForCampaign = (campaignId: string) => {
    setSelectedCampaigns(new Set([campaignId]));
    setVistaActual("conjuntos");
  };

  // Al cambiar la selección de campañas, limpiar selección de ad sets y
  // recortar el caché de ad sets a solo esas campañas para evitar datos arrastrados
  useEffect(() => {
    setSelectedAdSets(new Set());
    setAdSetsData((prev) => {
      if (selectedCampaigns.size === 0) return new Map();
      const next = new Map<string, MetaAdSet[]>();
      for (const id of selectedCampaigns) {
        const sets = prev.get(id) || [];
        const filtered = sets.filter((s) => String(s.campaign_id) === String(id));
        next.set(id, filtered);
      }
      return next;
    });
  }, [selectedCampaigns]);

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
    if (!(vistaActual === "conjuntos" && selectedCampaigns.size > 0 && usingRealData)) return;
    const missing = Array.from(selectedCampaigns).filter((id) => !adSetsData.has(id));
    if (missing.length === 0) {
      setLoadingAdSets(false);
      return;
    }
    setLoadingAdSets(true);
    Promise.all(
      missing.map(async (campaignId) => {
        const adSets = await fetchCampaignAdSets(campaignId, datePreset);
        return { campaignId, adSets };
      })
    ).then((results) => {
      const newAdSetsData = new Map(adSetsData);
      results.forEach((result) => {
        newAdSetsData.set(result.campaignId, result.adSets);
      });
      setAdSetsData(newAdSetsData);
      setLoadingAdSets(false);
    });
  }, [vistaActual, selectedCampaigns, adSetsData, datePreset, usingRealData]);

  // Obtener conjuntos de anuncios de campañas seleccionadas
  const adSetsFromSelectedCampaigns = Array.from(selectedCampaigns).flatMap((campaignId) => {
    const sets = adSetsData.get(campaignId) || [];
    // Asegurar que solo entren ad sets de esa campaña
    return sets.filter((s) => String(s.campaign_id) === String(campaignId));
  });

  // Obtener anuncios de conjuntos seleccionados
  
  // Scroll sync: tabla y barra horizontal pegajosa
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState<number>(2000);

  useLayoutEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    const update = () => setContentWidth(el.scrollWidth);
    update();
  const RO: typeof ResizeObserver | undefined = (window as unknown as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
  const ro = RO ? new RO(update) : undefined;
  ro?.observe(el);
    window.addEventListener('resize', update);
    return () => { 
      try { 
        ro?.disconnect(); 
      } catch (error) {
        console.error("Error disconnecting ResizeObserver:", error);
      } 
      window.removeEventListener('resize', update); 
    };
  }, []);

  const handleMainScroll = () => {
    const a = tableScrollRef.current, b = topScrollRef.current;
    if (a && b && b.scrollLeft !== a.scrollLeft) b.scrollLeft = a.scrollLeft;
  };
  const handleTopScroll = () => {
    const a = tableScrollRef.current, b = topScrollRef.current;
    if (a && b && a.scrollLeft !== b.scrollLeft) a.scrollLeft = b.scrollLeft;
  };
const adsFromSelectedAdSets = Array.from(selectedAdSets).flatMap((adSetId) => {
    const ads = adsData.get(adSetId) || [];
    // Filtrar estrictamente por adset_id cuando exista
    return ads.filter((ad) => !ad.adset_id || String(ad.adset_id) === String(adSetId));
  });

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
    costePorConv: totales.conversaciones > 0 ? totales.gastado / totales.conversaciones : 0,
    roas: totales.gastado > 0 ? totales.ingresos / totales.gastado : 0,
    tasaConversion: totales.conversaciones > 0 ? (totales.ventas / totales.conversaciones) * 100 : 0, // CVR = Ventas / Conversaciones (según solicitud del usuario)
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

  // Using top-level SortIcon

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
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Administrador de anuncios</h1>
                {lastUpdated && (
                  <span className="text-xs text-gray-400 font-normal">
                    Actualizado hace {Math.floor((now - lastUpdated.getTime()) / 1000)}s
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Gestiona tus campañas publicitarias • Actualización automática cada 30 segundos</p>
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
          <div className="mb-2 flex items-center gap-2 text-sm">
            {loading && (
              <Badge variant="default" className="bg-blue-500">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Actualizando datos desde Meta Ads...
              </Badge>
            )}
            {!loading && usingRealData && (
              <>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  En vivo desde Meta Ads
                </Badge>
                <Badge variant="default" className="bg-indigo-500">CI: {getAIScore()}</Badge>
                <span className="text-gray-500 text-xs">
                  {campaigns.length} campañas • Última actualización: {new Date().toLocaleTimeString()}
                </span>
              </>
            )}
            {!loading && !usingRealData && (
              <>
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Reconectando con Meta Ads...
                </Badge>
                <span className="text-gray-500 text-xs">Reintentando automáticamente</span>
              </>
            )}
          </div>

          {/* Métricas principales - Estilo Meta */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Gasto total</p>
                <p className="text-2xl font-bold mt-1">${totales.gastado.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.3% vs anterior
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Conversaciones</p>
                <p className="text-2xl font-bold mt-1">{totales.conversaciones.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${promedios.costePorConv.toFixed(2)} por conv.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Ventas</p>
                <p className="text-2xl font-bold mt-1">{totales.ventas}</p>
                <p className="text-xs text-green-600 mt-1">
                  {promedios.tasaConversion.toFixed(1)}% tasa conversión
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">ROAS</p>
                <p className="text-2xl font-bold mt-1">{promedios.roas.toFixed(2)}x</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${totales.ingresos.toLocaleString()} ingresos
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">TASA DE CONVERSION "CVR"</p>
                <p className="text-2xl font-bold mt-1">{promedios.tasaConversion.toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totales.conversaciones.toLocaleString()} conversaciones
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Barra de herramientas - Estilo Meta Ads */}
        <div className="bg-white border-b px-6 py-2">
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
            {/* Vista selector con guardas */}
            <Tabs
              value={vistaActual}
              onValueChange={(v) => {
                const target = v as "campañas" | "conjuntos" | "anuncios";
                if (target === "conjuntos" && selectedCampaigns.size === 0) {
                  toast.info("Selecciona una campaña para ver sus conjuntos");
                  setVistaActual("campañas");
                  return;
                }
                if (target === "anuncios" && selectedAdSets.size === 0) {
                  toast.info("Selecciona al menos un conjunto para ver sus anuncios");
                  // Si hay una campaña, mandamos a conjuntos; si no, a campañas
                  setVistaActual(selectedCampaigns.size > 0 ? "conjuntos" : "campañas");
                  return;
                }
                setVistaActual(target);
              }}
              className="w-auto"
            >
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
          {/* Scope/filter chips like Meta when navigating deeper levels */}
          {vistaActual !== "campañas" && selectedCampaigns.size > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              {selectedCampaigns.size === 1 ? (
                (() => {
                  const selectedId = Array.from(selectedCampaigns)[0];
                  const camp = campaigns.find((c) => c.id === selectedId);
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Filtrando por campaña:</span>
                      <Badge variant="secondary" className="flex items-center gap-2">
                        <span className="max-w-[260px] truncate" title={camp?.nombre}>{camp?.nombre || selectedId}</span>
                        <button
                          className="ml-1 inline-flex items-center justify-center rounded hover:text-red-600"
                          onClick={() => {
                            setSelectedCampaigns(new Set());
                            setVistaActual("campañas");
                          }}
                          aria-label="Quitar filtro de campaña"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedCampaigns.size} campañas seleccionadas</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      setSelectedCampaigns(new Set());
                      setVistaActual("campañas");
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabla principal - Estilo profesional Meta */}
        <div className="flex-1 bg-white relative" ref={tableScrollRef} style={{ overflowX: "auto", overflowY: "auto" }} onScroll={handleMainScroll}>
            <div className="sticky top-0 left-0 w-full bg-white z-20">
              <div ref={topScrollRef} className="overflow-x-auto overflow-y-hidden h-3" onScroll={handleTopScroll}>
                <div style={{ width: contentWidth }} />
              </div>
            </div>
          <Table className="w-full" style={{ minWidth: '2000px' }}>
            <TableHeader className="sticky top-3 bg-gray-50 z-30 shadow-sm">
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
                    <SortIcon field="estado" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="min-w-[300px]">
                  <button 
                    onClick={() => handleSort('nombre')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Campaña
                    <SortIcon field="nombre" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="text-center">
                  <button 
                    onClick={() => handleSort('entrega')}
                    className="flex items-center gap-1 hover:text-blue-600 mx-auto"
                  >
                    Entrega
                    <SortIcon field="entrega" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="text-center">Rec.</TableHead>
                <TableHead className="text-right w-[100px]">
                  <button 
                    onClick={() => handleSort('presupuesto')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    Presup.
                    <SortIcon field="presupuesto" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[100px]">
                  <button 
                    onClick={() => handleSort('gastado')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    Gastado
                    <SortIcon field="gastado" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[80px]">
                  <button 
                    onClick={() => handleSort('conversaciones')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    Conv.
                    <SortIcon field="conversaciones" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[90px]">
                  <button 
                    onClick={() => handleSort('costePorConv')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    $/Conv.
                    <SortIcon field="costePorConv" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[70px]">
                  <button 
                    onClick={() => handleSort('ventas')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    Ventas
                    <SortIcon field="ventas" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[90px]">
                  <button 
                    onClick={() => handleSort('ingresos')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    Ingresos
                    <SortIcon field="ingresos" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[70px]">
                  <button 
                    onClick={() => handleSort('roas')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    ROAS
                    <SortIcon field="roas" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[60px]">
                  <button 
                    onClick={() => handleSort('cvr')}
                    className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs"
                  >
                    CVR
                    <SortIcon field="cvr" activeField={sortField} direction={sortDirection} />
                  </button>
                </TableHead>
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p
                                  className="font-medium text-sm whitespace-nowrap cursor-pointer text-blue-700 hover:underline"
                                  title="Click para ver conjuntos de anuncios"
                                  onClick={() => openAdSetsForCampaign(campaign.id)}
                                >
                                  {campaign.nombre}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md">
                                <p className="text-xs text-gray-700 break-words">{campaign.nombre}</p>
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
                    <p className="font-semibold text-green-600">{campaign.ventas}</p>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    ${(campaign.ingresos / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="text-right">
                    {(() => {
                      let cls = 'text-red-600';
                      if (campaign.roas >= 4) {
                        cls = 'text-green-600';
                      } else if (campaign.roas >= 2) {
                        cls = 'text-yellow-600';
                      }
                      return <span className={`font-bold text-lg ${cls}`}>{campaign.roas.toFixed(2)}x</span>;
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-medium">{campaign.cvr.toFixed(2)}%</span>
                  </TableCell>
                </TableRow>
              ))}

              {vistaActual === "conjuntos" && (
                <>
                  {(() => {
                    if (selectedCampaigns.size === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={14} className="text-center py-12">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-700 font-medium mb-2">Selecciona una campaña</p>
                            <p className="text-gray-500 text-sm">Ve a la pestaña "Campañas" y haz clic en el nombre para ver sus conjuntos</p>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    if (loadingAdSets) {
                      return (
                        <TableRow>
                          <TableCell colSpan={14} className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                            <p className="text-gray-700 font-medium">Cargando conjuntos de anuncios...</p>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return adSetsFromSelectedCampaigns.map((adSet) => (
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
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="font-medium text-sm whitespace-nowrap cursor-help" title={adSet.name}>{adSet.name}</p>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-md">
                                    <p className="text-xs text-gray-700 break-words">{adSet.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <p className="text-xs text-gray-500">Conjunto de anuncios — ID: {adSet.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">—</TableCell>
                        <TableCell className="text-right font-medium">
                          ${(adSet.daily_budget ? adSet.daily_budget / 100 : 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-semibold">${(adSet.insights?.spend || 0).toLocaleString()}</p>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {adSet.conversaciones?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          ${adSet.costePorConv?.toFixed(2) || '0'}
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-semibold text-green-600">{adSet.ventas || '0'}</p>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          ${((adSet.ingresos || 0) / 1000).toFixed(0)}K
                        </TableCell>
                        <TableCell className="text-right">
                          {(() => {
                            const r = adSet.roas || 0;
                            let cls = 'text-red-600';
                            if (r >= 4) {
                              cls = 'text-green-600';
                            } else if (r >= 2) {
                              cls = 'text-yellow-600';
                            }
                            return <span className={`font-bold text-lg ${cls}`}>{r.toFixed(2)}x</span>;
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-medium">{(adSet.cvr || 0).toFixed(2)}%</span>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
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
                <span className="font-bold text-green-600">{promedios.roas.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Advertising;
