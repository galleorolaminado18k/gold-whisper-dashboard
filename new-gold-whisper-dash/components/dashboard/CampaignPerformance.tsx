'use client';

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

interface CampaignData {
  name: string;
  conversations: number;
  sales: number;
  revenue: number;
  investment: number;
  topCities: string[];
}

const campaigns: CampaignData[] = [
  {
    name: "Meta Ads - Joyería Premium",
    conversations: 156,
    sales: 42,
    revenue: 18500000,
    investment: 3200000,
    topCities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"],
  },
  {
    name: "WhatsApp Orgánico",
    conversations: 89,
    sales: 31,
    revenue: 12300000,
    investment: 0,
    topCities: ["Medellín", "Bogotá", "Pereira", "Manizales", "Armenia"],
  },
  {
    name: "Meta Ads - Balinería",
    conversations: 134,
    sales: 28,
    revenue: 8900000,
    investment: 2100000,
    topCities: ["Cali", "Bogotá", "Bucaramanga", "Cúcuta", "Ibagué"],
  },
];

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 15, 30];
const dayLabel = (d: number) => (d === 1 ? "Ayer (1 día)" : `Hace ${d} días`);

export function CampaignPerformance() {
  // -------- NUEVO: selector de rango --------
  const [days, setDays] = useState<number>(30);

  // Escalado y cálculos derivados
  const processedCampaigns = useMemo(() => {
    const factor = Math.max(1, days) / 30;
    return campaigns.map((c) => {
      const conversations = Math.round(c.conversations * factor);
      const sales = Math.round(c.sales * factor);
      const revenue = Math.round(c.revenue * factor);
      const investment = Math.round(c.investment * factor);

      // Cálculos de métricas derivadas
      const costPerConv = conversations > 0 ? investment / conversations : 0;
      const cvr = conversations > 0 ? (sales / conversations) * 100 : 0;
      const roas = investment > 0 ? revenue / investment : 0;

      return {
        ...c,
        conversations,
        sales,
        revenue,
        investment,
        costPerConv,
        cvr,
        roas,
      };
    });
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
                <TableHead className="text-right">Gastado</TableHead>
                <TableHead className="text-center">Conversaciones</TableHead>
                <TableHead className="text-right">$/Conv.</TableHead>
                <TableHead className="text-center">Ventas</TableHead>
                <TableHead className="text-center">CVR</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-center">ROAS</TableHead>
                <TableHead>Top Ciudades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedCampaigns.map((campaign) => (
                <TableRow key={campaign.name} className="perf-row group">
                  <TableCell className="font-medium">{campaign.name}</TableCell>

                  <TableCell className="text-right num">
                    {campaign.investment > 0
                      ? `$${(campaign.investment / 1000000).toFixed(1)}M`
                      : "-"}
                  </TableCell>

                  <TableCell className="text-center num">
                    {campaign.conversations}
                  </TableCell>

                  <TableCell className="text-right num">
                    {campaign.costPerConv > 0
                      ? `$${Math.round(
                          campaign.costPerConv
                        ).toLocaleString("es-CO")}`
                      : "-"}
                  </TableCell>

                  <TableCell className="text-center font-semibold num">
                    {campaign.sales}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant={campaign.cvr > 25 ? "default" : "secondary"}
                      className={`pill ${
                        campaign.cvr > 25
                          ? "bg-gold text-primary-foreground border-gold"
                          : ""
                      }`}
                    >
                      {campaign.cvr.toFixed(1)}%
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-semibold num">
                    ${(campaign.revenue / 1000000).toFixed(1)}M
                  </TableCell>

                  <TableCell className="text-center">
                    {campaign.roas > 0 ? (
                      <Badge
                        variant={campaign.roas > 4 ? "default" : "secondary"}
                        className={`pill ${
                          campaign.roas > 4
                            ? "bg-gold text-primary-foreground border-gold"
                            : ""
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