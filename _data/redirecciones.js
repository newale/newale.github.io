// URLs que dejaron de existir con el rediseño de noviembre de 2026 (la
// Bitácora se repartió en Investigación y Proyectos; la música se fue a
// musica.aebn.cl). GitHub Pages es estático, así que cada una se publica como
// una página mínima que redirige; ver redirecciones.liquid.
module.exports = [
  // Entradas publicadas de la Bitácora
  { desde: "/bitacora/ensayo/la-pradera-que-nos-devora/", hacia: "/investigacion/la-pradera-que-nos-devora/" },
  { desde: "/bitacora/seminarios/ia-libertad-puc/", hacia: "/investigacion/ia-libertad-puc/" },
  { desde: "/bitacora/apuntes/arquitecturas-soberanas-solid/", hacia: "/investigacion/arquitecturas-soberanas-solid/" },
  { desde: "/bitacora/proyecto/tecnocoop/", hacia: "/proyectos/tecnocoop/" },
  { desde: "/bitacora/proyecto/kit-transistor-compuertas-logicas/", hacia: "/proyectos/programacion-tangible/" },
  { desde: "/proyectos/kit-transistor-compuertas-logicas/", hacia: "/proyectos/programacion-tangible/" },
  { desde: "/investigacion/kit-transistor-compuertas-logicas/", hacia: "/proyectos/programacion-tangible/" },
  { desde: "/investigacion/viejito-perro-interfaz/", hacia: "/proyectos/viejito-perro-interfaz/" },
  { desde: "/bitacora/proyecto/pedalera-bluetooth/", hacia: "/proyectos/pedalera-bluetooth/" },

  // Portada y listados por tag de la Bitácora
  { desde: "/bitacora/", hacia: "/investigacion/" },
  { desde: "/bitacora/feed/", hacia: "/feed/" },
  { desde: "/bitacora/ensayo/", hacia: "/investigacion/" },
  { desde: "/bitacora/seminarios/", hacia: "/investigacion/" },
  { desde: "/bitacora/apuntes/", hacia: "/investigacion/" },
  { desde: "/bitacora/proyecto/", hacia: "/proyectos/" },
  { desde: "/bitacora/electrónica/", hacia: "/proyectos/" },
  { desde: "/bitacora/educación/", hacia: "/proyectos/" },
  { desde: "/bitacora/música/", hacia: "/proyectos/" },
  { desde: "/bitacora/cooperativa/", hacia: "/proyectos/" },

  // Páginas sueltas
  { desde: "/sobre-mi/", hacia: "/trayectoria/" },
  { desde: "/proyectos/guia-de-sintetizacion/", hacia: "/proyectos/curso-de-sintesis/" },
  { desde: "/aplicaciones/", hacia: "/proyectos/tecnocoop/" },
  { desde: "/musica/", hacia: "/obra/#musica" },
  { desde: "/musica-gracias/", hacia: "/obra/#musica" },
  { desde: "/musica/agradecimiento-suscripcion/", hacia: "/obra/#musica" },
];
