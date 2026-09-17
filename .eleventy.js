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
  eleventyConfig.addPassthroughCopy({
    "node_modules/jszip/dist/jszip.min.js": "static/js/vendor/jszip.min.js",
  });

  const entradas = (collectionApi) =>
    collectionApi
      .getFilteredByGlob("investigacion/**/*.md")
      .filter(esPublicado)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

  eleventyConfig.addCollection("entradas", entradas);

  // Los tags que de verdad están en uso, para los botones del listado.
  eleventyConfig.addCollection("tagsUsados", function (collectionApi) {
    const todos = entradas(collectionApi).flatMap((item) => aLista(item.data.tags));
    return [...new Set(todos)].sort((a, b) => a.localeCompare(b, "es"));
  });

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
