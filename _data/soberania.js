// Idiomas de /soberania-digital/: cada archivo de _data/tesis/<código>.json es
// una traducción completa. Para agregar un idioma basta con sumar su archivo.
const fs = require("fs");
const path = require("path");

const carpeta = path.join(__dirname, "tesis");
const comun = require("./tesis/comun.json");
const orden = ["es", "en", "ru"];

const porId = (lista, clave) => Object.fromEntries(lista.map((x) => [x[clave], x]));

module.exports = fs
  .readdirSync(carpeta)
  .filter((f) => f.endsWith(".json") && f !== "comun.json")
  .map((f) => f.replace(".json", ""))
  .sort((a, b) => (orden.indexOf(a) + 1 || 99) - (orden.indexOf(b) + 1 || 99) || a.localeCompare(b))
  .map((codigo) => {
    const t = require(path.join(carpeta, `${codigo}.json`));
    const proy = t.proyectos.items;
    const casos = t.criterios.casos;
    return {
      ...t,
      codigo,
      mostrarDedicatoria: comun.dedicatoria,
      orcid: comun.orcid,
      pdf: comun.pdf,
      proyectos: {
        ...t.proyectos,
        items: comun.proyectos.map((p) => ({ ...p, ...proy[p.id] })),
      },
      criterios: {
        ...t.criterios,
        casos: comun.casos.map((c) => ({ ...c, ...casos[c.id] })),
      },
    };
  });
