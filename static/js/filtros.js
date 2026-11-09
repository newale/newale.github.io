// Filtros por tipo en los índices de sección. Sin JS, el índice se ve
// completo y los botones quedan ocultos.
document.querySelectorAll("[data-filtros]").forEach((grupo) => {
  const indice = document.getElementById(grupo.dataset.filtros);
  if (!indice) return;
  grupo.hidden = false;
  const botones = grupo.querySelectorAll("button[data-tipo]");
  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const tipo = boton.dataset.tipo;
      botones.forEach((b) => b.setAttribute("aria-pressed", String(b === boton)));
      indice.querySelectorAll(".indice-item").forEach((item) => {
        item.hidden = tipo !== "" && item.dataset.tipo !== tipo;
      });
    });
  });
});
