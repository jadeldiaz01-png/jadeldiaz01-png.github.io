const API_ORIGIN = "https://intake.jadeltechrd.com";
const APPROVALS_URL = `${API_ORIGIN}/api/v1/admin/approvals`;
const PAYMENT_RECONCILE_URL = `${API_ORIGIN}/api/v1/admin/payments/reconcile`;
const CATALOG_QUOTE_URL = `${API_ORIGIN}/api/v1/admin/quotes/from-catalog`;
const QUOTE_ACCEPT_URL = `${API_ORIGIN}/api/v1/admin/quotes/accept`;
const QUOTE_ACCEPT_READINESS_URL = `${API_ORIGIN}/api/v1/admin/quotes/acceptance-readiness`;
const PAYMENT_ORDER_URL = `${API_ORIGIN}/api/v1/admin/payment-orders`;

const form = document.getElementById("approval-auth");
const tokenInput = document.getElementById("admin-token");
const protectedShaInput = document.getElementById("protected-main-sha");
const statusNode = document.getElementById("approval-status");
const resultsNode = document.getElementById("approval-results");

let token = "";

function setStatus(message, kind = "") {
  statusNode.textContent = message;
  statusNode.dataset.kind = kind;
}

function htmlEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function formatMinor(value, currency = "USD") {
  const amount = Number(value);
  if (!Number.isSafeInteger(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style:"currency",
    currency,
  }).format(amount / 100);
}

function protectedMainSha() {
  const value = protectedShaInput?.value.trim() || "";
  return /^[0-9a-f]{40}$/.test(value) ? value : "<protected_main_sha>";
}

const SAFE_ERROR_CODE_RE = /^[A-Z][A-Z0-9_]{0,79}$/;

function safeApiCode(value, fallback = "UNKNOWN_ERROR") {
  return typeof value === "string" && SAFE_ERROR_CODE_RE.test(value) ? value : fallback;
}

function apiError(status, code) {
  const safeStatus = Number.isInteger(status) && status >= 100 && status <= 599 ? status : 0;
  const safeCode = safeApiCode(code, safeStatus ? `HTTP_${safeStatus}` : "NETWORK_ERROR");
  const error = new Error(safeCode);
  error.status = safeStatus;
  error.code = safeCode;
  return error;
}

function formatApiError(error) {
  const status = Number.isInteger(error?.status) ? error.status : 0;
  const code = safeApiCode(error?.code, status ? `HTTP_${status}` : "NETWORK_ERROR");
  return status ? `HTTP ${status} · ${code}` : code;
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw apiError(0, "NETWORK_ERROR");
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw apiError(response.status, body.error);
  return body;
}


function safePayPalApprovalUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" && url.hostname === "www.paypal.com" ? url.href : null;
  } catch {
    return null;
  }
}

function quotePaymentControls(quote, paymentOrders) {
  if (quote.status !== "ACCEPTED") return "";
  const order = paymentOrders.find((item) => item.quote_id === quote.quote_id);
  const approvalUrl = safePayPalApprovalUrl(order?.provider_approval_url);
  if (approvalUrl) {
    return `<div><a href="${htmlEscape(approvalUrl)}" target="_blank" rel="noopener noreferrer">Abrir checkout PayPal</a></div>`;
  }
  return `<div>
    <button data-payment-order-create="${htmlEscape(quote.quote_id)}">
      ${order ? "Completar orden PayPal" : "Crear orden PayPal"}
    </button>
  </div>`;
}

function captureAssist(order) {
  if (order.status !== "PENDING" || !order.provider_order_id) return "";
  const command = [
    "gh workflow run paypal-live-capture.yml",
    "--repo jadeldiaz01-png/jadeltechrd.com",
    "--ref main",
    `-f expected_sha=${protectedMainSha()}`,
    `-f paypal_order_id=${order.provider_order_id}`,
    `-f payment_order_id=${order.payment_order_id}`,
    `-f quote_id=${order.quote_id}`,
    "-f confirmation=CAPTURE_PAYPAL_LIVE_ORDER",
  ].join(" ");
  return `<details class="approval-command">
    <summary>Preparar captura asistida</summary>
    <p>Ejecutar solo después de confirmar aprobación del cliente en PayPal. No reconcilia, no reembolsa y no hace pagos salientes.</p>
    <code>${htmlEscape(command)}</code>
  </details>`;
}

function render(data) {
  const projects = data.projects || [];
  const quotableProjects = data.quotable_projects || [];
  const quotes = data.quotes || [];
  const payments = data.payments || [];
  const paymentOrders = data.payment_orders || [];
  resultsNode.innerHTML = `
    <div class="approval-list">
      <section>
        <h3>Solicitudes</h3>
        ${projects.length ? projects.map((project) => `
          <article>
            <strong>${htmlEscape(project.name)} · ${htmlEscape(project.email)}</strong>
            <span>${htmlEscape(project.state)} / ${htmlEscape(project.policy_status)}</span>
            <small>${htmlEscape(project.service_ids_json)}</small>
            <div>
              <button data-decision="APPROVED" data-project="${htmlEscape(project.project_id)}">Aprobar política</button>
              <button data-decision="NEEDS_INFO" data-project="${htmlEscape(project.project_id)}">Pedir datos</button>
              <button data-decision="DENIED" data-project="${htmlEscape(project.project_id)}">Denegar</button>
            </div>
          </article>`).join("") : "<p>No hay solicitudes pendientes.</p>"}
      </section>
      <section>
        <h3>Proyectos listos para cotizar</h3>
        ${quotableProjects.length ? quotableProjects.map((project) => `
          <article>
            <strong>${htmlEscape(project.name)} · ${htmlEscape(project.email)}</strong>
            <span>${htmlEscape(project.state)} · catálogo canónico</span>
            <small>${htmlEscape(project.service_ids_json)}</small>
            <div>
              <button data-catalog-quote-project="${htmlEscape(project.project_id)}">Crear cotización base</button>
            </div>
          </article>`).join("") : "<p>No hay proyectos listos para cotizar.</p>"}
      </section>
      <section>
        <h3>Cotizaciones activas</h3>
        ${quotes.length ? quotes.map((quote) => `
          <article>
            <strong>${htmlEscape(quote.name)} · ${formatMinor(quote.total_amount_minor, quote.currency_code)}</strong>
            <span>${htmlEscape(quote.status)} · versión ${htmlEscape(quote.version)}</span>
            <small>Proyecto: ${htmlEscape(quote.project_id)} · Quote: ${htmlEscape(quote.quote_id)}</small>
            ${quote.status === "ISSUED" ? `
              <div>
                <input
                  type="text"
                  autocomplete="off"
                  data-quote-evidence="${htmlEscape(quote.quote_id)}"
                  placeholder="Evidencia de aceptación del cliente"
                  aria-label="Evidencia de aceptación"
                >
                <button data-quote-readiness="${htmlEscape(quote.quote_id)}">Comprobar readiness</button>
                <button data-quote-accept="${htmlEscape(quote.quote_id)}" disabled>Registrar aceptación</button>
              </div>` : quotePaymentControls(quote, paymentOrders)}
          </article>`).join("") : "<p>No hay cotizaciones activas.</p>"}
      </section>
      <section>
        <h3>Órdenes internas pendientes</h3>
        ${paymentOrders.length ? paymentOrders.map((order) => `
          <article>
            <strong>${htmlEscape(order.payment_order_id)}</strong>
            <span>${htmlEscape(order.status)} · ${htmlEscape(order.amount_minor)} minor units ${htmlEscape(order.currency_code)}</span>
            <small>Proyecto: ${htmlEscape(order.project_id)} · Quote: ${htmlEscape(order.quote_id)}</small>
            ${safePayPalApprovalUrl(order.provider_approval_url)
              ? `<a href="${htmlEscape(safePayPalApprovalUrl(order.provider_approval_url))}" target="_blank" rel="noopener noreferrer">Abrir checkout PayPal</a>`
              : ""}
            ${captureAssist(order)}
          </article>`).join("") : "<p>No hay órdenes internas pendientes.</p>"}
      </section>
      <section>
        <h3>Pagos por reconciliar</h3>
        ${payments.length ? payments.map((payment) => `
          <article>
            <strong>${htmlEscape(payment.provider_event_id)}</strong>
            <span>${htmlEscape(payment.ledger_state)} · ${htmlEscape(payment.amount_usd)} ${htmlEscape(payment.currency_code)}</span>
            <small>Ledger: ${htmlEscape(payment.ledger_id)} · ${htmlEscape(payment.created_at)}</small>
            <div>
              <input
                type="text"
                inputmode="text"
                autocomplete="off"
                data-payment-project="${htmlEscape(payment.ledger_id)}"
                placeholder="Project ID verificado"
                aria-label="Project ID para reconciliar"
              >
              <input
                type="text"
                inputmode="text"
                autocomplete="off"
                data-payment-order="${htmlEscape(payment.ledger_id)}"
                placeholder="Payment Order ID"
                aria-label="Payment Order ID para liquidar"
              >
              <button data-payment-decision="MATCHED" data-ledger="${htmlEscape(payment.ledger_id)}">Liquidar pago</button>
              <button data-payment-decision="REJECTED" data-ledger="${htmlEscape(payment.ledger_id)}">Rechazar pago</button>
            </div>
          </article>`).join("") : "<p>No hay pagos pendientes.</p>"}
      </section>
    </div>`;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  token = tokenInput.value.trim();
  if (!token) return;
  setStatus("Cargando pendientes...", "working");
  try {
    render(await api(APPROVALS_URL));
    setStatus("Pendientes cargados.", "success");
    tokenInput.value = "";
  } catch (error) {
    setStatus(`No se pudo cargar la consola: ${formatApiError(error)}`, "error");
  }
});

resultsNode?.addEventListener("click", async (event) => {
  const catalogQuoteButton = event.target.closest("button[data-catalog-quote-project]");
  if (catalogQuoteButton) {
    setStatus("Creando cotización desde el catálogo canónico...", "working");
    try {
      await api(CATALOG_QUOTE_URL, {
        method:"POST",
        body:JSON.stringify({ project_id:catalogQuoteButton.dataset.catalogQuoteProject }),
      });
      render(await api(APPROVALS_URL));
      setStatus("Cotización canónica creada.", "success");
    } catch (error) {
      setStatus(`No se pudo crear la cotización canónica: ${formatApiError(error)}`, "error");
    }
    return;
  }

  const quoteReadinessButton = event.target.closest("button[data-quote-readiness]");
  if (quoteReadinessButton) {
    const quoteId = quoteReadinessButton.dataset.quoteReadiness;
    const acceptButton = [...resultsNode.querySelectorAll("button[data-quote-accept]")]
      .find((node) => node.dataset.quoteAccept === quoteId);
    if (acceptButton) acceptButton.disabled = true;
    setStatus("Comprobando readiness de aceptación...", "working");
    try {
      const readiness = await api(`${QUOTE_ACCEPT_READINESS_URL}?quote_id=${encodeURIComponent(quoteId)}`);
      const code = safeApiCode(readiness.code, "INVALID_READINESS_RESPONSE");
      if (readiness.ready === true && code === "QUOTE_ACCEPTANCE_READY") {
        if (acceptButton) acceptButton.disabled = false;
        setStatus("Readiness de aceptación: PASS · QUOTE_ACCEPTANCE_READY", "success");
      } else {
        setStatus(`Readiness de aceptación bloqueado · ${code}`, "error");
      }
    } catch (error) {
      setStatus(`No se pudo comprobar readiness: ${formatApiError(error)}`, "error");
    }
    return;
  }

  const quoteAcceptButton = event.target.closest("button[data-quote-accept]");
  if (quoteAcceptButton) {
    const quoteId = quoteAcceptButton.dataset.quoteAccept;
    const evidenceInput = [...resultsNode.querySelectorAll("input[data-quote-evidence]")]
      .find((node) => node.dataset.quoteEvidence === quoteId);
    const evidence = evidenceInput?.value.trim() || "";
    if (!evidence) {
      setStatus("Registra evidencia de aceptación del cliente.", "error");
      return;
    }
    setStatus("Registrando aceptación de cotización...", "working");
    try {
      await api(QUOTE_ACCEPT_URL, {
        method:"POST",
        body:JSON.stringify({ quote_id:quoteId, acceptance_evidence:evidence }),
      });
      render(await api(APPROVALS_URL));
      setStatus("Aceptación registrada. La orden de pago sigue detrás de su gate.", "success");
    } catch (error) {
      setStatus(`No se pudo registrar la aceptación: ${formatApiError(error)}`, "error");
    }
    return;
  }

  const paymentOrderButton = event.target.closest("button[data-payment-order-create]");
  if (paymentOrderButton) {
    const quoteId = paymentOrderButton.dataset.paymentOrderCreate;
    setStatus("Creando orden PayPal gobernada...", "working");
    try {
      const created = await api(PAYMENT_ORDER_URL, {
        method:"POST",
        body:JSON.stringify({ quote_id:quoteId }),
      });
      render(await api(APPROVALS_URL));
      const approvalUrl = safePayPalApprovalUrl(created.approval_url);
      setStatus(
        approvalUrl
          ? "Orden PayPal creada. Abre el checkout desde la cotización u orden pendiente."
          : "Orden interna preparada; el gate del proveedor sigue cerrado.",
        approvalUrl ? "success" : "working",
      );
    } catch (error) {
      setStatus(`No se pudo crear la orden PayPal: ${formatApiError(error)}`, "error");
    }
    return;
  }

  const paymentButton = event.target.closest("button[data-payment-decision]");
  if (paymentButton) {
    const ledgerId = paymentButton.dataset.ledger;
    const projectInput = [...resultsNode.querySelectorAll("input[data-payment-project]")]
      .find((node) => node.dataset.paymentProject === ledgerId);
    const orderInput = [...resultsNode.querySelectorAll("input[data-payment-order]")]
      .find((node) => node.dataset.paymentOrder === ledgerId);
    const projectId = projectInput?.value.trim() || "";
    const paymentOrderId = orderInput?.value.trim() || "";
    if (!projectId) {
      setStatus("Indica el Project ID antes de reconciliar el pago.", "error");
      return;
    }
    if (paymentButton.dataset.paymentDecision === "MATCHED" && !paymentOrderId) {
      setStatus("Indica el Payment Order ID antes de liquidar el pago.", "error");
      return;
    }
    setStatus("Reconciliando pago con evidencia verificada...", "working");
    try {
      await api(PAYMENT_RECONCILE_URL, {
        method:"POST",
        body:JSON.stringify({
          project_id:projectId,
          ledger_id:ledgerId,
          payment_order_id:paymentOrderId || undefined,
          decision:paymentButton.dataset.paymentDecision,
          reason:"operator console payment reconciliation",
        }),
      });
      render(await api(APPROVALS_URL));
      setStatus("Reconciliación registrada.", "success");
    } catch (error) {
      setStatus(`No se pudo reconciliar el pago: ${formatApiError(error)}`, "error");
    }
    return;
  }

  const button = event.target.closest("button[data-decision]");
  if (!button) return;
  setStatus("Registrando decisión...", "working");
  try {
    await api(APPROVALS_URL, {
      method: "POST",
      body: JSON.stringify({
        project_id: button.dataset.project,
        approval_type: "policy",
        decision: button.dataset.decision,
        reason: "operator console decision",
      }),
    });
    render(await api(APPROVALS_URL));
    setStatus("Decisión registrada.", "success");
  } catch (error) {
    setStatus(`No se pudo registrar la decisión: ${formatApiError(error)}`, "error");
  }
});
