# Copilot Instructions: Gold Whisper Dashboard

## Project Overview

**Gold Whisper Dashboard** is a comprehensive CRM and analytics platform for Galle 18K jewelry business. It integrates Chatwoot conversations, Meta Ads campaigns, AI-powered analytics (Gemini), and customer lifecycle management from initial contact through delivery.

**Tech Stack:** React 18 + TypeScript, Vite, TanStack Query, Supabase (auth + data), shadcn/ui, Tailwind CSS, Recharts

**Business Domain:** Colombian jewelry e-commerce (oro laminado 18K + balinería premium) with WhatsApp/Instagram sales flow

## Architecture & Key Components

### 1. Authentication System (`src/contexts/AuthContext.tsx`)

- **Dual-mode auth**: Supabase (production) + fallback mock auth (development)
- Controlled via `VITE_ENABLE_FALLBACK_AUTH` env var
- Protected routes use `<ProtectedRoute>` wrapper
- Session persists in localStorage with auto-refresh

### 2. Supabase Integration (`src/integrations/supabase/`)

- Client initialized in `client.ts` with URL validation fallback
- Default URL: `https://evjgujiyjplvbudgfiwr.supabase.co`
- Types auto-generated in `types.ts`
- **Critical env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### 3. CRM System (Two Views)

**Traditional CRM** (`src/pages/CRM.tsx`):
- Table-based with stage tabs
- Uses `src/lib/crmStages.ts` for stage definitions

**Inbox-style CRM** (`src/pages/CRMInbox.tsx`):
- 3-panel layout: conversations list, messages, customer details
- **Stage classifier** (`src/lib/classifier.ts`) auto-categorizes conversations:
  - `por_contestar` → unanswered customer messages
  - `pendiente_datos` → waiting for shipping/payment info
  - `por_confirmar` → order confirmation pending
  - `pendiente_guia` → waiting for tracking number
  - `pedido_completo` → fulfilled orders
- Classifier uses regex patterns + message history analysis

### 4. Chatwoot Bridge (`src/lib/chatwoot.ts`)

- Bridge API proxies Chatwoot to avoid CORS: `VITE_BRIDGE_API_URL` (default: `http://localhost:4000`)
- **Key functions**: `fetchConversations()`, `fetchMessages()`, `sendMessage()`
- Normalizes message types: `0/"incoming"` = customer, `1/"outgoing"` = agent
- Config: `VITE_CHATWOOT_URL`, `VITE_CHATWOOT_WEBSITE_TOKEN`, `VITE_CHATWOOT_ACCOUNT_ID`

### 5. AI Analytics (`src/lib/gemini.ts`)

- Multi-provider support: Gemini (default), OpenAI, Anthropic
- Config stored in localStorage + fallback to `VITE_GEMINI_API_KEY`
- System prompt tuned for jewelry marketing analysis (ROAS, CVR, CPC benchmarks)
- Used in `src/pages/AIAnalytics.tsx` for campaign insights

### 6. Meta Ads Integration (`src/lib/metaAds.ts`)

- Fetch campaigns, ad sets, insights from Facebook Marketing API
- **Key types**: `MetaCampaign`, `MetaInsights`, `MetaAdSet`
- ROAS/CVR calculations with AOV (average order value) from env:
  - `VITE_DEFAULT_AOV` = 285000 COP
  - `VITE_AOV_BALINERIA`, `VITE_AOV_JOYERIA` for product-specific values

### 7. Dashboard Components (`src/components/dashboard/`)

- **Recharts-based visualizations**: `CampaignPerformance`, `ConversationFunnel`, `PaymentMix`, `DeliveryStats`
- **Time-range scaling**: Most components support dynamic day ranges (1-30 days) with proportional data scaling
- **KPICard pattern**: Reusable metric display with trend indicators

### 8. UI Components (`src/components/ui/`)

- **shadcn/ui** components configured via `components.json`
- Tailwind CSS variables in `src/index.css` define theme colors
- Custom utilities: `cn()` function in `src/lib/utils.ts` merges Tailwind classes

## Development Workflows

### Local Development

```bash
npm run dev          # Start Vite dev server on port 8081
npm run build        # Production build to dist/
npm run preview      # Preview build on port 8082
```

### Environment Configuration

Create `.env` with required variables:

```env
# Supabase (required for production)
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Chatwoot Bridge
VITE_BRIDGE_API_URL=http://localhost:4000
VITE_CHATWOOT_URL=http://localhost:3020
VITE_CHATWOOT_WEBSITE_TOKEN=token
VITE_CHATWOOT_ACCOUNT_ID=1

# AI (optional)
VITE_GEMINI_API_KEY=your-key

# Fallback Auth (development only)
VITE_ENABLE_FALLBACK_AUTH=true
VITE_FALLBACK_AUTH_EMAIL=demo@example.com
VITE_FALLBACK_ALLOWED_EMAILS=demo@example.com,test@example.com

# Business Metrics
VITE_DEFAULT_AOV=285000
VITE_AOV_BALINERIA=195000
VITE_AOV_JOYERIA=375000
```

### Deployment

- **Netlify/Vercel**: Build command `npm run build`, publish directory `dist/`
- **Docker**: Multi-service setup in `docker-compose.yml` includes Chatwoot + PostgreSQL + Redis
- **Hostinger VPS**: Shell scripts for deployment (`hostinger-deploy.sh`, `deploy-dashboard-24-7.sh`)

## Project Conventions

### File Structure

- `src/pages/` → Full-page route components (exported as default)
- `src/components/` → Reusable UI (use named exports for non-page components)
- `src/lib/` → Business logic, API clients, utilities
- `src/contexts/` → React context providers (Auth, etc.)
- `src/hooks/` → Custom React hooks

### Naming Patterns

- **Components**: PascalCase files, named exports (`KPICard.tsx` → `export function KPICard()`)
- **Utilities**: camelCase (`utils.ts`, `chatwoot.ts`)
- **Types**: PascalCase with descriptive suffixes (`CWMessage`, `MetaCampaign`, `CRMStageId`)

### Data Flow

1. **TanStack Query** for server state (conversations, campaigns)
2. **React Context** for global auth state
3. **localStorage** for AI config, fallback auth sessions
4. **Props drilling** acceptable for dashboard visualizations (avoid over-abstracting)

### Styling Approach

- **Tailwind-first**: Use utility classes, avoid custom CSS
- **Theme variables**: Leverage CSS variables (`hsl(var(--primary))`) for consistent theming
- **shadcn/ui patterns**: Always import from `@/components/ui/[component]`
- **Animations**: Use `tailwindcss-animate` classes (`animate-fade-in`, etc.)

## Critical Patterns

### Message Type Handling

Chatwoot APIs return inconsistent message types (string vs number). Always normalize:

```typescript
function toMsgType(v: unknown): "incoming" | "outgoing" | undefined {
  if (v === 0 || v === "0" || v === "incoming") return "incoming";
  if (v === 1 || v === "1" || v === "outgoing") return "outgoing";
  return undefined;
}
```

### Stage Classification Logic

The CRM classifier (`src/lib/classifier.ts`) uses regex-based heuristics. When modifying:
- Test with Spanish text (Colombian dialect: "dirección", "barrio", "cédula")
- Consider message order (last message direction matters)
- Account for partial data collection (phone without barrio, etc.)

### Path Aliases

TypeScript/Vite configured with these aliases (see `vite.config.ts`, `tsconfig.json`):
- `@/` or `@src/` → `src/`

Always use aliases for imports, never relative paths beyond siblings.

### Error Handling

- Supabase client validates URL format; falls back to default if invalid
- Auth system supports fallback mode when Supabase unavailable
- API calls from `src/lib/` should return null/empty arrays on error (avoid throwing)

## Testing & Debugging

- **Console warnings**: Check for Supabase URL validation messages
- **TanStack Query DevTools**: Available in dev mode for query inspection
- **Stage classification**: Test classifier with `classifyStage(messages)` in browser console
- **Environment issues**: Verify `import.meta.env.VITE_*` values in browser console

## Common Gotchas

1. **Wasp file** (`main.wasp`) is legacy artifact—ignore it, project uses Vite + React Router
2. **Duplicate folders**: `gold-whisper-dashboard/` subfolder is old version—work in root
3. **TypeScript strict mode OFF**: `tsconfig.json` has `strict: false` for gradual typing
4. **Hot reload**: Vite HMR configured for `localhost:8081` WebSocket—VPS deployments need nginx proxy
5. **Colombian business logic**: Currency is COP (pesos), phone format is 10 digits, cities matter for delivery

## External Dependencies

- **Chatwoot**: Self-hosted customer communication platform (Docker image)
- **Meta Business API**: Facebook/Instagram ad campaign data (requires Business Manager access)
- **Supabase**: Backend-as-a-Service for auth + PostgreSQL
- **Google Generative AI**: Gemini models for campaign analysis

## What to Avoid

- Don't create new utility functions in components—extract to `src/lib/`
- Don't use `any` type—use `unknown` + type guards or specific types
- Don't bypass path aliases with `../../../` imports
- Don't add new env vars without `VITE_` prefix (Vite won't expose them)
- Don't modify `src/components/ui/` components directly—override via className prop
