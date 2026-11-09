// Datos de directorio para las entradas de Obra (cuentos).
module.exports = {
  layout: "layouts/entrada.html",
  seccion: "obra",

  eleventyComputed: {
    // Los borradores se ven en `npm run dev` pero no se construyen para el sitio
    // publicado: devolver `false` cancela la página entera.
    permalink: (data) => {
      const enDesarrollo = process.env.ELEVENTY_RUN_MODE === "serve";
      if (data.draft === true && !enDesarrollo) return false;
      return `/obra/cuentos/${data.page.fileSlug}/`;
    },
  },
};
