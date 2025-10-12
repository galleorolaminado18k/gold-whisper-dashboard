// src/lib/channelMap.ts
export type Canal = "whatsapp" | "instagram" | "web" | "facebook" | "email";

const INBOX_TO_CHANNEL: Record<number, Canal> = {
  // 👉 PON AQUÍ TUS IDS REALES DE CHATWOOT
  // Ejemplos:
  12: "whatsapp",
  13: "instagram",
  14: "web",
};

export function channelFromInbox(inboxId?: number): Canal {
  if (!inboxId && inboxId !== 0) return "web"; // default
  return INBOX_TO_CHANNEL[inboxId] ?? "web";
}
