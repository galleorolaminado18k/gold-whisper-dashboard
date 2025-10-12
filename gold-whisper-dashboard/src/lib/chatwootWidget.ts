export function initChatwootWidget() {
  const ENABLED = (import.meta.env.VITE_CHATWOOT_ENABLED ?? "false").toString() === "true";
  const BASE_URL = (import.meta.env.VITE_CHATWOOT_URL ?? "").toString();
  const WEBSITE_TOKEN = (import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN ?? "").toString();

  if (!ENABLED) return;
  if (!BASE_URL || !WEBSITE_TOKEN) {
    console.warn("[Chatwoot] Falta BASE_URL o WEBSITE_TOKEN; no se inicializa.");
    return;
  }

  try {
    const g = document.createElement("script");
    const s = document.getElementsByTagName("script")[0];
    g.src = BASE_URL.replace(/\/$/, "") + "/packs/js/sdk.js";
    g.async = true;
    g.defer = true;
    s.parentNode?.insertBefore(g, s);
    g.onload = function () {
      if (window.chatwootSDK && typeof window.chatwootSDK.run === "function") {
        window.chatwootSDK.run({
          websiteToken: WEBSITE_TOKEN,
          baseUrl: BASE_URL,
        });
      } else {
        console.warn("[Chatwoot] SDK no cargó correctamente.");
      }
    };
    g.onerror = function () {
      console.warn("[Chatwoot] No fue posible cargar el SDK desde:", g.src);
    };
  } catch (e) {
    console.warn("[Chatwoot] Error inicializando:", e);
  }
}

