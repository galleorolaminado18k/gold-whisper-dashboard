'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";

interface FunnelStage {
  label: string;
  count: number;
  percentage: number;
}

/** Baseline: tus métricas originales para 30 días */
const BASE_STAGES: FunnelStage[] = [
  { label: "Total conversaciones", count: 245, percentage: 100 },
  { label: "Mensajes recibidos", count: 198, percentage: 81 },
  { label: "Por contestar", count: 47, percentage: 19 },
  { label: "Pendiente enviar datos", count: 125, percentage: 51 },
  { label: "Por confirmar pedido", count: 89, percentage: 36 },
  { label: "Pendiente enviar guía", count: 67, percentage: 27 },
  { label: "Pedido completo", count: 54, percentage: 22 },
];

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 15, 30];

function dayLabel(d: number) {
  if (d === 1) return "Ayer (1 día)";
  return `Hace ${d} días`;
}

export function ConversationFunnel() {
  // Nuevo: selector de rango de días
  const [days, setDays] = useState<number>(30);

  // Recalcula los "count" de forma proporcional al rango seleccionado
  const stages = useMemo(() => {
    const factor = Math.max(1, days) / 30; // 30 días = baseline
    return BASE_STAGES.map((s) => ({
      ...s,
      count: Math.round(s.count * factor),
      // Los porcentajes del embudo se mantienen (son proporciones)
      percentage: s.percentage,
    }));
  }, [days]);

  return (
    <Card className="hover:shadow-gold transition-shadow duration-300">
      {/* —— Estilos: realce al pasar el mouse (crece barra y resalta título/número) —— */}
      <style>{`
        .funnel-row {
          --bar-h: 24px;
          --bar-shadow: 0 1px 0 rgba(0,0,0,.03);
          transition: transform .25s ease;
        }
        .funnel-row:hover { transform: translateY(-1px); }

        .funnel-row .bar-container {
          height: var(--bar-h);
          transition: height .25s ease, box-shadow .25s ease, background .25s ease;
          box-shadow: var(--bar-shadow);
          border-radius: .75rem;
        }
        .funnel-row .bar-fill {
          transition: transform .25s ease, background .25s ease;
          will-change: transform;
        }
        .funnel-row:hover .bar-container {
          --bar-h: 40px;
          box-shadow:
            0 10px 24px rgba(245, 158, 11, .25),
            inset 0 0 0 1px rgba(245, 158, 11, .25);
        }
        .funnel-row:hover .bar-fill {
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 55%, #fde68a 100%);
        }
        .funnel-row .row-title {
          transition: font-size .25s ease, color .25s ease, font-weight .25s ease;
        }
        .funnel-row:hover .row-title {
          font-weight: 700;
          font-size: 1rem;
          color: #111827;
        }
        .funnel-row .row-value {
          transition: transform .25s ease, color .25s ease, font-weight .25s ease;
        }
        .funnel-row:hover .row-value {
          font-weight: 800;
          transform: scale(1.08);
          color: #92400e;
        }
        .funnel-row:hover .bar-perc { font-weight: 700; }
      `}</style>

      <CardHeader>
        {/* Encabezado + selector de días */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <span>Embudo de Conversaciones</span>
            <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
              Últimos {days} día{days === 1 ? "" : "s"}
            </Badge>
          </CardTitle>

          {/* Select nativo (simple y sin dependencias) */}
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
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.label} className="funnel-row">
              <div className="flex items-center justify-between mb-2">
                <span className="row-title text-sm font-medium text-foreground">
                  {stage.label}
                </span>
                <div className="row-value flex items-center gap-2 text-foreground">
                  <span className="text-sm font-semibold">{stage.count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({stage.percentage}%)
                  </span>
                </div>
              </div>

              {/* Barra que crece en HOVER (sin 3D) */}
              <div className="bar-container bg-muted rounded-lg overflow-hidden">
                <div
                  className="bar-fill h-full bg-gradient-gold flex items-center px-3"
                  style={{ width: `${stage.percentage}%` }}
                >
                  {stage.percentage > 15 && (
                    <span className="bar-perc text-xs font-semibold text-primary-foreground">
                      {stage.percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}