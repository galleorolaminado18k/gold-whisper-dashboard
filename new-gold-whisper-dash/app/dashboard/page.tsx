'use client';

import { KPICard } from '@/components/dashboard/KPICard';
import { CampaignPerformance } from '@/components/dashboard/CampaignPerformance';
import { ConversationFunnel } from '@/components/dashboard/ConversationFunnel';
import { DeliveryStats } from '@/components/dashboard/DeliveryStats';
import { PaymentMix } from '@/components/dashboard/PaymentMix';

import { ChartBar, CreditCard, Package, MessageCircle, Truck } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Ventas Totales"
          value="$12.5M"
          icon={ChartBar}
          subtitle="Últimos 30 días"
          trend={{ value: 12.4, isPositive: true }}
        />
        <KPICard
          title="Conversaciones"
          value="1,245"
          icon={MessageCircle}
          trend={{ value: 5.2, isPositive: true }}
        />
        <KPICard
          title="Tasa de Conversión"
          value="18.7%"
          icon={CreditCard}
          trend={{ value: 2.1, isPositive: true }}
        />
        <KPICard
          title="Entregas"
          value="276"
          icon={Truck}
          subtitle="78% entregadas"
          trend={{ value: 3.4, isPositive: false }}
          variant="gold"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CampaignPerformance />
        <ConversationFunnel />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentMix />
        <DeliveryStats />
      </div>
    </div>
  );
}