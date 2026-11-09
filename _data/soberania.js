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
      institucion: t.institucion.map((fila) => fila.map((i) => ({ ...i, url: comun.institucion[i.id] }))),
      mostrarDedicatoria: comun.dedicatoria,
      orcid: comun.orcid,
      pdf: comun.pdf,
      abordar: {
        ...t.abordar,
        items: comun.abordar.map((i) => ({ ...i, ...t.abordar.items[i.id], etiqueta: t.abordar.etiquetas[i.tipo] })),
      },
      red: {
        aria: t.proyectos.red.aria,
        nodos: comun.red.nodos.map((n) => ({
          ...n,
          corto: t.proyectos.red.nodos[n.id],
          anillo: (comun.proyectos.find((p) => p.id === n.id) || {}).anillo || 0,
          url: n.id === "tesis" ? "#abordar" : (comun.proyectos.find((p) => p.id === n.id) || {}).url,
        })),
        aristas: comun.red.aristas.map(([a, b, tipo]) => ({ a, b, tipo, etiqueta: t.proyectos.red.aristas[`${a}|${b}`] })),
      },
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
