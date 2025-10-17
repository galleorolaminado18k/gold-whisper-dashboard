import { NextResponse } from "next/server";
import { MetaAds } from "@/lib/meta";

export async function GET() {
  const adAccountId = process.env.META_AD_ACCOUNT_ID as string;
  if (!adAccountId) return NextResponse.json({ error: "Falta META_AD_ACCOUNT_ID" }, { status: 500 });
  const data = await MetaAds.getCampaigns(adAccountId);
  return NextResponse.json(data);
}
