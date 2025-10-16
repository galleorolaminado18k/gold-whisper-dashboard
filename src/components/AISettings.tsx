import { useState, useEffect } from 'react';
import { Settings, X, Check, ExternalLink } from 'lucide-react';
import { getAIConfig, saveAIConfig, AVAILABLE_MODELS } from '../lib/gemini';

export function AISettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [model, setModel] = useState('gemini-2.0-flash-exp');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [ciScore, setCiScore] = useState<number>(145);

  // Cargar configuración al montar
  useEffect(() => {
    const config = getAIConfig();
    setProvider(config.provider);
    setModel(config.model);
    setApiKey(config.apiKey);
    try {
      const stored = localStorage.getItem('ai_ci_score');
      if (stored) {
        const v = Number(stored);
        if (Number.isFinite(v) && v > 0) setCiScore(v);
      } else {
        const envVal = Number(import.meta.env.VITE_AI_CI_SCORE);
        if (Number.isFinite(envVal) && envVal > 0) setCiScore(envVal);
      }
    } catch {}
  }, []);

  const handleSave = () => {
    saveAIConfig({ provider, model, apiKey });
    try {
      localStorage.setItem('ai_ci_score', String(ciScore));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getAPIKeyLink = () => {
    switch (provider) {
      case 'gemini':
        return 'https://makersuite.google.com/app/apikey';
      case 'openai':
        return 'https://platform.openai.com/api-keys';
      case 'anthropic':
        return 'https://console.anthropic.com/settings/keys';
      default:
        return '#';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
          title="Ajustes de IA"
        >
          <Settings className="w-6 h-6" />
        </button>
      )}

      {/* Panel de ajustes */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              Ajustes IA
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Provider selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor de IA
            </label>
            <select
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value as 'gemini' | 'openai' | 'anthropic';
                setProvider(newProvider);
                setModel(AVAILABLE_MODELS[newProvider][0]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          {/* Model selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modelo
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {AVAILABLE_MODELS[provider].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* API Key input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Tu API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <a
              href={getAPIKeyLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-700 mt-1 inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Obtener API key
            </a>
          </div>

          {/* CI Score selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coeficiente Intelectual (CI) deseado
            </label>
            <select
              value={ciScore}
              onChange={(e) => setCiScore(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={130}>130 — Analítico y claro</option>
              <option value={145}>145 — Rigor alto (recomendado)</option>
              <option value={160}>160 — Máxima precisión</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Afecta el tono y estructura del razonamiento en insights y gráficos (más riguroso y cuantitativo a mayor CI).
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Guardado
              </>
            ) : (
              'Guardar Configuración'
            )}
          </button>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-600">
            <p className="font-medium text-gray-900 mb-1">ℹ️ Información</p>
            <p>
              Los ajustes se guardan en tu navegador. Cada proveedor requiere su propia API key.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
