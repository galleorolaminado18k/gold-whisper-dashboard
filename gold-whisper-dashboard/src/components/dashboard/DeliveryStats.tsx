import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, RotateCcw, CheckCircle2 } from "lucide-react";

interface DeliveryStatus {
  label: string;
  count: number;
  percentage: number;
  icon: typeof Package;
  variant: "success" | "warning" | "info" | "danger";
  /** GIF opcional (ponlo en public/gifs/...) */
  gifSrc?: string;
}

const deliveryStats: DeliveryStatus[] = [
  { label: "Entregado", count: 187, percentage: 78, icon: CheckCircle2, variant: "success", gifSrc: "/gifs/check.gif" },
  { label: "En tránsito", count: 42, percentage: 17.5, icon: Truck, variant: "info", gifSrc: "/gifs/truck.gif" },
  { label: "Devolución en tránsito", count: 8, percentage: 3.3, icon: RotateCcw, variant: "warning", gifSrc: "/gifs/return.gif" },
  { label: "Devolución completada", count: 3, percentage: 1.2, icon: Package, variant: "danger", gifSrc: "/gifs/box.gif" },
];

const variantColors = {
  success: "text-green-600 bg-green-50",
  warning: "text-yellow-600 bg-yellow-50",
  info: "text-blue-600 bg-blue-50",
  danger: "text-red-600 bg-red-50",
};

export function DeliveryStats() {
  // Controlamos si el GIF cargó bien; si falla, usamos el ícono SVG
  const [gifOk, setGifOk] = useState<Record<string, boolean>>({});

  const totalDeliveries = deliveryStats.reduce((sum, stat) => sum + stat.count, 0);
  const successRate = ((deliveryStats[0].count / totalDeliveries) * 100).toFixed(1);
  const rtoRate = (((deliveryStats[2].count + deliveryStats[3].count) / totalDeliveries) * 100).toFixed(1);

  return (
    <Card className="hover:shadow-gold transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Estado de Entregas</CardTitle>
          <div className="flex gap-2">
            <Badge variant="default" className="bg-green-600">Éxito: {successRate}%</Badge>
            <Badge variant="secondary" className={Number(rtoRate) > 5 ? "bg-red-100 text-red-700" : ""}>
              RTO: {rtoRate}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {deliveryStats.map((stat) => {
            const Icon = stat.icon;
            const showGif = !!stat.gifSrc && gifOk[stat.label] !== false;

            return (
              <div key={stat.label} className="group">
                {/* Encabezado con icono + título + cifras */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Contenedor fijo para icono/GIF */}
                    <div
                      className={`relative h-7 w-7 rounded-md ${variantColors[stat.variant]} grid place-items-center 
                                  overflow-hidden transition-transform duration-300
                                  group-hover:scale-[1.35] group-hover:-translate-y-0.5`}
                    >
                      {/* Fallback SVG (se oculta si el GIF carga bien) */}
                      <Icon
                        className={`h-4 w-4 z-10 transition-opacity duration-200
                                   ${showGif ? "opacity-0" : "opacity-100"}`}
                      />
                      {/* GIF (solo si carga OK) */}
                      {stat.gifSrc && (
                        <img
                          src={stat.gifSrc}
                          alt={stat.label}
                          className={`absolute inset-0 h-full w-full object-contain pointer-events-none
                                      transition-opacity duration-200
                                      ${showGif ? "opacity-100" : "opacity-0"}`}
                          onLoad={() => setGifOk((s) => ({ ...s, [stat.label]: true }))}
                          onError={() => setGifOk((s) => ({ ...s, [stat.label]: false }))}
                        />
                      )}
                    </div>

                    <span
                      className="text-sm font-medium text-foreground transition-all duration-300 
                                 group-hover:font-semibold group-hover:-translate-y-0.5 group-hover:tracking-tight"
                    >
                      {stat.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground transition-transform duration-300 group-hover:scale-110">
                      {stat.count}
                    </span>
                    <span className="text-xs text-muted-foreground">({stat.percentage}%)</span>
                  </div>
                </div>

                {/* Pista gris + relleno dorado con “lift” notorio en hover */}
                <div
                  className="relative mt-2 h-3 rounded-full bg-muted overflow-hidden shadow-inner
                             transition-[height,box-shadow,transform] duration-300
                             group-hover:h-5 group-hover:shadow-lg group-hover:shadow-amber-200/40 group-hover:-translate-y-0.5"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={stat.percentage}
                >
                  <div
                    className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-out"
                    style={{ width: `${stat.percentage}%` }}
                  >
                    <div className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200
                                    group-hover:from-amber-500 group-hover:via-amber-400 group-hover:to-amber-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {Number(rtoRate) > 5 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">⚠️ Alerta: Tasa de devoluciones superior al 5%</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
