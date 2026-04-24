type NotificationPayload = {
  text?: unknown;
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...jsonHeaders, ...corsHeaders },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  let payload: NotificationPayload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  if (typeof payload.text !== "string" || !payload.text.trim()) {
    return jsonResponse({ error: "text_required" }, 400);
  }

  const webhookUrl = Deno.env.get("SECURITY_REVIEW_GOOGLE_CHAT_WEBHOOK_URL");
  if (!webhookUrl) {
    return jsonResponse({ skipped: true, reason: "webhook_not_configured" });
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ text: payload.text }),
  });

  if (!response.ok) {
    return jsonResponse({ error: "google_chat_failed", status: response.status }, 502);
  }

  return jsonResponse({ ok: true });
});
