const esPublicado = (item) => item.data.draft !== true;

// El frontmatter trae `tags` como string suelto, como lista o ausente.
// Todo lo que muestre o filtre tags pasa por acá.
const aLista = (tags) => {
  if (!tags) return [];
  return (Array.isArray(tags) ? tags : [tags])
    .map((tag) => String(tag).trim())
    .filter(Boolean);
};

module.exports = function (eleventyConfig) {
  // Archivos del repo que no son páginas del sitio.
  ["README.md", "CHANGELOG.md"].forEach((f) => eleventyConfig.ignores.add(f));

  eleventyConfig.addPassthroughCopy("static/css");
  eleventyConfig.addPassthroughCopy("static/images");
  eleventyConfig.addPassthroughCopy("static/imagenes");
  eleventyConfig.addPassthroughCopy("static/audios");
  eleventyConfig.addPassthroughCopy("static/documentos");
  eleventyConfig.addPassthroughCopy("static/js");
  eleventyConfig.addPassthroughCopy("CNAME");
  // Eleventy ignora carpetas con punto por defecto; espacio (la app de
  // escritorio de la cooperativa) descubre las mini-apps de un dominio leyendo
  // /.well-known/espacio-apps.json — ver tecnocoop.aebn.cl.
  eleventyConfig.addPassthroughCopy(".well-known");
  eleventyConfig.addPassthroughCopy({
    "node_modules/jszip/dist/jszip.min.js": "static/js/vendor/jszip.min.js",
  });

  // Cada sección tiene su carpeta de entradas. `todo` las junta para la
  // portada y el feed.
  const porFecha = (a, b) => new Date(b.date) - new Date(a.date);
  const carpetas = {
    investigacion: "investigacion/**/*.md",
    proyectos: "proyectos/**/*.md",
    cuentos: "obra/cuentos/**/*.md",
  };
  const deCarpeta = (collectionApi, glob) =>
    collectionApi.getFilteredByGlob(glob).filter(esPublicado).sort(porFecha);

  Object.entries(carpetas).forEach(([nombre, glob]) => {
    eleventyConfig.addCollection(nombre, (collectionApi) => deCarpeta(collectionApi, glob));
  });
  // Los proyectos no se ordenan por fecha: son procesos en curso. Se muestran
  // como fichas en el orden de `orden`.
  eleventyConfig.addCollection("fichas", (collectionApi) =>
    collectionApi
      .getFilteredByGlob(carpetas.proyectos)
      .filter((item) => esPublicado(item) && item.data.tipo === "proyecto")
      .sort((a, b) => (a.data.orden || 99) - (b.data.orden || 99))
  );
  eleventyConfig.addCollection("todo", (collectionApi) =>
    Object.values(carpetas).flatMap((glob) => deCarpeta(collectionApi, glob)).sort(porFecha)
  );

  // Los `tipo` en uso dentro de una lista de entradas, para los filtros.
  eleventyConfig.addFilter("tiposUsados", (items) =>
    [...new Set((items || []).map((item) => item.data.tipo).filter(Boolean))]
  );

  eleventyConfig.addFilter("nombreSeccion", (seccion) =>
    ({ investigacion: "Investigación", proyectos: "Proyectos", obra: "Obras" })[seccion] || ""
  );

  eleventyConfig.addFilter("nombreTipo", (tipo) =>
    ({ ensayo: "Ensayo", seminario: "Seminario", apunte: "Apunte", proyecto: "Proyecto", cuento: "Cuento", exploracion: "Exploración", nota: "Nota de construcción", podcast: "Podcast" })[tipo] || tipo
  );

  eleventyConfig.addFilter("dosDigitos", (n) => String(n).padStart(2, "0"));

  // Colecciones (p. ej. los apuntes de estética): las entradas con `coleccion: <id>`
  // se leen en orden cronológico, de la primera clase a la última.
  const deColeccion = (items, coleccion) =>
    (items || [])
      .filter((item) => item.data.coleccion === coleccion)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  eleventyConfig.addFilter("deColeccion", deColeccion);

  // Posición de una entrada dentro de su colección, con la anterior y la siguiente.
  eleventyConfig.addFilter("posicionEnColeccion", (items, coleccion, url) => {
    const lista = deColeccion(items, coleccion);
    const i = lista.findIndex((item) => item.url === url);
    if (i === -1) return null;
    return {
      numero: i + 1,
      total: lista.length,
      anterior: lista[i - 1] || null,
      siguiente: lista[i + 1] || null,
    };
  });

  eleventyConfig.addFilter("formattedDateCorta", function (date) {
    return new Date(date).toLocaleDateString("es-CL", { month: "short", year: "numeric", timeZone: "UTC" });
  });

  // Contenido de /soberania-digital/: cada archivo .md es un bloque editable
  // (nodo, término del glosario, criterio…) y se ordena con `orden`.
  ["bloques", "nodos", "glosario", "criterios", "objeciones", "tiempo"].forEach((carpeta) => {
    eleventyConfig.addCollection(`soberania_${carpeta}`, (collectionApi) =>
      collectionApi
        .getFilteredByGlob(`contenido-soberania/${carpeta}/*.md`)
        .sort((a, b) => (a.data.orden || 0) - (b.data.orden || 0))
    );
  });

  eleventyConfig.addFilter("porSlug", (items, slug) =>
    (items || []).find((item) => item.fileSlug === slug)
  );

  // Término del glosario dentro de un texto: enlaza al glosario y, con JS,
  // abre la definición en un globo.
  eleventyConfig.addShortcode(
    "g",
    (slug, texto) => `<a class="g" href="#g-${slug}" data-g="${slug}">${texto}</a>`
  );

  eleventyConfig.addFilter("listaTags", aLista);

  eleventyConfig.addFilter("formattedDate", function (date) {
    const options = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
    return new Date(date).toLocaleDateString("es-CL", options);
  });

  // ISO 8601 con Z: es RFC 3339 válido, que es lo que pide Atom.
  eleventyConfig.addFilter("isoDate", function (date) {
    return new Date(date).toISOString();
  });

  eleventyConfig.addFilter("urlAbsoluta", function (url) {
    return new URL(url, "https://aebn.cl").href;
  });

  // Dentro de un lector de feeds no hay una página base, así que los enlaces e
  // imágenes relativos del contenido no resuelven. Se absolutizan para el feed.
  eleventyConfig.addFilter("htmlAbsoluto", function (html) {
    return String(html || "").replace(
      /(\s(?:href|src)=")\/(?!\/)/g,
      `$1https://aebn.cl/`
    );
  });

  eleventyConfig.addFilter("formatPrecio", function (precio) {
    return precio.toLocaleString("es-CL");
  });

  eleventyConfig.addFilter("upper", function (str) {
    return String(str).toUpperCase();
  });
};
