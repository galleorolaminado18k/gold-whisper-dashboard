import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, DollarSign } from "lucide-react";

interface PaymentMethod {
  method: string;
  confirmed: number;
  pending: number;
  total: number;
  percentage: number;
  icon: typeof CreditCard;
}

const paymentMethods: PaymentMethod[] = [
  {
    method: "Contraentrega",
    confirmed: 89,
    pending: 23,
    total: 112,
    percentage: 54,
    icon: Banknote,
  },
  {
    method: "Transferencia",
    confirmed: 67,
    pending: 12,
    total: 79,
    percentage: 38,
    icon: CreditCard,
  },
  {
    method: "Efectivo",
    confirmed: 14,
    pending: 2,
    total: 16,
    percentage: 8,
    icon: DollarSign,
  },
];

export function PaymentMix() {
  const totalConfirmed = paymentMethods.reduce((sum, pm) => sum + pm.confirmed, 0);
  const totalPending = paymentMethods.reduce((sum, pm) => sum + pm.pending, 0);
  const confirmationRate = ((totalConfirmed / (totalConfirmed + totalPending)) * 100).toFixed(1);

  return (
    <Card className="hover:shadow-gold transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mix de Métodos de Pago</CardTitle>
          <Badge variant="default" className="bg-gold text-primary-foreground">
            Confirmación: {confirmationRate}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.map((pm) => {
            const Icon = pm.icon;
            return (
              <div
                key={pm.method}
                tabIndex={0}
                className="
                  group p-4 rounded-lg border border-border bg-white cursor-default
                  transition-colors duration-200
                  hover:bg-gradient-gold hover:border-gold
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60
                  transform-gpu transition-transform ease-out
                  hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-200/40
                "
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Icono: neutro en blanco, blanco con realce en dorado */}
                    <div
                      className="
                        p-2 rounded-lg bg-zinc-100 text-zinc-700
                        transition-all duration-200
                        group-hover:bg-white/20 group-hover:text-primary-foreground
                        group-hover:ring-1 group-hover:ring-white/30
                        group-hover:scale-105
                      "
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary-foreground">
                        {pm.method}
                      </p>
                      <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80">
                        {pm.percentage}% del total
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground group-hover:text-primary-foreground">
                      {pm.total}
                    </p>
                    <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80">
                      pedidos
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-1 group-hover:text-primary-foreground/80">
                      Confirmados
                    </p>
                    <p className="font-semibold text-green-600">{pm.confirmed}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-1 group-hover:text-primary-foreground/80">
                      Pendientes
                    </p>
                    <p className="font-semibold text-yellow-600">{pm.pending}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-1 group-hover:text-primary-foreground/80">
                      Tasa conf.
                    </p>
                    <p className="font-semibold text-foreground group-hover:text-primary-foreground">
                      {((pm.confirmed / pm.total) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
