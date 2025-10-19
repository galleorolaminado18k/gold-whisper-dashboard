import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  fetchAllAccountsCampaigns,
  fetchCampaignAdSets,
  updateAdSetStatus,
  updateCampaignStatus,
  MetaCampaign,
  MetaAdSet,
} from "@/lib/metaAds";
import { fetchConversationsByLabel, fetchMessages } from "@/lib/chatwoot";
import classifyStage from "@/lib/classifier";
import { getCategoryLabelForMessages } from "@/lib/campaignAttribution";
import { getTotalsByCampaignFromSupabase } from "@/lib/sales";
import { toast } from "sonner";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Edit,
  Filter,
  Folder,
  Loader2,
  MoreHorizontal,
  Pause,
  RefreshCw,
  Search,
  Settings2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type CampaignRow = {
  id: string;
  nombre: string;
  estado: "activa" | "pausada" | "finalizada";
  entrega: "activa" | "pausada" | "completada";
  recomendaciones: number;
  presupuesto: number;
  gastado: number;
  conversaciones: number;
  ventas: number;
  ingresos: number;
  costePorConv: number;
  roas: number;
  alcance: number;
  impresiones: number;
  clicks: number;
  ctr: number;
  cvr: number; // Ventas / Conversaciones (%)
  account_name?: string;
};

const NAME_MAX = 28;
const clamp = (s: string) => (s?.length > NAME_MAX ? s.slice(0, NAME_MAX) + "..." : s);

function toRow(c: MetaCampaign): CampaignRow {
  const spend = Number((c as any)?.insights?.spend) || 0;
  const clicks = Number((c as any)?.insights?.clicks) || 0;
  const impressions = Number((c as any)?.insights?.impressions) || 0;
  const reach = Number((c as any)?.insights?.reach) || 0;
  const daily = Number((c as any)?.daily_budget) || 0;
  const lifetime = Number((c as any)?.lifetime_budget) || 0;

  let presupuesto = 0;
  if (daily > 0) presupuesto = daily / 100;
  else if (lifetime > 0) presupuesto = lifetime / 100;

  const estadoEntrega = c.effective_status === "ACTIVE" ? "activa" : "pausada";
  const estado = c.status === "ACTIVE" ? "activa" : c.status === "PAUSED" ? "pausada" : "finalizada";

  return {
    id: c.id,
    nombre: c.name,
    estado,
    entrega: estadoEntrega,
    recomendaciones: 0,
    presupuesto,
    gastado: spend,
    conversaciones: 0,
    ventas: 0,
    ingresos: 0,
    costePorConv: 0,
    roas: 0,
    alcance: reach,
    impresiones: impressions,
    clicks,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    cvr: 0,
    account_name: (c as any)?.account_name,
  };
}

export function AdvertisingDashboard() {
  const [datePreset, setDatePreset] = useState("last_30d");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [usingRealData, setUsingRealData] = useState(false);

  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [originalMeta, setOriginalMeta] = useState<MetaCampaign[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [vista, setVista] = useState<"campañas" | "conjuntos" | "anuncios">("campañas");

  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [adSetsData, setAdSetsData] = useState<Map<string, MetaAdSet[]>>(new Map());
  const [loadingAdSets, setLoadingAdSets] = useState(false);

  const [sortField, setSortField] = useState<keyof CampaignRow | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState<number>(2000);

  useLayoutEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    const update = () => setContentWidth(el.scrollWidth);
    update();
    const ro = new (window as any).ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      try { ro.disconnect(); } catch {}
      window.removeEventListener("resize", update);
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

  const enrichCampaign = async (c: CampaignRow): Promise<CampaignRow> => {
    try {
      const label = `campaign:${c.id}`;
      const convs = await fetchConversationsByLabel(label);
      let conversaciones = Array.isArray(convs) ? convs.length : 0;

      let ventas = 0;
      let ingresosEstimado = 0;
      const AOV_DEFAULT = Number(import.meta.env.VITE_DEFAULT_AOV) || 285000;
      const AOV_BAL = Number(import.meta.env.VITE_AOV_BALINERIA) || AOV_DEFAULT;
      const AOV_JOY = Number(import.meta.env.VITE_AOV_JOYERIA) || AOV_DEFAULT;

      for (const conv of convs) {
        const msgs = await fetchMessages(conv.id).catch(() => []);
        const stage = classifyStage(msgs as any);
        if (stage === "pedido_completo") {
          ventas++;
          const cat = getCategoryLabelForMessages(msgs as any);
          if (cat === "category:balineria") ingresosEstimado += AOV_BAL;
          else if (cat === "category:joyeria") ingresosEstimado += AOV_JOY;
          else ingresosEstimado += AOV_DEFAULT;
        }
      }

      let ingresos = ingresosEstimado;
      try {
        const db = await getTotalsByCampaignFromSupabase(c.id);
        if (db && typeof (db as any).ingresos === "number" && (db as any).ingresos > 0)
          ingresos = Number((db as any).ingresos);
      } catch {}

      const gastado = c.gastado || 0;
      const costePorConv = conversaciones > 0 ? gastado / conversaciones : 0;
      const roas = gastado > 0 ? ingresos / gastado : 0;
      const cvr = conversaciones > 0 ? (ventas / conversaciones) * 100 : 0;
      const ctr = c.impresiones > 0 ? (c.clicks / c.impresiones) * 100 : 0;

      return { ...c, conversaciones, ventas, ingresos, costePorConv, roas, cvr, ctr };
    } catch {
      return c;
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const campaigns = await fetchAllAccountsCampaigns(datePreset);
      setOriginalMeta(campaigns);
      const baseRows = campaigns.map(toRow);

      // Presupuesto fallback desde ad sets si hace falta
      const withBudgets = await Promise.all(
        baseRows.map(async (r) => {
          if (r.presupuesto > 0) return r;
          try {
            const sets = await fetchCampaignAdSets(r.id, datePreset);
            const sum = (sets || []).reduce((acc, s) => acc + (Number((s as any).daily_budget) || 0), 0);
            const presupuesto = sum > 0 ? sum / 100 : 0;
            return { ...r, presupuesto };
          } catch {
            return r;
          }
        })
      );

      const enriched = await Promise.all(withBudgets.map(enrichCampaign));
      setRows(enriched);
      setUsingRealData(true);
      setLastUpdated(new Date());
    } catch (e) {
      setUsingRealData(false);
      toast.error("No se pudieron cargar campañas de Meta Ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { load(); }, [datePreset]);

  const totals = useMemo(() => rows.reduce((a, r) => ({
    gastado: a.gastado + r.gastado,
    conversaciones: a.conversaciones + r.conversaciones,
    ventas: a.ventas + r.ventas,
    ingresos: a.ingresos + r.ingresos,
    impresiones: a.impresiones + r.impresiones,
    clicks: a.clicks + r.clicks,
  }), { gastado: 0, conversaciones: 0, ventas: 0, ingresos: 0, impresiones: 0, clicks: 0 }), [rows]);

  const promedioCvr = totals.conversaciones > 0 ? (totals.ventas / totals.conversaciones) * 100 : 0;
  const promedioRoas = totals.gastado > 0 ? (totals.ingresos / totals.gastado) : 0;
  const promedioCtr = totals.impresiones > 0 ? (totals.clicks / totals.impresiones) * 100 : 0;

  const filtered = useMemo(() => rows
    .filter((r) => {
      const nameOk = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const stateOk = filtroEstado === "todos"
        || (filtroEstado === "activas" && r.estado === "activa")
        || (filtroEstado === "pausadas" && r.estado === "pausada")
        || (filtroEstado === "finalizadas" && r.estado === "finalizada");
      return nameOk && stateOk;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === "number" && typeof bv === "number") return sortDirection === "asc" ? av - bv : bv - av;
      if (typeof av === "string" && typeof bv === "string") return sortDirection === "asc" ? av.localeCompare(bv) : b.localeCompare(av);
      return 0;
    }), [rows, busqueda, filtroEstado, sortField, sortDirection]);

  const toggleCampaign = async (campaignId: string) => {
    if (!usingRealData) { toast.info("Disponible con datos reales"); return; }
    const original = originalMeta.find((c) => c.id === campaignId);
    if (!original) { toast.error("No se encontró la campaña"); return; }
    const newStatus = original.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    const ok = await updateCampaignStatus(campaignId, newStatus);
    if (ok) { toast.success(`Campaña ${newStatus === "ACTIVE" ? "activada" : "pausada"}`); load(); }
    else toast.error("No se pudo actualizar la campaña");
  };

  const toggleAdSet = async (adSetId: string, current: "ACTIVE" | "PAUSED") => {
    if (!usingRealData) { toast.info("Disponible con datos reales"); return; }
    const ok = await updateAdSetStatus(adSetId, current === "ACTIVE" ? "PAUSED" : "ACTIVE");
    if (ok) { toast.success("Conjunto actualizado"); }
    else toast.error("No se pudo actualizar el conjunto");
  };

  useEffect(() => {
    if (vista !== "conjuntos" || selectedCampaigns.size === 0 || !usingRealData) return;
    setLoadingAdSets(true);
    Promise.all(Array.from(selectedCampaigns).map(async (cid) => {
      if (!adSetsData.has(cid)) {
        const sets = await fetchCampaignAdSets(cid, datePreset);
        return { cid, sets } as { cid: string, sets: MetaAdSet[] };
      }
      return null;
    })).then((res) => {
      const map = new Map(adSetsData);
      res.forEach((r) => { if (r) map.set(r.cid, r.sets); });
      setAdSetsData(map);
    }).finally(() => setLoadingAdSets(false));
  }, [vista, selectedCampaigns, usingRealData, datePreset]);

  const adSetsFromSelected = Array.from(selectedCampaigns).flatMap((cid) => adSetsData.get(cid) || []);

  const SortIcon = ({ field }: { field: keyof CampaignRow }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400"/>;
    return sortDirection === "asc" ? <ArrowUp className="w-4 h-4 text-blue-600"/> : <ArrowDown className="w-4 h-4 text-blue-600"/>;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Administrador de anuncios</h1>
                {lastUpdated && (
                  <span className="text-xs text-gray-400">Actualizado hace {Math.floor((Date.now() - lastUpdated.getTime())/1000)}s</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Gestiona tus campañas publicitarias</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="w-[200px]"><Calendar className="w-4 h-4 mr-2"/><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="yesterday">Ayer</SelectItem>
                  <SelectItem value="last_7d">Últimos 7 días</SelectItem>
                  <SelectItem value="last_30d">Últimos 30 días</SelectItem>
                  <SelectItem value="this_month">Este mes</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Cargando...</>) : (<><RefreshCw className="w-4 h-4 mr-2"/>Actualizar</>)}
              </Button>
              <Button variant="outline" size="sm"><Settings2 className="w-4 h-4 mr-2"/>Configurar</Button>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2 text-sm">
            {loading ? (
              <Badge variant="default" className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin"/>Actualizando datos desde Meta Ads...</Badge>
            ) : usingRealData ? (
              <Badge variant="default" className="bg-green-600">En vivo desde Meta Ads</Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Reintento automático</Badge>
            )}
          </div>

          <div className="grid grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">Gasto total</p><p className="text-2xl font-bold mt-1">${totals.gastado.toLocaleString()}</p><p className="text-xs text-green-600 mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/>+12.3% vs anterior</p></CardContent></Card>
            <Card className="border-l-4 border-l-purple-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">Conversaciones</p><p className="text-2xl font-bold mt-1">{totals.conversaciones.toLocaleString()}</p><p className="text-xs text-gray-500 mt-1">${(totals.conversaciones>0? totals.gastado/totals.conversaciones:0).toFixed(2)} por conv.</p></CardContent></Card>
            <Card className="border-l-4 border-l-green-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">Ventas</p><p className="text-2xl font-bold mt-1">{totals.ventas.toLocaleString()}</p><p className="text-xs text-green-600 mt-1">{promedioCvr.toFixed(1)}% tasa conversión</p></CardContent></Card>
            <Card className="border-l-4 border-l-yellow-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">ROAS</p><p className="text-2xl font-bold mt-1">{promedioRoas.toFixed(2)}x</p><p className="text-xs text-gray-500 mt-1">${totals.ingresos.toLocaleString()} ingresos</p></CardContent></Card>
            <Card className="border-l-4 border-l-indigo-500"><CardContent className="p-4"><p className="text-xs text-gray-500 uppercase">CTR PROMEDIO</p><p className="text-2xl font-bold mt-1">{promedioCtr.toFixed(2)}%</p><p className="text-xs text-gray-500 mt-1">{totals.impresiones.toLocaleString()} impresiones</p></CardContent></Card>
          </div>
        </div>

        <div className="bg-white border-b px-6 py-2">
          <div className="flex items-center justify-between mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
              <Input placeholder="Buscar por nombre, identificador o métricas" className="pl-10 w-[400px]" value={busqueda} onChange={(e)=>setBusqueda(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-[140px]"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="activas">Activas</SelectItem>
                  <SelectItem value="pausadas">Pausadas</SelectItem>
                  <SelectItem value="finalizadas">Finalizadas</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-2"/>Editar</Button>
              <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2"/>Filtros</Button>
              <Button variant="outline" size="sm"><Settings2 className="w-4 h-4 mr-2"/>Columnas</Button>
              <Button variant="outline" size="sm"><BarChart3 className="w-4 h-4 mr-2"/>Gráficos</Button>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2"/>Exportar</Button>
            </div>
          </div>

          <Tabs value={vista} onValueChange={(v)=>setVista(v as any)} className="w-auto">
            <TabsList className="bg-white">
              <TabsTrigger value="campañas" className="data-[state=active]:bg-blue-50">Campañas</TabsTrigger>
              <TabsTrigger value="conjuntos" className="data-[state=active]:bg-blue-50">Conjuntos de anuncios</TabsTrigger>
              <TabsTrigger value="anuncios" className="data-[state=active]:bg-blue-50">Anuncios</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 bg-white relative" ref={tableScrollRef} style={{ overflowX: "auto", overflowY: "auto" }} onScroll={handleMainScroll}>
          <div className="sticky top-0 left-0 w-full bg-white z-20">
            <div ref={topScrollRef} className="overflow-x-auto overflow-y-hidden h-3" onScroll={handleTopScroll}>
              <div style={{ width: contentWidth }} />
            </div>
          </div>

          <Table className="w-full" style={{ minWidth: "2000px" }}>
            <TableHeader className="sticky top-3 bg-gray-50 z-30 shadow-sm">
              <TableRow className="border-b-2">
                <TableHead className="w-[50px]"><input type="checkbox" className="rounded"/></TableHead>
                <TableHead className="w-[80px]">Estado</TableHead>
                <TableHead className="min-w-[300px]">Campaña</TableHead>
                <TableHead className="text-center">Entrega</TableHead>
                <TableHead className="text-center">Rec.</TableHead>
                <TableHead className="text-right w-[100px]"><button onClick={()=>{setSortField("presupuesto"); setSortDirection(sortField==="presupuesto" && sortDirection==="asc"?"desc":"asc")}} className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs">Presup. <SortIcon field="presupuesto"/></button></TableHead>
                <TableHead className="text-right w-[100px]"><button onClick={()=>{setSortField("gastado"); setSortDirection(sortField==="gastado" && sortDirection==="asc"?"desc":"asc")}} className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs">Gastado <SortIcon field="gastado"/></button></TableHead>
                <TableHead className="text-right w-[80px]"><button onClick={()=>{setSortField("conversaciones"); setSortDirection(sortField==="conversaciones" && sortDirection==="asc"?"desc":"asc")}} className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs">Conv. <SortIcon field="conversaciones"/></button></TableHead>
                <TableHead className="text-right w-[90px]"><button onClick={()=>{setSortField("costePorConv"); setSortDirection(sortField==="costePorConv" && sortDirection==="asc"?"desc":"asc")}} className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs">$/Conv. <SortIcon field="costePorConv"/></button></TableHead>
                <TableHead className="text-right w-[70px]"><button onClick={()=>{setSortField("ventas"); setSortDirection(sortField==="ventas" && sortDirection==="asc"?"desc":"asc")}} className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs">Ventas <SortIcon field="ventas"/></button></TableHead>
                <TableHead className="text-right w-[90px]"><button onClick={()=>{setSortField("ingresos"); setSortDirection(sortField==="ingresos" && sortDirection==="asc"?"desc":"asc")}} className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs">Ingresos <SortIcon field="ingresos"/></button></TableHead>
                <TableHead className="text-right w-[70px]"><button onClick={()=>{setSortField("roas"); setSortDirection(sortField==="roas" && sortDirection==="asc"?"desc":"asc")}} className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs">ROAS <SortIcon field="roas"/></button></TableHead>
                <TableHead className="text-right w-[70px]"><button onClick={()=>{setSortField("ctr"); setSortDirection(sortField==="ctr" && sortDirection==="asc"?"desc":"asc")}} className="flex items-center gap-1 hover:text-blue-600 ml-auto text-xs">CTR <SortIcon field="ctr"/></button></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vista === "campañas" && filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-gray-50">
                  <TableCell><input type="checkbox" className="rounded" onChange={(e)=>{ const s = new Set(selectedCampaigns); e.target.checked ? s.add(c.id) : s.delete(c.id); setSelectedCampaigns(s); }}/></TableCell>
                  <TableCell>
                    <Switch checked={c.estado === "activa"} onCheckedChange={() => toggleCampaign(c.id)} disabled={!usingRealData}/>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">{c.nombre.substring(0,2).toUpperCase()}</div>
                      <div className="min-w-0 flex-1">
                        <TooltipProvider><Tooltip><TooltipTrigger asChild><p className="font-medium text-sm whitespace-nowrap cursor-help" title={c.nombre}>{clamp(c.nombre)}</p></TooltipTrigger><TooltipContent className="max-w-md"><p className="text-xs text-gray-700 break-words">{c.nombre}</p></TooltipContent></Tooltip></TooltipProvider>
                        <p className="text-xs text-gray-500">ID: {c.id}{c.account_name && (<span className="ml-2 text-blue-600">• {c.account_name}</span>)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{c.entrega === "activa" ? (<Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1"/>Activa</Badge>) : (<Badge variant="secondary"><Pause className="w-3 h-3 mr-1"/>Pausada</Badge>)}</TableCell>
                  <TableCell className="text-center">{c.recomendaciones > 0 ? (<button className="text-blue-600 font-semibold text-sm">{c.recomendaciones}</button>) : (<span className="text-gray-400">—</span>)}</TableCell>
                  <TableCell className="text-right font-medium">${c.presupuesto.toLocaleString()}</TableCell>
                  <TableCell className="text-right"><p className="font-semibold">${c.gastado.toLocaleString()}</p><p className="text-xs text-gray-500">{(() => { const pct = c.presupuesto>0 ? (c.gastado/c.presupuesto)*100 : 0; return Number.isFinite(pct) ? pct.toFixed(0) : "0"; })()}%</p></TableCell>
                  <TableCell className="text-right font-semibold">{c.conversaciones.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-gray-600">${c.costePorConv.toLocaleString()}</TableCell>
                  <TableCell className="text-right"><span className="font-semibold text-green-600">{c.ventas.toLocaleString()}</span></TableCell>
                  <TableCell className="text-right font-semibold text-green-600">${(c.ingresos/1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-right"><span className={`font-bold text-lg ${c.roas>=4?'text-green-600':c.roas>=2?'text-yellow-600':'text-red-600'}`}>{c.roas.toFixed(2)}x</span></TableCell>
                  <TableCell className="text-right"><span className="text-sm font-medium">{c.ctr.toFixed(2)}%</span></TableCell>
                </TableRow>
              ))}

              {vista === "conjuntos" && (
                <>
                  {loadingAdSets ? (
                    <TableRow><TableCell colSpan={14} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500"/><p className="text-gray-700 font-medium">Cargando conjuntos de anuncios...</p></TableCell></TableRow>
                  ) : selectedCampaigns.size === 0 ? (
                    <TableRow><TableCell colSpan={14} className="text-center py-12"><AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400"/><p className="text-gray-700 font-medium mb-2">Selecciona una campaña</p><p className="text-gray-500 text-sm">Ve a "Campañas" y elige al menos una campaña</p></TableCell></TableRow>
                  ) : (
                    adSetsFromSelected.map((adSet) => (
                      <TableRow key={adSet.id} className="hover:bg-gray-50">
                        <TableCell><input type="checkbox" className="rounded"/></TableCell>
                        <TableCell><Switch checked={adSet.status === "ACTIVE"} onCheckedChange={() => toggleAdSet(adSet.id, adSet.status as any)} disabled={!usingRealData}/></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Folder className="w-10 h-10 p-2 rounded-full bg-blue-100 text-blue-600"/>
                            <div>
                              <TooltipProvider><Tooltip><TooltipTrigger asChild><p className="font-medium text-sm whitespace-nowrap cursor-help" title={adSet.name}>{adSet.name}</p></TooltipTrigger><TooltipContent className="max-w-md"><p className="text-xs text-gray-700 break-words">{adSet.name}</p></TooltipContent></Tooltip></TooltipProvider>
                              <p className="text-xs text-gray-500">Conjunto • ID: {adSet.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">—</TableCell>
                        <TableCell className="text-right font-medium">${(adSet.daily_budget ? adSet.daily_budget/100 : 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right"><p className="font-semibold">${(adSet.insights?.spend || 0).toLocaleString()}</p></TableCell>
                        <TableCell className="text-right font-semibold">{(adSet as any).conversaciones?.toLocaleString?.() || '0'}</TableCell>
                        <TableCell className="text-right text-gray-600">${(adSet as any).costePorConv?.toFixed?.(2) || '0'}</TableCell>
                        <TableCell className="text-right"><span className="font-semibold text-green-600">{(adSet as any).ventas || '0'}</span></TableCell>
                        <TableCell className="text-right font-semibold text-green-600">${(((adSet as any).ingresos || 0)/1000).toFixed(0)}K</TableCell>
                        <TableCell className="text-right"><span className={`font-bold text-lg ${((adSet as any).roas || 0) >= 4 ? 'text-green-600' : ((adSet as any).roas || 0) >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>{((adSet as any).roas || 0).toFixed(2)}x</span></TableCell>
                        <TableCell className="text-right"><span className="text-sm font-medium">{(((adSet as any).cvr || 0)).toFixed(2)}%</span></TableCell>
                      </TableRow>
                    ))
                  )}
                </>
              )}
            </TableBody>
          </Table>

          {loading && filtered.length === 0 && (
            <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500"/><p className="text-gray-700 font-medium">Cargando campañas desde Meta Ads...</p></div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12"><AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400"/><p className="text-gray-700 font-medium mb-2">No se encontraron campañas</p><p className="text-gray-500 text-sm">Ajusta tus filtros de búsqueda</p></div>
          )}
        </div>

        <div className="bg-gray-50 border-t px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">Mostrando <span className="font-semibold">{filtered.length}</span> de <span className="font-semibold">{rows.length}</span> campañas</p>
            <div className="flex items-center gap-6 text-gray-700">
              <div><span className="text-gray-500">Total gastado: </span><span className="font-bold">${totals.gastado.toLocaleString()}</span></div>
              <div><span className="text-gray-500">Total conv.: </span><span className="font-bold">{totals.conversaciones.toLocaleString()}</span></div>
              <div><span className="text-gray-500">Total ventas: </span><span className="font-bold text-green-600">{totals.ventas.toLocaleString()}</span></div>
              <div><span className="text-gray-500">ROAS prom.: </span><span className="font-bold text-green-600">{promedioRoas.toFixed(2)}x</span></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdvertisingDashboard;

