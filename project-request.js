const API_ORIGIN = "https://intake.jadeltechrd.com";
const CONFIG_URL = `${API_ORIGIN}/api/v1/public-config`;
const REQUEST_URL = `${API_ORIGIN}/api/v1/project-requests`;
const IDEMPOTENCY_SESSION_KEY = `jadel-project-request-idempotency-v1:${window.location.pathname}`;
const ALLOWED_SERVICES = new Set([
  "architecture","support","sales","social","cineforge","meta","analytics","revenue","quant","governance","multiagent"
]);
const UTM_ALLOWLISTS = {
  utm_source: new Set(["google", "bing", "linkedin", "workana", "upwork", "freelancer", "youtube", "facebook", "instagram", "referral"]),
  utm_medium: new Set(["organic", "referral", "social", "marketplace", "cpc"]),
  utm_campaign: new Set(["revenue_funnel_v1", "automation_blueprint", "support_tickets", "sales_intelligence", "dashboard_intelligence"]),
};
const english = document.documentElement.lang.toLowerCase().startsWith("en");
const copy = english ? {
  preparing: "Preparing secure verification…",
  ready: "Verification ready.",
  expired: "Verification expired. Complete the challenge again.",
  verificationError: "Verification could not be completed. Please try again.",
  completeChallenge: "Complete the challenge to enable submission.",
  configUnavailable: "The secure intake is temporarily unavailable. No information was sent.",
  configInvalid: "The secure intake configuration could not be verified. No information was sent.",
  turnstileTimeout: "Cloudflare verification did not load in time. Check script blockers or retry.",
  blocked: "No information was sent. The form remains closed until secure verification is available.",
  unknownBlock: "Secure verification is unavailable. The form remains blocked for safety.",
  selectServices: "Select between 1 and 8 services.",
  completeVerification: "Complete anti-bot verification.",
  sending: "Sending your request securely…",
  replayed: (id) => `This request was already recorded and was not duplicated. Reference: ${id}.`,
  received: (id) => `Your request was recorded. Reference: ${id}.`,
  rateLimited: "Too many attempts in a short time. Wait one minute and try again.",
  turnstileFailed: "Verification expired or failed. Complete a new challenge and try again.",
  idempotencyConflict: "The retry identifier does not match this request. Reload the page before trying again.",
  requestFailed: "We could not record your request right now. No payment or commitment was created. Please try again.",
} : {
  preparing: "Preparando verificación segura…",
  ready: "Verificación lista.",
  expired: "La verificación expiró. Completa el reto nuevamente.",
  verificationError: "No se pudo completar la verificación. Inténtalo de nuevo.",
  completeChallenge: "Completa la verificación para habilitar el envío.",
  configUnavailable: "El runtime no entregó configuración pública. El formulario queda bloqueado sin enviar datos.",
  configInvalid: "La configuración pública del runtime no pasó contrato. El formulario queda bloqueado.",
  turnstileTimeout: "Cloudflare Turnstile no cargó a tiempo. Revisa bloqueadores de scripts o reintenta.",
  blocked: "No se enviaron datos. Nexus conserva el flujo en modo fail-closed hasta recuperar verificación segura.",
  unknownBlock: "La verificación segura no está disponible. El formulario permanece bloqueado por seguridad.",
  selectServices: "Selecciona entre 1 y 8 servicios.",
  completeVerification: "Completa la verificación anti-bot.",
  sending: "Enviando solicitud de forma segura…",
  replayed: (id) => `Esta solicitud ya estaba registrada y no se duplicó. Folio de seguimiento: ${id}.`,
  received: (id) => `Tu solicitud quedó registrada. Folio de seguimiento: ${id}.`,
  rateLimited: "Demasiados intentos en poco tiempo. Espera un minuto y vuelve a intentarlo.",
  turnstileFailed: "La verificación expiró o no fue válida. Completa un nuevo reto y reintenta.",
  idempotencyConflict: "El identificador de reintento no coincide con esta solicitud. Recarga la página antes de volver a enviar.",
  requestFailed: "No pudimos registrar la solicitud en este momento. No se creó ningún compromiso ni pago. Inténtalo nuevamente.",
};

const form = document.getElementById("project-request-form");
const submit = document.getElementById("submit-project");
const status = document.getElementById("request-status");
const confirmation = document.getElementById("request-confirmation");
const confirmationSummary = document.getElementById("request-confirmation-summary");
const assurance = document.getElementById("request-assurance");
const turnstileStatus = document.getElementById("turnstile-status");
const retryRuntime = document.getElementById("retry-runtime");
const consent = document.getElementById("privacy-consent");
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

let widgetId = null;
let turnstileToken = "";
let turnstileAction = "project_request";
let submitting = false;
let completed = false;
let bootstrapping = false;
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

function attributionFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const bounded = (name) => String(params.get(name) || "").trim().slice(0, 120);
  const utm = (name) => {
    const value = bounded(name).toLowerCase();
    return UTM_ALLOWLISTS[name]?.has(value) ? value : "";
  };
  const offerId = bounded("offer_id");
  return {
    offer_id: /^[a-z][a-z0-9_]{0,63}$/.test(offerId) ? offerId : "",
    utm_source: utm("utm_source"),
    utm_medium: utm("utm_medium"),
    utm_campaign: utm("utm_campaign"),
    utm_content: bounded("utm_content"),
  };
}

function preselectFromQuery() {
  const values = new URLSearchParams(window.location.search).get("services") || "";
  const requested = values.split(",").map((value) => value.trim()).filter((value) => ALLOWED_SERVICES.has(value));
  for (const value of requested.slice(0, 8)) {
    const input = form.querySelector(`input[name="service_ids"][value="${CSS.escape(value)}"]`);
    if (input) input.checked = true;
  }
}

function configureBlueprintRequest() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("offer_id") !== "automation_blueprint" || params.get("service_id") !== "architecture" || !selectedServices().includes("architecture")) return;

  const heroTitle = document.getElementById("request-hero-title");
  const heroLead = document.getElementById("request-hero-lead");
  const formIntro = document.getElementById("request-form-intro");
  const serviceSummary = document.getElementById("blueprint-service-summary");
  const serviceSelector = document.querySelector(".service-selector");
  if (!heroTitle || !heroLead || !formIntro || !serviceSummary || !serviceSelector) return;

  heroTitle.textContent = "Solicita tu AI Automation Blueprint";
  heroLead.textContent = "Revisamos un proceso de captación y seguimiento de leads y te entregamos un mapa, una arquitectura recomendada y un backlog priorizado en un máximo de 2.5 horas. Comparte tus datos para confirmar el alcance y la cotización; este formulario no genera un cobro.";
  document.getElementById("request-title").textContent = "Cuéntanos sobre el flujo que quieres mejorar";
  formIntro.textContent = "Blueprint desde US$250. Indica tu contexto y las herramientas que utilizas para que podamos evaluar el alcance de un solo flujo.";
  serviceSummary.hidden = false;
  serviceSelector.hidden = true;
  document.getElementById("submit-project").textContent = "Solicitar cotización del Blueprint";
  const assuranceTitle = assurance?.querySelector("h2");
  if (assuranceTitle) assuranceTitle.textContent = "Cómo funciona el Blueprint";
  const technicalPanel = assurance?.querySelector(".nexus-intake-panel");
  if (technicalPanel) technicalPanel.hidden = true;
}

async function waitForTurnstile(timeoutMs = 8000) {
  const started = Date.now();
  while (!window.turnstile) {
    if (Date.now() - started > timeoutMs) throw new Error("TURNSTILE_CLIENT_TIMEOUT");
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function bootstrapTurnstile() {
  if (bootstrapping || completed) return;
  bootstrapping = true;
  turnstileToken = "";
  if (retryRuntime) retryRuntime.hidden = true;
  turnstileStatus.textContent = copy.preparing;
  setStatus("");
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
  if (widgetId !== null) window.turnstile.reset(widgetId);
  else widgetId = window.turnstile.render("#turnstile-widget", {
    sitekey: config.turnstile_sitekey,
    action: turnstileAction,
    theme: "auto",
    callback(token) {
      turnstileToken = token;
      turnstileStatus.textContent = copy.ready;
      updateSubmitState();
    },
    "expired-callback"() {
      turnstileToken = "";
      turnstileStatus.textContent = copy.expired;
      updateSubmitState();
    },
    "error-callback"() {
      turnstileToken = "";
      turnstileStatus.textContent = copy.verificationError;
      updateSubmitState();
    },
  });
  turnstileStatus.textContent = copy.completeChallenge;
  bootstrapping = false;
}

function explainRuntimeBlock(error) {
  bootstrapping = false;
  const code = String(error?.message || "RUNTIME_UNAVAILABLE");
  const messages = {
    PUBLIC_CONFIG_UNAVAILABLE: copy.configUnavailable,
    PUBLIC_CONFIG_INVALID: copy.configInvalid,
    TURNSTILE_CLIENT_TIMEOUT: copy.turnstileTimeout,
  };
  turnstileToken = "";
  turnstileStatus.textContent = messages[code] || copy.unknownBlock;
  setStatus(copy.blocked, "error");
  if (retryRuntime) retryRuntime.hidden = false;
  updateSubmitState();
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
    ...attributionFromQuery(),
  };
}

form?.addEventListener("change", updateSubmitState);
form?.addEventListener("input", () => { if (!completed) setStatus(""); });
retryRuntime?.addEventListener("click", () => {
  bootstrapTurnstile().catch(explainRuntimeBlock);
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitting || completed) return;
  const services = selectedServices();
  if (!form.reportValidity()) return;
  if (services.length < 1 || services.length > 8) {
    setStatus(copy.selectServices, "error");
    return;
  }
  if (!turnstileToken) {
    setStatus(copy.completeVerification, "error");
    return;
  }

  submitting = true;
  updateSubmitState();
  setStatus(copy.sending, "working");
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
    const projectId = String(body.project_id || (english ? "recorded" : "registrado")).slice(0, 64);
    if (!body.replayed) window.RevenueAnalytics?.track("generate_lead", { lead_source: "project_request" });
    const receiptMessage = body.replayed
      ? copy.replayed(projectId)
      : copy.received(projectId);
    setStatus(receiptMessage, "success");
    if (confirmation && confirmationSummary) {
      confirmationSummary.textContent = receiptMessage;
      confirmation.hidden = false;
      form.hidden = true;
      if (assurance) assurance.hidden = true;
      confirmation.focus();
    } else {
      form.querySelectorAll("input,textarea,button").forEach((node) => { node.disabled = true; });
    }
  } catch (error) {
    const code = String(error?.message || "REQUEST_FAILED");
    const messages = {
      RATE_LIMITED: copy.rateLimited,
      TURNSTILE_FAILED: copy.turnstileFailed,
      IDEMPOTENCY_CONFLICT: copy.idempotencyConflict,
    };
    setStatus(messages[code] || copy.requestFailed, "error");
    resetTurnstile();
  } finally {
    submitting = false;
    updateSubmitState();
  }
});

preselectFromQuery();
configureBlueprintRequest();
updateSubmitState();
bootstrapTurnstile().catch(explainRuntimeBlock);
