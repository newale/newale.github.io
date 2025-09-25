module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static/css");
  eleventyConfig.addPassthroughCopy("static/images");
  eleventyConfig.addCollection("journal", function(collectionApi) {
    return collectionApi.getAll().filter(item => item.data.journal === true);
  });
}
