// src/components/crm/ConvoTable.tsx
import React from "react";
import { CRMStageId } from "@/lib/crmStages";

export type Contact = {
  name?: string;
  full_name?: string;
  display_name?: string;
  email?: string;
  phone_number?: string;
  phone?: string;
  id?: number | string;
} | string | null;

export type Convo = {
  id: number | string;
  // En CRM.tsx estás pasando c.contact (objeto). Aquí lo soportamos flexible.
  cliente: Contact;
  ultimoMensaje: string;
  canal: "whatsapp" | "instagram" | "facebook" | "web";
  etapa: CRMStageId;
  updatedAt: string; // ISO
};

type Props = { rows: Convo[] };

// ==== Helpers de presentación ====
function getContactName(c: Contact): string {
  // Intenta nombre → email → phone → id → "Desconocido"
  if (!c) return "Desconocido";
  if (typeof c === "string") return c;
  const name = c.name || c.full_name || c.display_name;
  if (name && String(name).trim()) return String(name);
  if (c.email) return c.email;
  if (c.phone_number || c.phone) return c.phone_number || c.phone;
  if (c.id) return `Contacto #${c.id}`;
  return "Desconocido";
}

function stageBadge(s: CRMStageId) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border";
  switch (s) {
    case "por_contestar":
      return (
        <span className={`${base} border-yellow-300/40 text-yellow-700 bg-yellow-50/60`}>
          Por contestar
        </span>
      );
    case "pendiente_datos":
      return (
        <span className={`${base} border-amber-300/40 text-amber-700 bg-amber-50/60`}>
          Pendiente datos
        </span>
      );
    case "por_confirmar":
      return (
        <span className={`${base} border-blue-300/40 text-blue-700 bg-blue-50/60`}>
          Por confirmar
        </span>
      );
    case "pendiente_guia":
      return (
        <span className={`${base} border-purple-300/40 text-purple-700 bg-purple-50/60`}>
          Pendiente guía
        </span>
      );
    case "pedido_completo":
      return (
        <span className={`${base} border-emerald-300/40 text-emerald-700 bg-emerald-50/60`}>
          Pedido completo
        </span>
      );
    default:
      return <span className={base}>{s}</span>;
  }
}

export default function ConvoTable({ rows }: Props) {
  if (!rows.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No hay conversaciones en esta etapa.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-left p-3 w-[26%]">Cliente</th>
            <th className="text-left p-3 w-[38%]">Último mensaje</th>
            <th className="text-left p-3 w-[12%]">Canal</th>
            <th className="text-left p-3 w-[14%]">Etapa</th>
            <th className="text-left p-3 w-[10%]">Actualización</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border hover:bg-muted/20">
              {/* Cliente */}
              <td className="p-3">
                <div className="font-medium">{getContactName(r.cliente)}</div>
                {/* Si quieres ver el id/conversación para debug: */}
                <div className="text-xs text-muted-foreground">Conv #{String(r.id)}</div>
              </td>

              {/* Último mensaje (truncado) */}
              <td className="p-3">
                <div className="max-w-[560px] truncate">{r.ultimoMensaje || "—"}</div>
              </td>

              {/* Canal */}
              <td className="p-3 capitalize">{r.canal}</td>

              {/* Etapa */}
              <td className="p-3">{stageBadge(r.etapa)}</td>

              {/* UpdatedAt */}
              <td className="p-3">
                {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
