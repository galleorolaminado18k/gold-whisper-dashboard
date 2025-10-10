// src/lib/crmStages.ts
export type CRMStageId =
  | "por_contestar"
  | "pendiente_datos"
  | "por_confirmar"
  | "pendiente_guia"
  | "pedido_completo";

export const CRM_STAGES: { id: CRMStageId; label: string }[] = [
  { id: "por_contestar",   label: "Por contestar" },
  { id: "pendiente_datos", label: "Pendiente enviar datos" },
  { id: "por_confirmar",   label: "Por confirmar pedido" },
  { id: "pendiente_guia",  label: "Pendiente enviar guía" },
  { id: "pedido_completo", label: "Pedido completo" },
];
