module.exports = [
  {
    slug: "male-s",
    titulo: "male.s",
    descripcion: "Cantautor de guitarra acústica.",
    tipo: "acustico",
    portada: "/static/imagenes/musica/male-s-cover.svg",
    canciones: [
      {
        slug: "naguara",
        titulo: "naguará",
        archivo: "/static/audios/naguara.mp3",
        precio: 1000,
        linkPago: "https://mpago.la/1hJiT57",
      },
    ],
  },
  {
    slug: "m-siniestra",
    titulo: "m.siniestra",
    descripcion: "Música ambiental electrónica.",
    tipo: "ambiental",
    portada: "/static/imagenes/musica/m-siniestra-cover.svg",
    discoTotal: 10,
    streaming: [
      { nombre: "Spotify", url: "https://open.spotify.com/album/108no6qoV8qqoomxDk4Her" },
      { nombre: "Apple Music", url: "https://music.apple.com/us/album/exploraciones-ambientales-ep/6795013701?uo=4&app=music&at=1001lry3&ct=dashboard" },
    ],
    canciones: [
      {
        slug: "ambiente-001",
        titulo: "ambiente 001",
        archivo: "/static/audios/ambient-001.mp3",
        precio: 1000,
        linkPago: "https://mpago.la/2Jdf4eE",
      },
      {
        slug: "ambiente-002",
        titulo: "ambiente 002",
        archivo: "/static/audios/ambient-002.mp3",
        precio: 1000,
        linkPago: "https://mpago.la/1ZH8AaN",
      },
    ],
  },
];
