// api/chatwoot.js
// Servidor puente entre tu dashboard y Chatwoot

import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

/* ========= CORS Configuration ========= */
// Permite localhost para desarrollo y dominios de producción desde variables de entorno
const allowedOrigins = [
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

// Añadir orígenes de producción desde variables de entorno
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Añadir orígenes adicionales separados por coma
if (process.env.ALLOWED_ORIGINS) {
  const additionalOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  allowedOrigins.push(...additionalOrigins);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como curl, Postman, apps móviles)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`⚠️  Origen bloqueado por CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

// Preflight para navegadores
app.options("*", cors());

app.use(express.json());

/* ========= Configuración de Chatwoot =========
   Usa variables de entorno o los valores configurados */
const CHATWOOT_URL =
  process.env.CHATWOOT_URL || "http://localhost:3020"; // URL base de Chatwoot
const CHATWOOT_API_TOKEN =
  process.env.CHATWOOT_API_TOKEN || "LKLQSw2D5AtCoyFBVEAmUwFM"; // API access token
const CHATWOOT_ACCOUNT_ID =
  Number(process.env.CHATWOOT_ACCOUNT_ID) || 1; // ID de cuenta
// =====================================

// Helper para asegurar path con "/"
const withSlash = (p = "") => (p.startsWith("/") ? p : `/${p}`);

// Helper generico para llamar a Chatwoot
async function cw(path, opts = {}) {
  const res = await fetch(`${CHATWOOT_URL}${withSlash(path)}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      api_access_token: CHATWOOT_API_TOKEN,
      ...(opts.headers || {}),
    },
    // timeout rudimentario vía AbortController (opcional)
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Chatwoot ${res.status} ${res.statusText} -> ${path}\n${text}`.slice(
        0,
        1000
      )
    );
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

/* ----- Normalizadores de respuesta (no se quita nada) ----- */

// Conversaciones: dejamos shape { meta, payload } para UI
function normalizeConversations(json) {
  const src = json?.data ? json.data : json;
  return {
    meta:
      src?.meta ?? {
        mine_count: 0,
        assigned_count: 0,
        unassigned_count: 0,
        all_count: 0,
      },
    payload: Array.isArray(src?.payload) ? src.payload : Array.isArray(src) ? src : [],
  };
}

// Mensajes: devolvemos SIEMPRE array plano []
function normalizeMessages(json) {
  const src = json?.data ? json.data : json;
  if (Array.isArray(src)) return src;
  if (Array.isArray(src?.payload)) return src.payload;
  return [];
}

/* -------------------- Endpoints -------------------- */

// Raíz informativa (sólo agregado; no interfiere)
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "chatwoot-bridge",
    chatwoot_url: CHATWOOT_URL,
    account_id: CHATWOOT_ACCOUNT_ID,
    endpoints: ["/health", "/conversations", "/conversations/:id/messages", "/send-message", "/inboxes"],
  });
});

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "chatwoot-bridge" });
});

// 🔹 Listar conversaciones de la cuenta
app.get(["/conversations", "/api/conversaciones"], async (_req, res) => {
  try {
    const raw = await cw(`/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`);
    const data = normalizeConversations(raw);
    res.json(data);
  } catch (err) {
    console.error("❌ /conversations error:", err.message);
    res.status(500).json({ error: "Error al obtener conversaciones" });
  }
});

// 🔹 Listar mensajes de una conversación (array plano)
app.get("/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const raw = await cw(
      `/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${id}/messages`
    );
    const messages = normalizeMessages(raw);
    res.json(messages);
  } catch (err) {
    console.error("❌ /conversations/:id/messages error:", err.message);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

// 🔹 Enviar mensaje a una conversación
app.post("/send-message", async (req, res) => {
  try {
    const { conversation_id, content } = req.body;
    if (!conversation_id || !content) {
      return res
        .status(400)
        .json({ error: "conversation_id y content son requeridos" });
    }

    const r = await cw(
      `/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversation_id}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content,
          message_type: "outgoing",
        }),
      }
    );

    res.json(r);
  } catch (err) {
    console.error("❌ /send-message error:", err.message);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
});

/* 🔹 Endpoint extra útil para validar credenciales (suma, no reemplaza nada)
   Lista inboxes del account: si esto responde, el token es correcto. */
app.get("/inboxes", async (_req, res) => {
  try {
    const data = await cw(`/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/inboxes`);
    res.json(data);
  } catch (err) {
    console.error("❌ /inboxes error:", err.message);
    res.status(500).json({ error: "Error al obtener inboxes" });
  }
});

/* ----- Manejador de errores genérico (agregado) ----- */
app.use((err, _req, res, _next) => {
  console.error("❌ Unhandled error:", err?.message || err);
  res.status(500).json({ error: "Error interno" });
});

// ---------------------------------------------------

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`✅ API Chatwoot lista en http://localhost:${PORT}`);
});
