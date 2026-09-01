const API_ORIGIN = "https://intake.jadeltechrd.com";
const APPROVALS_URL = `${API_ORIGIN}/api/v1/admin/approvals`;

const form = document.getElementById("approval-auth");
const tokenInput = document.getElementById("admin-token");
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

async function api(path, options = {}) {
  const response = await fetch(path, {
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
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `HTTP_${response.status}`);
  return body;
}

function render(data) {
  const projects = data.projects || [];
  const payments = data.payments || [];
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
        <h3>Pagos por reconciliar</h3>
        ${payments.length ? payments.map((payment) => `
          <article>
            <strong>${htmlEscape(payment.provider_event_id)}</strong>
            <span>${htmlEscape(payment.ledger_state)} · ${htmlEscape(payment.amount_usd)} ${htmlEscape(payment.currency_code)}</span>
            <small>${htmlEscape(payment.created_at)}</small>
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
  } catch {
    setStatus("No se pudo cargar la consola. Verifica token y runtime.", "error");
  }
});

resultsNode?.addEventListener("click", async (event) => {
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
  } catch {
    setStatus("No se pudo registrar la decisión.", "error");
  }
});
