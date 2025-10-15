/**
 * Meta Ads API Service - OPTIMIZED VERSION
 * Fetches real campaign, ad set, and ad data from Meta Graph API v21.0
 * with caching and batch requests for faster loading
 */

const META_GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos de cache

// Environment variables - SOPORTE MULTI-TOKEN
const ACCESS_TOKEN = import.meta.env.VITE_META_ACCESS_TOKEN || '';
const ACCESS_TOKEN_2 = import.meta.env.VITE_META_ACCESS_TOKEN_2 || '';
const AD_ACCOUNT_IDS = (import.meta.env.VITE_META_AD_ACCOUNT_IDS || '').split(',').map(id => id.trim());
const AD_ACCOUNT_NAMES_ARR = (import.meta.env.VITE_META_AD_ACCOUNT_NAMES || '').split(',').map(s => s.trim());
const AD_ACCOUNT_NAME_MAP: Record<string, string> = AD_ACCOUNT_IDS.reduce((acc, id, idx) => {
  const name = AD_ACCOUNT_NAMES_ARR[idx] || id;
  acc[id] = name;
  return acc;
}, {} as Record<string, string>);

// Mapeo de cuenta a token (ambas cuentas usan el mismo token)
const ACCOUNT_TOKENS: Record<string, string> = {
  '1281508182357459': ACCESS_TOKEN, // Cuenta 1 (ID corregido)
  '5518735214914409': ACCESS_TOKEN, // GALLE 18K DETAL
};

// Función para obtener el token correcto según la cuenta
function getTokenForAccount(accountId: string): string {
  return ACCOUNT_TOKENS[accountId] || ACCESS_TOKEN;
}

// Cache en memoria
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = {
  campaigns: null as CacheEntry<Campaign[]> | null,
  adsets: null as CacheEntry<AdSet[]> | null,
  ads: null as CacheEntry<Ad[]> | null,
};

function isCacheValid<T>(entry: CacheEntry<T> | null): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  accountId?: string;
  detail?: string; // account name shown under campaign name
  objective?: string;
  daily_budget?: number;
  lifetime_budget?: number;
  budget?: number; // effective daily budget (campaign or sum of ad sets)
  spent: number;
  conversations: number;
  sales: number;
  revenue: number;
  roas: number;
  cvr: number;
}

export interface AdSet {
  id: string;
  name: string;
  status: string;
  campaignId: string;
  daily_budget?: number;
  lifetime_budget?: number;
  spent: number;
  conversations: number;
  sales: number;
  revenue: number;
  roas: number;
  cvr: number;
}

export interface Ad {
  id: string;
  name: string;
  status: string;
  adsetId: string;
  spent: number;
  conversations: number;
  sales: number;
  revenue: number;
  roas: number;
  cvr: number;
}

/**
 * Parse metrics from insights data
 */
function parseInsights(insights: any) {
  const spent = parseFloat(insights.spend || '0');

  const actions = insights.actions || [];
  // Conversaciones = "mensajes iniciados" (conversaciones iniciadas)
  // Contabilizamos únicamente los action_type de conversación iniciada
  const CONV_TYPES = new Set<string>([
    'onsite_conversion.messaging_conversation_started_7d',
    'onsite_conversion.messaging_conversation_started_7d_unique'
  ]);
  const conversations = actions
    .filter((a: any) => a && CONV_TYPES.has(String(a.action_type)))
    .reduce((sum: number, a: any) => sum + (parseInt(a.value, 10) || 0), 0);

  const actionValues = insights.action_values || [];
  const purchaseAction = actionValues.find(
    (a: any) => 
      a.action_type === 'offsite_conversion.fb_pixel_purchase' ||
      a.action_type === 'omni_purchase'
  );
  const revenue = purchaseAction ? parseFloat(purchaseAction.value) : 0;

  const salesAction = actions.find(
    (a: any) => 
      a.action_type === 'offsite_conversion.fb_pixel_purchase' ||
      a.action_type === 'omni_purchase'
  );
  const sales = salesAction ? parseInt(salesAction.value, 10) : 0;

  const roas = spent > 0 ? revenue / spent : 0;
  const cvr = conversations > 0 ? (sales / conversations) * 100 : 0;

  return { spent, conversations, sales, revenue, roas, cvr };
}

/**
 * Fetch campaigns with insights from all ad accounts - OPTIMIZED
 * Uses insights as nested field to reduce API calls
 */
export async function fetchMetaCampaigns(): Promise<Campaign[]> {
  // Check cache first
  if (isCacheValid(cache.campaigns)) {
    console.log('✅ Usando campañas desde cache');
    return cache.campaigns!.data;
  }

  if (!ACCESS_TOKEN) {
    console.error('❌ META ACCESS TOKEN no configurado');
    console.error('Verifica que VITE_META_ACCESS_TOKEN esté en las variables de entorno');
    return [];
  }

  console.log('🔐 Token configurado:', ACCESS_TOKEN.substring(0, 20) + '...');
  console.log('🏢 Cuentas a consultar:', AD_ACCOUNT_IDS);

  const startTime = Date.now();
  console.log('🚀 Cargando campañas desde Meta API...');

  try {
    // Paralelizar las llamadas a cada cuenta
    const accountPromises = AD_ACCOUNT_IDS.filter(id => id).map(async (accountId) => {
      try {
        // Obtener el token correcto para esta cuenta
        const accountToken = getTokenForAccount(accountId);
        console.log(`📡 Consultando cuenta: act_${accountId} con token: ${accountToken.substring(0, 20)}...`);
        
        // OPTIMIZADO: Solo las últimas 5 campañas por cuenta (total 10 campañas)
        const url = `${META_GRAPH_API_BASE}/act_${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&limit=5&access_token=${accountToken}`;
        
        console.log(`🔗 URL: ${url.replace(accountToken, 'TOKEN_OCULTO')}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error ${response.status} en cuenta ${accountId}:`, errorText);
          
          // Intentar parsear el error de Meta
          try {
            const errorJson = JSON.parse(errorText);
            console.error('📄 Error detallado de Meta:', JSON.stringify(errorJson, null, 2));
          } catch (e) {
            console.error('📄 Error raw:', errorText);
          }
          
          return [];
        }

        const data = await response.json();
        console.log(`📊 Respuesta de cuenta ${accountId}:`, JSON.stringify(data, null, 2));
        
        const campaigns = data.data || [];
        console.log(`✅ ${campaigns.length} campañas encontradas en cuenta ${accountId} (máximo 5 por cuenta)`);

        if (campaigns.length === 0) {
          console.warn(`⚠️ No se encontraron campañas en la cuenta ${accountId}`);
          console.warn('Posibles causas:');
          console.warn('1. La cuenta no tiene campañas activas');
          console.warn('2. El token no tiene permisos ads_read');
          console.warn('3. El ID de cuenta es incorrecto');
          return [];
        }

        // Obtener insights para cada campaña (batch de 5 en 5 para no saturar)
        const campaignsWithInsights = [];
        for (let i = 0; i < campaigns.length; i += 5) {
          const batch = campaigns.slice(i, i + 5);
          const batchPromises = batch.map(async (campaign: any) => {
            try {
              // Usar el token correcto para esta cuenta
              const insightsUrl = `${META_GRAPH_API_BASE}/${campaign.id}/insights?fields=spend,actions,action_values&date_preset=last_30d&access_token=${accountToken}`;
              const insightsResponse = await fetch(insightsUrl);
              
              if (!insightsResponse.ok) {
                console.warn(`⚠️ No insights para campaña ${campaign.id}`);
                return {
                  id: campaign.id,
                  name: campaign.name,
                  status: String(campaign.status || '').toLowerCase(),
                  accountId: accountId,
                  detail: AD_ACCOUNT_NAME_MAP[accountId] || accountId,
                  objective: campaign.objective,
                  daily_budget: campaign.daily_budget ? (() => { const v = parseFloat(campaign.daily_budget); return v > 100000 ? v / 100 : v; })() : undefined,
                  lifetime_budget: campaign.lifetime_budget ? (() => { const v = parseFloat(campaign.lifetime_budget); return v > 100000 ? v / 100 : v; })() : undefined,
                  spent: 0,
                  conversations: 0,
                  sales: 0,
                  revenue: 0,
                  roas: 0,
                  cvr: 0,
                };
              }

              const insightsData = await insightsResponse.json();
              const insights = insightsData.data?.[0] || {};
              const metrics = parseInsights(insights);

              console.log(`📈 Campaña ${campaign.name}:`, {
                id: campaign.id,
                status: String(campaign.status || '').toLowerCase(),
                spent: metrics.spent,
                conversations: metrics.conversations,
              });

              return {
                id: campaign.id,
                name: campaign.name,
                status: String(campaign.status || '').toLowerCase(),
                accountId: accountId,
                detail: AD_ACCOUNT_NAME_MAP[accountId] || accountId,
                objective: campaign.objective,
                daily_budget: campaign.daily_budget ? (() => { const v = parseFloat(campaign.daily_budget); return v > 100000 ? v / 100 : v; })() : undefined,
                lifetime_budget: campaign.lifetime_budget ? (() => { const v = parseFloat(campaign.lifetime_budget); return v > 100000 ? v / 100 : v; })() : undefined,
                ...metrics,
              };
            } catch (error) {
              console.error(`❌ Error obteniendo insights para ${campaign.id}:`, error);
              return {
                id: campaign.id,
                name: campaign.name,
                status: String(campaign.status || '').toLowerCase(),
                accountId: accountId,
                detail: AD_ACCOUNT_NAME_MAP[accountId] || accountId,
                objective: campaign.objective,
                daily_budget: campaign.daily_budget ? (() => { const v = parseFloat(campaign.daily_budget); return v > 100000 ? v / 100 : v; })() : undefined,
                lifetime_budget: campaign.lifetime_budget ? (() => { const v = parseFloat(campaign.lifetime_budget); return v > 100000 ? v / 100 : v; })() : undefined,
                spent: 0,
                conversations: 0,
                sales: 0,
                revenue: 0,
                roas: 0,
                cvr: 0,
              };
            }
          });

          const batchResults = await Promise.all(batchPromises);
          campaignsWithInsights.push(...batchResults);
        }

        return campaignsWithInsights;
      } catch (error) {
        console.error(`❌ Error crítico en cuenta ${accountId}:`, error);
        if (error instanceof Error) {
          console.error('Stack trace:', error.stack);
        }
        return [];
      }
    });

    // Esperar todas las cuentas en paralelo
    const results = await Promise.all(accountPromises);
    const allCampaigns = results.flat();

    const loadTime = Date.now() - startTime;
    console.log(`✅ ${allCampaigns.length} campañas cargadas en ${loadTime}ms`);

    // Guardar en cache
    cache.campaigns = {
      data: allCampaigns,
      timestamp: Date.now(),
    };

    return allCampaigns;
  } catch (error) {
    console.error('❌ Error general cargando campañas:', error);
    return [];
  }
}

/**
 * Fetch ad sets with insights - OPTIMIZED
 * @param campaignId Optional - filter by campaign ID
 */
export async function fetchMetaAdSets(campaignId?: string): Promise<AdSet[]> {
  // Check cache first (only if no campaign filter)
  if (!campaignId && isCacheValid(cache.adsets)) {
    console.log('✅ Usando adsets desde cache');
    return cache.adsets!.data;
  }

  if (!ACCESS_TOKEN) {
    console.error('❌ META ACCESS TOKEN no configurado');
    return [];
  }

  const startTime = Date.now();
  console.log('🚀 Cargando ad sets desde Meta API...');

  try {
    // Paralelizar las llamadas a cada cuenta
    const accountPromises = AD_ACCOUNT_IDS.filter(id => id).map(async (accountId) => {
      try {
        // Obtener el token correcto para esta cuenta
        const accountToken = getTokenForAccount(accountId);
        
        // OPTIMIZACIÓN: Solicitar insights como campo anidado (límite 20 ad sets)
        let url = `${META_GRAPH_API_BASE}/act_${accountId}/adsets?fields=id,name,status,campaign_id,daily_budget,lifetime_budget,insights{spend,actions,action_values}&limit=20&access_token=${accountToken}`;
        
        if (campaignId) {
          url += `&filtering=[{"field":"campaign.id","operator":"EQUAL","value":"${campaignId}"}]`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Error en cuenta ${accountId}:`, response.status);
          return [];
        }

        const data = await response.json();
        const adsets = data.data || [];

        return adsets.map((adset: any) => {
          const insights = adset.insights?.data?.[0] || {};
          const metrics = parseInsights(insights);

          return {
            id: adset.id,
            name: adset.name,
            status: String(adset.status || '').toLowerCase(),
            campaignId: adset.campaign_id,
            daily_budget: adset.daily_budget ? (() => { const v = parseFloat(adset.daily_budget); return v > 100000 ? v / 100 : v; })() : undefined,
            lifetime_budget: adset.lifetime_budget ? (() => { const v = parseFloat(adset.lifetime_budget); return v > 100000 ? v / 100 : v; })() : undefined,
            ...metrics,
          };
        });
      } catch (error) {
        console.error(`Error en cuenta ${accountId}:`, error);
        return [];
      }
    });

    const results = await Promise.all(accountPromises);
    const allAdSets = results.flat();

    const loadTime = Date.now() - startTime;
    console.log(`✅ ${allAdSets.length} ad sets cargados en ${loadTime}ms`);

    // Guardar en cache (solo si no hay filtro)
    if (!campaignId) {
      cache.adsets = {
        data: allAdSets,
        timestamp: Date.now(),
      };
    }

    return allAdSets;
  } catch (error) {
    console.error('❌ Error general cargando ad sets:', error);
    return [];
  }
}

/**
 * Fetch ads with insights - OPTIMIZED
 * @param adSetId Optional - filter by ad set ID
 */
export async function fetchMetaAds(adSetId?: string): Promise<Ad[]> {
  // Check cache first (only if no adset filter)
  if (!adSetId && isCacheValid(cache.ads)) {
    console.log('✅ Usando ads desde cache');
    return cache.ads!.data;
  }

  if (!ACCESS_TOKEN) {
    console.error('❌ META ACCESS TOKEN no configurado');
    return [];
  }

  const startTime = Date.now();
  console.log('🚀 Cargando ads desde Meta API...');

  try {
    // Paralelizar las llamadas a cada cuenta
    const accountPromises = AD_ACCOUNT_IDS.filter(id => id).map(async (accountId) => {
      try {
        // Obtener el token correcto para esta cuenta
        const accountToken = getTokenForAccount(accountId);
        
        // OPTIMIZACIÓN: Solicitar insights como campo anidado (límite 30 ads)
        let url = `${META_GRAPH_API_BASE}/act_${accountId}/ads?fields=id,name,status,adset_id,insights{spend,actions,action_values}&limit=30&access_token=${accountToken}`;
        
        if (adSetId) {
          url += `&filtering=[{"field":"adset.id","operator":"EQUAL","value":"${adSetId}"}]`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Error en cuenta ${accountId}:`, response.status);
          return [];
        }

        const data = await response.json();
        const ads = data.data || [];

        return ads.map((ad: any) => {
          const insights = ad.insights?.data?.[0] || {};
          const metrics = parseInsights(insights);

          return {
            id: ad.id,
            name: ad.name,
            status: String(ad.status || '').toLowerCase(),
            adsetId: ad.adset_id,
            ...metrics,
          };
        });
      } catch (error) {
        console.error(`Error en cuenta ${accountId}:`, error);
        return [];
      }
    });

    const results = await Promise.all(accountPromises);
    const allAds = results.flat();

    const loadTime = Date.now() - startTime;
    console.log(`✅ ${allAds.length} ads cargados en ${loadTime}ms`);

    // Guardar en cache (solo si no hay filtro)
    if (!adSetId) {
      cache.ads = {
        data: allAds,
        timestamp: Date.now(),
      };
    }

    return allAds;
  } catch (error) {
    console.error('❌ Error general cargando ads:', error);
    return [];
  }
}

/**
 * Clear all cache - useful for manual refresh
 */
export function clearCache() {
  cache.campaigns = null;
  cache.adsets = null;
  cache.ads = null;
  console.log('🗑️ Cache limpiado');
}
