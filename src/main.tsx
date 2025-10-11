import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initChatwootWidget } from "@/lib/chatwootWidget";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Inicializa Chatwoot (si está habilitado por ENV)
initChatwootWidget();
