import React from "react";

type SegmentItem = {
  key: string;
  title: string;
  subtitle: string;
  value: string | number;
  tone?: "vip" | "risk" | "default";
  gif: string; // ruta en /public/media/seg
};

const SEGMENTS: SegmentItem[] = [
  { key: "cross_balineria", title: "Cross Balinería", subtitle: "Joyería→Balín", value: 58, tone: "risk", gif: "/media/seg/fire.gif" },
  { key: "cross_joyeria",   title: "Cross Joyería",   subtitle: "Balín→Joyería", value: 73, tone: "risk", gif: "/media/seg/fire.gif" },
  { key: "churn_risk",      title: "Riesgo abandono", subtitle: "45–60 días",    value: 19, tone: "risk", gif: "/media/seg/peligro.gif" },
  { key: "wholesalers_active",   title: "Mayoristas activos",   subtitle: "≤30 días", value: 84, gif: "/media/seg/brief.gif" },
  { key: "wholesalers_inactive", title: "Mayoristas inactivos", subtitle: ">60 días", value: 31, gif: "/media/seg/inactive.gif" },
  { key: "vip_clients",          title: "Clientes VIP",         subtitle: "+$2M/6m",  value: 12, tone: "vip", gif: "/media/seg/vip.gif" },
];

function Chip({ children, tone = "default" }: { children: React.ReactNode; tone?: "vip" | "risk" | "default" }) {
  const styles =
    tone === "vip"  ? "border-amber-300 bg-amber-100 text-amber-700"
  : tone === "risk" ? "border-rose-300 bg-rose-100 text-rose-700"
                    : "border-slate-300 bg-slate-100 text-slate-700";
  return <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] ${styles}`}>{children}</span>;
}

function Item({ s }: { s: SegmentItem }) {
  return (
    <div className="flex items-center gap-2 px-3 md:px-4 py-1.5">
      <img
        src={s.gif}
        alt={`${s.title} anim`}
        className="h-6 w-6 md:h-7 md:w-7 rounded-md object-contain select-none"
        draggable={false}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-900">{s.title}</span>
        <Chip tone={s.tone}>{s.subtitle}</Chip>
        <span className="ml-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
          {s.value}
        </span>
      </div>
    </div>
  );
}

export default function SmartSegmentationBanner() {
  const items = [...SEGMENTS, ...SEGMENTS]; // loop infinito

  return (
    <section
      /* SIN borde superior y pegado visualmente al borde del header */
      className="group relative overflow-hidden rounded-b-lg rounded-t-none border-x border-b border-t-0 border-slate-200 bg-white shadow-sm"
      aria-label="Ticker de segmentación inteligente"
    >
      {/* Gradientes laterales */}
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white to-transparent z-10" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10" />

      <div className="relative h-[46px] md:h-[50px]">
        <div className="flex h-full items-center" aria-roledescription="marquee">
          <div className="flex shrink-0 items-center will-change-transform" style={{ animation: "galle-scroll 28s linear infinite" }}>
            {items.map((s, i) => (
              <React.Fragment key={`${s.key}-${i}`}>
                <Item s={s} />
                <div className="h-5 w-px bg-slate-200" aria-hidden />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes galle-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .group:hover [style*="galle-scroll"] { animation-play-state: paused !important; }
      `}</style>
    </section>
  );
}
