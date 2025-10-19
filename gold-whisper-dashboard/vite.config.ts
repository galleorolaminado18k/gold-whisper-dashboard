// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Con dominio personalizado (dashboard.galle18k.com), la base debe ser '/'
const base = process.env.VITE_ASSET_BASE?.trim()
  ? process.env.VITE_ASSET_BASE
  : "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 🔧 Servidor de desarrollo
  server: {
    port: 8081,
    host: "0.0.0.0",     // escucha en todas las interfaces
    strictPort: true,
    open: false,
    cors: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 8081,
    },
    // Permitir acceso desde el dominio
    allowedHosts: [
      "dashboard.galle18k.com",
      "85.31.235.37",
      "localhost"
    ]
  },

  // 🔧 Vista previa de build: npm run build && npm run preview
  preview: {
    port: 8082,          // puerto de preview
    host: "localhost",
    strictPort: false,   // permite elegir siguiente puerto libre
    cors: true,
  },
});
