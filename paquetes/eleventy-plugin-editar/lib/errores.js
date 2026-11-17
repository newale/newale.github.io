class ErrorEdicion extends Error {
  constructor(mensaje, estado = 400) {
    super(mensaje);
    this.estado = estado;
  }
}

module.exports = { ErrorEdicion };
