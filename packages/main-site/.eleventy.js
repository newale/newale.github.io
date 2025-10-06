module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static/css");
  eleventyConfig.addPassthroughCopy("static/images");
  eleventyConfig.addPassthroughCopy("static/audios");

  eleventyConfig.addCollection("journal", function(collectionApi) {
    return collectionApi.getAll().filter(item => item.data.journal === true && item.data.draft == false);
  });
  eleventyConfig.addCollection("journalMonths", function(collectionApi) {
    const journalEntries = collectionApi.getAll().filter(item => (item.data.journal === true && item.data.draft == false));

    // Map monthYear to its latest date
    const monthMap = new Map();

    journalEntries.forEach(entry => {
      const date = new Date(entry.date);
      const monthYear = date.toLocaleString("es-CL", { month: "long", year: "numeric" });
      if (!monthMap.has(monthYear) || date > monthMap.get(monthYear)) {
        monthMap.set(monthYear, date);
      }
    });

    // Sort monthYear by date descending
    const grouped = Array.from(monthMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([monthYear]) => monthYear);

    return grouped;
  });

  eleventyConfig.addCollection("journalByMonth", function(collectionApi) {
    const journalEntries = collectionApi.getAll().filter(item => item.data.journal === true  && item.data.draft == false);
    const grouped = {};

    journalEntries.forEach(entry => {
      const date = new Date(entry.date);
      const monthYear = date.toLocaleString("es-CL", { month: "long", year: "numeric" });

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }

      grouped[monthYear].push(entry);
    });


    return grouped;
  });

  eleventyConfig.addFilter("formattedDate", function(date) {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(date).toLocaleDateString("es-CL", options);
  });
}
