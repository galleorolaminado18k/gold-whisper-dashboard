// Flat ESLint config for ESLint v9+
// Minimal, TypeScript-friendly, Vite/React project
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  // Ignorar rutas y artefactos que no queremos lintar desde el root
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".vite/**",
      "public/**",
      "gold-whisper-dashboard/**",
      "**/*.min.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Reglas/entorno para archivos JS comunes del proyecto (config, scripts)
  {
    files: ["**/*.{js,cjs,mjs}", "*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // En proyectos Vite/React se ejecuta en browser y en Node (scripts/config)
      "no-undef": "off",
      // Relajar expresiones vacías que suelen aparecer en configs
      "no-unused-expressions": "warn",
      // Estilo
      "prefer-const": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React Fast Refresh constraint
      "react-refresh/only-export-components": "warn",

      // React hooks best practices
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // TS ergonomics
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      // Permitir patrones JSX comunes como cond && <Comp/> o cond ? A : B
      "@typescript-eslint/no-unused-expressions": [
        "warn",
        { "allowShortCircuit": true, "allowTernary": true, "allowTaggedTemplates": true }
      ],

      // Keep it pragmatic for now; we can tighten later
      "no-console": "off",
      "no-undef": "off",
      // Permitir catch vacío (útil para parseos resilientes)
      "no-empty": ["error", { "allowEmptyCatch": true }],
      // Preferencias de estilo menos estrictas
      "prefer-const": "warn",
    },
  },
];
