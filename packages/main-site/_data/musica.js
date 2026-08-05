module.exports = [
  {
    slug: "male",
    titulo: "male",
    sencillo: "naguará",
    genero: "Folklore",
    anio: 2025,
    descripcion: "Canciones con guitarra de palo.",
    tipo: "acustico",
    portada: "/static/imagenes/musica/male-cover.jpg",
    apoyo: {
      mensual: "https://mpago.la/26cXj8R",
      unico: "https://link.mercadopago.cl/alejandrobstsnnz",
    },
    canciones: [
      {
        slug: "naguara",
        titulo: "naguará",
        archivos: [
          { formato: "mp3", etiqueta: "MP3", url: "/static/audios/naguara.mp3" },
        ],
        precio: 1000,
        linkPago: "https://mpago.la/1hJiT57",
      },
    ],
  },
  {
    slug: "siniestra",
    titulo: "siniestra",
    album: "Exploraciones ambientales",
    genero: "Ambient",
    anio: 2026,
    descripcion: "Música ambiental electrónica.",
    tipo: "ambiental",
    portada: "/static/imagenes/musica/siniestra-cover.jpg",
    streaming: [
      { nombre: "Apple Music", url: "https://music.apple.com/us/album/exploraciones-ambientales-ep/6795013701?uo=4&app=music&at=1001lry3&ct=dashboard" },
      { nombre: "YouTube", url: "https://www.youtube.com/@msiniestra" },
    ],
    apoyo: {
      mensual: "https://mpago.la/2bQWwDK",
      unico: "https://link.mercadopago.cl/alejandrobstsnnz",
    },
    canciones: [
      {
        slug: "ambiente-001",
        titulo: "ambiente 001",
        archivos: [
          { formato: "mp3", etiqueta: "MP3", url: "/static/audios/ambient-001.mp3" },
        ],
        precio: 1000,
        linkPago: "https://mpago.la/2Jdf4eE",
      },
      {
        slug: "ambiente-002",
        titulo: "ambiente 002",
        archivos: [
          { formato: "mp3", etiqueta: "MP3", url: "/static/audios/ambient-002.mp3" },
        ],
        precio: 1000,
        linkPago: "https://mpago.la/1ZH8AaN",
      },
      {
        slug: "ambiente-003",
        titulo: "ambiente 003",
        estreno: true,
        archivos: [
          { formato: "mp3", etiqueta: "MP3", url: "/static/audios/ambient-003.mp3" },
          { formato: "mp3-hq", etiqueta: "MP3 (alta calidad)", url: "/static/audios/ambient-003-hq.mp3" },
        ],
        precio: 1000,
        linkPago: "",
      },
    ],
  },
];
