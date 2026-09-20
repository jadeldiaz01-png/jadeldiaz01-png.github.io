(() => {
  "use strict";

  const STORAGE_KEY = "jadel.analytics_consent.v1";
  const GRANTED = "granted";
  const DENIED = "denied";

  function safeRead() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === GRANTED || value === DENIED ? value : null;
    } catch {
      return null;
    }
  }

  function safeWrite(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Consent still applies to the current page even if storage is unavailable.
    }
  }

  function emitCurrentOfferView() {
    const offerId = document.body?.dataset?.offerId || "";
    const serviceId = document.body?.dataset?.serviceId || "";
    if (!offerId) return;
    window.dispatchEvent(new CustomEvent("jadel:revenue-event", {
      detail: {
        event: "offer_view",
        params: {
          offer_id: offerId,
          service_id: serviceId,
          landing_path: window.location.pathname
        }
      }
    }));
  }

  function removePanel() {
    document.getElementById("analytics-consent-panel")?.remove();
  }

  function ensurePreferencesTrigger() {
    if (document.getElementById("analytics-preferences-trigger")) return;
    const button = document.createElement("button");
    button.id = "analytics-preferences-trigger";
    button.className = "analytics-preferences-trigger";
    button.type = "button";
    button.textContent = "Preferencias de analítica";
    button.addEventListener("click", () => renderPanel());
    document.body.appendChild(button);
  }

  function choose(value, emitOfferView = false) {
    if (value === GRANTED) {
      if (!window.JadelGA4?.grantAnalyticsConsent()) return false;
      safeWrite(GRANTED);
      if (emitOfferView) emitCurrentOfferView();
    } else {
      window.JadelGA4?.denyAnalyticsConsent();
      safeWrite(DENIED);
    }
    removePanel();
    ensurePreferencesTrigger();
    return true;
  }

  function renderPanel() {
    removePanel();

    const panel = document.createElement("section");
    panel.id = "analytics-consent-panel";
    panel.className = "analytics-consent-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "analytics-consent-title");
    panel.innerHTML = `
      <div class="analytics-consent-copy">
        <strong id="analytics-consent-title">Analítica opcional</strong>
        <p>Podemos usar Google Analytics 4 para medir visitas y mejorar el sitio. No enviamos a Analytics nombres, email, teléfono, notas ni datos de pago. La publicidad permanece desactivada.</p>
        <a href="/?view=privacy#analytics">Ver política de privacidad</a>
      </div>
      <div class="analytics-consent-actions">
        <button type="button" class="button secondary" data-consent="denied">Solo necesarias</button>
        <button type="button" class="button primary" data-consent="granted">Aceptar analítica</button>
      </div>`;

    panel.querySelector('[data-consent="denied"]').addEventListener("click", () => choose(DENIED));
    panel.querySelector('[data-consent="granted"]').addEventListener("click", () => choose(GRANTED, true));
    document.body.appendChild(panel);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const stored = safeRead();
    if (stored === GRANTED) {
      choose(GRANTED, false);
      return;
    }
    if (stored === DENIED) {
      window.JadelGA4?.denyAnalyticsConsent();
      ensurePreferencesTrigger();
      return;
    }
    renderPanel();
  });
})();
