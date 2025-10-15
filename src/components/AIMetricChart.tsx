import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { analyzeWithGemini } from '../lib/gemini';

interface CampaignData {
  name: string;
  spent: number;
  conversations: number;
  sales: number;
  revenue: number;
}

interface MetricCardProps {
  title: string;
  data: CampaignData[];
  metric: 'spent' | 'conversations' | 'sales' | 'revenue' | 'roas' | 'cvr' | 'cpc';
}

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#A78BFA'];

export function AIMetricChart({ title, data, metric }: MetricCardProps) {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  const calculateMetric = (campaign: CampaignData) => {
    switch (metric) {
      case 'spent':
        return campaign.spent;
      case 'conversations':
        return campaign.conversations;
      case 'sales':
        return campaign.sales;
      case 'revenue':
        return campaign.revenue;
      case 'roas':
        return campaign.revenue / (campaign.spent || 1);
      case 'cvr':
        return (campaign.sales / (campaign.conversations || 1)) * 100;
      case 'cpc':
        return campaign.spent / (campaign.conversations || 1);
      default:
        return 0;
    }
  };

  const chartData = data.map(campaign => ({
    name: campaign.name,
    value: calculateMetric(campaign),
    rawData: campaign
  }));

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const getMetricLabel = () => {
    switch (metric) {
      case 'spent': return 'Gasto Total';
      case 'conversations': return 'Conversaciones';
      case 'sales': return 'Ventas';
      case 'revenue': return 'Ingresos';
      case 'roas': return 'ROAS';
      case 'cvr': return 'CVR';
      case 'cpc': return 'CPC';
      default: return title;
    }
  };

  const formatValue = (value: number) => {
    if (metric === 'spent' || metric === 'revenue' || metric === 'cpc') {
      return `$${value.toFixed(2)}`;
    } else if (metric === 'cvr') {
      return `${value.toFixed(1)}%`;
    } else if (metric === 'roas') {
      return `${value.toFixed(2)}x`;
    }
    return value.toFixed(0);
  };

  const analyzeMetric = async () => {
    setIsAnalyzing(true);
    setShowInsight(true);

    const metricName = getMetricLabel();
    const campaignDetails = data.map((c, i) => {
      const value = calculateMetric(c);
      return `${c.name}: ${formatValue(value)}`;
    }).join(', ');

    // Calcular benchmarks
    const avgROAS = data.reduce((sum, c) => sum + (c.revenue / (c.spent || 1)), 0) / data.length;
    const avgCVR = data.reduce((sum, c) => sum + ((c.sales / (c.conversations || 1)) * 100), 0) / data.length;
    const avgCPC = data.reduce((sum, c) => sum + (c.spent / (c.conversations || 1)), 0) / data.length;

    const prompt = `Analiza esta métrica de campañas Meta Ads para Galle 18K (joyería de lujo):

📊 MÉTRICA: ${metricName}
📈 DATOS POR CAMPAÑA: ${campaignDetails}

🎯 CONTEXTO:
- ROAS Promedio: ${avgROAS.toFixed(2)}x
- CVR Promedio: ${avgCVR.toFixed(1)}%
- CPC Promedio: $${avgCPC.toFixed(2)}

Benchmarks industria joyería/lujo:
- ROAS ideal: 4-8x
- CVR ideal: 20-35%
- CPC ideal: $8-$15

Como experto en marketing digital y trafficker profesional, responde:

1. 🔍 ¿Qué campaña(s) están bajo-performando y por qué?
2. 💡 ¿Qué campaña(s) son ganadoras y cómo escalarlas?
3. ⚡ 3 acciones INMEDIATAS (24-72h)
4. 📅 2 ajustes de mediano plazo (1-2 semanas)

Sé específico, accionable y directo. Máximo 200 palabras.`;

    try {
      const insight = await analyzeWithGemini(prompt);
      setAiInsight(insight);
    } catch (error) {
      setAiInsight('❌ Error al analizar. Verifica tu API key en Ajustes IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{getMetricLabel()}</h3>
          <p className="text-sm text-gray-500">{formatValue(totalValue)} total</p>
        </div>
        <button
          onClick={analyzeMetric}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
        </button>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name} (${((entry.value / totalValue) * 100).toFixed(1)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatValue(value)}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insight Panel */}
      {showInsight && (
        <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                Análisis Profesional
                <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                  Expert Trafficker
                </span>
              </h4>
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  Analizando métricas y comparando con benchmarks...
                </div>
              ) : (
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {aiInsight}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {chartData.map((item, index) => {
          const percentage = ((item.value / totalValue) * 100).toFixed(1);
          const isTop = parseFloat(percentage) >= 40;
          const isLow = parseFloat(percentage) < 20;

          return (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">{percentage}%</p>
              </div>
              {isTop && <TrendingUp className="w-4 h-4 text-green-500" />}
              {isLow && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
