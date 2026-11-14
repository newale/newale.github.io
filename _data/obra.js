// Proyectos musicales. La música ya no se reproduce ni se vende acá: vive en
// musica.tecnocooperativa.cl (la app de la cooperativa) y en las plataformas de streaming.
module.exports = {
  // Audios publicados en la audioteca de la cooperativa.
  audios: [
    {
      nombre: "Audios de Santiago",
      descripcion: "Audios de Santiago publicados en la audioteca de la cooperativa. El primero: «20 de octubre al medio día».",
      url: "https://audioteca.aebn.cl/usuario-aebn/audios-santiago",
    },
  ],
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
      formato: "Álbum",
      genero: "Ambient",
      anio: 2026,
      descripcion: "Música ambiental electrónica: texturas largas, ruido y paisaje.",
      portada: "/static/imagenes/musica/siniestra-cover.jpg",
      enlaces: [
        { nombre: "Escuchar en Música", url: "https://musica.tecnocooperativa.cl", principal: true },
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
        { nombre: "Escuchar en Música", url: "https://musica.tecnocooperativa.cl", principal: true },
      ],
    },
    {
      slug: "querryqueen",
      nombre: "querryqueen",
      obra: "Hola a nadie el mundo",
      formato: "Álbum",
      anio: 2017,
      descripcion: "Canciones de querryqueen.",
      portada: "/static/imagenes/musica/querryqueen-cover.jpg",
      enlaces: [
        { nombre: "Escuchar en Música", url: "https://musica.tecnocooperativa.cl", principal: true },
        { nombre: "YouTube", url: "https://www.youtube.com/@querryqueen2511" },
      ],
    },
    {
      slug: "golden-acapulco",
      nombre: "Gölden Acapulco",
      obra: "El gran viaje",
      formato: "Sencillo",
      anio: 2016,
      descripcion: "Canciones de Gölden Acapulco.",
      portada: "/static/imagenes/musica/golden-acapulco-cover.jpg",
      enlaces: [
        { nombre: "Escuchar en Música", url: "https://musica.tecnocooperativa.cl", principal: true },
        { nombre: "SoundCloud", url: "https://soundcloud.com/dimensionacapulco" },
      ],
    },
  ],
};
