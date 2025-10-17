'use client';

// lib/crm/chatwoot.ts
// Adaptado para Next.js

// ===== Tipos NORMALIZADOS que usa el resto del app =====
export type CWMessage = {
  id: number | string;
  content: string;
  /** "incoming" = cliente, "outgoing" = asesor/bot */
  message_type?: "incoming" | "outgoing";
  /** epoch seconds */
  created_at: number;
};

export type CWConversation = {
  id: number | string;
  contact: Record<string, unknown> | null;
  contact_name?: string;
  customer_name?: string;
  inbox_id?: number;
  last_activity_at?: number; // epoch seconds
  messages?: CWMessage[]; // opcionalmente embebidos
  labels?: string[];
};

// ===== Config de Chatwoot =====
const API = process.env.NEXT_PUBLIC_BRIDGE_API_URL || "http://localhost:4000";
const CHATWOOT_URL = process.env.NEXT_PUBLIC_CHATWOOT_URL || "http://localhost:3020";
const CHATWOOT_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || "";
const CHATWOOT_ACCOUNT_ID = process.env.NEXT_PUBLIC_CHATWOOT_ACCOUNT_ID || "1";

// Exportar para uso en otros archivos si es necesario
export const CHATWOOT_CONFIG = {
  url: CHATWOOT_URL,
  websiteToken: CHATWOOT_TOKEN,
  accountId: CHATWOOT_ACCOUNT_ID,
  bridgeApiUrl: API,
};

// ===== Utilidades de normalización =====
function toMsgType(v: unknown): "incoming" | "outgoing" | undefined {
  if (v === 0 || v === "0") return "incoming";
  if (v === 1 || v === "1") return "outgoing";
  if (v === "incoming" || v === "outgoing") return v as "incoming" | "outgoing";
  return undefined;
}

function normMessage(m: Record<string, unknown>): CWMessage {
  return {
    id: (m?.id as number | string) ?? 0,
    content: (m?.content as string) ?? "",
    message_type: (toMsgType(m?.message_type) ?? "incoming") as
      | "incoming"
      | "outgoing",
    created_at:
      typeof m?.created_at === "number"
        ? (m.created_at as number)
        : Number(m?.created_at) || Math.floor(Date.now() / 1000),
  };
}

function normConversation(c: Record<string, unknown>): CWConversation {
  const msgsValue = (c as Record<string, unknown>)["messages"];
  const msgsRaw = Array.isArray(msgsValue) ? (msgsValue as unknown[]) : [];

  const inboxVal = (c as Record<string, unknown>)["inbox_id"];
  const lastActVal = (c as Record<string, unknown>)["last_activity_at"];

  const labelsVal = (c as Record<string, unknown>)["labels"] as unknown;
  let labels: string[] | undefined = undefined;
  if (Array.isArray(labelsVal)) {
    const asStrings = labelsVal.filter((x) => typeof x === 'string') as string[];
    if (asStrings.length === labelsVal.length) {
      labels = asStrings;
    } else {
      const fromObjs = (labelsVal as unknown[])
        .map((x) => (x && typeof x === 'object' ? (x as Record<string, unknown>)["title"] : undefined))
        .filter((t) => typeof t === 'string') as string[];
      labels = fromObjs.length ? fromObjs : undefined;
    }
  }
  return {
    id: (c?.id as number | string) ?? 0,
    contact: ((c as Record<string, unknown>)["contact"] as Record<string, unknown>) ?? {},
    inbox_id: typeof inboxVal === "number" ? (inboxVal as number) : undefined,
    last_activity_at:
      typeof lastActVal === "number"
        ? (lastActVal as number)
        : Number(lastActVal) || undefined,
    messages: msgsRaw.map((m) => normMessage(m as Record<string, unknown>)),
    labels,
  };
}

function normConversationsResponse(raw: unknown): CWConversation[] {
  const r1 = Array.isArray(raw) ? (raw as unknown[]) : null;

  const r2Obj = raw as Record<string, unknown> | null;
  const r2 = r2Obj && Array.isArray(r2Obj["payload"])
    ? (r2Obj["payload"] as unknown[])
    : null;

  const r3Obj = r2Obj && r2Obj["data"] as unknown;
  const r3 = r3Obj && Array.isArray(r3Obj)
    ? (r3Obj as unknown[])
    : null;

  const raw2 = r1 || r2 || r3 || [];
  return raw2.map((c) => normConversation(c as Record<string, unknown>));
}

// ===== Métodos públicos =====

/**
 * Obtiene todas las conversaciones
 */
export async function fetchConversations(): Promise<CWConversation[]> {
  try {
    const response = await fetch(`${API}/conversations`);
    const data = await response.json();
    return normConversationsResponse(data);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

/**
 * Obtiene conversaciones con una etiqueta específica
 */
export async function fetchConversationsByLabel(label: string): Promise<CWConversation[]> {
  try {
    const response = await fetch(`${API}/conversations?label=${encodeURIComponent(label)}`);
    const data = await response.json();
    return normConversationsResponse(data);
  } catch (error) {
    console.error(`Error fetching conversations with label ${label}:`, error);
    return [];
  }
}

/**
 * Obtiene mensajes de una conversación específica
 */
export async function fetchMessages(conversationId: number | string): Promise<CWMessage[]> {
  try {
    const response = await fetch(`${API}/conversations/${conversationId}/messages`);
    const data = await response.json();
    
    const messages = Array.isArray(data) 
      ? data
      : Array.isArray(data.payload) 
        ? data.payload 
        : Array.isArray(data.data) 
          ? data.data
          : [];
    
    return messages.map((m) => normMessage(m as Record<string, unknown>));
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    return [];
  }
}

/**
 * Envía un mensaje a una conversación
 */
export async function sendMessage(conversationId: number | string, content: string): Promise<boolean> {
  try {
    const response = await fetch(`${API}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Error sending message to conversation ${conversationId}:`, error);
    return false;
  }
}

// Funciones adicionales que se pueden implementar según sea necesario