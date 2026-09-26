(() => {
  "use strict";

  const body = document.body;
  const offerId = body?.dataset?.offerId || "";
  const serviceId = body?.dataset?.serviceId || "";
  const allowedKeys = new Set([
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "offer_id", "service_id", "landing_path", "cta_id", "lead_source"
  ]);
  const prohibitedKeyPattern = /(email|phone|name|notes|message|company|payment|token|secret)/i;

  function attribution() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const value = params.get(key);
      if (value) result[key] = value.slice(0, 120);
    }
    const queryOfferId = params.get("offer_id");
    const queryServiceId = params.get("service_id");
    if (offerId) result.offer_id = offerId;
    else if (queryOfferId) result.offer_id = queryOfferId.slice(0, 120);
    if (serviceId) result.service_id = serviceId;
    else if (queryServiceId) result.service_id = queryServiceId.slice(0, 120);
    result.landing_path = window.location.pathname;
    return result;
  }

  function sanitize(input = {}) {
    const out = {};
    for (const [key, raw] of Object.entries(input)) {
      if (!allowedKeys.has(key) || prohibitedKeyPattern.test(key)) continue;
      const value = String(raw ?? "").trim();
      if (!value) continue;
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
