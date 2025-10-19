const API = `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION ?? 'v19.0'}`;

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno: ${name}`);
  return v as string;
}

export function getMetaHeaders() {
  const token = requireEnv("META_LONG_LIVED_TOKEN");
  return { Authorization: `Bearer ${token}` };
}

export async function metaFetch<T>(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...getMetaHeaders(), ...(init?.headers || {}) },
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const MetaAds = {
  async getCampaigns(adAccountId: string) {
    return metaFetch(`/${adAccountId}/campaigns?fields=id,name,status,objective,created_time,updated_time`);
  },
  async getInsights(adAccountId: string, datePreset = "last_30d") {
    return metaFetch(
      `/${adAccountId}/insights?date_preset=${datePreset}&fields=campaign_name,impressions,clicks,spend,actions`
    );
  },
};
