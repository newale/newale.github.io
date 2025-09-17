module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static/css/main.css");
  eleventyConfig.addPassthroughCopy("static/images");
}
