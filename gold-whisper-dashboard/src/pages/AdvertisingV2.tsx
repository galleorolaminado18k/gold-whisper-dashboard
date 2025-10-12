import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  fetchAllAccountsCampaigns,
  fetchCampaignAdSets,
  MetaCampaign,
} from "@/lib/metaAds";
import { fetchConversations, fetchMessages, CWConversation } from "@/lib/chatwoot";
import classifyStage from "@/lib/classifier";
import { getTotalsByCampaignFromSupabase } from "@/lib/sales";
import { getCategoryLabelForMessages } from "@/lib/campaignAttribution";

type Row = {
  id: string;
  nombre: string;
  presupuesto: number;
  gastado: number;
  conversaciones: number;
  ventas: number;
  ingresos: number;
  costePorConv: number;
  roas: number;
  cvr: number;
};

function num(v: unknown, d = 0): number { const n = Number(v); return Number.isFinite(n) ? n : d; }

export default function AdvertisingV2() {
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<Row[]>([]);

  const datePreset = "last_30d";

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const campaigns = await fetchAllAccountsCampaigns(datePreset);
      const allConvs = await fetchConversations();

      const data: Row[] = [];

      for (const c of campaigns) {
        try {
          const id = c.id;
          const nombre = c.name;
          const insights = (c as MetaCampaign).insights as any;
          const gastado = num(insights?.spend, 0);

          let presupuesto = 0;
          const db = num((c as any).daily_budget, 0);
          const lb = num((c as any).lifetime_budget, 0);
          if (db > 0) presupuesto = db / 100; else if (lb > 0) presupuesto = lb / 100;
          if (presupuesto === 0) {
            const sets = await fetchCampaignAdSets(id, datePreset);
            const sum = (sets || []).reduce((acc, s) => acc + num((s as any).daily_budget, 0), 0);
            presupuesto = sum > 0 ? sum / 100 : 0;
          }

          const label = `campaign:${id}`;
          const convs = (allConvs as CWConversation[]).filter((cv) => {
            const labels = Array.isArray((cv as any).labels) ? ((cv as any).labels as string[]) : [];
            return labels.some((l) => typeof l === 'string' && l === label);
          });
          let conversaciones = convs.length;

          if (conversaciones === 0) {
            // si no hay etiquetas aún, mantener 0 (o podríamos usar proxy de actions si se requiere)
          }

          let ventas = 0;
          let ingresosEst = 0;
          const AOV_DEFAULT = num((import.meta as any).env?.VITE_DEFAULT_AOV, 285000);
          const AOV_BAL = num((import.meta as any).env?.VITE_AOV_BALINERIA, AOV_DEFAULT);
          const AOV_JOY = num((import.meta as any).env?.VITE_AOV_JOYERIA, AOV_DEFAULT);

          for (const conv of convs) {
            const msgs = await fetchMessages(conv.id).catch(() => []);
            const arr = Array.isArray(msgs) ? msgs : [];
            const stage = classifyStage(arr as any);
            if (stage === 'pedido_completo') {
              ventas++;
              const cat = getCategoryLabelForMessages(arr as any);
              if (cat === 'category:balineria') ingresosEst += AOV_BAL;
              else if (cat === 'category:joyeria') ingresosEst += AOV_JOY;
              else ingresosEst += AOV_DEFAULT;
            }
          }

          let ingresos = ingresosEst;
          try {
            const fromDb = await getTotalsByCampaignFromSupabase(id);
            if (fromDb && num(fromDb.ingresos) > 0) ingresos = num(fromDb.ingresos);
          } catch {}

          const costePorConv = conversaciones > 0 ? gastado / conversaciones : 0;
          const roas = gastado > 0 ? ingresos / gastado : 0;
          const cvr = conversaciones > 0 ? (ventas / conversaciones) * 100 : 0;

          data.push({ id, nombre, presupuesto, gastado, conversaciones, ventas, ingresos, costePorConv, roas, cvr });
        } catch {}
      }

      setRows(data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const totals = rows.reduce((a, r) => ({
    gastado: a.gastado + r.gastado,
    conversaciones: a.conversaciones + r.conversaciones,
    ventas: a.ventas + r.ventas,
    ingresos: a.ingresos + r.ingresos,
  }), { gastado: 0, conversaciones: 0, ventas: 0, ingresos: 0 });

  const avgCvr = totals.conversaciones > 0 ? (totals.ventas / totals.conversaciones) * 100 : 0;
  const avgRoas = totals.gastado > 0 ? (totals.ingresos / totals.gastado) : 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">Gasto Total</p>
              <p className="text-2xl font-bold mt-1">${totals.gastado.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">Conversaciones</p>
              <p className="text-2xl font-bold mt-1">{totals.conversaciones.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">Ventas</p>
              <p className="text-2xl font-bold mt-1">{totals.ventas.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">CVR Promedio</p>
              <p className="text-2xl font-bold mt-1">{avgCvr.toFixed(2)}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Campañas</h2>
          <Button size="sm" onClick={load} disabled={loading}>
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Actualizando...</>) : (<>Actualizar</>)}
          </Button>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaña</TableHead>
                <TableHead className="text-right">Presup.</TableHead>
                <TableHead className="text-right">Gastado</TableHead>
                <TableHead className="text-right">Conv.</TableHead>
                <TableHead className="text-right">$/Conv.</TableHead>
                <TableHead className="text-right">Ventas</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead className="text-right">CVR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.nombre}</TableCell>
                  <TableCell className="text-right">${r.presupuesto.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${r.gastado.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{r.conversaciones.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${r.costePorConv.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{r.ventas.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${r.ingresos.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{r.roas.toFixed(2)}x</TableCell>
                  <TableCell className="text-right">{r.cvr.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && (
            <div className="p-6 text-center text-sm text-gray-500">Cargando campañas...</div>
          )}
          {!loading && rows.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">Sin campañas</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

