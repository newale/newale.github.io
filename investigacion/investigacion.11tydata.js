// Datos de directorio para las entradas de Investigación.
module.exports = {
  layout: "layouts/entrada.html",
  seccion: "investigacion",

  eleventyComputed: {
    // Los borradores se ven en `npm run dev` pero no se construyen para el sitio
    // publicado: devolver `false` cancela la página entera.
    permalink: (data) => {
      const enDesarrollo = process.env.ELEVENTY_RUN_MODE === "serve";
      if (data.draft === true && !enDesarrollo) return false;
      return `/investigacion/${data.page.fileSlug}/`;
    },
  },
};
