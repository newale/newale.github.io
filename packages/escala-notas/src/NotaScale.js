// Escala de notas chilena
export function calcularNota({ puntaje, puntajeMax, exigencia, notaMin, notaMax, notaAprobacion }) {
  // Si el puntaje es menor o igual al exigido para aprobar
  const puntajeAprobacion = puntajeMax * exigencia;
  if (puntaje <= puntajeAprobacion) {
    // Escala lineal entre notaMin y notaAprobacion
    return (
      ((notaAprobacion - notaMin) / puntajeAprobacion) * puntaje + notaMin
    );
  } else {
    // Escala lineal entre notaAprobacion y notaMax
    return (
      ((notaMax - notaAprobacion) / (puntajeMax - puntajeAprobacion)) * (puntaje - puntajeAprobacion) + notaAprobacion
    );
  }
}
