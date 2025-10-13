# Settings UI - Visual Guide

## 🎨 Settings Page Overview

The Settings page has been completely redesigned with a modern, tabbed interface.

### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Configuración                                               │
│ Administra la configuración del sistema y las integraciones │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✨ Inteligencia Artificial] [General] [Integraciones]  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Tab 1: Inteligencia Artificial (AI Configuration)

### Main Card: Claude AI (Anthropic)

```
┌──────────────────────────────────────────────────────────────────┐
│ ✨ Claude AI (Anthropic)                    [✓ Configurado]     │
│ Configura la integración con Claude AI para clasificación       │
│ inteligente de conversaciones                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ℹ Claude AI no está configurado                            │  │
│ │ Para habilitar clasificación inteligente de conversaciones,│  │
│ │ configura tu API key de Anthropic.                         │  │
│ │ Obtén tu clave en: https://console.anthropic.com/...      │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Habilitar Claude AI                            [ON/OFF]     │  │
│ │ Usa IA para mejorar la clasificación de conversaciones     │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ────────────────────────────────────────────────────────────    │
│                                                                  │
│ 🔑 API Key                                                      │
│ ┌────────────────────────────────────────────┬──────────────┐  │
│ │ sk-ant-api03-...                [👁]       │ [🧪 Probar]  │  │
│ └────────────────────────────────────────────┴──────────────┘  │
│ Tu API key se almacena de forma segura y solo se usa para     │
│ llamadas a la API de Claude                                    │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ✓ API Key Válida                                           │  │
│ │ La conexión con Claude AI fue exitosa.                    │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ Modelo                                                          │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ claude-3-5-sonnet-20241022                                 │  │
│ └────────────────────────────────────────────────────────────┘  │
│ Modelo recomendado: claude-3-5-sonnet-20241022                │
│                                                                  │
│ ────────────────────────────────────────────────────────────    │
│                                                                  │
│                                          [💾 Guardar Configuración]│
└──────────────────────────────────────────────────────────────────┘
```

### Features Card

```
┌──────────────────────────────────────────────────────────────────┐
│ Características de Claude AI                                    │
│ Funcionalidades disponibles cuando Claude AI está habilitado   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ✓ Clasificación Inteligente de Conversaciones                  │
│   Clasifica automáticamente las conversaciones en las etapas   │
│   correctas del embudo de ventas                                │
│                                                                  │
│ ✓ Análisis de Sentimiento                                      │
│   Detecta el tono y sentimiento de las conversaciones con      │
│   los clientes                                                  │
│                                                                  │
│ ✓ Categorización Automática                                    │
│   Identifica automáticamente si el interés es en joyería o    │
│   balinería                                                     │
│                                                                  │
│ ✓ Resúmenes de Conversaciones                                  │
│   Genera resúmenes concisos de conversaciones largas          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## UI Components Used

### 1. Status Badge
```tsx
<Badge variant="default" className="bg-green-500">
  <CheckCircle2 className="w-3 h-3 mr-1" />
  Configurado
</Badge>
```

### 2. Enable/Disable Switch
```tsx
<Switch
  id="claude-enabled"
  checked={claudeEnabled}
  onCheckedChange={setClaudeEnabled}
/>
```

### 3. API Key Input with Toggle
```tsx
<Input
  type={showApiKey ? "text" : "password"}
  value={claudeApiKey}
  onChange={(e) => setClaudeApiKey(e.target.value)}
  placeholder="sk-ant-api03-..."
/>
<Button onClick={() => setShowApiKey(!showApiKey)}>
  {showApiKey ? <EyeOff /> : <Eye />}
</Button>
```

### 4. Validation Button
```tsx
<Button onClick={handleValidateApiKey} disabled={!claudeApiKey || isValidating}>
  {isValidating ? (
    <><Loader2 className="animate-spin" /> Validando...</>
  ) : (
    <><TestTube /> Probar</>
  )}
</Button>
```

### 5. Alert Components
```tsx
// Success Alert
<Alert variant="default">
  <CheckCircle2 className="h-4 w-4" />
  <AlertTitle>API Key Válida</AlertTitle>
  <AlertDescription>
    La conexión con Claude AI fue exitosa.
  </AlertDescription>
</Alert>

// Error Alert
<Alert variant="destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>Error de Validación</AlertTitle>
  <AlertDescription>
    {validationResult.error}
  </AlertDescription>
</Alert>
```

## States and Interactions

### 1. Initial State (Not Configured)
- API key input is empty
- Enable switch is OFF
- Alert shows "Claude AI no está configurado"
- Test button is disabled
- Save button is disabled

### 2. API Key Entered
- API key input has text (masked)
- Eye icon allows showing/hiding
- Test button becomes enabled
- Save button becomes enabled (has changes)

### 3. Testing API Key
- Test button shows spinner: "Validando..."
- Button is disabled during validation
- After ~2-3 seconds, shows result

### 4. Valid API Key
- Green success alert appears
- Toast notification: "✅ API key válida..."
- Badge changes to "Configurado"

### 5. Invalid API Key
- Red error alert appears
- Toast notification: "❌ API key inválida..."
- Error message explains the problem

### 6. Enabled State
- Switch is ON
- System will use Claude for classification
- All features are active

## Color Scheme

### Status Colors
- **Green** (`bg-green-500`): Configured, Active, Success
- **Red** (`destructive`): Error, Invalid
- **Blue** (`bg-blue-50`): Active tab, Hover states
- **Purple** (`text-purple-500`): AI/Sparkles icon
- **Gray** (`bg-gray-50`): Background sections

### Icons Used
| Icon | Usage | Library |
|------|-------|---------|
| ✨ Sparkles | AI/Intelligence indicator | lucide-react |
| 🔑 Key | API Key field | lucide-react |
| ✓ CheckCircle2 | Success states | lucide-react |
| ✗ XCircle | Error states | lucide-react |
| ⟳ Loader2 | Loading states | lucide-react |
| ℹ AlertCircle | Information alerts | lucide-react |
| 💾 Save | Save button | lucide-react |
| 👁 Eye/EyeOff | Show/hide password | lucide-react |
| 🧪 TestTube | Test/Validate button | lucide-react |

## Responsive Design

The layout is fully responsive:
- **Desktop**: Full width cards with proper spacing
- **Tablet**: Stacked layout maintained
- **Mobile**: Single column, touch-friendly buttons

## Accessibility

- ✓ Proper label associations
- ✓ ARIA attributes for switches
- ✓ Keyboard navigation support
- ✓ Screen reader friendly
- ✓ High contrast colors
- ✓ Focus indicators

## Toast Notifications

Used for user feedback:

```javascript
// Success
toast.success("✅ API key válida y funcionando correctamente");

// Error
toast.error("❌ API key inválida: {error}");

// Info
toast.info("⚠️ Para aplicar los cambios...", { duration: 6000 });
```

## Code Organization

### State Management
```typescript
const [claudeApiKey, setClaudeApiKey] = useState("");
const [claudeModel, setClaudeModel] = useState("...");
const [claudeEnabled, setClaudeEnabled] = useState(false);
const [showApiKey, setShowApiKey] = useState(false);
const [isValidating, setIsValidating] = useState(false);
const [validationResult, setValidationResult] = useState(null);
const [hasChanges, setHasChanges] = useState(false);
```

### Effects
```typescript
// Load configuration on mount
useEffect(() => { ... }, []);

// Track changes for Save button
useEffect(() => { ... }, [claudeApiKey, claudeModel, claudeEnabled]);
```

### Handlers
```typescript
handleValidateApiKey() // Test API key
handleSave()           // Save configuration
```

## Best Practices Implemented

1. **Loading States**: Show spinner during async operations
2. **Disabled States**: Prevent actions when invalid
3. **Error Handling**: Clear, helpful error messages
4. **Success Feedback**: Multiple confirmation methods (alert + toast)
5. **Progressive Disclosure**: Show relevant info at the right time
6. **Helpful Hints**: Tooltips and descriptions throughout
7. **Security**: Password-style inputs for sensitive data
8. **Validation**: Test before save
9. **Change Tracking**: Only enable save when needed
10. **External Links**: Direct users to relevant documentation

---

**Page**: Settings → Inteligencia Artificial  
**Route**: `/settings`  
**Component**: `src/pages/Settings.tsx`  
**Total Lines**: 370+
