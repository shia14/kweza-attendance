const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export function withCors(headers = {}) {
  return { ...corsHeaders, ...headers };
}

export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: withCors({ 'Content-Type': 'application/json', ...headers })
  });
}

export function emptyResponse(status = 204) {
  return new Response(null, { status, headers: withCors() });
}

export async function getJson(request) {
  if (!request.body) return {};
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function getAuthToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer') return null;
  return token || null;
}

export function handleServerError(err) {
  console.error('API error:', err);
  const message = err?.message || 'Server error';
  return jsonResponse({ success: false, message }, 500);
}
