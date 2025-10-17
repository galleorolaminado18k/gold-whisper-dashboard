'use client';

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "gold";
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: KPICardProps) {
  return (
    <Card
      className={cn(
        // base
        "metric-card group overflow-hidden border bg-card transition-all duration-300",
        // hover -> dorado + lift
        "hover:bg-gradient-gold hover:border-gold hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-200/40",
        // estado inicial dorado (por si quieres usar variant='gold' en alguna)
        variant === "gold" && "bg-gradient-gold border-gold"
      )}
    >
      {/* Animaciones locales (no tocan Tailwind global) */}
      <style>{`
        @keyframes kpiWiggle {
          0%   { transform: translateY(0) scale(1) rotate(0deg); }
          50%  { transform: translateY(-1px) scale(1.08) rotate(-5deg); }
          100% { transform: translateY(0) scale(1) rotate(2deg); }
        }
        /* Icono tipo GIF: pausado y corre en hover */
        .metric-card .gif-anim { 
          animation: kpiWiggle 1.1s ease-in-out infinite; 
          animation-play-state: paused; 
        }
        .metric-card:hover .gif-anim { animation-play-state: running; }

        /* Realce del valor numérico */
        .metric-card .kpi-value { 
          transition: transform .22s ease, text-shadow .22s ease, color .18s ease;
        }
        .metric-card:hover .kpi-value { 
          transform: translateY(-1px) scale(1.04); 
          text-shadow: 0 4px 14px rgba(245, 158, 11, .45);
        }
      `}</style>

      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p
              className={cn(
                "text-sm font-medium mb-1 transition-colors",
                variant === "gold" ? "text-primary-foreground" : "text-muted-foreground",
                "group-hover:text-primary-foreground"
              )}
            >
              {title}
            </p>

            <p
              className={cn(
                "kpi-value text-3xl font-bold mb-1 transition-colors",
                variant === "gold" ? "text-primary-foreground" : "text-foreground",
                "group-hover:text-primary-foreground"
              )}
            >
              {value}
            </p>

            {subtitle && (
              <p
                className={cn(
                  "text-sm transition-colors",
                  variant === "gold" ? "text-primary-foreground/80" : "text-muted-foreground",
                  "group-hover:text-primary-foreground/85"
                )}
              >
                {subtitle}
              </p>
            )}

            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600",
                    "group-hover:drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span
                  className={cn(
                    "text-xs transition-colors",
                    variant === "gold" ? "text-primary-foreground/70" : "text-muted-foreground",
                    "group-hover:text-primary-foreground/70"
                  )}
                >
                  vs anterior
                </span>
              </div>
            )}
          </div>

          {/* Burbuja del icono (con animación tipo GIF en hover) */}
          <div
            className={cn(
              "p-3 rounded-lg transition-all duration-200",
              variant === "gold" ? "bg-white/20" : "bg-muted",
              "group-hover:bg-white/20 group-hover:ring-1 group-hover:ring-white/30 group-hover:scale-110 group-hover:-rotate-3"
            )}
          >
            <Icon
              className={cn(
                "gif-anim h-6 w-6 transition-colors",
                variant === "gold" ? "text-primary-foreground" : "text-primary",
                "group-hover:text-primary-foreground"
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}