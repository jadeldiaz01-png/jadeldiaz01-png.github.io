(() => {
  "use strict";

  const INTAKE_PATH = "/solicitar-proyecto.html";
  const SERVICE_ID_PATTERN = /^[a-z0-9-]{1,64}$/;
  const MAX_SERVICES = 8;

  function selectedServiceIds() {
    return [...document.querySelectorAll("[data-remove-service]")]
      .map((node) => node.getAttribute("data-remove-service"))
      .filter((value) => SERVICE_ID_PATTERN.test(value || ""))
      .slice(0, MAX_SERVICES);
  }

  function intakeUrl(ids) {
    if (!ids.length) return INTAKE_PATH;
    const params = new URLSearchParams({ services: ids.join(",") });
    return `${INTAKE_PATH}?${params.toString()}`;
  }

  function syncRequestCta() {
    const request = document.getElementById("request-payment");
    if (!request) return;

    const ids = selectedServiceIds();
    const disabled = ids.length === 0;
    const text = disabled ? "Selecciona servicios para solicitar proyecto" : "Solicitar proyecto";
    const href = disabled ? "#servicios" : intakeUrl(ids);

    if (request.textContent !== text) request.textContent = text;
    if (request.getAttribute("href") !== href) request.setAttribute("href", href);
    request.classList.toggle("is-disabled", disabled);
    request.setAttribute("aria-disabled", String(disabled));
    request.setAttribute("data-governed-intake", "true");
    request.removeAttribute("target");
    request.removeAttribute("rel");
  }

  function scheduleSync() {
    window.setTimeout(syncRequestCta, 0);
  }

  function start() {
    const grid = document.getElementById("services-grid");
    const selected = document.getElementById("selected-services");
    const request = document.getElementById("request-payment");

    grid?.addEventListener("click", (event) => {
      if (event.target.closest?.("[data-add-service]")) scheduleSync();
    });

    selected?.addEventListener("click", (event) => {
      if (event.target.closest?.("[data-remove-service]")) scheduleSync();
    });

    request?.addEventListener("click", (event) => {
      const ids = selectedServiceIds();
      event.preventDefault();
      if (!ids.length) {
        document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.location.assign(intakeUrl(ids));
    });

    const nav = document.querySelector(".site-header .nav");
    if (nav && !nav.querySelector('[data-intake-nav="true"]')) {
      const link = document.createElement("a");
      link.href = INTAKE_PATH;
      link.textContent = "Solicitar proyecto";
      link.dataset.intakeNav = "true";
      nav.appendChild(link);
    }

    syncRequestCta();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
