(() => {
  "use strict";

  const INTAKE_PATH = "/solicitar-proyecto.html";
  let syncing = false;

  function selectedServiceIds() {
    return [...document.querySelectorAll("[data-remove-service]")]
      .map((node) => node.getAttribute("data-remove-service"))
      .filter((value) => /^[a-z0-9-]{1,64}$/.test(value || ""))
      .slice(0, 8);
  }

  function intakeUrl(ids) {
    if (!ids.length) return INTAKE_PATH;
    const params = new URLSearchParams({ services: ids.join(",") });
    return `${INTAKE_PATH}?${params.toString()}`;
  }

  function syncRequestCta() {
    if (syncing) return;
    syncing = true;
    try {
      const request = document.getElementById("request-payment");
      if (request) {
        const ids = selectedServiceIds();
        const disabled = ids.length === 0;
        request.textContent = disabled ? "Selecciona servicios para solicitar proyecto" : "Solicitar proyecto";
        request.href = disabled ? "#servicios" : intakeUrl(ids);
        request.removeAttribute("target");
        request.removeAttribute("rel");
        request.classList.toggle("is-disabled", disabled);
        request.setAttribute("aria-disabled", String(disabled));
        request.dataset.governedIntake = "true";
      }

      const nav = document.querySelector(".site-header .nav");
      if (nav && !nav.querySelector('[data-intake-nav="true"]')) {
        const link = document.createElement("a");
        link.href = INTAKE_PATH;
        link.textContent = "Solicitar proyecto";
        link.dataset.intakeNav = "true";
        nav.appendChild(link);
      }
    } finally {
      syncing = false;
    }
  }

  document.addEventListener("click", (event) => {
    const request = event.target.closest?.("#request-payment");
    if (!request) return;
    const ids = selectedServiceIds();
    if (!ids.length) {
      event.preventDefault();
      document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    event.preventDefault();
    window.location.assign(intakeUrl(ids));
  }, true);

  const observer = new MutationObserver(() => syncRequestCta());
  const start = () => {
    syncRequestCta();
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
