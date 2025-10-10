import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";

interface Campaign {
  name: string;
  conversations: number;
  sales: number;
  conversionRate: number;
  revenue: number;
  investment: number;
  roas: number;
  topCities: string[];
}

const campaigns: Campaign[] = [
  {
    name: "Meta Ads - Joyería Premium",
    conversations: 156,
    sales: 42,
    conversionRate: 26.9,
    revenue: 18500000,
    investment: 3200000,
    roas: 5.78,
    topCities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"],
  },
  {
    name: "WhatsApp Orgánico",
    conversations: 89,
    sales: 31,
    conversionRate: 34.8,
    revenue: 12300000,
    investment: 0,
    roas: 0,
    topCities: ["Medellín", "Bogotá", "Pereira", "Manizales", "Armenia"],
  },
  {
    name: "Meta Ads - Balinería",
    conversations: 134,
    sales: 28,
    conversionRate: 20.9,
    revenue: 8900000,
    investment: 2100000,
    roas: 4.24,
    topCities: ["Cali", "Bogotá", "Bucaramanga", "Cúcuta", "Ibagué"],
  },
];

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 15, 30];
const dayLabel = (d: number) => (d === 1 ? "Ayer (1 día)" : `Hace ${d} días`);

export function CampaignPerformance() {
  // -------- NUEVO: selector de rango --------
  const [days, setDays] = useState<number>(30);

  // Escalado proporcional (base=30 días) de conversaciones/ventas/ingresos/inversión
  const scaledCampaigns = useMemo(() => {
    const factor = Math.max(1, days) / 30;
    return campaigns.map((c) => ({
      ...c,
      conversations: Math.round(c.conversations * factor),
      sales: Math.round(c.sales * factor),
      revenue: Math.round(c.revenue * factor),
      investment: Math.round(c.investment * factor),
    }));
  }, [days]);

  return (
    <Card className="hover:shadow-gold transition-shadow duration-300">
      {/* Estilos para realce/animaciones (solo añadidos) */}
      <style>{`
        .perf-row {
          transition: transform .25s ease, background .25s ease, box-shadow .25s ease;
        }
        .perf-row:hover {
          transform: translateY(-3px);
          background: rgba(245, 158, 11, .06);
          box-shadow: 0 12px 28px rgba(245, 158, 11, .20);
        }
        .pill {
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .perf-row:hover .pill {
          transform: scale(1.06);
          box-shadow: 0 6px 16px rgba(245, 158, 11, .25);
        }
        .num {
          transition: transform .2s ease;
        }
        .perf-row:hover .num {
          transform: scale(1.03);
        }
      `}</style>

      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>Rendimiento de Campañas Publicitarias</CardTitle>

          {/* NUEVO: badge + selector de rango */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
              Últimos {days} día{days === 1 ? "" : "s"}
            </Badge>
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              Rango:
              <select
                className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value, 10))}
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {dayLabel(d)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaña</TableHead>
                <TableHead className="text-center">Conversaciones</TableHead>
                <TableHead className="text-center">Ventas</TableHead>
                <TableHead className="text-center">Conv. %</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Inversión</TableHead>
                <TableHead className="text-center">ROAS</TableHead>
                <TableHead>Top Ciudades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Usamos scaledCampaigns (NO se elimina campaigns) */}
              {scaledCampaigns.map((campaign) => (
                <TableRow key={campaign.name} className="perf-row group">
                  <TableCell className="font-medium">{campaign.name}</TableCell>

                  <TableCell className="text-center num">
                    {campaign.conversations}
                  </TableCell>

                  <TableCell className="text-center font-semibold num">
                    {campaign.sales}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant={campaign.conversionRate > 25 ? "default" : "secondary"}
                      className={`pill ${
                        campaign.conversionRate > 25
                          ? "bg-gold text-primary-foreground border-gold"
                          : ""
                      }`}
                    >
                      {campaign.conversionRate}%
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-semibold num">
                    ${(campaign.revenue / 1000000).toFixed(1)}M
                  </TableCell>

                  <TableCell className="text-right num">
                    {campaign.investment > 0
                      ? `$${(campaign.investment / 1000000).toFixed(1)}M`
                      : "-"}
                  </TableCell>

                  <TableCell className="text-center">
                    {campaign.roas > 0 ? (
                      <Badge
                        variant={campaign.roas > 4 ? "default" : "secondary"}
                        className={`pill ${
                          campaign.roas > 4 ? "bg-gold text-primary-foreground border-gold" : ""
                        }`}
                      >
                        {campaign.roas.toFixed(2)}x
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {campaign.topCities.slice(0, 3).map((city) => (
                        <Badge key={city} variant="outline" className="text-xs">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

