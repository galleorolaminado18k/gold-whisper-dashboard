// src/lib/claude.ts
// Claude AI service for enhanced conversation classification and analysis

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Get configuration from environment variables
export function getClaudeConfig(): ClaudeConfig {
  return {
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
    model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    enabled: import.meta.env.VITE_CLAUDE_ENABLED === 'true',
  };
}

// Check if Claude is properly configured
export function isClaudeConfigured(): boolean {
  const config = getClaudeConfig();
  return config.enabled && config.apiKey.length > 0;
}

// Validate API key by making a simple test request
export async function validateClaudeApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'test',
          },
        ],
      }),
    });

    if (response.ok) {
      return { valid: true };
    } else {
      const error = await response.json();
      return { 
        valid: false, 
        error: error.error?.message || 'Invalid API key' 
      };
    }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

// Call Claude API for conversation classification
export async function classifyConversationWithClaude(
  messages: string[],
  apiKey?: string
): Promise<string> {
  const config = getClaudeConfig();
  const key = apiKey || config.apiKey;

  if (!key) {
    throw new Error('Claude API key not configured');
  }

  const conversationHistory = messages.join('\n');
  
  const prompt = `Analiza esta conversación de WhatsApp entre un cliente y un representante de ventas de joyería (Galle 18K). 
Clasifica la conversación en una de estas etapas:

1. "por_contestar" - El cliente envió un mensaje y está esperando respuesta
2. "pendiente_datos" - Se están recopilando datos del cliente (nombre, dirección, teléfono, etc.)
3. "por_confirmar" - Se envió un resumen del pedido y se espera confirmación del cliente
4. "pendiente_guia" - El pago fue confirmado y se está generando la guía de envío
5. "pedido_completo" - La guía de envío fue enviada y el pedido está completo

Conversación:
${conversationHistory}

Responde SOLO con el nombre de la etapa (sin comillas ni explicaciones adicionales).`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API request failed');
    }

    const data: ClaudeResponse = await response.json();
    const result = data.content[0]?.text?.trim() || 'por_contestar';
    
    // Validate the response is one of our expected stages
    const validStages = ['por_contestar', 'pendiente_datos', 'por_confirmar', 'pendiente_guia', 'pedido_completo'];
    if (validStages.includes(result)) {
      return result;
    }
    
    // Fallback to por_contestar if response is invalid
    console.warn('Claude returned invalid stage:', result);
    return 'por_contestar';
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

// Call Claude API for general conversation analysis
export async function analyzeConversationWithClaude(
  messages: string[],
  analysisType: 'sentiment' | 'category' | 'summary',
  apiKey?: string
): Promise<string> {
  const config = getClaudeConfig();
  const key = apiKey || config.apiKey;

  if (!key) {
    throw new Error('Claude API key not configured');
  }

  const conversationHistory = messages.join('\n');
  
  let prompt = '';
  switch (analysisType) {
    case 'sentiment':
      prompt = `Analiza el sentimiento de esta conversación de WhatsApp. Responde con: "positivo", "neutral" o "negativo".\n\nConversación:\n${conversationHistory}`;
      break;
    case 'category':
      prompt = `Esta es una conversación de una joyería. Clasifica el producto de interés en: "balineria" o "joyeria". Si no está claro, responde "general".\n\nConversación:\n${conversationHistory}`;
      break;
    case 'summary':
      prompt = `Resume esta conversación de WhatsApp en 2-3 oraciones cortas.\n\nConversación:\n${conversationHistory}`;
      break;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API request failed');
    }

    const data: ClaudeResponse = await response.json();
    return data.content[0]?.text?.trim() || '';
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

export default {
  getClaudeConfig,
  isClaudeConfigured,
  validateClaudeApiKey,
  classifyConversationWithClaude,
  analyzeConversationWithClaude,
};
