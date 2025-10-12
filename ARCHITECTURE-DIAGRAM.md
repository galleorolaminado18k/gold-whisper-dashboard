# Architecture Diagram: Claude AI Integration

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Gold Whisper Dashboard                      │
│                     (React + TypeScript)                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │
        ┌────────────────────────┴────────────────────────┐
        │                                                  │
        ▼                                                  ▼
┌──────────────┐                                  ┌──────────────┐
│   Settings   │                                  │     CRM      │
│     Page     │                                  │   Inbox      │
│              │                                  │              │
│  - Configure │                                  │ - View       │
│  - Validate  │                                  │ - Classify   │
│  - Enable    │                                  │ - Respond    │
└──────┬───────┘                                  └──────┬───────┘
       │                                                  │
       │ Validates & Configures                          │ Uses
       │                                                  │
       ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    src/lib/claude.ts                            │
│                  (Claude AI Service Layer)                      │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ getClaudeConfig()         - Read configuration         │   │
│  │ isClaudeConfigured()      - Check if ready             │   │
│  │ validateClaudeApiKey()    - Test API key               │   │
│  │ classifyConversation()    - AI classification          │   │
│  │ analyzeConversation()     - Sentiment, category, etc.  │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ If enabled
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    src/lib/classifier.ts                        │
│                  (Enhanced Classifier)                          │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ classifyStage()           - Rule-based (original)      │   │
│  │ classifyStageWithAI()     - AI-powered (new)           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│             If Claude enabled:                                  │
│         ┌─────────┐    Fallback on Error    ┌────────────┐    │
│         │   AI    │─────────────────────────→│   Rules    │    │
│         └─────────┘                          └────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │
                                 ▼
                    ┌───────────────────────┐
                    │   Classification      │
                    │   Result              │
                    │                       │
                    │ - por_contestar       │
                    │ - pendiente_datos     │
                    │ - por_confirmar       │
                    │ - pendiente_guia      │
                    │ - pedido_completo     │
                    └───────────────────────┘
```

## Data Flow

### Configuration Flow

```
User Input → Settings UI → Validation → Environment Vars → App Config
                ↓
         [Test Button]
                ↓
    Anthropic API Test Request
                ↓
         [Success/Error]
                ↓
         User Feedback
         (Toast + Alert)
```

### Classification Flow

```
Conversation Messages
        ↓
   classifyStageWithAI()
        ↓
   Check: isClaudeConfigured()
        ↓
    ┌───┴────┐
    │  YES   │  NO
    ↓        ↓
  Claude   Rules
  API      Based
    ↓        ↓
    └───┬────┘
        ↓
   Stage Result
```

## Component Hierarchy

```
src/
├── pages/
│   ├── Settings.tsx ─────────────┐ (New UI - 370+ lines)
│   ├── CRM.tsx                   │ (Uses classifier)
│   └── Advertising.tsx           │ (Uses classifier)
│
├── lib/
│   ├── claude.ts ────────────────┐ (New Service - 223 lines)
│   ├── classifier.ts ─────────────┤ (Enhanced - +27 lines)
│   ├── chatwoot.ts               │ (Existing)
│   └── metaAds.ts                │ (Existing)
│
├── components/
│   └── ui/ ──────────────────────┐ (shadcn/ui components)
│       ├── card.tsx              │ (Used by Settings)
│       ├── input.tsx             │ (Used by Settings)
│       ├── button.tsx            │ (Used by Settings)
│       ├── switch.tsx            │ (Used by Settings)
│       ├── tabs.tsx              │ (Used by Settings)
│       ├── badge.tsx             │ (Used by Settings)
│       └── alert.tsx             │ (Used by Settings)
│
└── .env files
    ├── .env.local.example ───────┐ (New - 41 lines)
    └── .env.production ──────────┤ (Modified - +6 lines)
```

## API Integration

```
┌─────────────────────────────────────────────────────────────┐
│                  Gold Whisper Dashboard                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS POST
                         │ x-api-key: sk-ant-...
                         │ anthropic-version: 2023-06-01
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Anthropic Claude API                           │
│          https://api.anthropic.com/v1/messages              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ JSON Response
                         │ {
                         │   content: [{
                         │     text: "por_contestar"
                         │   }]
                         │ }
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Parse & Validate Result                     │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Environment Variables                            │
│  ├─ VITE_CLAUDE_API_KEY stored in .env.local              │
│  ├─ Never committed to repository                          │
│  └─ .gitignore ensures protection                          │
│                                                             │
│  Layer 2: UI Masking                                       │
│  ├─ Password-style input (type="password")                │
│  ├─ Manual show/hide toggle                               │
│  └─ Value not visible by default                          │
│                                                             │
│  Layer 3: Validation                                       │
│  ├─ Test before enabling                                  │
│  ├─ Verify with Anthropic API                             │
│  └─ Clear error messages                                   │
│                                                             │
│  Layer 4: Secure Transport                                │
│  ├─ HTTPS only                                            │
│  ├─ API key in header (not URL)                           │
│  └─ No key logging                                         │
│                                                             │
│  Layer 5: Fallback System                                 │
│  ├─ Fails gracefully                                      │
│  ├─ Uses rule-based on error                              │
│  └─ System remains functional                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## State Management

```
Settings Component State:
┌──────────────────────────────────────────────────────────┐
│ claudeApiKey: string         (User's API key)           │
│ claudeModel: string          (Model to use)             │
│ claudeEnabled: boolean       (Enable/disable toggle)    │
│ showApiKey: boolean          (Show/hide password)       │
│ isValidating: boolean        (Testing in progress)      │
│ validationResult: object     (Test result)              │
│ hasChanges: boolean          (Unsaved changes)          │
└──────────────────────────────────────────────────────────┘
          │
          │ Updates on user interaction
          │
          ▼
    Environment Check
    (on component mount)
          │
          ▼
  Load current config
  from import.meta.env
```

## Error Handling Flow

```
API Call Attempt
       │
       ▼
Try: Claude API
       │
   ┌───┴────┐
   │  OK    │  ERROR
   ▼        ▼
Success   Catch Error
   │         │
   │         ├─ Log to console
   │         ├─ Show user message
   │         └─ Fallback to rules
   │         
   └────┬────┘
        │
        ▼
   Return Result
```

## Configuration Cascade

```
Priority Order:
1. User Input (Settings UI)
        ↓
2. Environment Variables (.env.local)
        ↓
3. Default Values (in code)
        ↓
4. Fallback Behavior (rule-based)
```

## Deployment Architecture

```
Development:
    .env.local → Local Dev Server → Browser
                    ↓
              Vite Dev Mode
                    ↓
            Hot Module Reload

Production (Vercel):
    Vercel Env Vars → Build Process → Static Files → CDN
                          ↓
                    Environment Variables Embedded
                          ↓
                    Browser (with API key)
```

## File Dependencies

```
Settings.tsx
    ├── imports: claude.ts
    ├── imports: ui components (card, input, button, etc.)
    ├── uses: toast from sonner
    └── uses: lucide-react icons

classifier.ts
    ├── imports: claude.ts
    └── uses: existing CWMessage types

claude.ts
    ├── imports: none (standalone)
    └── uses: fetch API, import.meta.env
```

## Future Architecture (Planned)

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Future)                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Secure key storage in database                    │  │
│  │  - Key encryption at rest                            │  │
│  │  - Usage tracking                                    │  │
│  │  - Rate limiting                                     │  │
│  │  - Cost monitoring                                   │  │
│  │  - Caching layer                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                        │
                        ├─ Dashboard Frontend
                        ├─ Analytics Dashboard
                        └─ Admin Panel
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: 2025-10-12  
**Implementation**: Complete
