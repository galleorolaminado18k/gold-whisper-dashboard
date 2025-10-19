# Merge: SalesDashboard + Publicidad (GWD)

Este paquete tiene como base **salesdashboard** y añade el módulo **Publicidad** del proyecto GWD.

## Qué se copió automáticamente
- Publicidad: []
- API Meta: []
- Lib Meta: [
  [
    "/mnt/data/work/gwd/gold-whisper-dashboard-main/gold-whisper-dashboard/src/lib/metaAds.ts",
    "/mnt/data/work/salesdashboard-merged/lib/metaAds.ts"
  ],
  [
    "/mnt/data/work/gwd/gold-whisper-dashboard-main/src/lib/metaAds.ts",
    "/mnt/data/work/salesdashboard-merged/lib/metaAds.ts"
  ]
]

Si algún bloque no aparece, se generó un **scaffold** mínimo en `app/publicidad/` y `app/api/meta/` + `lib/meta.ts`.

## Variables de entorno
Edita `.env.local` (basado en `.env.example`) con:
- META_APP_ID, META_APP_SECRET, META_AD_ACCOUNT_ID, META_LONG_LIVED_TOKEN
- (opcional) Supabase, Vercel Blob, NextAuth

## Ejecutar
npm i
npm run dev

## Seguridad
Los tokens se usan **solo en servidor** (Route Handlers / lib/meta.ts). Revisa que no estén en el cliente.
