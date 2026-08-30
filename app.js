(() => {
  const DATA_DELETION_URL = "/?view=data-deletion";

  const services = [
    {
      id: "architecture",
      category: "automation",
      icon: "⌘",
      name: "Arquitectura Agentic & Automatización",
      summary: "Diseño de agentes, workflows, APIs, MCP, guardrails, memoria y handoffs con arquitectura modular y auditable.",
      deliverables: ["Mapa de procesos", "Arquitectura objetivo", "Backlog priorizado", "Plan de integración"],
      status: "available",
      statusLabel: "Servicio de ingeniería",
      setup: 250,
      monthly: 0,
      priceLabel: "Desde US$250"
    },
    {
      id: "support",
      category: "business",
      icon: "◎",
      name: "Agente de Soporte & Tickets",
      summary: "Chatbot y flujo de soporte con clasificación, base de conocimiento, escalación humana, trazabilidad y panel operativo.",
      deliverables: ["Chat de soporte", "Gestión de tickets", "Escalación humana", "Dashboard"],
      status: "available",
      statusLabel: "Implementable",
      setup: 900,
      monthly: 149,
      priceLabel: "US$900 + US$149/mes"
    },
    {
      id: "sales",
      category: "business",
      icon: "↗",
      name: "Sales & Lead Intelligence",
      summary: "Investigación de cuentas, calificación de oportunidades, preparación de outreach y seguimiento con aprobación antes de acciones externas.",
      deliverables: ["Lead research", "Scoring", "Brief comercial", "Aprobaciones"],
      status: "pilot",
      statusLabel: "Piloto supervisado",
      setup: 1500,
      monthly: 299,
      priceLabel: "Desde US$1,500 + US$299/mes"
    },
    {
      id: "social",
      category: "media",
      icon: "◉",
      name: "Social Trend Intelligence",
      summary: "Detección y ranking de tendencias con normalización de métricas, frescura, fit por plataforma, derechos y revisión de políticas.",
      deliverables: ["Trend scoring", "Creative brief", "Rights review", "Feedback loop"],
      status: "pilot",
      statusLabel: "Piloto supervisado",
      setup: 750,
      monthly: 199,
      priceLabel: "US$750 + US$199/mes"
    },
    {
      id: "cineforge",
      category: "media",
      icon: "▶",
      name: "CineForge · Video Premium",
      summary: "Pipeline para reels y video social premium: planificación, QC, originalidad, aprobación humana y conectores de publicación multi-plataforma.",
      deliverables: ["Creative direction", "Video QC", "Caption/thumbnail", "Publisher connectors"],
      status: "pilot",
      statusLabel: "Publicación live bloqueada por gates",
      setup: 180,
      monthly: 899,
      priceLabel: "Desde US$180/reel · packs desde US$899/mes"
    },
    {
      id: "meta",
      category: "integrations",
      icon: "∞",
      name: "Meta/Facebook Integration & App Review",
      summary: "Integración segura de Facebook Pages, OAuth, permisos, revisión de app, evidencias y páginas públicas de cumplimiento.",
      deliverables: ["OAuth", "Pages API", "Review readiness", "Compliance URLs"],
      status: "available",
      statusLabel: "Servicio de ingeniería",
      setup: 850,
      monthly: 0,
      priceLabel: "Desde US$850"
    },
    {
      id: "analytics",
      category: "data",
      icon: "▦",
      name: "Dashboards & Decision Intelligence",
      summary: "Paneles operativos y analíticos para convertir métricas, tickets, actividad de agentes o datos de negocio en decisiones accionables.",
      deliverables: ["KPIs", "Visual analytics", "Filtros", "Exportación"],
      status: "available",
      statusLabel: "Implementable",
      setup: 650,
      monthly: 99,
      priceLabel: "Desde US$650 + US$99/mes"
    },
    {
      id: "revenue",
      category: "automation",
      icon: "$",
      name: "Revenue Opportunity Intelligence",
      summary: "Descubrimiento, evaluación y reconciliación de oportunidades legítimas con evidencia, costes atribuidos y autoridad financiera cerrada por defecto.",
      deliverables: ["Opportunity scoring", "Cost model", "Evidence ledger", "Approval gates"],
      status: "pilot",
      statusLabel: "Piloto · sin promesas de ingresos",
      setup: 1800,
      monthly: 349,
      priceLabel: "Pilotos desde US$1,800"
    },
    {
      id: "quant",
      category: "research",
      icon: "∑",
      name: "Quant Research & Trading Risk Systems",
      summary: "Investigación cuantitativa, contratos de datos, backtesting, walk-forward, risk engine y arquitectura de ejecución supervisada.",
      deliverables: ["Research pipeline", "Backtest design", "Risk controls", "Production gates"],
      status: "research",
      statusLabel: "Research-only · no live capital",
      setup: 2000,
      monthly: 0,
      priceLabel: "Proyectos desde US$2,000"
    },
    {
      id: "governance",
      category: "security",
      icon: "◇",
      name: "AI Governance & Production Readiness",
      summary: "Políticas fail-closed, secretos, supply chain, observabilidad, evaluaciones adversariales, SLOs y evidencia de readiness.",
      deliverables: ["Threat model", "Policy gates", "CI/CD controls", "Readiness report"],
      status: "available",
      statusLabel: "Servicio de ingeniería",
      setup: 2500,
      monthly: 299,
      priceLabel: "Desde US$2,500"
    },
    {
      id: "multiagent",
      category: "automation",
      icon: "✦",
      name: "Multi-Agent Orchestration",
      summary: "Sistemas coordinados con agentes especializados, routing, colas, APIs, memoria, approvals, retries, idempotencia y observabilidad.",
      deliverables: ["Agent registry", "Routing", "Durable workflows", "Observability"],
      status: "pilot",
      statusLabel: "Proyecto a medida",
      setup: 4500,
      monthly: 790,
      priceLabel: "Desde US$4,500 + soporte"
    }
  ];

  const categories = [
    ["all", "Todos"],
    ["automation", "Automatización"],
    ["business", "Ventas & soporte"],
    ["media", "Media"],
    ["integrations", "Integraciones"],
    ["data", "Datos"],
    ["security", "Gobernanza"],
    ["research", "Research"]
  ];

  const formatMoney = (value) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

  const serviceCard = (service) => `
    <article class="service-card reveal" data-category="${service.category}" data-service-id="${service.id}">
      <div class="service-topline">
        <span class="service-icon" aria-hidden="true">${service.icon}</span>
        <span class="status-badge status-${service.status}">${service.statusLabel}</span>
      </div>
      <h3>${service.name}</h3>
      <p>${service.summary}</p>
      <ul class="service-deliverables" aria-label="Entregables incluidos">
        ${service.deliverables.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <div class="service-footer">
        <div>
          <span class="price-caption">Precio de lanzamiento</span>
          <strong>${service.priceLabel}</strong>
        </div>
        <button class="mini-action" type="button" data-add-service="${service.id}" aria-pressed="false">Añadir</button>
      </div>
    </article>`;

  const homeMarkup = `
    <section class="commercial-home" data-view="home">
      <section class="hero-v2" id="inicio">
        <div class="hero-copy reveal">
          <div class="eyebrow"><span class="live-dot"></span> Agentic Systems Studio · 2026</div>
          <h1>Agentes de IA que <span>trabajan con controles reales.</span></h1>
          <p class="lead">Diseñamos automatización, agentes, media intelligence, integraciones y sistemas de decisión con ingeniería, seguridad y aprobación humana donde importa.</p>
          <div class="actions">
            <a class="button primary" href="#servicios">Explorar servicios <span aria-hidden="true">↘</span></a>
            <a class="button secondary" href="#configurador">Configurar una solución</a>
          </div>
          <div class="hero-trust" aria-label="Principios de operación">
            <span>✓ Human-in-the-loop</span>
            <span>✓ Fail-closed</span>
            <span>✓ APIs oficiales</span>
            <span>✓ Evidencia auditable</span>
          </div>
        </div>

        <div class="agent-console reveal" aria-label="Visualización del sistema de agentes">
          <div class="console-bar">
            <span class="console-dot"></span><span class="console-dot"></span><span class="console-dot"></span>
            <span class="console-title">Jadel Agent Control Plane</span>
            <span class="console-state">ONLINE</span>
          </div>
          <div class="agent-core">
            <div class="core-orbit orbit-a"><span>Media</span><span>Data</span><span>Sales</span></div>
            <div class="core-orbit orbit-b"><span>Risk</span><span>Policy</span><span>Ops</span></div>
            <div class="core-node"><strong>JT</strong><small>ORCHESTRATOR</small></div>
          </div>
          <div class="console-events" aria-live="polite">
            <div><span class="event-ok">PASS</span><b>Policy gate</b><small>external action requires approval</small></div>
            <div><span class="event-ok">PASS</span><b>Evidence ledger</b><small>trace id attached</small></div>
            <div><span class="event-wait">HITL</span><b>Human approval</b><small>waiting before side effect</small></div>
          </div>
        </div>
      </section>

      <section class="signal-strip reveal" aria-label="Capacidades verificables">
        <div><strong>4</strong><span>plataformas sociales en conectores CineForge</span></div>
        <div><strong>3</strong><span>niveles de madurez visibles en el catálogo</span></div>
        <div><strong>0</strong><span>acciones críticas autónomas sin gates</span></div>
        <div><strong>24/7</strong><span>arquitectura preparada para observabilidad</span></div>
      </section>

      <section class="section-block" id="servicios">
        <div class="section-heading reveal">
          <div>
            <div class="eyebrow">Catálogo de capacidades</div>
            <h2>Un estudio de agentes, no una caja negra.</h2>
          </div>
          <p>Cada servicio indica su nivel real de madurez. “Piloto” no se presenta como producción y “Research-only” nunca se vende como operación financiera real.</p>
        </div>
        <div class="filter-row reveal" role="group" aria-label="Filtrar servicios">
          ${categories.map(([id, label], index) => `<button type="button" class="filter-chip${index === 0 ? " is-active" : ""}" data-filter="${id}" aria-pressed="${index === 0}">${label}</button>`).join("")}
        </div>
        <div class="services-grid" id="services-grid">
          ${services.map(serviceCard).join("")}
        </div>
      </section>

      <section class="section-block split-section" id="metodo">
        <div class="section-heading reveal">
          <div>
            <div class="eyebrow">Cómo trabajamos</div>
            <h2>De problema real a sistema controlado.</h2>
          </div>
          <p>La autonomía se gana con evidencia. Primero definimos valor, después permisos, ejecución, observabilidad y criterios de promoción.</p>
        </div>
        <ol class="process-grid">
          <li class="process-card reveal"><span>01</span><h3>Descubrir</h3><p>Proceso, datos, coste actual, riesgos, restricciones y objetivo medible.</p></li>
          <li class="process-card reveal"><span>02</span><h3>Diseñar</h3><p>Arquitectura, contratos, integraciones, guardrails, HITL y modelo de datos.</p></li>
          <li class="process-card reveal"><span>03</span><h3>Validar</h3><p>Tests, evals, sandbox, observabilidad, seguridad y evidencia de calidad.</p></li>
          <li class="process-card reveal"><span>04</span><h3>Operar</h3><p>Despliegue gradual, SLOs, alertas, reconciliación y mejora controlada.</p></li>
        </ol>
      </section>

      <section class="section-block configurator-shell" id="configurador">
        <div class="section-heading reveal">
          <div>
            <div class="eyebrow">Configurador interactivo</div>
            <h2>Construye tu alcance en segundos.</h2>
          </div>
          <p>Selecciona capacidades. La estimación es orientativa y no incluye consumo de APIs, licencias de terceros, impuestos ni requisitos extraordinarios de cumplimiento.</p>
        </div>
        <div class="configurator reveal">
          <div class="selected-services" id="selected-services">
            <div class="empty-selection">
              <span>+</span>
              <strong>Tu solución está vacía</strong>
              <p>Añade servicios desde el catálogo para estimar implementación y soporte.</p>
            </div>
          </div>
          <aside class="estimate-card">
            <span class="estimate-label">Estimación inicial</span>
            <div class="estimate-row"><span>Implementación</span><strong id="estimate-setup">US$0</strong></div>
            <div class="estimate-row"><span>Soporte mensual</span><strong id="estimate-monthly">US$0</strong></div>
            <div class="estimate-note">Rango recomendado final: ±25% según integraciones, volumen y controles requeridos.</div>
            <button class="button primary full" type="button" id="copy-brief" disabled>Copiar brief de proyecto</button>
            <span class="copy-feedback" id="copy-feedback" role="status"></span>
          </aside>
        </div>
      </section>

      <section class="section-block pricing-section" id="precios">
        <div class="section-heading reveal">
          <div>
            <div class="eyebrow">Paquetes de lanzamiento</div>
            <h2>Precios claros para empezar. Escala solo cuando genera valor.</h2>
          </div>
          <p>Posicionamiento entre herramientas self-service y consultoría enterprise: más implementación que un SaaS genérico, sin empezar en tickets de US$10k para cada proyecto.</p>
         </div>
        <div class="pricing-grid">
          <article class="pricing-card reveal">
            <span class="plan-label">Discover</span><h3>Agentic Blueprint</h3><div class="plan-price"><strong>US$250</strong><span>desde</span></div>
            <p>Para identificar el primer workflow con ROI y controles claros.</p>
            <ul><li>Discovery</li><li>Mapa de automatización</li><li>Arquitectura propuesta</li><li>Backlog y estimación</li></ul>
            <a href="#configurador" class="button secondary full">Empezar por diagnóstico</a>
          </article>
          <article class="pricing-card featured reveal">
            <div class="popular-pill">Más adaptable</div><span class="plan-label">Build</span><h3>Business Agent</h3><div class="plan-price"><strong>US$1.5k</strong><span>setup desde</span></div>
            <p>Un agente conectado a procesos reales con supervisión y observabilidad.</p>
            <ul><li>1 agente principal</li><li>Hasta 3 integraciones estándar</li><li>Guardrails + HITL</li><li>Tests y handoff</li></ul>
            <a href="#servicios" class="button primary full">Elegir capacidades</a>
          </article>
          <article class="pricing-card reveal">
            <span class="plan-label">Scale</span><h3>Agentic System</h3><div class="plan-price"><strong>US$4.5k</strong><span>setup desde</span></div>
            <p>Orquestación multi-agente para procesos con datos, estados y operaciones durables.</p>
            <ul><li>Multi-agent routing</li><li>Workflows durables</li><li>Policy/risk gates</li><li>SLOs + evidence</li></ul>
            <a href="#configurador" class="button secondary full">Configurar sistema</a>
          </article>
          <article class="pricing-card reveal">
            <span class="plan-label">Enterprise</span><h3>Managed Agent Platform</h3><div class="plan-price"><strong>Custom</strong><span>desde US$10k</span></div>
            <p>Implementación con seguridad, gobernanza, integraciones especiales y soporte.</p>
            <ul><li>Arquitectura dedicada</li><li>Seguridad y compliance</li><li>Observabilidad avanzada</li><li>Roadmap y soporte</li></ul>
            <a href="#gobernanza" class="button secondary full">Ver controles</a>
          </article>
        </div>
      </section>

      <section class="section-block governance-section" id="gobernanza">
        <div class="governance-panel reveal">
          <div>
            <div class="eyebrow">Trust layer</div>
            <h2>La seguridad no está detrás del producto. Está dentro.</h2>
            <p>Acciones externas, identidad, dinero, contratos y decisiones críticas requieren controles deterministas y, cuando corresponde, aprobación humana.</p>
          </div>
          <div class="governance-grid">
            <div><span>AUTH</span><strong>Least privilege</strong><small>tokens y permisos mínimos</small></div>
            <div><span>POLICY</span><strong>Fail-closed</strong><small>sin evidencia, no se ejecuta</small></div>
            <div><span>HITL</span><strong>Human approval</strong><small>side effects sensibles</small></div>
            <div><span>AUDIT</span><strong>Evidence ledger</strong><small>qué ocurrió y por qué</small></div>
            <div><span>SRE</span><strong>Observability</strong><small>SLI, SLO, alertas, health</small></div>
            <div><span>QA</span><strong>Adversarial evals</strong><small>inyección, permisos, regresión</small></div>
          </div>
        </div>
      </section>

      <section class="section-block benchmark-section">
        <div class="section-heading reveal">
          <div><div class="eyebrow">Posicionamiento</div><h2>Diseñado para competir en 2026 sin copiar a nadie.</h2></div>
          <p>Tomamos los patrones que convierten en SaaS modernos —valor inmediato, producto visible, pricing, prueba social verificable y demos— y los combinamos con una diferenciación fuerte: gobernanza y madurez explícita.</p>
        </div>
        <div class="benchmark-grid">
          <div class="benchmark-card reveal"><span>01</span><strong>Producto visible</strong><p>El visitante entiende qué hace cada agente antes de hablar con ventas.</p></div>
          <div class="benchmark-card reveal"><span>02</span><strong>Pricing orientativo</strong><p>Reduce fricción sin prometer un alcance que todavía no fue descubierto.</p></div>
          <div class="benchmark-card reveal"><span>03</span><strong>Interacción útil</strong><p>Filtros y configurador convierten la web en una mini experiencia de producto.</p></div>
          <div class="benchmark-card reveal"><span>04</span><strong>Confianza verificable</strong><p>Sin logos inventados, ROI fabricado ni estados de producción falsos.</p></div>
        </div>
      </section>

      <section class="section-block faq-section" id="faq">
        <div class="section-heading reveal"><div><div class="eyebrow">FAQ</div><h2>Preguntas antes de construir.</h2></div></div>
        <div class="faq-list">
          <details class="reveal"><summary>¿Los agentes actúan sin aprobación?</summary><p>No por defecto. Las acciones con impacto externo o riesgo elevado se diseñan con gates, permisos mínimos y aprobación humana cuando corresponde.</p></details>
          <details class="reveal"><summary>¿Los precios incluyen OpenAI, modelos o APIs de terceros?</summary><p>No. Los precios publicados son de implementación/soporte. Consumo de modelos, SaaS, almacenamiento, telefonía, mensajería y otros proveedores se cotizan o trasladan según uso.</p></details>
          <details class="reveal"><summary>¿CineForge publica automáticamente en redes sociales?</summary><p>El repositorio incluye conectores y gobernanza, pero la publicación live permanece bloqueada hasta validar credenciales, permisos, revisiones de plataforma y contract tests. Se puede ofrecer producción y flujo supervisado sin afirmar autonomía no certificada.</p></details>
          <details class="reveal"><summary>¿Ofrecen un bot de trading rentable?</summary><p>No se promete rentabilidad ni operación autónoma de capital. El servicio comercializable es investigación cuantitativa, backtesting, diseño de riesgo, testnet y readiness técnico con etapas y aprobación explícitas.</p></details>
          <details class="reveal"><summary>¿Se puede integrar con mis herramientas actuales?</summary><p>Sí, siempre que exista una API, webhook, MCP o conector autorizado. Priorizamos integraciones oficiales y evitamos automatizaciones que dependan de evadir controles de plataforma.</p></details>
        </div>
      </section>

      <section class="final-cta reveal">
        <div><div class="eyebrow">Jadel Tech RD</div><h2>Tu próximo empleado digital debería empezar como un sistema bien diseñado.</h2><p>Explora el catálogo, arma el alcance y valida el primer caso de uso antes de escalar autonomía.</p></div>
        <div class="actions"><a class="button primary" href="#configurador">Construir mi alcance</a><a class="button secondary" href="/?view=privacy">Privacidad y datos</a></div>
      </section>
    </section>`;

  const main = document.getElementById("main");
  if (!main) return;

  // Preserve the legal data-deletion page required by platform review.
  if (!main.querySelector('[data-view="data-deletion"]')) {
    const article = document.createElement("article");
    article.className = "legal";
    article.dataset.view = "data-deletion";
    article.hidden = true;
    article.innerHTML = `
      <div class="legal-heading">
        <div class="eyebrow">Documento público</div>
        <h1>Instrucciones para la eliminación de datos</h1>
        <p class="muted">Última actualización: 28 de agosto de 2026.</p>
      </div>
      <p>Esta página explica cómo solicitar la eliminación de datos asociados a una aplicación o integración de Jadel Tech RD. No publiques contraseñas, tokens, documentos de identidad ni otra información sensible en repositorios, comentarios públicos o redes sociales.</p>
      <h2>1. Revocar el acceso de la aplicación</h2>
      <p>Si conectaste la aplicación mediante Meta/Facebook u otra plataforma de terceros, puedes retirar primero el acceso desde los controles de aplicaciones e integraciones de esa plataforma. Revocar el acceso impide nuevas consultas autorizadas, pero no sustituye una solicitud de eliminación cuando existan datos que deban borrarse de nuestros sistemas.</p>
      <h2>2. Solicitar la eliminación</h2>
      <p>La solicitud debe identificar la aplicación utilizada y aportar únicamente la información mínima necesaria para localizar la cuenta o registro correspondiente. Podremos pedir una verificación razonable de identidad para evitar eliminaciones fraudulentas o no autorizadas.</p>
      <h2>3. Qué ocurre después</h2>
      <p>Una vez validada la solicitud, eliminaremos o anonimizaremos los datos que podamos borrar de acuerdo con la legislación, obligaciones contractuales y controles de seguridad aplicables. Algunos registros podrán conservarse cuando exista una obligación legal, contable, de seguridad, prevención de fraude o resolución de disputas.</p>
      <h2>4. Estado del canal de contacto</h2>
      <p>El canal público de privacidad todavía no ha sido publicado en este sitio. Hasta que se configure una dirección real y verificada, esta página funciona como las instrucciones públicas de eliminación, pero no debe considerarse un mecanismo de recepción de solicitudes.</p>
      <h2>5. URL pública de estas instrucciones</h2>
      <p><code>https://jadeltechrd.com/?view=data-deletion</code></p>`;
    main.appendChild(article);
  }

  const legacyHome = [...main.querySelectorAll('[data-view="home"]')];
  if (legacyHome.length) {
    legacyHome[0].insertAdjacentHTML("beforebegin", homeMarkup);
    legacyHome.forEach((node) => node.remove());
  }

  const headerNav = document.querySelector(".nav");
  if (headerNav) {
    headerNav.innerHTML = `
      <a href="/" data-nav="home">Inicio</a>
      <a href="/#servicios" data-home-nav>Servicios</a>
      <a href="/#precios" data-home-nav>Precios</a>
      <a href="/#gobernanza" data-home-nav>Seguridad</a>
      <a href="/?view=privacy" data-nav="privacy">Privacidad</a>
      <a href="/?view=terms" data-nav="terms">Condiciones</a>
      <a href="${DATA_DELETION_URL}" data-nav="data-deletion">Eliminar datos</a>`;
  }

  const footerNav = document.querySelector('.site-footer nav[aria-label="Enlaces legales"]');
  if (footerNav) {
    footerNav.innerHTML = `
      <a href="/#servicios">Servicios</a>
      <a href="/#precios">Precios</a>
      <a href="/?view=privacy">Privacidad</a>
      <a href="/?view=terms">Condiciones</a>
      <a href="${DATA_DELETION_URL}">Eliminación de datos</a>`;
  }

  const privacyArticle = document.querySelector('[data-view="privacy"]');
  if (privacyArticle && !privacyArticle.querySelector('a[href="/?view=data-deletion"]')) {
    const deletionHeading = [...privacyArticle.querySelectorAll("h2")].find((heading) => heading.textContent.includes("Eliminación de datos"));
    if (deletionHeading) {
      const paragraph = deletionHeading.nextElementSibling;
      if (paragraph) {
        const note = document.createElement("p");
        note.innerHTML = 'Consulta también nuestras <a href="/?view=data-deletion">instrucciones públicas para la eliminación de datos</a>.';
        paragraph.insertAdjacentElement("afterend", note);
      }
    }
  }

  const params = new URLSearchParams(window.location.search);
  const requested = params.get("view");
  const allowedViews = new Set(["privacy", "terms", "data-deletion"]);
  const view = allowedViews.has(requested) ? requested : "home";

  const titles = {
    home: "Agentes de IA & Automatización | Jadel Tech RD",
    privacy: "Política de Privacidad | Jadel Tech RD",
    terms: "Condiciones del Servicio | Jadel Tech RD",
    "data-deletion": "Eliminación de Datos | Jadel Tech RD",
  };
  const descriptions = {
    home: "Diseño e integración de agentes de IA, automatización, social intelligence, video, datos, seguridad y sistemas agentic con supervisión y gobernanza.",
    privacy: "Política de Privacidad de las aplicaciones y servicios de Jadel Tech RD.",
    terms: "Condiciones del Servicio de las aplicaciones y servicios de Jadel Tech RD.",
    "data-deletion": "Instrucciones públicas para solicitar la eliminación de datos asociados a aplicaciones de Jadel Tech RD.",
  };
  document.title = titles[view];
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", descriptions[view]);

  document.querySelectorAll("[data-view]").forEach((node) => {
    node.hidden = node.getAttribute("data-view") !== view;
  });
  document.querySelectorAll("[data-home-nav]").forEach((link) => {
    link.hidden = view !== "home";
  });
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.getAttribute("data-nav") === view) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = view === "home" ? "https://jadeltechrd.com/" : `https://jadeltechrd.com/?view=${view}`;
  document.head.appendChild(canonical);

  if (view === "home") {
    const structured = document.createElement("script");
    structured.type = "application/ld+json";
    structured.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "Jadel Tech RD",
      url: "https://jadeltechrd.com/",
      description: descriptions.home,
      areaServed: "Worldwide",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de agentes de IA y automatización",
        itemListElement: services.map((service) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: service.name,  description: service.summary },
          priceCurrency: "USD",
          price: String(service.setup),
        })),
      },
    });
    document.head.appendChild(structured);

    const selected = new Set();
    const grid = document.getElementById("services-grid");
    const selectedContainer = document.getElementById("selected-services");
    const setupOutput = document.getElementById("estimate-setup");
    const monthlyOutput = document.getElementById("estimate-monthly");
    const copyButton = document.getElementById("copy-brief");
    const feedback = document.getElementById("copy-feedback");

    const renderEstimate = () => {
      const chosen = services.filter((service) => selected.has(service.id));
      const setup = chosen.reduce((sum, service) => sum + service.setup, 0);
      const monthly = chosen.reduce((sum, service) => sum + service.monthly, 0);
      setupOutput.textContent = formatMoney(setup);
      monthlyOutput.textContent = formatMoney(monthly);
      copyButton.disabled = chosen.length === 0;
      selectedContainer.innerHTML = chosen.length
        ? chosen.map((service) => `<button type="button" class="selected-chip" data-remove-service="${service.id}"><span>${service.icon}</span>${service.name}<b aria-label="Quitar">×</b></button>`).join("")
        : `<div class="empty-selection"><span>+</span><strong>Tu solución está vacía</strong><p>Añade servicios desde el catálogo para estimar implementación y soporte.</p></div>`;
      document.querySelectorAll("[data-add-service]").forEach((button) => {
        const active = selected.has(button.dataset.addService);
        button.setAttribute("aria-pressed", String(active));
        button.textContent = active ? "Añadido ✓" : "Añadir";
      });
    };

    grid?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-service]");
      if (!button) return;
      const id = button.dataset.addService;
      if (selected.has(id)) selected.delete(id); else selected.add(id);
      renderEstimate();
    });
    selectedContainer?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-service]");
      if (!button) return;
      selected.delete(button.dataset.removeService);
      renderEstimate();
    });

    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        document.querySelectorAll("[data-filter]").forEach((node) => {
          const active = node === button;
          node.classList.toggle("is-active", active);
          node.setAttribute("aria-pressed", String(active));
        });
        document.querySelectorAll(".service-card").forEach((card) => {
          card.hidden = filter !== "all" && card.dataset.category !== filter;
        });
      });
    });

    copyButton?.addEventListener("click", async () => {
      const chosen = services.filter((service) => selected.has(service.id));
      if (!chosen.length) return;
      const setup = chosen.reduce((sum, service) => sum + service.setup, 0);
      const monthly = chosen.reduce((sum, service) => sum + service.monthly, 0);
      const brief = [
        "Jadel Tech RD · Brief preliminar",
        "",
        ...chosen.map((service) => `- ${service.name} (${service.statusLabel})`),
        "",
        `Implementación estimada: ${formatMoney(setup)} (±25%)`,
        `Soporte mensual estimado: ${formatMoney(monthly)} (±25%)`,
        "",
        "Nota: estimación orientativa; no incluye consumo de APIs, licencias de terceros, impuestos ni requisitos extraordinarios de cumplimiento."
      ].join("\n");
      try {
        await navigator.clipboard.writeText(brief);
        feedback.textContent = "Brief copiado al portapapeles.";
      } catch {
        feedback.textContent = "No se pudo copiar automáticamente. Selecciona el texto manualmente desde tu navegador.";
      }
      window.setTimeout(() => { feedback.textContent = ""; }, 3500);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

    const home = document.querySelector(".commercial-home");
    home?.addEventListener("pointermove", (event) => {
      const rect = home.getBoundingClientRect();
      home.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      home.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }, { passive: true });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
