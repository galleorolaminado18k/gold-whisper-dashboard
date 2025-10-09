// src/pages/CRM.tsx
import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import StageTabs from "@/components/crm/StageTabs";
import ConvoTable, { Convo } from "@/components/crm/ConvoTable";
import { CRMStageId } from "@/lib/crmStages";
import { useQuery } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchMessages,
  CWConversation,
  // ⚠️ OJO: NO importamos CWMessage desde chatwoot para evitar choques de tipos
} from "@/lib/chatwoot";
import classifyStage from "@/lib/classifier";

// ===== Tipos mínimos que espera el clasificador =====
type ClassifierMsg = {
  id?: number | string;
  content?: string;
  message_type?: "incoming" | "outgoing";
  created_at?: number; // epoch seconds
};

// ——— Utilidades robustas ———
function normalizeConversations(raw: unknown): CWConversation[] {
  const r = raw as { data?: { payload?: unknown[] }; payload?: unknown[] };
  if (Array.isArray(r)) return r as CWConversation[];
  if (Array.isArray(r?.data?.payload)) return r.data.payload as CWConversation[];
  if (Array.isArray(r?.payload)) return r.payload as CWConversation[];
  return [];
}

// 🔧 Normaliza mensajes: acepta array o {payload}/{data.payload}
function normalizeMessages(raw: unknown): ClassifierMsg[] {
  const r = raw as { data?: { payload?: unknown[] }; payload?: unknown[] };
  if (Array.isArray(r)) return r as ClassifierMsg[];
  if (Array.isArray(r?.data?.payload)) return r.data.payload as ClassifierMsg[];
  if (Array.isArray(r?.payload)) return r.payload as ClassifierMsg[];
  return [];
}

function safeNumber(n: unknown): number | undefined {
  const x = Number(n);
  return Number.isFinite(x) ? x : undefined;
}

// 🔧 Convierte ms → segundos si hace falta
function toSec(ts?: number | null): number | undefined {
  if (!Number.isFinite(ts as number)) return undefined;
  const n = Number(ts);
  // si viene en milisegundos, será > 2,000,000,000
  return n > 2_000_000_000 ? Math.floor(n / 1000) : n;
}

function mapChannel(inboxId: number | undefined): Convo["canal"] {
  return "whatsapp"; // ajusta si deseas mapear por inbox_id reales
}

/**
 * Convierte mensajes “como vengan” de Chatwoot a lo que
 * el clasificador espera (strings 'incoming'/'outgoing', etc).
 */
function toClassifierMsgs(msgs: ClassifierMsg[] | undefined): ClassifierMsg[] {
  if (!Array.isArray(msgs)) return [];
  return msgs.map((m) => {
    // hay instalaciones donde message_type puede venir como número o texto
    // 0/“incoming” = cliente, 1/“outgoing” = agente/bot
    const raw = m?.message_type;
    const rawStr = raw != null ? String(raw).toLowerCase() : "";
    const type: "incoming" | "outgoing" =
      rawStr === "0" || rawStr === "incoming" ? "incoming" : "outgoing";

    // created_at puede venir en ms o s; normalizamos a segundos
    const createdSeconds = toSec(safeNumber(m?.created_at) ?? 0) ?? 0;

    return {
      id: m?.id,
      content: m?.content ?? "",
      message_type: type,
      created_at: createdSeconds,
    } as ClassifierMsg;
  });
}

// ——— Construcción de filas para la tabla ———
async function buildConvos(): Promise<Convo[]> {
  try {
    const raw = await fetchConversations();
    const convs: CWConversation[] = normalizeConversations(raw);

    const top = convs.slice(0, 30); // proteger rendimiento

    const all = await Promise.all(
      top.map(async (c) => {
        try {
          // pueden venir embebidos en distintas formas
          let msgs: ClassifierMsg[] | undefined = normalizeMessages(c.messages);
          if (!Array.isArray(msgs) || msgs.length === 0) {
            const fetched = await fetchMessages(c.id).catch(() => []);
            msgs = normalizeMessages(fetched);
          }

          // 🔧 Adaptamos los mensajes al tipo del clasificador
          const clsMsgs = toClassifierMsgs(msgs);

          const etapa: CRMStageId = classifyStage(clsMsgs) as CRMStageId;

          // último mensaje por created_at (desc)
          const last = clsMsgs
            .slice()
            .sort((a, b) => (b?.created_at ?? 0) - (a?.created_at ?? 0))[0];

          // last_activity_at puede venir en ms o s
          const lastActivitySec =
            toSec(safeNumber(c.last_activity_at) ?? undefined) ??
            (last?.created_at ?? Math.floor(Date.now() / 1000));

          return {
            id: c.id,
            // distintos deploys usan contact / contact_name / customer_name
            cliente:
              c.contact ||
              c.contact_name ||
              c.customer_name ||
              `Conv #${c.id}`,
            ultimoMensaje: last?.content || "",
            canal: mapChannel(c.inbox_id),
            etapa,
            updatedAt: new Date((lastActivitySec as number) * 1000).toISOString(),
          } as Convo;
        } catch {
          return undefined as unknown as Convo;
        }
      })
    );

    return all.filter(Boolean);
  } catch {
    return [];
  }
}

// ——— Componente de página ———
const CRMRoute: React.FC = () => {
  const [active, setActive] = React.useState<CRMStageId>("por_contestar");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["crm-convos"],
    queryFn: buildConvos,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });

  const convos = data || [];

  const counts = React.useMemo(() => {
    const acc: Record<CRMStageId, number> = {
      por_contestar: 0,
      pendiente_datos: 0,
      por_confirmar: 0,
      pendiente_guia: 0,
      pedido_completo: 0,
    };
    for (const c of convos) acc[c.etapa]++;
    return acc;
  }, [convos]);

  const filtered = React.useMemo(
    () => convos.filter((c) => c.etapa === active),
    [convos, active]
  );

  return (
    <DashboardLayout>
      <div className="p-6 animate-fade-in">
        <div className="relative border-b border-border pb-4 max-w-[1200px] mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            CRM — Conversaciones Activas
          </h1>
          <p className="text-muted-foreground">Total: {convos.length}</p>
        </div>

        <div className="max-w-[1200px] mx-auto mt-6">
          <StageTabs active={active} counts={counts} onChange={setActive} />

          {isLoading && (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          )}

          {!isLoading && isError && (
            <div className="text-sm text-muted-foreground">
              No se pudieron cargar conversaciones. (Mostrando 0)
            </div>
          )}

          {!isLoading && !isError && <ConvoTable rows={filtered} />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CRMRoute;
