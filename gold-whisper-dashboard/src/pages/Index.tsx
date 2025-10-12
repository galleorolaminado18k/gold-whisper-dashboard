import SmartSegmentationBanner from "@/components/SmartSegmentationBanner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { ConversationFunnel } from "@/components/dashboard/ConversationFunnel";
import { CampaignPerformance } from "@/components/dashboard/CampaignPerformance";
import { DeliveryStats } from "@/components/dashboard/DeliveryStats";
import { PaymentMix } from "@/components/dashboard/PaymentMix";
import { CustomerSegments } from "@/components/dashboard/CustomerSegments";
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  ShoppingCart,
  Briefcase,
  Calendar,
} from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="p-6 animate-fade-in">
        {/* Header con línea */}
        <div className="relative border-b border-border pb-4 max-w-[1200px] mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Inteligente Galle
          </h1>
          <p className="text-muted-foreground">
            Joyería Oro Laminado 18K & Balinería Premium
          </p>
        </div>

        {/* Banner inmediatamente debajo de la línea (no tapa texto) */}
        <div className="max-w-[1200px] mx-auto -mt-px">
          <SmartSegmentationBanner />
        </div>

        {/* KPIs fila 1 */}
        <div className="max-w-[1200px] mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Ventas Mensuales"
            value="$42.5M"
            subtitle="Últimos 30 días"
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
          />
          <KPICard
            title="Margen Promedio"
            value="38%"
            subtitle="$16.2M de utilidad"
            icon={TrendingUp}
            trend={{ value: 3.2, isPositive: true }}
          />
          <KPICard
            title="Leads Cualificados"
            value="245"
            subtitle="89 en seguimiento activo"
            icon={Users}
            trend={{ value: 8.7, isPositive: true }}
          />
          <KPICard
            title="Tasa de Conversión"
            value="22%"
            subtitle="Lead → Venta"
            icon={Target}
            trend={{ value: -2.1, isPositive: false }}
          />
        </div>

        {/* KPIs fila 2 */}
        <div className="max-w-[1200px] mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Ticket Promedio" value="$789K" subtitle="Por pedido completo" icon={ShoppingCart} />
          <KPICard title="Cartera Activa" value="$18.9M" subtitle="67 ventas en proceso" icon={Briefcase} />
          <KPICard title="YTD Crecimiento" value="+34%" subtitle="vs año anterior" icon={Calendar} trend={{ value: 34, isPositive: true }} />
          <KPICard title="Clientes VIP" value="12" subtitle="+$2M en 6 meses" icon={Users} />
        </div>

        {/* Embudo */}
        <div className="max-w-[1200px] mx-auto mt-4">
          <ConversationFunnel />
        </div>

        {/* Rendimiento de Campañas */}
        <div className="max-w-[1200px] mx-auto mt-4">
          <CampaignPerformance />
        </div>

        {/* Entregas / Pagos */}
        <div className="max-w-[1200px] mx-auto mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeliveryStats />
          <PaymentMix />
        </div>

        {/* Segmentación de Clientes */}
        <div className="max-w-[1200px] mx-auto mt-4">
          <CustomerSegments />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
