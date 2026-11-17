// eleventy-plugin-editar
//
// Durante `eleventy --serve`, marca los textos del sitio para editarlos en el
// navegador y los guarda de vuelta en su archivo. En `eleventy` (build) no deja
// rastro: los filtros devuelven el texto (o su HTML) tal cual.
//
//   eleventyConfig.addPlugin(require("eleventy-plugin-editar"), { activo: process.env.EDITAR === "1" });
//
//   {{ portada.bajada | editable: "portada", "bajada" }}              texto de _data/portada.json
//   {{ t.titulo | editable: archivo, "abordar.items", i.id, "titulo" }} la ruta se arma por partes
//   {{ item | editableMd: "trayectoria", "formacion.items", forloop.index0 }}  Markdown en línea
//   {{ title | editableFm: page.inputPath, "title" }}                 campo del frontmatter
//   <article{{ page.inputPath | editarMarkdown }}>                    abre el editor del archivo .md
const fs = require("node:fs");
const path = require("node:path");
const MarkdownIt = require("markdown-it");
const { aplicarCambios, leerMarkdown, escribirMarkdown, ErrorEdicion } = require("./lib/datos");

const CLIENTE = path.join(__dirname, "cliente");
const TIPOS = { ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const LOCALES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

const escaparAtributo = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const atributos = (pares) =>
  Object.entries(pares)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escaparAtributo(v)}"`))
    .join("");

function crearMarkdown(abrirExternos) {
  const md = new MarkdownIt({ html: true, typographer: false });
  if (abrirExternos) {
    const original = md.renderer.rules.link_open || ((t, i, o, e, s) => s.renderToken(t, i, o));
    md.renderer.rules.link_open = (tokens, i, opciones, env, self) => {
      if (/^https?:\/\//.test(tokens[i].attrGet("href") || "")) {
        tokens[i].attrSet("target", "_blank");
        tokens[i].attrSet("rel", "noopener");
      }
      return original(tokens, i, opciones, env, self);
    };
  }
  return md;
}

const sinFrontmatter = (texto) => texto.replace(/^---\r?\n[\s\S]*?\r?\n---(\r?\n|$)/, "");

function leerCuerpo(req, limite = 2_000_000) {
  return new Promise((resolver, rechazar) => {
    let cuerpo = "";
    req.setEncoding("utf8");
    req.on("data", (trozo) => {
      cuerpo += trozo;
      if (cuerpo.length > limite) rechazar(new ErrorEdicion("Cuerpo demasiado grande", 413));
    });
    req.on("end", () => resolver(cuerpo));
    req.on("error", rechazar);
  });
}

function responder(res, estado, datos) {
  res.statusCode = estado;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(datos));
}

module.exports = function editarPlugin(eleventyConfig, opciones = {}) {
  const {
    activo = process.env.EDITAR === "1",
    carpetaDatos = "_data",
    raiz = process.cwd(),
    excluir = [],
    filtro = "editable",
    prefijo = "/__editar",
    abrirEnlacesExternos = true,
  } = opciones;

  const md = crearMarkdown(abrirEnlacesExternos);
  const salida = eleventyConfig.directories?.output;
  const carpetasExcluidas = ["node_modules", ...(salida ? [path.basename(path.resolve(salida))] : []), ...excluir];
  const archivos = { carpetaDatos: path.resolve(carpetaDatos), raiz: path.resolve(raiz), excluir: carpetasExcluidas };

  // Solo se activa en el servidor de desarrollo, nunca al construir el sitio.
  const encendido = () => activo && process.env.ELEVENTY_RUN_MODE === "serve";
  const unir = (partes) => partes.filter((p) => p !== undefined && p !== null && p !== "").join(".");
  const conHtml = (valor) => /<[a-z!/]/i.test(valor);

  // Texto plano de un JSON. Si el valor trae HTML se muestra, pero no se edita.
  eleventyConfig.addFilter(filtro, function (valor, archivo, ...ruta) {
    if (!encendido() || typeof valor !== "string" || !archivo) return valor;
    return `<span${atributos({ "data-editar": archivo, "data-editar-ruta": unir(ruta), "data-editar-html": conHtml(valor) })}>${valor}</span>`;
  });

  // Markdown en línea (negritas, cursivas, enlaces) de un JSON. Siempre se
  // renderiza; en modo edición se edita la fuente en Markdown.
  eleventyConfig.addFilter(`${filtro}Md`, function (valor, archivo, ...ruta) {
    if (typeof valor !== "string") return valor;
    const html = md.renderInline(valor);
    if (!encendido() || !archivo) return html;
    return `<span${atributos({ "data-editar": archivo, "data-editar-ruta": unir(ruta), "data-editar-fuente": valor })}>${html}</span>`;
  });

  // Campo de una línea del frontmatter de un archivo Markdown (title, resumen…).
  eleventyConfig.addFilter(`${filtro}Fm`, function (valor, archivo, campo) {
    if (!encendido() || typeof valor !== "string" || !/\.md$/i.test(archivo || "")) return valor;
    return `<span${atributos({ "data-editar": archivo, "data-editar-ruta": campo, "data-editar-tipo": "fm", "data-editar-html": conHtml(valor) })}>${valor}</span>`;
  });

  // Atributo para el contenedor de una página hecha desde un .md: habilita el
  // editor de Markdown completo para ese archivo.
  eleventyConfig.addFilter("editarMarkdown", function (archivo) {
    if (!encendido() || !/\.md$/i.test(archivo || "")) return "";
    return atributos({ "data-editar-md": archivo });
  });

  if (!activo) return;

  eleventyConfig.addTransform("editar-cliente", function (contenido) {
    if (!encendido() || !(this.page.outputPath || "").endsWith(".html")) return contenido;
    const etiquetas =
      `<link rel="stylesheet" href="${prefijo}/editar.css">` +
      `<script type="module" src="${prefijo}/editar.js" data-prefijo="${prefijo}"></script>`;
    return contenido.includes("</body>")
      ? contenido.replace("</body>", `${etiquetas}</body>`)
      : contenido + etiquetas;
  });

  const rutas = {
    async "POST guardar"(cuerpo) {
      const archivosEscritos = aplicarCambios(archivos, cuerpo.cambios);
      return { ok: true, archivos: archivosEscritos };
    },
    async "POST md/leer"(cuerpo) {
      return { contenido: leerMarkdown(archivos, cuerpo.archivo) };
    },
    async "POST md/guardar"(cuerpo) {
      return { ok: true, archivos: [escribirMarkdown(archivos, cuerpo.archivo, cuerpo.contenido, cuerpo.original)] };
    },
    async "POST md/vista"(cuerpo) {
      if (typeof cuerpo.contenido !== "string") throw new ErrorEdicion("El contenido no es texto");
      return { html: md.render(sinFrontmatter(cuerpo.contenido)) };
    },
  };

  eleventyConfig.setServerOptions({
    middleware: [
      async function editarMiddleware(req, res, next) {
        const url = new URL(req.url, "http://localhost");
        if (!url.pathname.startsWith(`${prefijo}/`)) return next();

        // Lee y escribe archivos del proyecto: solo se atiende desde esta misma máquina.
        if (!LOCALES.has(req.socket.remoteAddress)) {
          return responder(res, 403, { error: "Solo disponible desde localhost" });
        }

        const nombre = url.pathname.slice(prefijo.length + 1);

        if (req.method === "GET" && /^[\w-]+\.(js|css)$/.test(nombre)) {
          const archivo = path.join(CLIENTE, nombre);
          if (!fs.existsSync(archivo)) return next();
          res.setHeader("Content-Type", TIPOS[path.extname(nombre)]);
          res.setHeader("Cache-Control", "no-store");
          return res.end(fs.readFileSync(archivo));
        }

        const ruta = rutas[`${req.method} ${nombre}`];
        if (!ruta) return next();

        try {
          // Un formulario de otro sitio no puede mandar JSON ni falsear Origin.
          if (!(req.headers["content-type"] || "").startsWith("application/json")) {
            throw new ErrorEdicion("Se espera application/json", 415);
          }
          const origen = req.headers.origin;
          if (origen && new URL(origen).host !== req.headers.host) {
            throw new ErrorEdicion("Origen no permitido", 403);
          }
          const respuesta = await ruta(JSON.parse(await leerCuerpo(req)));
          if (respuesta.archivos) console.log(`[editar] guardado: ${respuesta.archivos.join(", ")}`);
          return responder(res, 200, respuesta);
        } catch (error) {
          const estado = error instanceof ErrorEdicion ? error.estado : error instanceof SyntaxError ? 400 : 500;
          return responder(res, estado, { error: error.message });
        }
      },
    ],
  });
};
