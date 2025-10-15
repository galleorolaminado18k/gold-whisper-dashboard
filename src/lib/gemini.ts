// src/lib/gemini.ts
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
  const stored = localStorage.getItem('ai_config');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default: Gemini con key desde .env
  return {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
  };
}

// Guardar configuración
export function saveAIConfig(config: AIConfig) {
  localStorage.setItem('ai_config', JSON.stringify(config));
}

// System prompt profesional
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

Formato de respuesta:
- Usa emojis para categorizar (🔍 análisis, 💡 oportunidades, ⚡ urgente, 📅 mediano plazo)
- Sé directo y específico
- Máximo 200 palabras por análisis
`;

// Función principal de análisis
export async function analyzeWithGemini(prompt: string): Promise<string> {
  const config = getAIConfig();
  
  if (!config.apiKey) {
    throw new Error('API key no configurada. Por favor, configura tu API key en el panel de ajustes.');
  }

  try {
    switch (config.provider) {
      case 'gemini':
        return await analyzeWithGeminiAPI(prompt, config);
      
      case 'openai':
        return await analyzeWithOpenAI(prompt, config);
      
      case 'anthropic':
        return await analyzeWithAnthropic(prompt, config);
      
      default:
        throw new Error(`Proveedor no soportado: ${config.provider}`);
    }
  } catch (error: any) {
    console.error('Error en análisis IA:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

// Implementación Gemini
async function analyzeWithGeminiAPI(prompt: string, config: AIConfig): Promise<string> {
  const genAI = new GoogleGenerativeAI(config.apiKey);
  const model = genAI.getGenerativeModel({ model: config.model });
  
  const result = await model.generateContent([
    SYSTEM_PROMPT,
    prompt
  ]);
  
  return result.response.text();
}

// Implementación OpenAI
async function analyzeWithOpenAI(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error en OpenAI API');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Implementación Anthropic
async function analyzeWithAnthropic(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `${SYSTEM_PROMPT}\n\n${prompt}`
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error en Anthropic API');
  }

  const data = await response.json();
  return data.content[0].text;
}
