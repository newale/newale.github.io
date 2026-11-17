// Edición de campos de una línea en el frontmatter YAML de un archivo Markdown.
// No re-serializa el YAML: reemplaza solo la línea del campo, así el resto del
// archivo (comentarios, orden, listas) queda tal cual.
const { ErrorEdicion } = require("./errores");

function partir(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  if (!m) throw new ErrorEdicion("El archivo no tiene frontmatter");
  return { inicio: 4, fin: 4 + m[1].length, yaml: m[1] };
}

// Lee un escalar YAML de una línea: "comillas dobles", 'simples' o plano.
function leerEscalar(crudo) {
  const v = crudo.trim();
  if (v.startsWith('"')) {
    try { return JSON.parse(v); } catch { throw new ErrorEdicion("Valor con comillas dobles que no se puede leer"); }
  }
  if (v.startsWith("'")) {
    if (!v.endsWith("'") || v.length < 2) throw new ErrorEdicion("Valor con comillas simples incompleto");
    return v.slice(1, -1).replace(/''/g, "'");
  }
  if (v === "" || /^[|>&*!\[{]/.test(v)) {
    throw new ErrorEdicion("Solo se editan campos de texto de una línea");
  }
  return v.replace(/\s+#.*$/, "");
}

function buscarCampo(yaml, campo) {
  if (!/^[\w-]+$/.test(campo)) throw new ErrorEdicion(`Campo no válido: ${campo}`);
  const re = new RegExp(`^${campo}:[ \\t]*(.*)$`, "m");
  const m = yaml.match(re);
  if (!m) throw new ErrorEdicion(`El frontmatter no tiene el campo ${campo}`);
  return m;
}

function leerCampo(texto, campo) {
  return leerEscalar(buscarCampo(partir(texto).yaml, campo)[1]);
}

// Devuelve el archivo con el campo reemplazado. Un string JSON es YAML válido.
function reemplazarCampo(texto, campo, valor, original) {
  const { inicio, fin, yaml } = partir(texto);
  const m = buscarCampo(yaml, campo);
  const actual = leerEscalar(m[1]);
  if (typeof original === "string" && actual !== original) {
    throw new ErrorEdicion(`${campo} cambió en el archivo desde que cargaste la página. Recarga.`, 409);
  }
  if (/[\r\n]/.test(valor)) throw new ErrorEdicion("El valor debe ser de una línea");
  const nuevaLinea = `${campo}: ${JSON.stringify(valor)}`;
  const nuevoYaml = yaml.slice(0, m.index) + nuevaLinea + yaml.slice(m.index + m[0].length);
  return texto.slice(0, inicio) + nuevoYaml + texto.slice(fin);
}

module.exports = { leerCampo, reemplazarCampo };
