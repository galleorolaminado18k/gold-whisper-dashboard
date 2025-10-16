// src/lib/campaignAttribution.ts
// Utilidades para detectar campaña y categoría desde mensajes (UTM/keywords)

import { fetchAllAccountsCampaigns, MetaCampaign } from "@/lib/metaAds";

type SimpleMsg = { content?: string };

let CACHE: { when: number; items: MetaCampaign[] } | null = null;
const TTL_MS = 5 * 60 * 1000;

async function getMetaCampaignsCached(): Promise<MetaCampaign[]> {
  const now = Date.now();
  if (CACHE && now - CACHE.when < TTL_MS) return CACHE.items;
  const items = await fetchAllAccountsCampaigns("last_30d").catch(() => []);
  CACHE = { when: now, items };
  return items;
}

function extractUtmCampaign(text: string): string | null {
  try {
    const urlRegex = /https?:\/\/[^\s]+/gi;
    const urls = text.match(urlRegex) || [];
    for (const u of urls) {
      const q = (u.split("?")[1] || "").split("#")[0];
      if (!q) continue;
      const params = new URLSearchParams(q);
      const utm = params.get("utm_campaign");
      if (utm) return decodeURIComponent(utm).toLowerCase();
      const cid = params.get("campaign_id");
      if (cid && /^(\d{6,})$/.test(cid)) return `id:${cid}`;
    }
  } catch (e) {
    // ignore URL parsing failures
  }
  return null;
}

function normalize(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const KW_BALINERIA = ["balineria", "balines", "balin", "balineria premium"];
const KW_JOYERIA = ["joyeria", "collar", "aretes", "anillo", "cadena", "pulsera", "dije"];

function detectKeywordFamily(text: string): "balineria" | "joyeria" | null {
  const t = normalize(text);
  if (KW_BALINERIA.some((k) => t.includes(normalize(k)))) return "balineria";
  if (KW_JOYERIA.some((k) => t.includes(normalize(k)))) return "joyeria";
  return null;
}

function pickBestCampaignId(camps: MetaCampaign[], key: string): string | null {
  const keyNorm = normalize(key);
  const nameHas = (c: MetaCampaign) => normalize(c.name || "").includes(keyNorm);
  const preferActive = (s?: string) => (s === "ACTIVE" ? 1 : 0);
  const filtered = camps.filter(nameHas);
  if (!filtered.length) return null;
  filtered.sort((a, b) => {
    const byActive = preferActive(b.effective_status) - preferActive(a.effective_status);
    if (byActive !== 0) return byActive;
    const ta = Date.parse(a.updated_time || a.created_time || "0");
    const tb = Date.parse(b.updated_time || b.created_time || "0");
    return tb - ta;
  });
  return filtered[0]?.id || null;
}

export async function getCampaignLabelForMessages(msgs: SimpleMsg[]): Promise<string | null> {
  try {
    const text = (msgs || [])
      .map((m) => (m?.content ? String(m.content) : ""))
      .filter(Boolean)
      .join("\n");
    if (!text.trim()) return null;
    const camps = await getMetaCampaignsCached();
    if (!camps.length) return null;
    const utm = extractUtmCampaign(text);
    if (utm) {
      if (utm.startsWith("id:")) return `campaign:${utm.slice(3)}`;
      const id = pickBestCampaignId(camps, utm);
      if (id) return `campaign:${id}`;
    }
    const fam = detectKeywordFamily(text);
    if (fam) {
      const id = pickBestCampaignId(camps, fam);
      if (id) return `campaign:${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function getCategoryLabelForMessages(msgs: SimpleMsg[]): string | null {
  const text = (msgs || [])
    .map((m) => (m?.content ? String(m.content) : ""))
    .filter(Boolean)
    .join("\n");
  if (!text.trim()) return null;
  const fam = detectKeywordFamily(text);
  if (fam === "balineria") return "category:balineria";
  if (fam === "joyeria") return "category:joyeria";
  return null;
}

