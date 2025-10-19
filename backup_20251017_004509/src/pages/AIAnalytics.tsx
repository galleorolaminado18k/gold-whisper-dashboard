import { useState, useEffect } from 'react';
import { AIMetricChart } from '../components/AIMetricChart';
import { AISettings } from '../components/AISettings';
import { Brain, TrendingUp, DollarSign, MessageCircle, ShoppingCart, BarChart3 } from 'lucide-react';

interface CampaignData {
  name: string;
  spent: number;
  conversations: number;
  sales: number;
  revenue: number;
}

export default function AIAnalytics() {
  // Datos de ejemplo (reemplazar con datos reales de tu API)
  const [campaigns, setCampaigns] = useState<CampaignData[]>([
    {
      name: 'Campaña Premium',
      spent: 1500,
      conversations: 85,
      sales: 22,
      revenue: 8800
    },
    {
      name: 'Campaña Engagement',
      spent: 980,
      conversations: 120,
      sales: 18,
      revenue: 5400
    },
    {
      name: 'Campaña VIP',
      spent: 2200,
      conversations: 65,
      sales: 28,
      revenue: 14000
    },
    {
      name: 'Campaña Classic',
      spent: 750,
      conversations: 95,
      sales: 15,
      revenue: 4200
    }
  ]);

  // Calcular KPIs globales
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalConversations = campaigns.reduce((sum, c) => sum + c.conversations, 0);
  const totalSales = campaigns.reduce((sum, c) => sum + c.sales, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const globalROAS = totalRevenue / totalSpent;
  const globalCVR = (totalSales / totalConversations) * 100;
  const globalCPC = totalSpent / totalConversations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Análisis IA - Galle 18K
            </h1>
            <p className="text-gray-600">
              Dashboard profesional con insights de marketing digital y traffic management
            </p>
          </div>
        </div>

        {/* KPIs Globales */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-600">Gastado</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-600">Conversaciones</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalConversations}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-600">Ventas</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <p className="text-xs text-gray-600">ROAS</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{globalROAS.toFixed(2)}x</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-gray-600">CVR</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{globalCVR.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-red-600" />
              <p className="text-xs text-gray-600">CPC</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">${globalCPC.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Análisis con IA - Grid de Gráficos */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Análisis Detallado por Métrica
          </h2>
          <p className="text-sm text-gray-600">
            Haz clic en "Analizar con IA" para obtener insights profesionales como trafficker experto
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gasto */}
          <AIMetricChart
            title="Inversión Publicitaria"
            data={campaigns}
            metric="spent"
          />

          {/* Conversaciones */}
          <AIMetricChart
            title="Conversaciones Generadas"
            data={campaigns}
            metric="conversations"
          />

          {/* Ventas */}
          <AIMetricChart
            title="Ventas Cerradas"
            data={campaigns}
            metric="sales"
          />

          {/* Ingresos */}
          <AIMetricChart
            title="Ingresos Generados"
            data={campaigns}
            metric="revenue"
          />

          {/* ROAS */}
          <AIMetricChart
            title="Retorno de Inversión (ROAS)"
            data={campaigns}
            metric="roas"
          />

          {/* CVR */}
          <AIMetricChart
            title="Tasa de Conversión (CVR)"
            data={campaigns}
            metric="cvr"
          />
        </div>

        {/* Info Footer */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                🚀 Análisis Profesional con IA Generativa
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Cada gráfico puede ser analizado por un experto en <strong>marketing digital</strong>, 
                <strong> traffic management</strong> y <strong>community management</strong> potenciado por IA.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <div>
                    <p className="font-medium text-gray-900">Identificación de problemas</p>
                    <p className="text-gray-600">Detecta campañas bajo-performando</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <div>
                    <p className="font-medium text-gray-900">Recomendaciones accionables</p>
                    <p className="text-gray-600">Acciones con plazos específicos</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <div>
                    <p className="font-medium text-gray-900">Comparación con benchmarks</p>
                    <p className="text-gray-600">Industria joyería/lujo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Settings Panel (fixed bottom-right) */}
      <AISettings />
    </div>
  );
}
