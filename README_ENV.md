# Configurar variables de entorno

Este proyecto usa Vite (React). Todas las credenciales se leen desde variables `VITE_*`.

- Copia `.env.example` a `.env` y rellena los valores.
- NO subas credenciales reales al repositorio.
- En producción (Vercel/Netlify/GitHub Actions/Fly/Render) configura los mismos nombres de variables desde los paneles de cada servicio.

## Claves necesarias

- Supabase
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
- Chatwoot / Bridge
  - VITE_CHATWOOT_ENABLED (true/false)
  - VITE_CHATWOOT_URL
  - VITE_CHATWOOT_WEBSITE_TOKEN
  - VITE_CHATWOOT_ACCOUNT_ID
  - VITE_BRIDGE_API_URL
- Meta Ads
  - VITE_META_ACCESS_TOKEN (y opcional VITE_META_ACCESS_TOKEN_2)
  - VITE_META_AD_ACCOUNT_ID (principal) o VITE_META_AD_ACCOUNT_IDS (lista separada por comas)
  - VITE_META_AD_ACCOUNT_NAMES (lista separada por comas)
  - VITE_META_BUSINESS_ID (opcional)
- AOV por categoría (opcional)
  - VITE_DEFAULT_AOV, VITE_AOV_BALINERIA, VITE_AOV_JOYERIA
- Fallback auth (solo demo)
  - VITE_ENABLE_FALLBACK_AUTH, VITE_FALLBACK_AUTH_EMAIL, VITE_FALLBACK_AUTH_PASSWORD, VITE_FALLBACK_ALLOWED_EMAILS

## Windows PowerShell (local)

1. Duplicar `.env.example`:

```powershell
Copy-Item .env.example .env
```

2. Editar `.env` y poner tus valores.
3. Ejecutar el servidor de desarrollo:

```powershell
npm install
npm run dev
```

## Vercel

- Usa `vercel env pull` para traer variables locales opcionalmente.
- Configura variables con los mismos nombres que en `.env.example`.
- `vercel.json` ya mapea claves típicas, pero es mejor definirlas en el panel.

## GitHub Actions (gh-pages)

- Ve a Settings → Secrets and variables → Actions → New repository secret y crea:
  - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_CHATWOOT_URL, VITE_CHATWOOT_WEBSITE_TOKEN, VITE_CHATWOOT_ACCOUNT_ID, VITE_BRIDGE_API_URL, VITE_META_ACCESS_TOKEN, VITE_META_AD_ACCOUNT_IDS, VITE_META_AD_ACCOUNT_NAMES, VITE_META_BUSINESS_ID
- El workflow `deploy.yml` consume estas variables con `${{ secrets.NAME }}`.

Nota: Para GitHub Pages como subpágina, la app se sirve bajo `/gold-whisper-dashboard/` y ya está configurado en el workflow y en Vite (VITE_ASSET_BASE/VITE_ROUTER_BASENAME).

## Notas de seguridad

- No guardes tokens largos ni claves privadas en el repo.
- Si el front necesita acceder a APIs privadas, usa un backend/edge function (no expongas service keys).
