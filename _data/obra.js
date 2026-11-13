// Proyectos musicales. La música ya no se reproduce ni se vende acá: vive en
// musica.aebn.cl (la app de la cooperativa) y en las plataformas de streaming.
module.exports = {
  // Cuentos. Sin `url` se muestran como "Próximamente"; cuando el texto esté
  // listo, se crea la entrada en obra/cuentos/ y se pone su url acá.
  cuentos: [
    { titulo: "Dormitorio 14 SJ", url: "" },
    { titulo: "Carta para el progreso", url: "" },
  ],
  musica: [
    {
      slug: "siniestra",
      nombre: "siniestra",
      obra: "Exploraciones ambientales",
      formato: "EP",
      genero: "Ambient",
      anio: 2026,
      descripcion: "Música ambiental electrónica: texturas largas, ruido y paisaje.",
      portada: "/static/imagenes/musica/siniestra-cover.jpg",
      enlaces: [
        { nombre: "Escuchar en Música", url: "https://musica.aebn.cl", principal: true },
        { nombre: "Apple Music", url: "https://music.apple.com/us/album/exploraciones-ambientales-ep/6795013701" },
        { nombre: "YouTube", url: "https://www.youtube.com/@msiniestra" },
      ],
    },
    {
      slug: "male",
      nombre: "male",
      obra: "naguará",
      formato: "Sencillo",
      genero: "Folklore",
      anio: 2025,
      descripcion: "Canciones con guitarra de palo.",
      portada: "/static/imagenes/musica/male-cover.jpg",
      enlaces: [
        { nombre: "Escuchar en Música", url: "https://musica.aebn.cl", principal: true },
      ],
    },
  ],
};
