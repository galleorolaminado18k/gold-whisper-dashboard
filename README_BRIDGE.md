# Chatwoot Bridge (API) – Despliegue rápido

Este servicio (`gold-whisper-dashboard/api/`) expone endpoints simples para hablar con Chatwoot sin problemas de CORS.

## 1) Variables requeridas

- CHATWOOT_URL = https://app.chatwoot.com (o tu propia instancia)
- CHATWOOT_API_TOKEN = Token de API (Perfil → Access tokens)
- CHATWOOT_ACCOUNT_ID = 138167 (tu ID de cuenta)
- FRONTEND_URL = https://dashboard.galle18k.com
- ALLOWED_ORIGINS = https://dashboard.galle18k.com

## 2) Secrets en GitHub (repo → Settings → Secrets and variables → Actions)

Agrega:

- FLY_API_TOKEN = token de Fly.io
- CHATWOOT_URL, CHATWOOT_API_TOKEN, CHATWOOT_ACCOUNT_ID
- FRONTEND_URL (opcional, por defecto https://dashboard.galle18k.com)
- ALLOWED_ORIGINS (opcional, por defecto https://dashboard.galle18k.com)

## 3) Ejecutar el workflow

Ve a GitHub → Actions → "Deploy Chatwoot Bridge (Fly.io)" → Run workflow.

Inputs opcionales:
- app_name: gold-whisper-api (por defecto)
- region: dfw (por defecto)

Al terminar, tu bridge estará en: https://APP_NAME.fly.dev

## 4) Probar

- https://APP_NAME.fly.dev/health → { ok: true }
- https://APP_NAME.fly.dev/inboxes → JSON (si las credenciales son correctas)

## 5) Conectar el frontend

En el repo, en Secrets de Actions, añade:

- VITE_CHATWOOT_ENABLED = true
- VITE_CHATWOOT_URL = https://app.chatwoot.com
- VITE_CHATWOOT_WEBSITE_TOKEN = [token del Inbox Website]
- VITE_CHATWOOT_ACCOUNT_ID = 138167
- VITE_BRIDGE_API_URL = https://APP_NAME.fly.dev

Haz un push o ejecuta el workflow de deploy principal para publicar a GitHub Pages.
