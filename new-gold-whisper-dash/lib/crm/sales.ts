'use client';

// lib/crm/sales.ts
// Totales de ventas por campaña (Supabase). Si no existe la tabla, retorna null.

import { createClient } from '@supabase/supabase-js';

// Inicializar cliente de Supabase con las variables de entorno
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export type SalesTotals = { ventas: number; ingresos: number };

export async function getTotalsByCampaignFromSupabase(
  campaignId: string
): Promise<SalesTotals | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id,total,status,campaign_id", { count: "exact" })
      .eq("campaign_id", campaignId)
      .eq("status", "completed");
    
    if (error) return null;
    
    const ventas = Array.isArray(data) ? data.length : 0;
    const ingresos = Array.isArray(data)
      ? data.reduce((s: number, it: any) => s + (Number(it?.total) || 0), 0)
      : 0;
    
    return { ventas, ingresos };
  } catch {
    return null;
  }
}