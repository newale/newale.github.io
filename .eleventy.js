module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static/css/main.css");
  eleventyConfig.addCollection("categorias", function(collectionApi) {
    const posts = collectionApi.getFilteredByTag("post").sort((a, b) => b.date - a.date);
    const categorias = [];
    for (const post of posts) {
      const categoria = post.data.categoria || "Sin categoría";
      if (!categorias.includes(categoria)) categorias.push(categoria);
    }
    console.log("Categorías:", categorias);
    return categorias;
  });
}