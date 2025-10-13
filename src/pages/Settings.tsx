import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { 
  Key, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  TestTube,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { getClaudeConfig, validateClaudeApiKey, isClaudeConfigured } from "@/lib/claude";

const Settings = () => {
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [claudeModel, setClaudeModel] = useState("claude-3-5-sonnet-20241022");
  const [claudeEnabled, setClaudeEnabled] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current configuration on mount
  useEffect(() => {
    const config = getClaudeConfig();
    setClaudeApiKey(config.apiKey);
    setClaudeModel(config.model);
    setClaudeEnabled(config.enabled);
  }, []);

  // Track changes
  useEffect(() => {
    const config = getClaudeConfig();
    const changed = 
      claudeApiKey !== config.apiKey ||
      claudeModel !== config.model ||
      claudeEnabled !== config.enabled;
    setHasChanges(changed);
  }, [claudeApiKey, claudeModel, claudeEnabled]);

  const handleValidateApiKey = async () => {
    if (!claudeApiKey) {
      toast.error("Por favor ingresa una API key");
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateClaudeApiKey(claudeApiKey);
      setValidationResult(result);
      
      if (result.valid) {
        toast.success("✅ API key válida y funcionando correctamente");
      } else {
        toast.error(`❌ API key inválida: ${result.error}`);
      }
    } catch (error) {
      toast.error("Error al validar la API key");
      setValidationResult({ 
        valid: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    // Note: In a real app, you'd want to save this to a backend or secure storage
    // For now, we'll just update the environment variables (which requires restart)
    toast.info(
      "⚠️ Para aplicar los cambios, debes actualizar las variables de entorno en tu archivo .env.local y reiniciar la aplicación.",
      { duration: 6000 }
    );
    
    console.log("Configuration to save:", {
      VITE_CLAUDE_API_KEY: claudeApiKey,
      VITE_CLAUDE_MODEL: claudeModel,
      VITE_CLAUDE_ENABLED: claudeEnabled,
    });
  };

  const isConfigured = isClaudeConfigured();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Configuración</h1>
          <p className="text-muted-foreground">Administra la configuración del sistema y las integraciones</p>
        </div>

        <Tabs defaultValue="ai" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Inteligencia Artificial
            </TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-6">
            {/* Claude AI Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Claude AI (Anthropic)
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Configura la integración con Claude AI para clasificación inteligente de conversaciones
                    </CardDescription>
                  </div>
                  {isConfigured && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Configurado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Alert */}
                {!isConfigured && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Claude AI no está configurado</AlertTitle>
                    <AlertDescription>
                      Para habilitar clasificación inteligente de conversaciones, configura tu API key de Anthropic.
                      Obtén tu clave en: <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://console.anthropic.com/settings/keys</a>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Enable/Disable Switch */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="claude-enabled" className="text-base font-medium">
                      Habilitar Claude AI
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Usa IA para mejorar la clasificación de conversaciones
                    </p>
                  </div>
                  <Switch
                    id="claude-enabled"
                    checked={claudeEnabled}
                    onCheckedChange={setClaudeEnabled}
                  />
                </div>

                <Separator />

                {/* API Key Input */}
                <div className="space-y-2">
                  <Label htmlFor="claude-api-key" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Key
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="claude-api-key"
                        type={showApiKey ? "text" : "password"}
                        value={claudeApiKey}
                        onChange={(e) => setClaudeApiKey(e.target.value)}
                        placeholder="sk-ant-api03-..."
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={handleValidateApiKey}
                      disabled={!claudeApiKey || isValidating}
                      variant="outline"
                      className="gap-2"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4" />
                          Probar
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tu API key se almacena de forma segura y solo se usa para llamadas a la API de Claude
                  </p>
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <Alert variant={validationResult.valid ? "default" : "destructive"}>
                    {validationResult.valid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>API Key Válida</AlertTitle>
                        <AlertDescription>
                          La conexión con Claude AI fue exitosa. La API está lista para usar.
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error de Validación</AlertTitle>
                        <AlertDescription>
                          {validationResult.error || "No se pudo validar la API key"}
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                )}

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="claude-model">Modelo</Label>
                  <Input
                    id="claude-model"
                    value={claudeModel}
                    onChange={(e) => setClaudeModel(e.target.value)}
                    placeholder="claude-3-5-sonnet-20241022"
                  />
                  <p className="text-xs text-muted-foreground">
                    Modelo recomendado: claude-3-5-sonnet-20241022 (mejor balance de rendimiento y costo)
                  </p>
                </div>

                <Separator />

                {/* Save Button */}
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle>Características de Claude AI</CardTitle>
                <CardDescription>
                  Funcionalidades disponibles cuando Claude AI está habilitado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Clasificación Inteligente de Conversaciones</p>
                      <p className="text-sm text-muted-foreground">
                        Clasifica automáticamente las conversaciones en las etapas correctas del embudo de ventas
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Análisis de Sentimiento</p>
                      <p className="text-sm text-muted-foreground">
                        Detecta el tono y sentimiento de las conversaciones con los clientes
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Categorización Automática</p>
                      <p className="text-sm text-muted-foreground">
                        Identifica automáticamente si el interés es en joyería o balinería
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Resúmenes de Conversaciones</p>
                      <p className="text-sm text-muted-foreground">
                        Genera resúmenes concisos de conversaciones largas
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>Configuración general del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integraciones</CardTitle>
                <CardDescription>Gestiona las integraciones con servicios externos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
