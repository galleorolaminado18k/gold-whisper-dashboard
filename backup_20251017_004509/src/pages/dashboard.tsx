import CampaignPerformance from "@/components/dashboard/CampaignPerformance";
import ConversationFunnel from "@/components/dashboard/ConversationFunnel";
import CustomerSegments from "@/components/dashboard/CustomerSegments";
import DeliveryStats from "@/components/dashboard/DeliveryStats";
import KPICard from "@/components/dashboard/KPICard";
import PaymentMix from "@/components/dashboard/PaymentMix";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold" style={{ color: '#d5c68c' }}>Dashboard Inteligente Galle</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard title="Ventas Totales" value="$12,345" />
        <KPICard title="Conversaciones" value="1,234" />
        <KPICard title="Tasa de Conversión" value="12.34%" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <CampaignPerformance />
        </div>
        <div className="lg:col-span-2">
          <ConversationFunnel />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CustomerSegments />
        <DeliveryStats />
        <PaymentMix />
      </div>
    </div>
  )
}
