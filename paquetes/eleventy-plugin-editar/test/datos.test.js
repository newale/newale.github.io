const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { aplicarCambios, resolverArchivo, leerMarkdown, escribirMarkdown } = require("../lib/datos");
const { leerCampo, reemplazarCampo } = require("../lib/frontmatter");

function proyecto(archivos) {
  const raiz = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "editar-")));
  for (const [nombre, contenido] of Object.entries(archivos)) {
    const ruta = path.join(raiz, nombre);
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
    fs.writeFileSync(ruta, contenido);
  }
  return { raiz, carpetaDatos: path.join(raiz, "_data"), excluir: ["node_modules", "_site"] };
}
const leer = (p, nombre) => fs.readFileSync(path.join(p.raiz, nombre), "utf8");

// ── JSON ──
test("json: reemplaza un texto anidado y en listas, respetando el formato", () => {
  const p = proyecto({ "_data/tesis/es.json": '{\n    "titulo": "A",\n    "lista": ["x", "y"],\n    "n": 1\n}\n' });
  aplicarCambios(p, [
    { archivo: "tesis/es", ruta: "titulo", valor: "B", original: "A" },
    { archivo: "tesis/es", ruta: "lista.1", valor: "z", original: "y" },
  ]);
  assert.equal(leer(p, "_data/tesis/es.json"), '{\n    "titulo": "B",\n    "lista": [\n        "x",\n        "z"\n    ],\n    "n": 1\n}\n');
});

test("json: no crea claves nuevas ni toca valores que no son texto", () => {
  const p = proyecto({ "_data/p.json": '{\n  "a": "x",\n  "n": 1\n}\n' });
  for (const ruta of ["nueva", "n", "__proto__.x"]) {
    assert.throws(() => aplicarCambios(p, [{ archivo: "p", ruta, valor: "v" }]), /no es un texto existente/);
  }
});

test("json: no sale de la carpeta de datos", () => {
  for (const malo of ["../package", "/etc/passwd", "a/../../b", "p.json", ""]) {
    assert.throws(() => resolverArchivo("/tmp/datos", malo), /no válido|fuera/);
  }
});

// ── Frontmatter ──
const ENTRADA = '---\ntitle: "Título: con dos puntos"\nresumen: \'It\'\'s\'\nfecha: 2026-01-01\ntags:\n  - a\n---\n\nCuerpo.\n';

test("fm: lee comillas dobles, simples y planas", () => {
  assert.equal(leerCampo(ENTRADA, "title"), "Título: con dos puntos");
  assert.equal(leerCampo(ENTRADA, "resumen"), "It's");
  assert.equal(leerCampo(ENTRADA, "fecha"), "2026-01-01");
});

test("fm: reemplaza solo la línea del campo", () => {
  const nuevo = reemplazarCampo(ENTRADA, "resumen", 'Dice "hola"', "It's");
  assert.equal(nuevo, ENTRADA.replace("resumen: 'It''s'", 'resumen: "Dice \\"hola\\""'));
  assert.equal(leerCampo(nuevo, "resumen"), 'Dice "hola"');
});

test("fm: rechaza listas, campos inexistentes, saltos de línea y conflictos", () => {
  assert.throws(() => reemplazarCampo(ENTRADA, "tags", "x"), /una línea/);
  assert.throws(() => reemplazarCampo(ENTRADA, "autor", "x"), /no tiene el campo/);
  assert.throws(() => reemplazarCampo(ENTRADA, "title", "a\nb"), /una línea/);
  assert.throws(() => reemplazarCampo(ENTRADA, "title", "x", "otro"), (e) => e.estado === 409);
});

test("fm + json en un guardado: todo o nada", () => {
  const p = proyecto({ "_data/p.json": '{\n  "a": "x"\n}\n', "blog/e.md": ENTRADA });
  assert.throws(() => aplicarCambios(p, [
    { archivo: "p", ruta: "a", valor: "y", original: "x" },
    { tipo: "fm", archivo: "./blog/e.md", ruta: "title", valor: "z", original: "otro" },
  ]), (e) => e.estado === 409);
  assert.equal(leer(p, "_data/p.json"), '{\n  "a": "x"\n}\n');

  aplicarCambios(p, [
    { archivo: "p", ruta: "a", valor: "y", original: "x" },
    { tipo: "fm", archivo: "./blog/e.md", ruta: "title", valor: "Nuevo", original: "Título: con dos puntos" },
  ]);
  assert.match(leer(p, "_data/p.json"), /"a": "y"/);
  assert.match(leer(p, "blog/e.md"), /^title: "Nuevo"$/m);
});

// ── Markdown completo ──
test("md: lee y escribe, y detecta que el archivo cambió", () => {
  const p = proyecto({ "blog/e.md": ENTRADA });
  const original = leerMarkdown(p, "./blog/e.md");
  escribirMarkdown(p, "./blog/e.md", original + "\nMás.\n", original);
  assert.match(leer(p, "blog/e.md"), /Más\./);
  assert.throws(() => escribirMarkdown(p, "./blog/e.md", "x", original), (e) => e.estado === 409);
});

test("md: no sale del proyecto ni entra a carpetas excluidas u ocultas", () => {
  const p = proyecto({
    "blog/e.md": ENTRADA,
    "node_modules/x/README.md": "x",
    "_site/e.md": "x",
    ".github/x.md": "x",
    "blog/e.txt": "x",
  });
  fs.symlinkSync(os.tmpdir(), path.join(p.raiz, "blog/afuera"));
  for (const malo of ["../e.md", "/etc/x.md", "node_modules/x/README.md", "_site/e.md", ".github/x.md", "blog/e.txt", "blog/afuera/x.md", "blog/no-existe.md"]) {
    assert.throws(() => leerMarkdown(p, malo), /no válido|fuera|no editable|No existe/, malo);
  }
});
