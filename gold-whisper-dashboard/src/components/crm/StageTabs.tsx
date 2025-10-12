// src/components/crm/StageTabs.tsx
import React from "react";
import { CRM_STAGES, CRMStageId } from "@/lib/crmStages";

type Props = {
  active: CRMStageId;
  counts: Partial<Record<CRMStageId, number>>;
  onChange: (id: CRMStageId) => void;
};

export default function StageTabs({ active, counts, onChange }: Props) {
  return (
    <div className="flex gap-2 border-b border-border mb-4 overflow-x-auto">
      {CRM_STAGES.map((s) => {
        const isActive = s.id === active;
        const count = counts[s.id] ?? 0;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`px-3 py-2 rounded-t-md text-sm font-medium
              ${isActive ? "bg-card text-foreground shadow-sm border border-border border-b-transparent"
                         : "text-muted-foreground hover:text-foreground"}`}
          >
            {s.label} <span className="ml-2 text-xs opacity-70">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
