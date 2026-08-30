(() => {
  const DATA_DELETION_URL = "/?view=data-deletion";

  const main = document.getElementById("main");
  if (main && !main.querySelector('[data-view="data-deletion"]')) {
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

      <p>
        Esta página explica cómo solicitar la eliminación de datos asociados a una aplicación o
        integración de Jadel Tech RD. No publiques contraseñas, tokens, documentos de identidad ni
        otra información sensible en repositorios, comentarios públicos o redes sociales.
      </p>

      <h2>1. Revocar el acceso de la aplicación</h2>
      <p>
        Si conectaste la aplicación mediante Meta/Facebook u otra plataforma de terceros, puedes
        retirar primero el acceso desde los controles de aplicaciones e integraciones de esa
        plataforma. Revocar el acceso impide nuevas consultas autorizadas, pero no sustituye una
        solicitud de eliminación cuando existan datos que deban borrarse de nuestros sistemas.
      </p>

      <h2>2. Solicitar la eliminación</h2>
      <p>
        La solicitud debe identificar la aplicación utilizada y aportar únicamente la información
        mínima necesaria para localizar la cuenta o registro correspondiente. Podremos pedir una
        verificación razonable de identidad para evitar eliminaciones fraudulentas o no autorizadas.
      </p>

      <h2>3. Qué ocurre después</h2>
      <p>
        Una vez validada la solicitud, eliminaremos o anonimizaremos los datos que podamos borrar de
        acuerdo con la legislación, obligaciones contractuales y controles de seguridad aplicables.
        Algunos registros podrán conservarse cuando exista una obligación legal, contable, de
        seguridad, prevención de fraude o resolución de disputas.
      </p>

      <h2>4. Estado del canal de contacto</h2>
      <p>
        El canal público de privacidad todavía no ha sido publicado en este sitio. Hasta que se
        configure una dirección real y verificada, esta página funciona como las instrucciones
        públicas de eliminación, pero no debe considerarse un mecanismo de recepción de solicitudes.
      </p>

      <h2>5. URL pública de estas instrucciones</h2>
      <p><code>https://jadeltechrd.com/?view=data-deletion</code></p>
    `;
    main.appendChild(article);
  }

  const headerNav = document.querySelector(".nav");
  if (headerNav && !headerNav.querySelector('[data-nav="data-deletion"]')) {
    const link = document.createElement("a");
    link.href = DATA_DELETION_URL;
    link.dataset.nav = "data-deletion";
    link.textContent = "Eliminar datos";
    headerNav.appendChild(link);
  }

  const footerNav = document.querySelector('.site-footer nav[aria-label="Enlaces legales"]');
  if (footerNav && !footerNav.querySelector('a[href="/?view=data-deletion"]')) {
    const link = document.createElement("a");
    link.href = DATA_DELETION_URL;
    link.textContent = "Eliminación de datos";
    footerNav.appendChild(link);
  }

  const privacyArticle = document.querySelector('[data-view="privacy"]');
  if (privacyArticle && !privacyArticle.querySelector('a[href="/?view=data-deletion"]')) {
    const deletionHeading = [...privacyArticle.querySelectorAll("h2")]
      .find((heading) => heading.textContent.includes("Eliminación de datos"));
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
    home: "Jadel Tech RD",
    privacy: "Política de Privacidad | Jadel Tech RD",
    terms: "Condiciones del Servicio | Jadel Tech RD",
    "data-deletion": "Eliminación de Datos | Jadel Tech RD",
  };

  const descriptions = {
    home: "Sitio oficial de Jadel Tech RD para información pública de aplicaciones y servicios.",
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

  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.getAttribute("data-nav") === view) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = view === "home"
    ? "https://jadeltechrd.com/"
    : `https://jadeltechrd.com/?view=${view}`;
  document.head.appendChild(canonical);

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
