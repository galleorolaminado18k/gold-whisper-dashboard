// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // ⬅️ importante

const redirectPath = sessionStorage.getItem('redirectAfterReload');
if (redirectPath) {
  sessionStorage.removeItem('redirectAfterReload');
  window.history.replaceState(null, '', redirectPath);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
