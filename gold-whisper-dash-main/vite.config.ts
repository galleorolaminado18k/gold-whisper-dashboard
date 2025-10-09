// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 🔧 Servidor de desarrollo
  server: {
    port: 8081,          // mantenemos tu puerto
    host: "localhost",   // asegura que escuche en localhost (evita problemas de binding)
    strictPort: true,    // si el 8081 está ocupado, falla en vez de cambiar de puerto
    open: false,         // ponlo en true si quieres que abra el navegador automáticamente
    cors: true,          // CORS habilitado por si consumes APIs locales
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 8081,
    },
  },

  // 🔧 Vista previa de build: npm run build && npm run preview
  preview: {
    port: 8082,          // puerto de preview
    host: "localhost",
    strictPort: true,
    cors: true,
  },
});
