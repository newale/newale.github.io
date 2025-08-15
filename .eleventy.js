module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static/css/main.css");
  eleventyConfig.addCollection("postsByCategoria", function(collectionApi) {
    const posts = collectionApi.getFilteredByTag("post").sort((a, b) => b.date - a.date);
    const grouped = {};
    for (const post of posts) {
      const categoria = post.data.categoria || "Sin categoría";
      if (!grouped[categoria]) grouped[categoria] = [];
      grouped[categoria].push(post);
    }
    return grouped;
  });
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