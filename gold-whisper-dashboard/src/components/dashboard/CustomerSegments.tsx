import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, AlertCircle, Award } from "lucide-react";

interface Segment {
  name: string;
  count: number;
  badge?: string;
  icon: "users" | "fire" | "alert" | "vip";
  description: string;
}

const segments: Segment[] = [
  { name: "Mayoristas Activos", count: 42, icon: "users", description: "Con compras en últimos 3 meses" },
  { name: "Mayoristas Inactivos", count: 18, icon: "alert", description: "Sin compras > 3 meses - Reactivar" },
  { name: "Clientes VIP", count: 12, badge: "VIP", icon: "vip", description: "+$2M en últimos 6 meses" },
  { name: "Cross-sell Balinería", count: 28, badge: "🔥", icon: "fire", description: "Clientes con +$500K - Sugerir joyería" },
  { name: "Cross-sell Joyería", count: 15, badge: "🔥", icon: "fire", description: "Recurrentes joyería - Sugerir balinería" },
  { name: "Riesgo de Abandono", count: 23, icon: "alert", description: "Inactividad detectada - Campaña urgente" },
];

const iconMap = {
  users: Users,
  fire: TrendingUp, // se usa SOLO para el chip pequeño (flecha)
  alert: AlertCircle,
  vip: Award,
};

export function CustomerSegments() {
  const styles = `
    @keyframes flameWiggle {
      0%   { transform: translateY(0) scale(1) rotate(0deg); filter: drop-shadow(0 0 0 rgba(255,170,0,0)); }
      50%  { transform: translateY(-1px) scale(1.08) rotate(-4deg); filter: drop-shadow(0 0 8px rgba(255,170,0,.55)); }
      100% { transform: translateY(0) scale(1) rotate(2deg); }
    }
    .flame-wiggle { animation: flameWiggle 1.1s ease-in-out infinite; transform-origin: bottom center; }
  `;

  return (
    <Card className="hover:shadow-gold transition-shadow duration-300">
      <style>{styles}</style>

      <CardHeader>
        <CardTitle>Segmentación Inteligente de Clientes</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((segment) => {
            const SmallIcon = iconMap[segment.icon];
            const isFire = segment.icon === "fire";

            return (
              <div
                key={segment.name}
                tabIndex={0}
                className="
                  group p-4 rounded-lg border border-border bg-card
                  transition-colors duration-200 hover:border-gold/50 hover:border-gold
                  hover:bg-gradient-gold
                  transform-gpu transition-transform ease-out
                  hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-200/40
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60
                "
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* ICONO PRINCIPAL (GRANDE) */}
                    {isFire ? (
                      // 🔥 Llama GRANDE animada
                      <div
                        className="
                          h-10 w-10 rounded-xl
                          bg-gradient-to-b from-amber-300 to-amber-500/90
                          flex items-center justify-center
                          ring-1 ring-white/30 shadow-inner
                          transition-transform duration-200
                          group-hover:scale-110 group-hover:-rotate-3
                        "
                      >
                        <span className="flame-wiggle text-2xl leading-none">🔥</span>
                      </div>
                    ) : (
                      // Otros iconos también GRANDES (40×40)
                      <div
                        className={`
                          h-10 w-10 rounded-xl flex items-center justify-center
                          transition-all duration-200 ring-0
                          ${
                            segment.icon === "vip"
                              ? "bg-gradient-gold"
                              : segment.icon === "alert"
                              ? "bg-red-100"
                              : "bg-zinc-100"
                          }
                          group-hover:bg-white/20 group-hover:ring-1 group-hover:ring-white/30
                          group-hover:scale-110 group-hover:-rotate-3
                        `}
                      >
                        {/* color del icono */}
                        {segment.icon === "vip" ? (
                          <Award className="h-5 w-5 text-primary-foreground" />
                        ) : segment.icon === "alert" ? (
                          <AlertCircle className="h-5 w-5 text-red-600 group-hover:text-primary-foreground" />
                        ) : (
                          <Users className="h-5 w-5 text-zinc-700 group-hover:text-primary-foreground" />
                        )}
                      </div>
                    )}

                    {/* ICONO SECUNDARIO (PEQUEÑO) SOLO EN FIRE (flecha) */}
                    {isFire && (
                      <div
                        className="
                          px-2 py-1 rounded-lg bg-zinc-100 text-amber-700
                          border border-amber-200
                          transition-colors duration-200
                          group-hover:bg-white/20 group-hover:text-primary-foreground group-hover:border-white/30
                        "
                        title="Tendencia / Upsell"
                      >
                        <SmallIcon className="h-3.5 w-3.5" />
                      </div>
                    )}

                    {/* BADGE (VIP u otros). Si es fire con '🔥' lo omitimos para no duplicar */}
                    {segment.badge && !isFire && (
                      <Badge
                        variant={segment.icon === "vip" ? "default" : "secondary"}
                        className={`
                          transition-colors duration-200
                          ${segment.icon === "vip" ? "bg-gold text-primary-foreground border-gold" : ""}
                          group-hover:bg-white/20 group-hover:text-primary-foreground
                          group-hover:border-white/30
                        `}
                      >
                        {segment.badge}
                      </Badge>
                    )}
                  </div>

                  <span className="text-2xl font-bold text-foreground group-hover:text-primary-foreground">
                    {segment.count}
                  </span>
                </div>

                <h4 className="font-semibold text-sm mb-1 text-foreground group-hover:text-primary-foreground">
                  {segment.name}
                </h4>

                {/* Subtítulo: sin 3D; ahora realce limpio (tamaño/weight/contraste) */}
                <p
                  className="
                    text-sm text-muted-foreground
                    transition-all duration-200
                    group-hover:text-primary-foreground/95
                    group-hover:font-semibold
                    group-hover:scale-[1.02]
                  "
                >
                  {segment.description}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
