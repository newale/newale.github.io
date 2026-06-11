const isGardenAndNotDraft = (item) => item.data.garden === true && item.data.draft !== true;

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static/css");
  eleventyConfig.addPassthroughCopy("static/images");
  eleventyConfig.addPassthroughCopy("static/imagenes");
  eleventyConfig.addPassthroughCopy("static/audios");
  eleventyConfig.addPassthroughCopy("static/documentos");

  eleventyConfig.addCollection("garden", function(collectionApi) {
    return collectionApi
      .getAll()
      .filter(isGardenAndNotDraft)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  eleventyConfig.addCollection("cuadernos", function(collectionApi) {
    const entries = collectionApi.getAll().filter(isGardenAndNotDraft);
    const map = {};
    entries.forEach(entry => {
      const cuaderno = entry.data.cuaderno;
      if (cuaderno) {
        if (!map[cuaderno]) map[cuaderno] = [];
        map[cuaderno].push(entry);
      }
    });
    return map;
  });

  eleventyConfig.addFilter("formattedDate", function(date) {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(date).toLocaleDateString("es-CL", options);
  });

  eleventyConfig.addFilter("byCuaderno", function(collection, cuaderno) {
    return collection.filter(item => item.data.cuaderno === cuaderno);
  });
}
