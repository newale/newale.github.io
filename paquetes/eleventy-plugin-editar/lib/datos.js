// Lectura y escritura segura de los archivos que edita el plugin:
//   - textos dentro de los JSON de la carpeta de datos      (tipo "json")
//   - campos de una línea en el frontmatter de un Markdown  (tipo "fm")
//   - archivos Markdown completos                           (leerMarkdown / escribirMarkdown)
// No depende de Eleventy: se puede probar y reutilizar por separado.
const fs = require("node:fs");
const path = require("node:path");
const { ErrorEdicion } = require("./errores");
const { reemplazarCampo } = require("./frontmatter");

const dentro = (base, destino) => destino.startsWith(base + path.sep);

// "portada" o "tesis/es" → ruta absoluta del .json, sin salir de la carpeta.
function resolverArchivo(carpeta, archivo) {
  if (typeof archivo !== "string" || !/^[\w\-]+(\/[\w\-]+)*$/.test(archivo)) {
    throw new ErrorEdicion(`Archivo no válido: ${archivo}`);
  }
  const base = path.resolve(carpeta);
  const destino = path.resolve(base, `${archivo}.json`);
  if (!dentro(base, destino)) throw new ErrorEdicion(`Archivo fuera de la carpeta de datos: ${archivo}`);
  return destino;
}

// "./investigacion/x.md" (page.inputPath) → ruta absoluta, dentro del proyecto,
// fuera de las carpetas excluidas y sin pasar por enlaces simbólicos hacia afuera.
function resolverMarkdown(raiz, archivo, excluir = []) {
  if (typeof archivo !== "string" || !/\.md$/i.test(archivo) || archivo.includes("\0")) {
    throw new ErrorEdicion(`Archivo Markdown no válido: ${archivo}`);
  }
  const base = fs.realpathSync(path.resolve(raiz));
  const destino = path.resolve(base, archivo);
  if (!dentro(base, destino)) throw new ErrorEdicion(`Archivo fuera del proyecto: ${archivo}`);
  const relativo = path.relative(base, destino).split(path.sep);
  if (relativo.some((parte) => parte.startsWith(".") || excluir.includes(parte))) {
    throw new ErrorEdicion(`Archivo en una carpeta no editable: ${archivo}`);
  }
  if (!fs.existsSync(destino)) throw new ErrorEdicion(`No existe ${archivo}`, 404);
  if (!dentro(base, fs.realpathSync(destino))) throw new ErrorEdicion(`Archivo fuera del proyecto: ${archivo}`);
  return destino;
}

// "parrafos.0" → ["parrafos", 0]
function partirRuta(ruta) {
  if (typeof ruta !== "string" || ruta === "") throw new ErrorEdicion("Ruta vacía");
  return ruta.split(".").map((p) => (/^\d+$/.test(p) ? Number(p) : p));
}

function leerEn(obj, partes) {
  return partes.reduce((o, p) => (o != null && Object.hasOwn(Object(o), p) ? o[p] : undefined), obj);
}

// Respeta la sangría del archivo y su salto de línea final.
function formato(texto) {
  const m = texto.match(/^[{[]\r?\n([ \t]+)/);
  return { sangria: m ? m[1] : 2, final: texto.endsWith("\n") ? "\n" : "" };
}

function escribirAtomico(destino, contenido) {
  const temporal = `${destino}.${process.pid}.tmp`;
  fs.writeFileSync(temporal, contenido);
  fs.renameSync(temporal, destino);
}

function cambiarJson(texto, lista) {
  const datos = JSON.parse(texto);
  for (const c of lista) {
    const partes = partirRuta(c.ruta);
    const actual = leerEn(datos, partes);
    if (typeof actual !== "string") throw new ErrorEdicion(`${c.archivo}:${c.ruta} no es un texto existente`);
    if (typeof c.original === "string" && actual !== c.original) {
      throw new ErrorEdicion(`${c.archivo}:${c.ruta} cambió en el archivo desde que cargaste la página. Recarga.`, 409);
    }
    leerEn(datos, partes.slice(0, -1))[partes[partes.length - 1]] = c.valor;
  }
  const { sangria, final } = formato(texto);
  return JSON.stringify(datos, null, sangria) + final;
}

function cambiarFrontmatter(texto, lista) {
  return lista.reduce((t, c) => reemplazarCampo(t, c.ruta, c.valor, c.original), texto);
}

// Aplica una lista de cambios { tipo?, archivo, ruta, valor, original }.
// Solo reemplaza textos que ya existen y que siguen valiendo `original`:
// no crea claves nuevas ni pisa un cambio hecho por otro lado. Todo o nada.
function aplicarCambios({ carpetaDatos, raiz = process.cwd(), excluir = [] }, cambios) {
  if (!Array.isArray(cambios) || cambios.length === 0) throw new ErrorEdicion("No hay cambios");

  const porArchivo = new Map();
  for (const c of cambios) {
    if (typeof c.valor !== "string") throw new ErrorEdicion(`El valor de ${c.archivo}:${c.ruta} no es texto`);
    const tipo = c.tipo === "fm" ? "fm" : "json";
    const destino = tipo === "fm" ? resolverMarkdown(raiz, c.archivo, excluir) : resolverArchivo(carpetaDatos, c.archivo);
    if (!porArchivo.has(destino)) porArchivo.set(destino, { tipo, lista: [] });
    porArchivo.get(destino).lista.push(c);
  }

  // Primero se valida todo; solo si nada falla se escribe.
  const escrituras = [];
  for (const [destino, { tipo, lista }] of porArchivo) {
    if (!fs.existsSync(destino)) throw new ErrorEdicion(`No existe ${path.basename(destino)}`, 404);
    const texto = fs.readFileSync(destino, "utf8");
    escrituras.push([destino, tipo === "fm" ? cambiarFrontmatter(texto, lista) : cambiarJson(texto, lista)]);
  }
  for (const [destino, contenido] of escrituras) escribirAtomico(destino, contenido);
  return escrituras.map(([destino]) => path.relative(raiz, destino));
}

function leerMarkdown({ raiz = process.cwd(), excluir = [] }, archivo) {
  return fs.readFileSync(resolverMarkdown(raiz, archivo, excluir), "utf8");
}

function escribirMarkdown({ raiz = process.cwd(), excluir = [] }, archivo, contenido, original) {
  if (typeof contenido !== "string") throw new ErrorEdicion("El contenido no es texto");
  const destino = resolverMarkdown(raiz, archivo, excluir);
  if (typeof original !== "string") throw new ErrorEdicion("Falta el contenido original");
  if (fs.readFileSync(destino, "utf8") !== original) {
    throw new ErrorEdicion("El archivo cambió desde que lo abriste. Copia tu texto y recarga.", 409);
  }
  escribirAtomico(destino, contenido);
  return path.relative(raiz, destino);
}

module.exports = {
  aplicarCambios,
  leerMarkdown,
  escribirMarkdown,
  resolverArchivo,
  resolverMarkdown,
  partirRuta,
  ErrorEdicion,
};
