/**
 * Meta Ads API Service
 * Fetches real campaign, ad set, and ad data from Meta Graph API v21.0
 */

const META_GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

// Environment variables
const ACCESS_TOKEN = import.meta.env.VITE_META_ACCESS_TOKEN || '';
const AD_ACCOUNT_IDS = (import.meta.env.VITE_META_AD_ACCOUNT_IDS || '').split(',').map(id => id.trim());

export interface Campaign {
  id: string;
  name: string;
  status: string;
  objective?: string;
  daily_budget?: number;
  lifetime_budget?: number;
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
 * Fetch campaigns with insights from all ad accounts
 */
export async function fetchMetaCampaigns(): Promise<Campaign[]> {
  if (!ACCESS_TOKEN) {
    console.error('❌ META ACCESS TOKEN no configurado');
    return [];
  }

  const allCampaigns: Campaign[] = [];

  for (const accountId of AD_ACCOUNT_IDS) {
    if (!accountId) continue;

    try {
      console.log(`📊 Obteniendo campañas de cuenta: ${accountId}`);

      // Fetch campaigns
      const campaignsUrl = `${META_GRAPH_API_BASE}/act_${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&access_token=${ACCESS_TOKEN}`;
      const campaignsResponse = await fetch(campaignsUrl);
      
      if (!campaignsResponse.ok) {
        console.error(`Error fetching campaigns for ${accountId}:`, await campaignsResponse.text());
        continue;
      }

      const campaignsData = await campaignsResponse.json();
      const campaigns = campaignsData.data || [];

      // Fetch insights for each campaign
      for (const campaign of campaigns) {
        try {
          const insightsUrl = `${META_GRAPH_API_BASE}/${campaign.id}/insights?fields=spend,actions,action_values&access_token=${ACCESS_TOKEN}`;
          const insightsResponse = await fetch(insightsUrl);

          if (!insightsResponse.ok) {
            console.warn(`No insights for campaign ${campaign.id}`);
            allCampaigns.push({
              id: campaign.id,
              name: campaign.name,
              status: campaign.status,
              objective: campaign.objective,
              daily_budget: campaign.daily_budget ? parseFloat(campaign.daily_budget) / 100 : undefined,
              lifetime_budget: campaign.lifetime_budget ? parseFloat(campaign.lifetime_budget) / 100 : undefined,
              spent: 0,
              conversations: 0,
              sales: 0,
              revenue: 0,
              roas: 0,
              cvr: 0,
            });
            continue;
          }

          const insightsData = await insightsResponse.json();
          const insights = insightsData.data?.[0] || {};

          // Parse spend
          const spent = parseFloat(insights.spend || '0');

          // Parse conversations from actions
          const actions = insights.actions || [];
          const conversationAction = actions.find(
            (a: any) => 
              a.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
              a.action_type === 'lead'
          );
          const conversations = conversationAction ? parseInt(conversationAction.value, 10) : 0;

          // Parse sales and revenue from action_values
          const actionValues = insights.action_values || [];
          const purchaseAction = actionValues.find(
            (a: any) => 
              a.action_type === 'offsite_conversion.fb_pixel_purchase' ||
              a.action_type === 'omni_purchase'
          );
          const revenue = purchaseAction ? parseFloat(purchaseAction.value) : 0;

          // Calculate sales (assuming we track purchase count in actions)
          const salesAction = actions.find(
            (a: any) => 
              a.action_type === 'offsite_conversion.fb_pixel_purchase' ||
              a.action_type === 'omni_purchase'
          );
          const sales = salesAction ? parseInt(salesAction.value, 10) : 0;

          // Calculate ROAS and CVR
          const roas = spent > 0 ? revenue / spent : 0;
          const cvr = conversations > 0 ? (sales / conversations) * 100 : 0;

          allCampaigns.push({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            objective: campaign.objective,
            daily_budget: campaign.daily_budget ? parseFloat(campaign.daily_budget) / 100 : undefined,
            lifetime_budget: campaign.lifetime_budget ? parseFloat(campaign.lifetime_budget) / 100 : undefined,
            spent,
            conversations,
            sales,
            revenue,
            roas,
            cvr,
          });
        } catch (error) {
          console.error(`Error fetching insights for campaign ${campaign.id}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error fetching campaigns for account ${accountId}:`, error);
    }
  }

  console.log(`✅ Total campañas cargadas: ${allCampaigns.length}`);
  return allCampaigns;
}

/**
 * Fetch ad sets with insights
 * @param campaignId Optional - filter by campaign ID
 */
export async function fetchMetaAdSets(campaignId?: string): Promise<AdSet[]> {
  if (!ACCESS_TOKEN) {
    console.error('❌ META ACCESS TOKEN no configurado');
    return [];
  }

  const allAdSets: AdSet[] = [];

  for (const accountId of AD_ACCOUNT_IDS) {
    if (!accountId) continue;

    try {
      console.log(`📊 Obteniendo ad sets de cuenta: ${accountId}`);

      // Fetch ad sets
      let adsetsUrl = `${META_GRAPH_API_BASE}/act_${accountId}/adsets?fields=id,name,status,campaign_id,daily_budget,lifetime_budget&access_token=${ACCESS_TOKEN}`;
      if (campaignId) {
        adsetsUrl += `&filtering=[{"field":"campaign.id","operator":"EQUAL","value":"${campaignId}"}]`;
      }

      const adsetsResponse = await fetch(adsetsUrl);
      
      if (!adsetsResponse.ok) {
        console.error(`Error fetching ad sets for ${accountId}:`, await adsetsResponse.text());
        continue;
      }

      const adsetsData = await adsetsResponse.json();
      const adsets = adsetsData.data || [];

      // Fetch insights for each ad set
      for (const adset of adsets) {
        try {
          const insightsUrl = `${META_GRAPH_API_BASE}/${adset.id}/insights?fields=spend,actions,action_values&access_token=${ACCESS_TOKEN}`;
          const insightsResponse = await fetch(insightsUrl);

          if (!insightsResponse.ok) {
            console.warn(`No insights for ad set ${adset.id}`);
            allAdSets.push({
              id: adset.id,
              name: adset.name,
              status: adset.status,
              campaignId: adset.campaign_id,
              daily_budget: adset.daily_budget ? parseFloat(adset.daily_budget) / 100 : undefined,
              lifetime_budget: adset.lifetime_budget ? parseFloat(adset.lifetime_budget) / 100 : undefined,
              spent: 0,
              conversations: 0,
              sales: 0,
              revenue: 0,
              roas: 0,
              cvr: 0,
            });
            continue;
          }

          const insightsData = await insightsResponse.json();
          const insights = insightsData.data?.[0] || {};

          // Parse metrics (same logic as campaigns)
          const spent = parseFloat(insights.spend || '0');

          const actions = insights.actions || [];
          const conversationAction = actions.find(
            (a: any) => 
              a.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
              a.action_type === 'lead'
          );
          const conversations = conversationAction ? parseInt(conversationAction.value, 10) : 0;

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

          allAdSets.push({
            id: adset.id,
            name: adset.name,
            status: adset.status,
            campaignId: adset.campaign_id,
            daily_budget: adset.daily_budget ? parseFloat(adset.daily_budget) / 100 : undefined,
            lifetime_budget: adset.lifetime_budget ? parseFloat(adset.lifetime_budget) / 100 : undefined,
            spent,
            conversations,
            sales,
            revenue,
            roas,
            cvr,
          });
        } catch (error) {
          console.error(`Error fetching insights for ad set ${adset.id}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error fetching ad sets for account ${accountId}:`, error);
    }
  }

  console.log(`✅ Total ad sets cargados: ${allAdSets.length}`);
  return allAdSets;
}

/**
 * Fetch ads with insights
 * @param adSetId Optional - filter by ad set ID
 */
export async function fetchMetaAds(adSetId?: string): Promise<Ad[]> {
  if (!ACCESS_TOKEN) {
    console.error('❌ META ACCESS TOKEN no configurado');
    return [];
  }

  const allAds: Ad[] = [];

  for (const accountId of AD_ACCOUNT_IDS) {
    if (!accountId) continue;

    try {
      console.log(`📊 Obteniendo ads de cuenta: ${accountId}`);

      // Fetch ads
      let adsUrl = `${META_GRAPH_API_BASE}/act_${accountId}/ads?fields=id,name,status,adset_id&access_token=${ACCESS_TOKEN}`;
      if (adSetId) {
        adsUrl += `&filtering=[{"field":"adset.id","operator":"EQUAL","value":"${adSetId}"}]`;
      }

      const adsResponse = await fetch(adsUrl);
      
      if (!adsResponse.ok) {
        console.error(`Error fetching ads for ${accountId}:`, await adsResponse.text());
        continue;
      }

      const adsData = await adsResponse.json();
      const ads = adsData.data || [];

      // Fetch insights for each ad
      for (const ad of ads) {
        try {
          const insightsUrl = `${META_GRAPH_API_BASE}/${ad.id}/insights?fields=spend,actions,action_values&access_token=${ACCESS_TOKEN}`;
          const insightsResponse = await fetch(insightsUrl);

          if (!insightsResponse.ok) {
            console.warn(`No insights for ad ${ad.id}`);
            allAds.push({
              id: ad.id,
              name: ad.name,
              status: ad.status,
              adsetId: ad.adset_id,
              spent: 0,
              conversations: 0,
              sales: 0,
              revenue: 0,
              roas: 0,
              cvr: 0,
            });
            continue;
          }

          const insightsData = await insightsResponse.json();
          const insights = insightsData.data?.[0] || {};

          // Parse metrics (same logic as campaigns)
          const spent = parseFloat(insights.spend || '0');

          const actions = insights.actions || [];
          const conversationAction = actions.find(
            (a: any) => 
              a.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
              a.action_type === 'lead'
          );
          const conversations = conversationAction ? parseInt(conversationAction.value, 10) : 0;

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

          allAds.push({
            id: ad.id,
            name: ad.name,
            status: ad.status,
            adsetId: ad.adset_id,
            spent,
            conversations,
            sales,
            revenue,
            roas,
            cvr,
          });
        } catch (error) {
          console.error(`Error fetching insights for ad ${ad.id}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error fetching ads for account ${accountId}:`, error);
    }
  }

  console.log(`✅ Total ads cargados: ${allAds.length}`);
  return allAds;
}
