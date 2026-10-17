(() => {
  "use strict";

  const body = document.body;
  const offerId = body?.dataset?.offerId || "";
  const serviceId = body?.dataset?.serviceId || "";
  const allowedKeys = new Set([
    "utm_source", "utm_medium", "utm_campaign", "utm_content",
    "offer_id", "service_id", "landing_path", "cta_id", "lead_source"
  ]);
  const prohibitedKeyPattern = /(email|phone|name|notes|message|company|payment|token|secret)/i;
  const allowedAttributionValues = Object.freeze({
    utm_source: new Set(["website", "service_catalog", "use_case_path", "pricing", "google", "bing", "linkedin", "workana", "upwork", "freelancer", "youtube", "facebook", "instagram", "referral"]),
    utm_medium: new Set(["homepage", "organic", "referral", "social", "marketplace", "cpc"]),
    utm_campaign: new Set(["service_intake", "blueprint_entry", "revenue_funnel_v1", "automation_blueprint", "support_tickets", "sales_intelligence", "dashboard_intelligence"]),
    utm_content: new Set(["automation_blueprint", "whatsapp_ai", "sales_intelligence"]),
    offer_id: new Set(["whatsapp_support", "automation_blueprint", "sales_lead_intelligence"]),
    service_id: new Set(["architecture", "support", "sales", "social", "cineforge", "meta", "analytics", "revenue", "quant", "governance", "multiagent"]),
    landing_path: new Set(["/", "/automatizacion-procesos-ia-rd.html", "/whatsapp-ia-empresas-rd.html", "/agente-ventas-ia-rd.html", "/solicitar-proyecto.html"]),
    lead_source: new Set(["website"])
  });

  function attribution() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
      const value = params.get(key);
      if (value && allowedAttributionValues[key].has(value)) result[key] = value;
    }
    const queryOfferId = params.get("offer_id");
    const queryServiceId = params.get("service_id");
    const selectedOfferId = offerId || queryOfferId || "";
    const selectedServiceId = serviceId || queryServiceId || "";
    if (allowedAttributionValues.offer_id.has(selectedOfferId)) result.offer_id = selectedOfferId;
    if (allowedAttributionValues.service_id.has(selectedServiceId)) result.service_id = selectedServiceId;
    const landingPath = window.location.pathname;
    if (allowedAttributionValues.landing_path.has(landingPath)) result.landing_path = landingPath;
    return result;
  }

  function sanitize(input = {}) {
    const out = {};
    for (const [key, raw] of Object.entries(input)) {
      if (!allowedKeys.has(key) || prohibitedKeyPattern.test(key)) continue;
      const value = String(raw ?? "").trim();
      if (!value) continue;
      const allowedValues = allowedAttributionValues[key];
      if (allowedValues && !allowedValues.has(value)) continue;
      if (key === "cta_id" && !/^service_quote_[a-z0-9]{1,32}$/.test(value)) continue;
      out[key] = value.slice(0, 120);
    }
    return out;
  }

  window.dataLayer = window.dataLayer || [];
  window.RevenueAnalytics = Object.freeze({
    attribution,
    track(eventName, params = {}) {
      if (!/^[a-z][a-z0-9_]{1,39}$/.test(String(eventName))) return false;
      const payload = { ...attribution(), ...sanitize(params) };
      window.dataLayer.push({
        event: String(eventName),
        ...payload,
        analytics_activation: "MEASUREMENT_ID_REQUIRED"
      });
      window.dispatchEvent(new CustomEvent("jadel:revenue-event", {
        detail: { event: String(eventName), params: payload }
      }));
      return true;
    }
  });

  if (offerId) window.RevenueAnalytics.track("offer_view");

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-revenue-event]");
    if (!target) return;
    window.RevenueAnalytics.track(target.dataset.revenueEvent, {
      cta_id: target.dataset.ctaId || target.id || "cta"
    });
  });

  const intakeForm = document.getElementById("project-request-form");
  if (intakeForm) {
    let started = false;
    intakeForm.addEventListener("input", () => {
      if (started) return;
      started = true;
      window.RevenueAnalytics.track("intake_start");
    }, { passive: true });
  }
})();
