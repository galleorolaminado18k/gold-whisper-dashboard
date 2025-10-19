import { cn } from "@/v0/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string
  subtitle: string
  trend?: "up" | "down"
  borderColor: string
}

export function MetricsCard({ title, value, subtitle, trend, borderColor }: MetricsCardProps) {
  return (
    <div className={cn("bg-card rounded-xl p-5 border-l-4 shadow-sm hover:shadow-md transition-shadow", borderColor)}>
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <div className="flex items-center gap-2 text-sm">
          {trend === "up" && (
            <span className="flex items-center gap-1 text-emerald-500">
              <TrendingUp className="w-3 h-3" />
            </span>
          )}
          {trend === "down" && (
            <span className="flex items-center gap-1 text-red-500">
              <TrendingDown className="w-3 h-3" />
            </span>
          )}
          <span
            className={cn(
              trend === "up" && "text-emerald-500",
              trend === "down" && "text-red-500",
              !trend && "text-muted-foreground",
            )}
          >
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  )
}
