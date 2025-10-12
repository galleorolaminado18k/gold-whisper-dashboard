// src/lib/metaAds.ts
// Servicio de integración con Meta Ads API

const META_API_VERSION = 'v21.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

// Configuración desde variables de entorno
const ACCESS_TOKEN = import.meta.env.VITE_META_ACCESS_TOKEN;
const AD_ACCOUNT_ID = import.meta.env.VITE_META_AD_ACCOUNT_ID;

// Soporte para múltiples cuentas
const AD_ACCOUNT_IDS_STRING = import.meta.env.VITE_META_AD_ACCOUNT_IDS || AD_ACCOUNT_ID;
const AD_ACCOUNT_IDS = AD_ACCOUNT_IDS_STRING.split(',').map((id: string) => id.trim());
const AD_ACCOUNT_NAMES = (import.meta.env.VITE_META_AD_ACCOUNT_NAMES || '').split(',').map((name: string) => name.trim());

// Tipos de datos de Meta Ads
export interface MetaCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  effective_status?: string; // Estado real de entrega: ACTIVE, PAUSED, CAMPAIGN_PAUSED, etc.
  objective: string;
  daily_budget?: number;
  lifetime_budget?: number;
  created_time: string;
  updated_time: string;
  insights?: {
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    cpc: number;
    cpm: number;
    ctr: number;
    conversions: number;
    cost_per_conversion: number;
  };
  account_name?: string; // Añadido para identificar la cuenta de la campaña
  account_id?: string; // Añadido para identificar el ID de la cuenta de la campaña
}

export interface MetaInsights {
  campaign_id: string;
  campaign_name: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  cpc: number;
  cpm: number;
  ctr: number;
  date_start: string;
  date_stop: string;
}

export interface MetaAdSet {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  campaign_id: string;
  daily_budget?: number;
  lifetime_budget?: number;
  created_time: string;
  updated_time: string;
  insights?: {
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    cpc: number;
    cpm: number;
    ctr: number;
  };
  // Añadidos para métricas de CRM/ventas a nivel AdSet
  conversaciones?: number;
  ventas?: number;
  ingresos?: number;
  roas?: number;
  cvr?: number;
  costePorConv?: number; // Añadido para métricas de CRM/ventas a nivel AdSet
}

/**
 * Obtiene todas las campañas de la cuenta publicitaria
 */
export async function fetchMetaCampaigns(): Promise<MetaCampaign[]> {
  try {
    const url = `${META_API_BASE}/act_${AD_ACCOUNT_ID}/campaigns`;
    const params = new URLSearchParams({
      access_token: ACCESS_TOKEN,
      fields: 'id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time',
      limit: '100',
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching Meta campaigns:', error);
      throw new Error(`Meta API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error en fetchMetaCampaigns:', error);
    return [];
  }
}

/**
 * Obtiene insights (métricas) de una campaña específica
 */
export async function fetchCampaignInsights(
  campaignId: string,
  datePreset: string = 'last_30d'
): Promise<MetaInsights | null> {
  try {
    const url = `${META_API_BASE}/${campaignId}/insights`;
    const params = new URLSearchParams({
      access_token: ACCESS_TOKEN,
      date_preset: datePreset,
      fields: 'campaign_id,campaign_name,spend,impressions,reach,clicks,cpc,cpm,ctr,date_start,date_stop',
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching campaign insights:', error);
      return null;
    }

    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error en fetchCampaignInsights:', error);
    return null;
  }
}

/**
 * Obtiene insights de todas las campañas con métricas agregadas
 */
export async function fetchAllCampaignsInsights(
  datePreset: string = 'last_30d'
): Promise<MetaInsights[]> {
  try {
    const url = `${META_API_BASE}/act_${AD_ACCOUNT_ID}/insights`;
    const params = new URLSearchParams({
      access_token: ACCESS_TOKEN,
      date_preset: datePreset,
      level: 'campaign',
      fields: 'campaign_id,campaign_name,spend,impressions,reach,clicks,cpc,cpm,ctr,date_start,date_stop',
      limit: '100',
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching all campaigns insights:', error);
      throw new Error(`Meta API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error en fetchAllCampaignsInsights:', error);
    return [];
  }
}

/**
 * Obtiene insights con conversiones personalizadas
 */
export async function fetchCampaignConversions(
  campaignId: string,
  datePreset: string = 'last_30d'
): Promise<Record<string, unknown> | null> {
  try {
    const url = `${META_API_BASE}/${campaignId}/insights`;
    const params = new URLSearchParams({
      access_token: ACCESS_TOKEN,
      date_preset: datePreset,
      fields: 'campaign_id,campaign_name,actions,action_values,cost_per_action_type',
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching campaign conversions:', error);
      return null;
    }

    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error en fetchCampaignConversions:', error);
    return null;
  }
}

/**
 * Combina datos de campañas con sus insights - DE UNA CUENTA
 */
export async function fetchCampaignsWithInsights(
  datePreset: string = 'last_30d'
): Promise<MetaCampaign[]> {
  try {
    // Obtener campañas
    const campaigns = await fetchMetaCampaigns();
    
    // Obtener insights de todas las campañas
    const allInsights = await fetchAllCampaignsInsights(datePreset);
    
    // Crear un mapa de insights por campaign_id
    const insightsMap = new Map(
      allInsights.map(insight => [insight.campaign_id, insight])
    );
    
    // Combinar campañas con sus insights
    const campaignsWithInsights = campaigns.map(campaign => {
      const insights = insightsMap.get(campaign.id);
      
      return {
        ...campaign,
        insights: insights ? {
          spend: parseFloat(String(insights.spend)) || 0,
          impressions: parseInt(String(insights.impressions)) || 0,
          reach: parseInt(String(insights.reach)) || 0,
          clicks: parseInt(String(insights.clicks)) || 0,
          cpc: parseFloat(String(insights.cpc)) || 0,
          cpm: parseFloat(String(insights.cpm)) || 0,
          ctr: parseFloat(String(insights.ctr)) || 0,
          conversions: 0, // Se actualizará con datos de conversiones
          cost_per_conversion: 0,
        } : undefined,
      };
    });
    
    return campaignsWithInsights;
  } catch (error) {
    console.error('Error en fetchCampaignsWithInsights:', error);
    return [];
  }
}

/**
 * Obtiene campañas de TODAS las cuentas publicitarias configuradas
 */
export async function fetchAllAccountsCampaigns(
  datePreset: string = 'last_30d'
): Promise<MetaCampaign[]> {
  try {
    console.log(`📊 Cargando campañas de ${AD_ACCOUNT_IDS.length} cuentas publicitarias...`);
    
    const allCampaignsPromises = AD_ACCOUNT_IDS.map(async (accountId, index) => {
      try {
        const accountName = AD_ACCOUNT_NAMES[index] || `Cuenta ${index + 1}`;
        console.log(`🔄 Obteniendo campañas de: ${accountName} (ID: ${accountId})`);
        
        // Obtener campañas de esta cuenta
        const url = `${META_API_BASE}/act_${accountId}/campaigns`;
        const params = new URLSearchParams({
          access_token: ACCESS_TOKEN,
          fields: 'id,name,status,effective_status,objective,daily_budget,lifetime_budget,created_time,updated_time',
          limit: '100',
        });

        const response = await fetch(`${url}?${params}`);
        
        if (!response.ok) {
          const error = await response.json();
          console.error(`❌ Error en cuenta ${accountName}:`, error);
          return [];
        }

        const campaignsData = await response.json();
        const campaigns = campaignsData.data || [];
        
        // Obtener insights para estas campañas
        const insightsUrl = `${META_API_BASE}/act_${accountId}/insights`;
        const insightsParams = new URLSearchParams({
          access_token: ACCESS_TOKEN,
          date_preset: datePreset,
          level: 'campaign',
          fields: 'campaign_id,campaign_name,spend,impressions,reach,clicks,cpc,cpm,ctr,date_start,date_stop',
          limit: '100',
        });

        const insightsResponse = await fetch(`${insightsUrl}?${insightsParams}`);
        
        if (!insightsResponse.ok) {
          console.error(`⚠️ No se pudieron obtener insights de ${accountName}`);
          return campaigns;
        }

        const insightsData = await insightsResponse.json();
        const insights = insightsData.data || [];
        
        // Crear mapa de insights con tipo explícito
        const insightsMap = new Map<string, MetaInsights>(
          insights.map((insight: MetaInsights) => [insight.campaign_id, insight])
        );
        
        // Combinar campañas con insights
        const campaignsWithInsights = campaigns.map((campaign: MetaCampaign) => {
          const campaignInsights = insightsMap.get(campaign.id);
          
          return {
            ...campaign,
            // Agregar el nombre de la cuenta para identificación
            account_name: accountName,
            account_id: accountId,
            insights: campaignInsights ? {
              spend: parseFloat(String(campaignInsights.spend)) || 0,
              impressions: parseInt(String(campaignInsights.impressions)) || 0,
              reach: parseInt(String(campaignInsights.reach)) || 0,
              clicks: parseInt(String(campaignInsights.clicks)) || 0,
              cpc: parseFloat(String(campaignInsights.cpc)) || 0,
              cpm: parseFloat(String(campaignInsights.cpm)) || 0,
              ctr: parseFloat(String(campaignInsights.ctr)) || 0,
              conversions: 0,
              cost_per_conversion: 0,
            } : undefined,
          };
        });
        
        console.log(`✅ ${accountName}: ${campaignsWithInsights.length} campañas cargadas`);
        return campaignsWithInsights;
      } catch (error) {
        console.error(`❌ Error cargando cuenta ${accountId}:`, error);
        return [];
      }
    });

    // Esperar todas las promesas y combinar resultados
    const allCampaignsArrays = await Promise.all(allCampaignsPromises);
    const allCampaigns = allCampaignsArrays.flat();
    
    console.log(`✅ Total de campañas cargadas: ${allCampaigns.length} de ${AD_ACCOUNT_IDS.length} cuentas`);
    return allCampaigns;
  } catch (error) {
    console.error('Error en fetchAllAccountsCampaigns:', error);
    return [];
  }
}

/**
 * Obtiene la lista de cuentas publicitarias configuradas
 */
export function getAdAccounts() {
  return AD_ACCOUNT_IDS.map((id, index) => ({
    id,
    name: AD_ACCOUNT_NAMES[index] || `Cuenta ${index + 1}`,
  }));
}

/**
 * Obtiene información de la cuenta publicitaria
 */
export async function fetchAdAccountInfo() {
  try {
    const url = `${META_API_BASE}/act_${AD_ACCOUNT_ID}`;
    const params = new URLSearchParams({
      access_token: ACCESS_TOKEN,
      fields: 'id,name,account_status,currency,timezone_name,amount_spent,balance',
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching ad account info:', error);
      throw new Error(`Meta API error: ${error.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en fetchAdAccountInfo:', error);
    return null;
  }
}

/**
 * Obtiene los ad sets (conjuntos de anuncios) de una campaña
 */
export async function fetchCampaignAdSets(
  campaignId: string,
  datePreset: string = 'last_30d'
): Promise<MetaAdSet[]> {
  try {
    // Obtener ad sets
    const url = `${META_API_BASE}/${campaignId}/adsets`;
    const params = new URLSearchParams({
      access_token: ACCESS_TOKEN,
      fields: 'id,name,status,campaign_id,daily_budget,lifetime_budget,created_time,updated_time',
      limit: '100',
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching ad sets:', error);
      return [];
    }

    const data = await response.json();
    const adSets = data.data || [];

    // Importar funciones de CRM y sales para enriquecer datos
    const { fetchConversationsByLabel, fetchMessages } = await import('@/lib/chatwoot');
    const { getTotalsByCampaignFromSupabase } = await import('@/lib/sales');
    const { default: classifyStage } = await import('@/lib/classifier');
    const { getCategoryLabelForMessages } = await import('@/lib/campaignAttribution');

    // Obtener insights y enriquecer con datos de CRM/Supabase para cada ad set
    const adSetsWithInsightsAndCRM = await Promise.all(
      adSets.map(async (adSet: MetaAdSet) => {
        let enrichedAdSet: MetaAdSet = { ...adSet };
        try {
          const insightsUrl = `${META_API_BASE}/${adSet.id}/insights`;
          const insightsParams = new URLSearchParams({
            access_token: ACCESS_TOKEN,
            date_preset: datePreset,
            fields: 'spend,impressions,reach,clicks,cpc,cpm,ctr',
          });

          const insightsResponse = await fetch(`${insightsUrl}?${insightsParams}`);
          
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            const insights = insightsData.data?.[0];
            
            enrichedAdSet.insights = insights ? {
              spend: parseFloat(String(insights.spend)) || 0,
              impressions: parseInt(String(insights.impressions)) || 0,
              reach: parseInt(String(insights.reach)) || 0,
              clicks: parseInt(String(insights.clicks)) || 0,
              cpc: parseFloat(String(insights.cpc)) || 0,
              cpm: parseFloat(String(insights.cpm)) || 0,
              ctr: parseFloat(String(insights.ctr)) || 0,
            } : undefined;
          }
        } catch (error) {
          console.error(`Error fetching insights for ad set ${adSet.id}:`, error);
        }

        // Enriquecer con datos del CRM (conversaciones y ventas por ad set)
        try {
          const label = `adset:${adSet.id}`; // Asumiendo que las conversaciones pueden etiquetarse por adset
          const convs = await fetchConversationsByLabel(label);
          let conversaciones = Array.isArray(convs) ? convs.length : 0;

          // Contar ventas (conversaciones en etapa 'pedido_completo') vía clasificador
          let ventas = 0;
          let ingresosEstimado = 0;
          const AOV_DEFAULT = Number(import.meta.env.VITE_DEFAULT_AOV) || 285000;
          const AOV_BAL = Number(import.meta.env.VITE_AOV_BALINERIA) || AOV_DEFAULT;
          const AOV_JOY = Number(import.meta.env.VITE_AOV_JOYERIA) || AOV_DEFAULT;
          for (const conv of convs) {
            const msgs = await fetchMessages(conv.id).catch((error) => {
              console.error(`Error fetching messages for conversation ${conv.id}:`, error);
              return [];
            });
            const stage = classifyStage(msgs);
            if (stage === "pedido_completo") {
              ventas++;
              const cat = getCategoryLabelForMessages(msgs);
              if (cat === 'category:balineria') ingresosEstimado += AOV_BAL;
              else if (cat === 'category:joyeria') ingresosEstimado += AOV_JOY;
              else ingresosEstimado += AOV_DEFAULT;
            }
          }

          // Intento de ingresos reales desde Supabase (si existe orders)
          let ingresos = ingresosEstimado;
          try {
            const db = await getTotalsByCampaignFromSupabase(adSet.id); // Asumiendo que Supabase también puede filtrar por adset ID
            if (db && typeof db.ingresos === 'number' && db.ingresos > 0) ingresos = db.ingresos;
          } catch (error) {
            console.error(`Error fetching Supabase totals for ad set ${adSet.id}:`, error);
          }

          const gastado = enrichedAdSet.insights?.spend || 0;
          const costePorConv = conversaciones > 0 ? gastado / conversaciones : 0;
          const roas = gastado > 0 ? ingresos / gastado : 0;
          const cvr = ventas > 0 ? (conversaciones / ventas) * 100 : 0; // CVR = Conversaciones / Ventas (según solicitud del usuario)

          enrichedAdSet = { 
            ...enrichedAdSet, 
            conversaciones, 
            ventas, 
            ingresos, 
            roas, 
            cvr,
            costePorConv // Aunque no está en la interfaz MetaAdSet, se puede añadir para uso interno
          };

        } catch (error) {
          console.error(`Error enriching ad set ${adSet.id} with CRM/Supabase data:`, error);
        }
        return enrichedAdSet;
      })
    );

    return adSetsWithInsightsAndCRM;
  } catch (error) {
    console.error('Error en fetchCampaignAdSets:', error);
    return [];
  }
}

/**
 * Actualiza el estado de una campaña
 */
export async function updateCampaignStatus(
  campaignId: string,
  status: 'ACTIVE' | 'PAUSED'
): Promise<boolean> {
  try {
    const url = `${META_API_BASE}/${campaignId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: ACCESS_TOKEN,
        status: status,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error updating campaign status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en updateCampaignStatus:', error);
    return false;
  }
}

/**
 * Actualiza el estado de un ad set
 */
export async function updateAdSetStatus(
  adSetId: string,
  status: 'ACTIVE' | 'PAUSED'
): Promise<boolean> {
  try {
    const url = `${META_API_BASE}/${adSetId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: ACCESS_TOKEN,
        status: status,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error updating ad set status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en updateAdSetStatus:', error);
    return false;
  }
}
