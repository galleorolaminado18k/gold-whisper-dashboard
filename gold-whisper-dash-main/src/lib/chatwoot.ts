// src/lib/chatwoot.ts

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
};

// ===== Config del bridge local =====
const API = import.meta.env.VITE_BRIDGE_API_URL || "http://localhost:4000";
const CHATWOOT_URL = import.meta.env.VITE_CHATWOOT_URL || "http://localhost:3020";
const CHATWOOT_TOKEN = import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN || "";
const CHATWOOT_ACCOUNT_ID = import.meta.env.VITE_CHATWOOT_ACCOUNT_ID || "1";

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

  return {
    id: (c?.id as number | string) ?? 0,
    contact: ((c as Record<string, unknown>)["contact"] as Record<string, unknown>) ?? {},
    inbox_id: typeof inboxVal === "number" ? (inboxVal as number) : undefined,
    last_activity_at:
      typeof lastActVal === "number"
        ? (lastActVal as number)
        : Number(lastActVal) || undefined,
    messages: msgsRaw.map((m) => normMessage(m as Record<string, unknown>)),
  };
}

function normConversationsResponse(raw: unknown): CWConversation[] {
  const r1 = Array.isArray(raw) ? (raw as unknown[]) : null;

  const r2Obj = raw as Record<string, unknown> | null;
  const r2 = r2Obj && Array.isArray(r2Obj["payload"])
    ? (r2Obj["payload"] as unknown[])
    : null;

  const r3data = (r2Obj?.["data"] as Record<string, unknown> | undefined) ?? undefined;
  const r3 = r3data && Array.isArray(r3data["payload"])
    ? (r3data["payload"] as unknown[])
    : null;

  const list = (r1 || r2 || r3 || []) as unknown[];

  return list.map((c) => normConversation(c as Record<string, unknown>));
}

// ===== API: conversaciones =====
export async function fetchConversations(): Promise<CWConversation[]> {
  const r = await fetch(`${API}/conversations`);
  if (!r.ok) {
    console.warn("fetchConversations:", r.status, r.statusText);
    return [];
  }
  const raw = await r.json().catch(() => []);
  return normConversationsResponse(raw);
}

// ===== API: mensajes por conversación =====
export async function fetchMessages(
  convId: number | string
): Promise<CWMessage[]> {
  try {
    const r = await fetch(`${API}/conversations/${convId}/messages`);
    if (!r.ok) return [];

    const raw = await r.json().catch(() => []);

    const r1 = Array.isArray(raw) ? (raw as unknown[]) : null;

    const rObj = raw as Record<string, unknown> | null;
    const r2 = rObj && Array.isArray(rObj["payload"])
      ? (rObj["payload"] as unknown[])
      : null;

    const rData = (rObj?.["data"] as Record<string, unknown> | undefined) ?? undefined;
    const r3 = rData && Array.isArray(rData["payload"])
      ? (rData["payload"] as unknown[])
      : null;

    const arr = (r1 || r2 || r3 || []) as unknown[];

    return arr.map((m) => normMessage(m as Record<string, unknown>));
  } catch {
    return [];
  }
}

// ===== API: enviar mensaje (outgoing) =====
// ÚNICA implementación activa
export async function sendMessage(
  conversationId: number | string,
  content: string
) {
  const r = await fetch(`${API}/send-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversation_id: conversationId, content }),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`sendMessage ${r.status} ${r.statusText} → ${text}`);
  }
  return r.json();
}

/* ============================================================================
   Copia de la implementación previa de sendMessage (MANTENIDA COMO REFERENCIA)
   ----------------------------------------------------------------------------
   export async function sendMessage(
     conversationId: number | string,
     content: string
   ) {
     const r = await fetch(`${API}/send-message`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ conversation_id: conversationId, content }),
     });
     if (!r.ok) {
       const text = await r.text().catch(() => "");
       throw new Error(`sendMessage ${r.status} ${r.statusText} → ${text}`);
     }
     return r.json();
   }
   ========================================================================== */
