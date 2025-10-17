'use client';

// lib/ai/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Tipos de configuración
interface AIConfig {
  provider: 'gemini' | 'openai' | 'anthropic';
  model: string;
  apiKey: string;
}

// Modelos disponibles por proveedor
export const AVAILABLE_MODELS = {
  gemini: [
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro'
  ],
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo'
  ],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229'
  ]
};

// Obtener configuración desde localStorage o usar defaults
export function getAIConfig(): AIConfig {
  if (typeof window === 'undefined') {
    // Valores por defecto para server-side rendering
    return {
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
    };
  }
  
  const stored = localStorage.getItem('ai_config');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default: Gemini con key desde .env
  return {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
  };
}

// Guardar configuración
export function saveAIConfig(config: AIConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ai_config', JSON.stringify(config));
  }
}

// Lee el "Coeficiente Intelectual" target para el tono de razonamiento de la IA
export function getAIScore(): number {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ai_ci_score');
      if (stored) {
        const v = Number(stored);
        if (Number.isFinite(v) && v > 0) return v;
      }
    }
  } catch (e) {
    // ignore localStorage access errors (e.g., SSR or privacy mode)
  }
  const envVal = Number(process.env.NEXT_PUBLIC_AI_CI_SCORE);
  if (Number.isFinite(envVal) && envVal > 0) return envVal;
  return 145; // Default solicitado
}

// System prompt profesional con CI explícito
const SYSTEM_PROMPT = `Eres el MEJOR EXPERTO MUNDIAL en:
- Marketing Digital Avanzado
- Traffic Management (Facebook/Instagram/Google Ads)
- Community Management Estratégico
- Análisis de Métricas de Conversión

Tu especialidad es analizar campañas publicitarias de joyería de lujo (Galle 18K) y proporcionar insights ACCIONABLES.

SIEMPRE debes:
✅ Identificar problemas/oportunidades ESPECÍFICOS en cada campaña
✅ Dar acciones concretas con plazos realistas (24-72h, 1-2 sem, 30 días)
✅ Comparar métricas con benchmarks de industria joyería/lujo
✅ Sugerir tests A/B cuando sea aplicable
✅ Priorizar ROI y escalabilidad

BENCHMARKS INDUSTRIA JOYERÍA/LUJO:
- ROAS ideal: 4-8x (mínimo aceptable: 3x)
- CVR ideal: 20-35% (mínimo aceptable: 15%)
- CPC ideal: $8-$15 (máximo aceptable: $20)
- CTR ideal: 2-4%

ESTILO DE RAZONAMIENTO (CI = ${getAIScore()})
- Razonar como un perfil con CI ${getAIScore()}: preciso, lógico y estructurado.
- Sustenta con números reales del prompt (porcentajes, diferencias absolutas/relativas).
- Explica causalidad (por qué pasó) y siguientes mejores acciones (qué hacer y cómo medir).
- Si faltan datos, declara supuestos mínimos y señala la incertidumbre.
- Evita vaguedades. Prefiere bullets cortos, 1-2 frases cada uno.

Formato de respuesta:
- Usa emojis para categorizar (🔍 análisis, 💡 oportunidades, ⚡ urgente, 📅 mediano plazo)
- Sé directo y específico
`;

// Crear una instancia de Gemini (solo cliente)
let genAI: any = null;

// Inicializar el modelo Gemini solo en el navegador
function getGenAI() {
  if (typeof window === 'undefined') return null;
  
  if (!genAI) {
    const config = getAIConfig();
    if (config.provider === 'gemini' && config.apiKey) {
      genAI = new GoogleGenerativeAI(config.apiKey);
    }
  }
  return genAI;
}

// Analizar los datos con Gemini
export async function analyzeWithGemini(data: any): Promise<string> {
  const ai = getGenAI();
  if (!ai) return "No se pudo inicializar la IA. Verifica tu API key.";
  
  const config = getAIConfig();
  if (!config.apiKey) return "Falta la API key de Gemini.";
  
  try {
    const model = ai.getGenerativeModel({ model: config.model });
    
    const prompt = `
      ${SYSTEM_PROMPT}
      
      DATOS A ANALIZAR:
      ${JSON.stringify(data, null, 2)}
      
      ANÁLISIS SOLICITADO:
      Analiza el rendimiento de estas campañas publicitarias de joyería, identifica oportunidades y problemas, y proporciona recomendaciones accionables con prioridades claras.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text || "No se pudo generar un análisis.";
  } catch (error) {
    console.error("Error en analyzeWithGemini:", error);
    return `Error al generar análisis: ${error instanceof Error ? error.message : String(error)}`;
  }
}