// Cliente de eleventy-plugin-editar.
//  - Textos en línea ([data-editar]): se editan sobre la página y se guardan juntos.
//  - Archivo Markdown ([data-editar-md]): se abre en un panel con vista previa.
const script = document.querySelector("script[data-prefijo]");
const PREFIJO = script?.dataset.prefijo || "/__editar";
const CLAVE_MODO = "editar:modo";
const CLAVE_PANEL = "editar:panel";

const sesion = {
  leer(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  poner(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch {} },
};

async function pedir(ruta, datos) {
  const r = await fetch(`${PREFIJO}/${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json.error || `Error ${r.status}`);
  return json;
}

const el = (etiqueta, props = {}, ...hijos) => {
  const n = Object.assign(document.createElement(etiqueta), props);
  n.append(...hijos);
  return n;
};

// ───────────────────────── Textos en línea ─────────────────────────
const campos = [...document.querySelectorAll("[data-editar]")];
const tipo = (c) => c.dataset.editarTipo || "json";
const clave = (c) => `${tipo(c)}|${c.dataset.editar}|${c.dataset.editarRuta}`;
const esFuente = (c) => "editarFuente" in c.dataset;
const editableEnLinea = (c) => !("editarHtml" in c.dataset);
const originales = new Map(); // clave → texto (o fuente Markdown) al cargar
const cambios = new Map();    // clave → texto nuevo
const renderizado = new Map(); // campo → HTML original, para los de Markdown en línea

for (const c of campos) {
  const valor = esFuente(c) ? c.dataset.editarFuente : c.textContent;
  if (!originales.has(clave(c))) originales.set(clave(c), valor);
  if (esFuente(c)) renderizado.set(c, c.innerHTML);
  const archivo = tipo(c) === "fm" ? c.dataset.editar.replace(/^\.\//, "") : `${c.dataset.editar}.json`;
  c.title = `${archivo} → ${c.dataset.editarRuta}${esFuente(c) ? " (Markdown)" : ""}`;
}

// ───────────────────────── Barra ─────────────────────────
const archivoMd = document.querySelector("[data-editar-md]")?.dataset.editarMd;
const barra = el("div", { className: "editar-barra" });
barra.setAttribute("role", "region");
barra.setAttribute("aria-label", "Edición de contenido");
const bModo = el("button", { type: "button", className: "editar-modo", textContent: "Editar textos" });
bModo.setAttribute("aria-pressed", "false");
const bMd = el("button", { type: "button", className: "editar-abrir-md", textContent: "Editar Markdown", hidden: !archivoMd });
const estado = el("span", { className: "editar-estado" });
estado.setAttribute("role", "status");
estado.setAttribute("aria-live", "polite");
const bDescartar = el("button", { type: "button", className: "editar-descartar", textContent: "Descartar", hidden: true });
const bGuardar = el("button", { type: "button", className: "editar-guardar", hidden: true }, "Guardar ", el("kbd", { textContent: "⌘S" }));
if (campos.length === 0) bModo.hidden = true;
barra.append(bModo, bMd, estado, bDescartar, bGuardar);
document.body.append(barra);

let modo = sesion.leer(CLAVE_MODO) === "1";

function decir(texto, tipoEstado = "") {
  estado.textContent = texto;
  estado.dataset.tipo = tipoEstado;
}

function refrescar() {
  const n = cambios.size;
  bGuardar.hidden = bDescartar.hidden = n === 0;
  if (n) decir(n === 1 ? "1 cambio sin guardar" : `${n} cambios sin guardar`);
  else if (modo) decir(`${campos.filter(editableEnLinea).length} textos editables`);
  else decir("");
}

function ponerModo(activo) {
  modo = activo;
  sesion.poner(CLAVE_MODO, activo ? "1" : "0");
  document.documentElement.classList.toggle("editar-activo", activo);
  bModo.setAttribute("aria-pressed", String(activo));
  for (const c of campos) {
    if (!editableEnLinea(c)) continue;
    if (!activo) { c.removeAttribute("contenteditable"); continue; }
    c.contentEditable = "plaintext-only";
    if (c.contentEditable !== "plaintext-only") c.contentEditable = "true";
    c.spellcheck = true;
  }
  refrescar();
}

// Al entrar a un texto con Markdown en línea se muestra su fuente; al salir sin
// cambios, vuelve a verse renderizado.
function mostrarFuente(c) {
  if (!esFuente(c) || c.dataset.editarViendoFuente) return;
  c.dataset.editarViendoFuente = "1";
  c.textContent = cambios.get(clave(c)) ?? originales.get(clave(c));
}
function mostrarRender(c) {
  if (!esFuente(c) || cambios.has(clave(c))) return;
  delete c.dataset.editarViendoFuente;
  c.innerHTML = renderizado.get(c);
}

// Un mismo texto puede aparecer varias veces en la página: se mantienen iguales.
function sincronizar(origen) {
  const k = clave(origen);
  const texto = origen.textContent.replace(/\s*\n\s*/g, " ");
  for (const c of campos) {
    if (c === origen || clave(c) !== k) continue;
    if (esFuente(c)) c.dataset.editarViendoFuente = "1";
    c.textContent = texto;
  }
  const cambiado = texto !== originales.get(k);
  if (cambiado) cambios.set(k, texto); else cambios.delete(k);
  for (const c of campos) if (clave(c) === k) c.classList.toggle("editar-cambiado", cambiado);
  refrescar();
}

function revertir(c) {
  const k = clave(c);
  cambios.delete(k);
  for (const otro of campos) {
    if (clave(otro) !== k) continue;
    otro.classList.remove("editar-cambiado");
    if (esFuente(otro)) { delete otro.dataset.editarViendoFuente; otro.innerHTML = renderizado.get(otro); }
    else otro.textContent = originales.get(k);
  }
  refrescar();
}

let recargando = false;
function recargarPronto() {
  recargando = true;
  // Eleventy reconstruye y recarga solo; esto cubre el caso en que no lo haga.
  setTimeout(() => location.reload(), 4000);
}

async function guardar() {
  if (!cambios.size) return;
  const lista = [...cambios].map(([k, valor]) => {
    const [t, archivo, ruta] = k.split("|");
    return { tipo: t, archivo, ruta, valor, original: originales.get(k) };
  });
  bGuardar.disabled = true;
  decir("Guardando…");
  try {
    const datos = await pedir("guardar", { cambios: lista });
    for (const [k, v] of cambios) originales.set(k, v);
    cambios.clear();
    for (const c of campos) c.classList.remove("editar-cambiado");
    bGuardar.hidden = bDescartar.hidden = true;
    decir(`Guardado en ${datos.archivos.join(", ")}`, "ok");
    recargarPronto();
  } catch (error) {
    decir(error.message, "error");
  } finally {
    bGuardar.disabled = false;
  }
}

bModo.addEventListener("click", () => ponerModo(!modo));
bGuardar.addEventListener("click", guardar);
bDescartar.addEventListener("click", () => {
  for (const c of campos) if (cambios.has(clave(c))) revertir(c);
});

document.addEventListener("focusin", (e) => {
  const c = e.target.closest?.("[data-editar]");
  if (c && modo) mostrarFuente(c);
});
document.addEventListener("focusout", (e) => {
  const c = e.target.closest?.("[data-editar]");
  if (c) mostrarRender(c);
});
document.addEventListener("input", (e) => {
  const c = e.target.closest?.("[data-editar]");
  if (c) sincronizar(c);
});

document.addEventListener("keydown", (e) => {
  if (panel.abierto()) return;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s" && cambios.size) {
    e.preventDefault();
    guardar();
    return;
  }
  const c = e.target.closest?.("[data-editar]");
  if (!c || !modo) return;
  if (e.key === "Enter") { e.preventDefault(); c.blur(); }
  if (e.key === "Escape") { revertir(c); c.blur(); }
});

// Pegar siempre como texto, también donde no existe plaintext-only.
document.addEventListener("paste", (e) => {
  const c = e.target.closest?.("[data-editar]");
  if (!c || !modo) return;
  e.preventDefault();
  const texto = e.clipboardData.getData("text/plain").replace(/\s*\n\s*/g, " ");
  document.execCommand("insertText", false, texto);
});

// En modo edición, hacer clic en un texto dentro de un enlace no navega.
document.addEventListener("click", (e) => {
  if (modo && e.target.closest?.("[data-editar]")) e.preventDefault();
}, true);

window.addEventListener("beforeunload", (e) => {
  if (!recargando && (cambios.size || panel.sucio())) e.preventDefault();
});

// ───────────────────────── Editor de Markdown ─────────────────────────
const panel = (() => {
  if (!archivoMd) return { abierto: () => false, sucio: () => false };

  let original = "";
  let abierto = false;
  let vistaPendiente = 0;

  const ruta = archivoMd.replace(/^\.\//, "");
  const area = el("textarea", { className: "editar-md-texto", spellcheck: true });
  area.setAttribute("aria-label", `Contenido de ${ruta}`);
  const vista = el("div", { className: "editar-md-vista" });
  vista.setAttribute("aria-label", "Vista previa");
  const estadoMd = el("span", { className: "editar-md-estado" });
  estadoMd.setAttribute("role", "status");
  estadoMd.setAttribute("aria-live", "polite");
  const conteo = el("span", { className: "editar-md-conteo" });
  const bGuardarMd = el("button", { type: "button", className: "editar-guardar" }, "Guardar ", el("kbd", { textContent: "⌘S" }));
  const bCerrar = el("button", { type: "button", className: "editar-md-cerrar", textContent: "Cerrar" });
  bCerrar.setAttribute("aria-label", "Cerrar el editor");
  const bVista = el("button", { type: "button", className: "editar-md-alternar", textContent: "Vista previa" });
  bVista.setAttribute("aria-pressed", "false");

  // [etiqueta, título, antes, después, por defecto, al inicio de línea]
  const formatos = [
    ["B", "Negrita (⌘B)", "**", "**", "texto"],
    ["I", "Cursiva (⌘I)", "*", "*", "texto"],
    ["H2", "Título de sección", "## ", "", "Título", true],
    ["H3", "Subtítulo", "### ", "", "Subtítulo", true],
    ["Enlace", "Enlace (⌘K)", "[", "](https://)", "texto"],
    ["Lista", "Lista", "- ", "", "elemento", true],
    ["Cita", "Cita", "> ", "", "cita", true],
    ["Código", "Código", "`", "`", "código"],
  ];
  const herramientas = el("div", { className: "editar-md-herramientas" });
  herramientas.setAttribute("role", "toolbar");
  herramientas.setAttribute("aria-label", "Formato");
  for (const [etiqueta, titulo, antes, despues, porDefecto, linea] of formatos) {
    const b = el("button", { type: "button", textContent: etiqueta, title: titulo });
    b.addEventListener("click", () => envolver(antes, despues, porDefecto, linea));
    herramientas.append(b);
  }

  const dialogo = el("section", { className: "editar-md", hidden: true },
    el("header", { className: "editar-md-cabecera" },
      el("strong", { textContent: "Markdown" }),
      el("code", { textContent: ruta }),
      bVista,
      bCerrar),
    herramientas,
    el("div", { className: "editar-md-cuerpo" }, area, vista),
    el("footer", { className: "editar-md-pie" }, conteo, estadoMd, bGuardarMd));
  dialogo.setAttribute("role", "dialog");
  dialogo.setAttribute("aria-label", `Editor de ${ruta}`);
  document.body.append(dialogo);

  const sucio = () => abierto && area.value !== original;
  const decirMd = (t, tipoEstado = "") => { estadoMd.textContent = t; estadoMd.dataset.tipo = tipoEstado; };

  function actualizarConteo() {
    const cuerpo = area.value.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
    const palabras = (cuerpo.match(/[\p{L}\p{N}]+/gu) || []).length;
    conteo.textContent = `${palabras.toLocaleString("es")} palabras`;
    if (sucio()) decirMd("Cambios sin guardar"); else if (estadoMd.dataset.tipo !== "ok") decirMd("");
  }

  function programarVista() {
    clearTimeout(vistaPendiente);
    vistaPendiente = setTimeout(async () => {
      try {
        const { html } = await pedir("md/vista", { contenido: area.value });
        vista.innerHTML = html;
      } catch (error) {
        vista.textContent = error.message;
      }
    }, 250);
  }

  function envolver(antes, despues, porDefecto, alInicioDeLinea) {
    area.focus();
    let { selectionStart: ini, selectionEnd: fin, value } = area;
    if (alInicioDeLinea) {
      ini = value.lastIndexOf("\n", ini - 1) + 1;
      const lineas = value.slice(ini, fin).split("\n");
      const nuevo = lineas.map((l) => antes + l.replace(/^(#{1,6} |> |- )/, "")).join("\n") || antes + porDefecto;
      area.setRangeText(nuevo, ini, fin, "end");
    } else {
      const seleccion = value.slice(ini, fin) || porDefecto;
      area.setRangeText(antes + seleccion + despues, ini, fin, "select");
      area.setSelectionRange(ini + antes.length, ini + antes.length + seleccion.length);
    }
    area.dispatchEvent(new Event("input"));
  }

  async function abrir() {
    try {
      decir("Abriendo el archivo…");
      const { contenido } = await pedir("md/leer", { archivo: archivoMd });
      original = contenido;
      const borrador = sesion.leer(`${CLAVE_PANEL}:borrador`);
      area.value = borrador ?? contenido;
      sesion.poner(`${CLAVE_PANEL}:borrador`, null);
      abierto = true;
      dialogo.hidden = false;
      document.documentElement.classList.add("editar-md-abierto");
      sesion.poner(CLAVE_PANEL, archivoMd);
      const cursor = Number(sesion.leer(`${CLAVE_PANEL}:cursor`)) || 0;
      area.setSelectionRange(cursor, cursor);
      area.focus();
      actualizarConteo();
      programarVista();
      refrescar();
    } catch (error) {
      decir(error.message, "error");
    }
  }

  function cerrar() {
    if (sucio() && !confirm("Hay cambios sin guardar en el Markdown. ¿Cerrar igual?")) return;
    abierto = false;
    dialogo.hidden = true;
    document.documentElement.classList.remove("editar-md-abierto");
    sesion.poner(CLAVE_PANEL, null);
    bMd.focus();
  }

  async function guardarMd() {
    if (!sucio()) return;
    bGuardarMd.disabled = true;
    decirMd("Guardando…");
    try {
      const datos = await pedir("md/guardar", { archivo: archivoMd, contenido: area.value, original });
      original = area.value;
      sesion.poner(`${CLAVE_PANEL}:cursor`, String(area.selectionStart));
      decirMd(`Guardado en ${datos.archivos[0]}. Recargando…`, "ok");
      recargarPronto();
    } catch (error) {
      decirMd(error.message, "error");
      // Si alguien cambió el archivo, el texto se guarda para no perderlo al recargar.
      if (/cambió/.test(error.message)) sesion.poner(`${CLAVE_PANEL}:borrador`, area.value);
    } finally {
      bGuardarMd.disabled = false;
    }
  }

  area.addEventListener("input", () => { actualizarConteo(); programarVista(); });
  area.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); guardarMd(); }
    else if (mod && e.key.toLowerCase() === "b") { e.preventDefault(); envolver("**", "**", "texto"); }
    else if (mod && e.key.toLowerCase() === "i") { e.preventDefault(); envolver("*", "*", "texto"); }
    else if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); envolver("[", "](https://)", "texto"); }
    else if (e.key === "Tab" && !e.shiftKey && !mod) { e.preventDefault(); area.setRangeText("  ", area.selectionStart, area.selectionEnd, "end"); }
  });
  dialogo.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); cerrar(); }
  });
  bGuardarMd.addEventListener("click", guardarMd);
  bCerrar.addEventListener("click", cerrar);
  bVista.addEventListener("click", () => {
    const solo = dialogo.classList.toggle("editar-md-solo-vista");
    bVista.setAttribute("aria-pressed", String(solo));
  });
  bMd.addEventListener("click", () => (abierto ? cerrar() : abrir()));

  // Tras guardar, la página se recarga: el editor vuelve a abrirse donde estaba.
  if (sesion.leer(CLAVE_PANEL) === archivoMd) abrir();

  return { abierto: () => abierto, sucio };
})();

ponerModo(modo);
