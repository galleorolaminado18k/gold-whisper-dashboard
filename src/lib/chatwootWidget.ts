function normalizeBaseUrl(url: string): string {
  let u = (url || "").trim();
  if (!u) return "";
  // Agregar protocolo si falta
  if (!/^https?:\/\//i.test(u)) {
    u = `https://${u}`;
  }
  // Quitar trailing slash para construir paths de forma consistente
  return u.replace(/\/$/, "");
}

export function initChatwootWidget() {
  const ENABLED = (import.meta.env.VITE_CHATWOOT_ENABLED ?? "false").toString() === "true";
  const RAW_BASE_URL = (import.meta.env.VITE_CHATWOOT_URL ?? "").toString();
  const BASE_URL = normalizeBaseUrl(RAW_BASE_URL);
  const WEBSITE_TOKEN = (import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN ?? "").toString();

  if (!ENABLED) return;
  if (!BASE_URL || !WEBSITE_TOKEN) {
    globalThis.console?.warn?.("[Chatwoot] Falta BASE_URL o WEBSITE_TOKEN; no se inicializa.");
    return;
  }

  try {
    const g = document.createElement("script");
    const s = document.getElementsByTagName("script")[0];
    g.src = BASE_URL + "/packs/js/sdk.js";
    g.async = true;
    g.defer = true;
    s.parentNode?.insertBefore(g, s);
    g.onload = function () {
      const sdk: any = (globalThis as any).chatwootSDK;
      if (sdk && typeof sdk.run === "function") {
        sdk.run({
          websiteToken: WEBSITE_TOKEN,
          baseUrl: BASE_URL,
        });
      } else {
        globalThis.console?.warn?.("[Chatwoot] SDK no cargó correctamente.");
      }
    };
    g.onerror = function () {
      globalThis.console?.warn?.("[Chatwoot] No fue posible cargar el SDK desde:", g.src);
    };
  } catch (e) {
    globalThis.console?.warn?.("[Chatwoot] Error inicializando:", e);
  }
}

