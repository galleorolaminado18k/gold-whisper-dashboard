'use client';
// lib/crm/classifier.ts
// Clasificador por etapas basado en tu Prompt Maestro (Karla – Galle).

export type CWMessage = {
  id?: number | string;
  content?: string;
  // ⚠️ Ajuste mínimo: tolerar números que puedan venir del bridge/API
  message_type?: "incoming" | "outgoing" | number;
  created_at?: number; // epoch seconds
};

export type CRMStageId =
  | "por_contestar"
  | "pendiente_datos"
  | "por_confirmar"
  | "pendiente_guia"
  | "pedido_completo";

/** Normaliza y quita diacríticos de forma compatible */
function norm(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Último mensaje por created_at */
function getLastMessage(msgs: CWMessage[] = []): CWMessage | undefined {
  if (!Array.isArray(msgs) || msgs.length === 0) return undefined;
  return [...msgs].sort((a, b) => (b?.created_at ?? 0) - (a?.created_at ?? 0))[0];
}

/** Interpreta variantes de message_type (string/number) sin romper */
function isIncomingType(t: CWMessage["message_type"]): boolean {
  if (t === "incoming") return true;
  if (t === "outgoing") return false;
  if (typeof t === "number") {
    // Convenciones más vistas:
    // 0 o 2 => incoming | 1 => outgoing (fallback seguro)
    if (t === 0 || t === 2) return true;
    if (t === 1) return false;
    // cualquier otro número: mejor tratarlo como incoming para no perder atención
    return true;
  }
  // si viene undefined o algo raro, preferimos "incoming" (para mostrar Por contestar)
  return true;
}

const RE = {
  pedirDatos: [
    /nombre\s+completo/,
    /ciudad\s+de\s+entrega/,
    /(direccion|dirección).*(barrio)/,
    /barrio\s+obligatorio|falta\s+barrio|de\s+que\s+barrio/,
    /celular|telefono|tel[eé]fono/,
    /documento|cc\b/,
    /correo\s+electr[oó]nico|email/,
    /metodo\s+de\s+pago|transferencia|anticipad[oa]|contra\s*entrega|contraentrega/,
    /confirma\s+por\s+favor/,
  ],
  resumenFinal: [
    /resumen\s+final/,
    /total[:\s]/,
    /producto[:\s]/,
    /env[ií]o[:\s]/,
    /metodo[:\s]\s*(transferencia|anticipado|contraentrega)/,
    /confirmas?\s+(para\s+)?despacho|lo\s+aseguramos|lo\s+activo\s+ya/,
    /ahorro[:\s]/,
  ],
  pagoConfirmado: [
    /pago\s+recibido|comprobante\s+validado|pagaste|transferencia\s+confirmada/,
    /pedido\s+(confirmado|alistado|preparado)|despacho\s+hoy/,
  ],
  // Confirmación explícita del cliente
  confirmacionPedido: [
    /\bconfirmo\b/,
    /\bconfirmado\b/,
    /pedido\s+confirmado/,
    /listo\s+para\s+despacho/,
  ],
  generandoGuia: [
    /te\s+paso\s+la\s+gu[ií]a|en\s+cuanto\s+salga\s+la\s+gu[ií]a/,
    /generando\s+gu[ií]a|creando\s+gu[ií]a|imprimiendo\s+gu[ií]a/,
  ],
  guiaEnviada: [
    /gu[ií]a\s*(n[uú]mero|#|no\.?)\s*[:#]?\s*\d+/,
    /aqui\s+esta\s+la\s+gu[ií]a|envio\s+registrado|gui[aí]\s+enviada/,
    /entregado|recibido/,
  ],
};

/** ¿Falta dato crítico? chequea barrio y teléfono de 10 dígitos */
function faltaDatoCritico(hist: string): boolean {
  const hasBarrio =
    /\bbarrio\b/.test(hist) ||
    /(?:calle|cll|carrera|cra|av(?:enida)?|diag|transv|tv|mz|manzana|#|no\.?)\s*\d+[^\n,;]*?(?:,|-|–|\s)\s*[a-z0-9áéíóúñü.\- ]{3,}/i.test(hist);

  const onlyDigits = hist.replace(/\D/g, "");
  const hasPhone10 = /\b\d{10}\b/.test(onlyDigits);

  return !(hasBarrio && hasPhone10);
}

/** Clasifica una conversación según su historial de mensajes */
export function classifyStage(messages: CWMessage[] = []): CRMStageId {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "por_contestar";
  }

  const hist = norm(messages.map((m) => m?.content ?? "").join("\n"));

  if (RE.guiaEnviada.some((r) => r.test(hist))) return "pedido_completo";

  if (
    RE.pagoConfirmado.some((r) => r.test(hist)) ||
    RE.generandoGuia.some((r) => r.test(hist)) ||
    RE.confirmacionPedido.some((r) => r.test(hist))
  ) {
    return "pendiente_guia";
  }

  if (RE.resumenFinal.some((r) => r.test(hist))) return "por_confirmar";

  if (RE.pedirDatos.some((r) => r.test(hist)) || faltaDatoCritico(hist)) {
    return "pendiente_datos";
  }

  const last = getLastMessage(messages);
  if (isIncomingType(last?.message_type)) return "por_contestar";

  return "por_contestar";
}

export default classifyStage;