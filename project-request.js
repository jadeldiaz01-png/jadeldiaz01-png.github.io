const API_ORIGIN = "https://intake.jadeltechrd.com";
const CONFIG_URL = `${API_ORIGIN}/api/v1/public-config`;
const REQUEST_URL = `${API_ORIGIN}/api/v1/project-requests`;
const IDEMPOTENCY_SESSION_KEY = "jadel-project-request-idempotency-v1";
const ALLOWED_SERVICES = new Set([
  "architecture","support","sales","social","cineforge","meta","analytics","revenue","quant","governance","multiagent"
]);

const form = document.getElementById("project-request-form");
const submit = document.getElementById("submit-project");
const status = document.getElementById("request-status");
const turnstileStatus = document.getElementById("turnstile-status");
const consent = document.getElementById("privacy-consent");
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

let widgetId = null;
let turnstileToken = "";
let turnstileAction = "project_request";
let submitting = false;
let completed = false;
let fallbackIdempotencyKey = crypto.randomUUID();

function setStatus(message, kind = "") {
  if (!status) return;
  status.textContent = message;
  status.dataset.kind = kind;
}

function selectedServices() {
  return [...form.querySelectorAll('input[name="service_ids"]:checked')].map((node) => node.value);
}

function updateSubmitState() {
  if (!submit || !form) return;
  const validSelection = selectedServices().length >= 1 && selectedServices().length <= 8;
  submit.disabled = completed || submitting || !turnstileToken || !consent?.checked || !validSelection;
}

function getIdempotencyKey() {
  try {
    let key = sessionStorage.getItem(IDEMPOTENCY_SESSION_KEY);
    if (!key || !/^[A-Za-z0-9_-]{16,128}$/.test(key)) {
      key = crypto.randomUUID();
      sessionStorage.setItem(IDEMPOTENCY_SESSION_KEY, key);
    }
    return key;
  } catch {
    return fallbackIdempotencyKey;
  }
}

function clearIdempotencyKey() {
  fallbackIdempotencyKey = crypto.randomUUID();
  try { sessionStorage.removeItem(IDEMPOTENCY_SESSION_KEY); } catch { /* storage may be unavailable */ }
}

function resetTurnstile() {
  turnstileToken = "";
  if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
  updateSubmitState();
}

function preselectFromQuery() {
  const values = new URLSearchParams(window.location.search).get("services") || "";
  const requested = values.split(",").map((value) => value.trim()).filter((value) => ALLOWED_SERVICES.has(value));
  for (const value of requested.slice(0, 8)) {
    const input = form.querySelector(`input[name="service_ids"][value="${CSS.escape(value)}"]`);
    if (input) input.checked = true;
  }
}

async function waitForTurnstile(timeoutMs = 8000) {
  const started = Date.now();
  while (!window.turnstile) {
    if (Date.now() - started > timeoutMs) throw new Error("TURNSTILE_CLIENT_TIMEOUT");
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function bootstrapTurnstile() {
  const response = await fetch(CONFIG_URL, {
    method: "GET",
    headers: { "accept": "application/json" },
    cache: "no-store",
    credentials: "omit",
  });
  if (!response.ok) throw new Error("PUBLIC_CONFIG_UNAVAILABLE");
  const config = await response.json();
  if (!config.turnstile_sitekey || config.turnstile_action !== "project_request") throw new Error("PUBLIC_CONFIG_INVALID");
  turnstileAction = config.turnstile_action;
  await waitForTurnstile();
  widgetId = window.turnstile.render("#turnstile-widget", {
    sitekey: config.turnstile_sitekey,
    action: turnstileAction,
    theme: "auto",
    callback(token) {
      turnstileToken = token;
      turnstileStatus.textContent = "Verificación lista.";
      updateSubmitState();
    },
    "expired-callback"() {
      turnstileToken = "";
      turnstileStatus.textContent = "La verificación expiró. Completa el reto nuevamente.";
      updateSubmitState();
    },
    "error-callback"() {
      turnstileToken = "";
      turnstileStatus.textContent = "No se pudo completar la verificación. Inténtalo de nuevo.";
      updateSubmitState();
    },
  });
  turnstileStatus.textContent = "Completa la verificación para habilitar el envío.";
}

function payloadFromForm() {
  const data = new FormData(form);
  return {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    company: String(data.get("company") || "").trim(),
    service_ids: selectedServices(),
    notes: String(data.get("notes") || "").trim(),
    locale: document.documentElement.lang || "es-DO",
    turnstile_token: turnstileToken,
  };
}

form?.addEventListener("change", updateSubmitState);
form?.addEventListener("input", () => { if (!completed) setStatus(""); });

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitting || completed) return;
  const services = selectedServices();
  if (!form.reportValidity()) return;
  if (services.length < 1 || services.length > 8) {
    setStatus("Selecciona entre 1 y 8 servicios.", "error");
    return;
  }
  if (!turnstileToken) {
    setStatus("Completa la verificación anti-bot.", "error");
    return;
  }

  submitting = true;
  updateSubmitState();
  setStatus("Enviando solicitud de forma segura…", "working");
  const idempotencyKey = getIdempotencyKey();

  try {
    const response = await fetch(REQUEST_URL, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      headers: {
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
      },
      body: JSON.stringify(payloadFromForm()),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 429) throw new Error("RATE_LIMITED");
      if (response.status === 409) throw new Error("IDEMPOTENCY_CONFLICT");
      if (body.error === "TURNSTILE_FAILED") throw new Error("TURNSTILE_FAILED");
      throw new Error(body.error || `HTTP_${response.status}`);
    }

    completed = true;
    clearIdempotencyKey();
    const projectId = body.project_id || "registrado";
    setStatus(`Solicitud recibida. ID de seguimiento: ${projectId}. Estado: ${body.state || "VALIDATED"}.`, "success");
    form.querySelectorAll("input,textarea,button").forEach((node) => { node.disabled = true; });
    turnstileStatus.textContent = body.replayed ? "Reintento reconciliado sin duplicar la solicitud." : "Verificación completada.";
  } catch (error) {
    const code = String(error?.message || "REQUEST_FAILED");
    const messages = {
      RATE_LIMITED: "Demasiados intentos en poco tiempo. Espera un minuto y vuelve a intentarlo.",
      TURNSTILE_FAILED: "La verificación expiró o no fue válida. Completa un nuevo reto y reintenta.",
      IDEMPOTENCY_CONFLICT: "El identificador de reintento no coincide con esta solicitud. Recarga la página antes de volver a enviar.",
    };
    setStatus(messages[code] || "No pudimos registrar la solicitud en este momento. No se creó ningún compromiso ni pago. Inténtalo nuevamente.", "error");
    resetTurnstile();
  } finally {
    submitting = false;
    updateSubmitState();
  }
});

preselectFromQuery();
updateSubmitState();
bootstrapTurnstile().catch(() => {
  turnstileStatus.textContent = "La verificación segura no está disponible. El formulario permanece bloqueado por seguridad.";
  setStatus("Runtime de solicitud no disponible. No se enviaron datos.", "error");
  updateSubmitState();
});
