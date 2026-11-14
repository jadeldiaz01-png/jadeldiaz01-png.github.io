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
  const attributionStorageKey = "jadel_attribution_v1";
  const attributionTtlMs = 30 * 60 * 1000;
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
  const allowedAttributionValues = Object.freeze({
    utm_source: new Set(["google", "bing", "linkedin", "workana", "upwork", "freelancer", "youtube", "facebook", "instagram", "referral"]),
    utm_medium: new Set(["organic", "referral", "social", "marketplace", "cpc"]),
    utm_campaign: new Set(["revenue_funnel_v1", "automation_blueprint", "support_tickets", "sales_intelligence", "dashboard_intelligence"]),
    utm_content: new Set(["automation_blueprint", "whatsapp_ai", "sales_intelligence"]),
    offer_id: new Set(["whatsapp_support", "automation_blueprint", "sales_lead_intelligence"]),
    service_id: new Set(["architecture", "support", "sales", "social", "cineforge", "meta", "analytics", "revenue", "quant", "governance", "multiagent"]),
    landing_path: new Set(["/", "/en/", "/en/request-project.html", "/ai-automation-blueprint.html", "/automatizacion-procesos-ia-rd.html", "/whatsapp-ia-empresas-rd.html", "/agente-ventas-ia-rd.html", "/solicitar-proyecto.html", "/demo-seguimiento-leads.html", "/en/lead-follow-up-demo.html"]),
    lead_source: new Set(["website", "project_request"])
  });

  function validCtaId(value) {
    return /^(?:service_quote_[a-z0-9]{1,32}|homepage_blueprint_(?:entry|scope|pricing)|english_blueprint_(?:entry|request)|lead_demo_(?:es|en)|hero_(?:request|catalog)|final_request)$/.test(value);
  }

  function validAttributionValue(key, value) {
    if (key === "utm_content" && validCtaId(value)) return true;
    return Boolean(allowedAttributionValues[key]?.has(value));
  }

  function queryAttribution(search) {
    const params = new URLSearchParams(search);
    const result = {};
    for (const key of utmKeys) {
      const value = String(params.get(key) || "").trim();
      if (value && validAttributionValue(key, value)) result[key] = value;
    }
    return result;
  }

  function readSessionAttribution() {
    try {
      const stored = JSON.parse(sessionStorage.getItem(attributionStorageKey) || "null");
      if (!stored || !Number.isFinite(stored.expiresAt) || stored.expiresAt <= Date.now()) {
        sessionStorage.removeItem(attributionStorageKey);
        return {};
      }
      return queryAttribution(new URLSearchParams(stored.values || {}).toString());
    } catch { return {}; }
  }

  function persistSessionAttribution() {
    const previous = readSessionAttribution();
    const current = queryAttribution(window.location.search);
    const hasNewCampaign = ["utm_source", "utm_medium", "utm_campaign"].some((key) => current[key]);
    const values = hasNewCampaign ? current : { ...previous, ...current };
    if (Object.keys(values).length) {
      try {
        sessionStorage.setItem(attributionStorageKey, JSON.stringify({ expiresAt: Date.now() + attributionTtlMs, values }));
      } catch { /* Storage may be unavailable; query attribution still works on this page. */ }
    }
    return values;
  }

  let sessionAttribution = persistSessionAttribution();

  function attribution() {
    const result = { ...sessionAttribution, ...queryAttribution(window.location.search) };
    const params = new URLSearchParams(window.location.search);
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
      if (allowedValues && !validAttributionValue(key, value)) continue;
      if (key === "cta_id" && !validCtaId(value)) continue;
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
      for (const key of ["offer_id", "service_id"]) {
        if (Object.hasOwn(params, key) && !String(params[key] ?? "").trim()) delete payload[key];
      }
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
    let destinationAttribution = {};
    try {
      const destination = new URL(target.href, window.location.href);
      if (destination.origin === window.location.origin) {
        const currentAttribution = { ...sessionAttribution, ...queryAttribution(window.location.search) };
        const destinationParams = destination.searchParams;
        const destinationServiceId = destinationParams.get("service_id") || destinationParams.get("services") || "";
        const destinationOfferId = destinationParams.get("offer_id") || ({
          architecture: "automation_blueprint",
          support: "whatsapp_support",
          sales: "sales_lead_intelligence"
        })[destinationServiceId] || "";
        destinationAttribution.service_id = allowedAttributionValues.service_id.has(destinationServiceId) ? destinationServiceId : "";
        destinationAttribution.offer_id = allowedAttributionValues.offer_id.has(destinationOfferId) ? destinationOfferId : "";
        for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
          if (currentAttribution[key]) destinationParams.set(key, currentAttribution[key]);
          else destinationParams.delete(key);
        }
        const ctaId = target.dataset.ctaId || target.id || "";
        if (validCtaId(ctaId)) {
          destinationParams.set("utm_content", ctaId);
          destinationAttribution = { ...currentAttribution, ...destinationAttribution, utm_content: ctaId };
        } else {
          destinationAttribution = { ...currentAttribution, ...destinationAttribution };
          if (currentAttribution.utm_content) destinationParams.set("utm_content", currentAttribution.utm_content);
          else destinationParams.delete("utm_content");
        }
        target.href = destination.href;
      }
    } catch { /* Ignore malformed or non-link CTA targets. */ }
    window.RevenueAnalytics.track(target.dataset.revenueEvent, {
      ...destinationAttribution,
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
