(() => {
  "use strict";

  const cfg = window.JADEL_GA4_CONFIG || {};
  const eventAllowlist = new Set([
    "page_view",
    "offer_view",
    "offer_cta_click",
    "intake_start",
    "generate_lead"
  ]);
  const parameterAllowlist = new Set([
    "offer_id",
    "service_id",
    "landing_path",
    "cta_id",
    "lead_source",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term"
  ]);
  const forbidden = /(name|email|phone|company|notes|message|payment|token|secret|idempotency)/i;
  const measurementPattern = /^G-[A-Z0-9]+$/;
  let initialized = false;
  let consentGranted = false;

  function sanitize(params = {}) {
    const clean = {};
    for (const [key, raw] of Object.entries(params)) {
      if (!parameterAllowlist.has(key) || forbidden.test(key)) continue;
      const value = String(raw ?? "").trim();
      if (value) clean[key] = value.slice(0, 120);
    }
    return clean;
  }

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function validConfiguration() {
    return cfg.enabled === true && measurementPattern.test(String(cfg.measurementId || ""));
  }

  function loadRemoteTag() {
    if (initialized || !consentGranted || !validConfiguration()) return false;
    initialized = true;

    window.dataLayer = window.dataLayer || [];
    gtag("js", new Date());
    gtag("config", cfg.measurementId, {
      send_page_view: true,
      debug_mode: cfg.debugMode === true
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.measurementId);
    script.referrerPolicy = "strict-origin-when-cross-origin";
    document.head.appendChild(script);
    return true;
  }

  function send(eventName, params) {
    if (!initialized || !consentGranted || !eventAllowlist.has(eventName)) return false;
    gtag("event", eventName, sanitize(params));
    return true;
  }

  window.JadelGA4 = Object.freeze({
    state: validConfiguration() ? "CONSENT_REQUIRED" : "MEASUREMENT_ID_REQUIRED",
    grantAnalyticsConsent() {
      if (!validConfiguration()) return false;
      consentGranted = true;
      gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
      return loadRemoteTag();
    },
    denyAnalyticsConsent() {
      consentGranted = false;
      if (initialized) {
        gtag("consent", "update", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied"
        });
      }
      return true;
    }
  });

  window.dataLayer = window.dataLayer || [];
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });

  window.addEventListener("jadel:revenue-event", (event) => {
    const detail = event.detail || {};
    send(String(detail.event || ""), detail.params || {});
  });
})();
