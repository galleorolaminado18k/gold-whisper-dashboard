// Cloudflare Worker: Free Chatwoot Bridge (CORS + token hidden)
// Endpoints:
//  - GET    /health
//  - GET    /conversations
//  - GET    /conversations/:id/messages
//  - POST   /send-message { conversation_id, content }
//  - GET    /inboxes

const textJson = (obj) => new Response(JSON.stringify(obj), {
  status: 200,
  headers: { 'content-type': 'application/json; charset=utf-8' },
});

function withCors(resp, origin) {
  const r = new Response(resp.body, resp);
  r.headers.set('Access-Control-Allow-Credentials', 'true');
  r.headers.set('Access-Control-Expose-Headers', 'X-Total-Count, Link');
  if (origin) r.headers.set('Access-Control-Allow-Origin', origin);
  return r;
}

function isAllowedOrigin(origin, ALLOWED) {
  if (!origin) return true; // allow tools like curl
  try {
    const list = (ALLOWED || '').split(',').map((v) => v.trim()).filter(Boolean);
    if (list.length === 0) return true; // allow all if not configured
    return list.includes(origin);
  } catch {
    return false;
  }
}

const withSlash = (p = '') => (p.startsWith('/') ? p : `/${p}`);

async function cw(env, path, init = {}) {
  const url = `${env.CHATWOOT_URL}${withSlash(path)}`;
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');
  headers.set('api_access_token', env.CHATWOOT_API_TOKEN);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    return new Response(
      `Chatwoot ${res.status} ${res.statusText} -> ${path}\n${txt}`.slice(0, 1000),
      { status: 502, headers: { 'content-type': 'text/plain' } }
    );
  }
  return res;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // CORS preflight
    if (request.method === 'OPTIONS') {
      if (!isAllowedOrigin(origin, env.ALLOWED_ORIGINS)) {
        return new Response('CORS', { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'content-type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (!isAllowedOrigin(origin, env.ALLOWED_ORIGINS)) {
      return new Response('CORS', { status: 403 });
    }

    // Health
    if (url.pathname === '/' || url.pathname === '/health') {
      const resp = textJson({ ok: true, service: 'chatwoot-worker', account_id: env.CHATWOOT_ACCOUNT_ID });
      return withCors(resp, origin || '*');
    }

    // GET /conversations (propaga querystring para filtros: labels, page, etc.)
    if (url.pathname === '/conversations') {
      const qs = url.search || '';
      const resp = await cw(
        env,
        `/api/v1/accounts/${env.CHATWOOT_ACCOUNT_ID}/conversations${qs}`
      );
      return withCors(resp, origin || '*');
    }

    // GET /conversations/:id/messages
    const msgMatch = url.pathname.match(/^\/conversations\/(\d+)\/messages$/);
    if (request.method === 'GET' && msgMatch) {
      const id = msgMatch[1];
      const resp = await cw(env, `/api/v1/accounts/${env.CHATWOOT_ACCOUNT_ID}/conversations/${id}/messages`);
      return withCors(resp, origin || '*');
    }

    // POST /conversations/:id/labels  (agregar etiquetas)
    const postLabels = url.pathname.match(/^\/conversations\/(\d+)\/labels$/);
    if (request.method === 'POST' && postLabels) {
      const id = postLabels[1];
      const body = await request.json().catch(() => ({}));
      const resp = await cw(
        env,
        `/api/v1/accounts/${env.CHATWOOT_ACCOUNT_ID}/conversations/${id}/labels`,
        { method: 'POST', body: JSON.stringify({ labels: body.labels || [] }) }
      );
      return withCors(resp, origin || '*');
    }

    // DELETE /conversations/:id/labels/:label (quitar etiqueta)
    const delLabels = url.pathname.match(/^\/conversations\/(\d+)\/labels\/(.+)$/);
    if (request.method === 'DELETE' && delLabels) {
      const id = delLabels[1];
      const label = decodeURIComponent(delLabels[2]);
      const resp = await cw(
        env,
        `/api/v1/accounts/${env.CHATWOOT_ACCOUNT_ID}/conversations/${id}/labels/${encodeURIComponent(label)}`,
        { method: 'DELETE' }
      );
      return withCors(resp, origin || '*');
    }

    // POST /send-message
    if (request.method === 'POST' && url.pathname === '/send-message') {
      const body = await request.json().catch(() => ({}));
      if (!body.conversation_id || !body.content) {
        return withCors(new Response(JSON.stringify({ error: 'conversation_id y content requeridos' }), { status: 400, headers: { 'content-type': 'application/json' } }), origin || '*');
      }
      const resp = await cw(
        env,
        `/api/v1/accounts/${env.CHATWOOT_ACCOUNT_ID}/conversations/${body.conversation_id}/messages`,
        { method: 'POST', body: JSON.stringify({ content: body.content, message_type: 'outgoing' }) }
      );
      return withCors(resp, origin || '*');
    }

    // GET /inboxes
    if (request.method === 'GET' && url.pathname === '/inboxes') {
      const resp = await cw(env, `/api/v1/accounts/${env.CHATWOOT_ACCOUNT_ID}/inboxes`);
      return withCors(resp, origin || '*');
    }

    return new Response('Not Found', { status: 404 });
  },
};
