const isPublicado = (item) => item.data.draft !== true;

module.exports = function(eleventyConfig) {
  // Archivos del repo que no son páginas del sitio.
  ["README.md", "CHANGELOG.md", "TODO.md"].forEach(f => eleventyConfig.ignores.add(f));

  eleventyConfig.addPassthroughCopy("static/css");
  eleventyConfig.addPassthroughCopy("static/images");
  eleventyConfig.addPassthroughCopy("static/imagenes");
  eleventyConfig.addPassthroughCopy("static/audios");
  eleventyConfig.addPassthroughCopy("static/videos");
  eleventyConfig.addPassthroughCopy("static/documentos");
  eleventyConfig.addPassthroughCopy("static/js");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy({ "node_modules/jszip/dist/jszip.min.js": "static/js/vendor/jszip.min.js" });

  const articulos = (collectionApi) => collectionApi
    .getFilteredByGlob("articulos/**/*.md")
    .filter(isPublicado)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  eleventyConfig.addCollection("articulos", articulos);

  // Secciones presentes en los artículos publicados, para los filtros del listado.
  eleventyConfig.addCollection("secciones", function(collectionApi) {
    return [...new Set(articulos(collectionApi).map(item => item.data.seccion).filter(Boolean))].sort();
  });

  eleventyConfig.addFilter("formattedDate", function(date) {
    const options = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
    return new Date(date).toLocaleDateString("es-CL", options);
  });

  eleventyConfig.addFilter("byArchivador", function(collection, archivador) {
    return collection.filter(item => {
      const valor = item.data.archivador;
      return Array.isArray(valor)
        ? valor.some(v => String(v).trim() === archivador)
        : String(valor || "").trim() === archivador;
    });
  });

  eleventyConfig.addFilter("formatPrecio", function(precio) {
    return precio.toLocaleString("es-CL");
  });

  eleventyConfig.addFilter("upper", function(str) {
    return String(str).toUpperCase();
  });
}
