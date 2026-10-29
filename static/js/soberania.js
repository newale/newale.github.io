// /soberania-digital/ — olas de puntos, órbitas de proyectos y radar de criterios.
// Sin dependencias ni rastreadores.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, attrs = {}, texto) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (texto != null) n.textContent = texto;
    return n;
  };
  const h = (tag, attrs = {}, texto) => {
    const n = document.createElement(tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (texto != null) n.textContent = texto;
    return n;
  };

  // ───────────── Olas de puntos (solo en el hero) ─────────────
  // Mar visto desde una esquina, en diagonal y en perspectiva, con una bahía en
  // forma de herradura (homenaje a La Herradura, Coquimbo). Los frentes de ola
  // siguen la costa; en la orilla rompen y dejan una franja de arena.
  // Los puntos se oscurecen y se pierden hacia el horizonte. No depende del scroll.
  const lienzo = $("#olas");
  if (lienzo) {
    const ctx = lienzo.getContext("2d");
    const SX = 54, SZ = 58;            // separación entre puntos (mundo)
    const FOCAL = 620, S_MIN = 0.11;   // distancia focal; escala mínima antes del horizonte
    // Bahía, en coordenadas de cámara (x a la derecha, z hacia el fondo).
    const BX = 250, BZ = 1500, R = 900;
    const AH = [Math.cos(0.75), Math.sin(0.75)];    // del mar hacia la tierra (diagonal)
    const BH = [-AH[1], AH[0]];                      // a lo largo de la costa
    const COSTA = -0.15 * R;                         // posición de la costa recta, a ambos lados de la bahía
    const AUMENTO = /[?&]olas=grande/.test(location.search) ? 2.6 : 1;   // ?olas=grande: para revisar la forma de la bahía
    let w = 0, h_ = 0, tema = {}, puntero = { x: -999, y: -999, f: 0 };

    const rgb = (hex) => {
      const m = hex.trim().replace("#", "");
      const n = parseInt(m.length === 3 ? m.replace(/./g, "$&$&") : m, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const mezcla = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    const paleta = () => {
      const base = rgb(getComputedStyle(document.documentElement).getPropertyValue("--ola"));
      const oscuro = matchMedia("(prefers-color-scheme: dark)").matches;
      tema = {
        oscuro,
        valle: mezcla(base, [120, 40, 0], 0.35),
        cresta: mezcla(base, [255, 205, 120], 0.55),
        espuma: [255, 236, 205],
        arena: oscuro ? [232, 196, 150] : [176, 120, 60],
        lejos: oscuro ? [58, 24, 6] : [120, 60, 20],
      };
    };
    const medir = () => {
      const r = lienzo.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h_ = r.height;
      lienzo.width = Math.round(w * dpr); lienzo.height = Math.round(h_ * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const suave = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

    // Costa: la tierra está donde a > f(b). Dentro de la bahía la costa es un arco.
    const costa = (b) => (Math.abs(b) < R ? Math.sqrt(R * R - b * b) - 0.15 * R : COSTA);

    const dibujar = (t) => {
      ctx.clearRect(0, 0, w, h_);
      const yH = h_ * 0.05, K = (h_ - yH) * 1.2, cx = w / 2;
      const brillo = tema.oscuro ? 1 : 0.9;
      for (let k = 0; ; k++) {
        const z = k * SZ, s = 1 / (1 + z / FOCAL);
        if (s < S_MIN) break;
        const niebla = suave(S_MIN, 0.26, s);                 // se pierde hacia el fondo
        const uMax = cx / s + SX;
        const y0 = yH + K * s;
        for (let u = -uMax + (k % 2) * (SX / 2); u <= uMax; u += SX) {
          const x = cx + u * s;
          if (x < -8 || x > w + 8) continue;
          const dx = u - BX, dz = z - BZ;
          const a = dx * AH[0] + dz * AH[1], b = dx * BH[0] + dz * BH[1];
          const f = costa(b);
          const prof = f - a;                                  // >0 mar, <0 tierra
          let r, c, alfa, lift = 0;

          if (prof > 0) {
            // mar: los frentes de ola se curvan con la costa y se aplanan mar adentro
            const m = Math.exp(-prof / (0.9 * R));
            const frente = a - f * m;
            const onda = Math.sin(frente * 0.022 - t * 0.95) + 0.3 * Math.sin(b * 0.008 + frente * 0.008 - t * 0.4);
            const amp = 24 * clamp(prof / (0.5 * R), 0.22, 1);
            lift = onda * amp * s;
            const cresta = clamp((onda / 1.4 + 1) / 2, 0, 1);
            const rompe = Math.exp(-prof / 120) * (0.55 + 0.45 * Math.sin(frente * 0.022 - t * 0.95));
            c = mezcla(mezcla(tema.valle, tema.cresta, cresta), tema.espuma, clamp(rompe, 0, 1));
            r = (0.4 + cresta * 1.0 + rompe * 1.0) * 1.25;
            alfa = 0.14 + cresta * 0.7 + rompe * 0.3;
          } else {
            // tierra: playa (ancha en la bahía, angosta en las puntas) y, más atrás, suelo apenas insinuado
            const ancho = 150 + 330 * (1 - suave(0.55 * R, 1.05 * R, Math.abs(b)));
            const e = -prof;
            if (e > ancho + 900) continue;
            if (e <= ancho) {
              const mojada = Math.exp(-e / 60);
              const resaca = 0.5 + 0.5 * Math.sin((e + 40 * Math.sin(t * 0.45)) * 0.05 - t * 0.9);
              c = mezcla(tema.arena, tema.espuma, mojada * 0.6 * resaca);
              r = (0.7 + (1 - e / ancho) * 0.5) * 1.3;
              alfa = (0.45 + 0.5 * (1 - e / ancho)) * (0.75 + 0.25 * resaca);
            } else {
              c = tema.arena; r = 0.5;
              alfa = 0.22 * (1 - (e - ancho) / 900);
            }
          }

          if (puntero.f > 0.01) {
            const d = Math.hypot(x - puntero.x, y0 - puntero.y);
            lift += puntero.f * Math.exp(-d / 150) * Math.sin(d * 0.05 - t * 6) * 12 * s;
          }
          const y = y0 - lift;
          const af = alfa * niebla * niebla * brillo;
          if (af < 0.04) continue;
          const col = mezcla(tema.lejos, c, Math.pow(niebla, 0.8));   // se oscurece hacia el horizonte
          const rad = Math.max(0.45, r * Math.pow(s, 0.5) * 1.6) * AUMENTO;
          ctx.fillStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${af.toFixed(2)})`;
          ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fill();
        }
      }
    };

    let raf = 0, visible = true; const t0 = performance.now();
    const cuadro = (ahora) => { puntero.f *= 0.985; dibujar((ahora - t0) / 1000); raf = requestAnimationFrame(cuadro); };
    const arrancar = () => {
      cancelAnimationFrame(raf);
      if (sinMovimiento) dibujar(2.4);
      else if (visible && !document.hidden) raf = requestAnimationFrame(cuadro);
    };
    paleta(); medir(); arrancar();
    new ResizeObserver(() => { medir(); if (sinMovimiento) dibujar(2.4); }).observe(lienzo);
    matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => { paleta(); if (sinMovimiento) dibujar(2.4); });
    document.addEventListener("visibilitychange", arrancar);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; arrancar(); }).observe(lienzo);
    addEventListener("pointermove", (e) => {
      const r = lienzo.getBoundingClientRect();
      puntero.x = e.clientX - r.left; puntero.y = e.clientY - r.top; puntero.f = 1;
    }, { passive: true });
  }

  // ───────────── Órbitas de proyectos ─────────────
  const orb = $("#orbitas");
  const tarjetas = $$(".proyecto");
  if (orb && tarjetas.length) {
    const cx = 450, cy = 320, radios = { 1: 145, 2: 255 };
    const fondo = el("g");
    const anillos = [1, 2].map((n) => el("g", { class: n === 1 ? "o-giro" : "o-giro o-giro-2" }));
    [1, 2].forEach((n, i) => {
      anillos[i].append(el("circle", { class: "o-anillo", cx, cy, r: radios[n] }));
      [0, 120, 240].forEach((g, k) => {
        const a = ((g + (n === 1 ? 20 : 70)) * Math.PI) / 180;
        anillos[i].append(el("circle", { class: n === 1 ? "o-sat" : "o-sat-2", cx: cx + radios[n] * Math.cos(a), cy: cy + radios[n] * Math.sin(a), r: k === 0 ? 4.5 : 3 }));
      });
    });
    fondo.append(...anillos);

    const rayos = el("g"), nodos = el("g");
    const porId = {};
    tarjetas.forEach((tj) => {
      const n = +tj.dataset.anillo, ang = (+tj.dataset.angulo * Math.PI) / 180, r = radios[n];
      const x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
      rayos.append(el("line", { class: "o-rayo", x1: cx, y1: cy, x2: x, y2: y }));
      const lado = Math.cos(ang) > 0.25 ? 1 : Math.cos(ang) < -0.25 ? -1 : 0;
      const anc = lado === 1 ? "start" : lado === -1 ? "end" : "middle";
      const tx = x + lado * 22, ty = lado === 0 ? y + (Math.sin(ang) > 0 ? 36 : -30) : y;
      const g = el("g", { class: "o-nodo", "data-anillo": n, tabindex: 0, role: "link", "aria-label": tj.dataset.nombre });
      g.append(
        el("circle", { cx: x, cy: y, r: 9 }),
        el("text", { class: "n", x: tx, y: ty - 2, "text-anchor": anc }, tj.dataset.nombre),
        el("text", { class: "c", x: tx, y: ty + 16, "text-anchor": anc }, tj.dataset.concepto)
      );
      const ir = () => { tj.scrollIntoView({ behavior: sinMovimiento ? "auto" : "smooth", block: "center" }); tj.querySelector("a")?.focus({ preventScroll: true }); };
      g.addEventListener("click", ir);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ir(); } });
      const marcar = (on) => { g.classList.toggle("on", on); tj.classList.toggle("on", on); };
      g.addEventListener("mouseenter", () => marcar(true));
      g.addEventListener("mouseleave", () => marcar(false));
      g.addEventListener("focus", () => marcar(true));
      g.addEventListener("blur", () => marcar(false));
      tj.addEventListener("mouseenter", () => marcar(true));
      tj.addEventListener("mouseleave", () => marcar(false));
      porId[tj.dataset.id] = g;
      nodos.append(g);
    });

    const centro = el("g");
    centro.append(el("circle", { class: "o-centro", cx, cy, r: 52 }), el("text", { class: "o-centro-t", x: cx, y: cy + 7 }, orb.dataset.centro));
    const nombres = [1, 2].map((n) => tarjetas.find((t) => +t.dataset.anillo === n)?.dataset.anilloNombre || "");
    const leyenda = el("g");
    nombres.forEach((txt, i) => leyenda.append(el("text", { class: "o-leyenda", x: cx - radios[i + 1], y: cy + 4 }, txt)));
    orb.append(fondo, rayos, centro, leyenda, nodos);
  }

  // ───────────── Radar de criterios ─────────────
  const raiz = $("#app-criterios");
  const crudo = $("#datos-criterios");
  if (raiz && crudo) {
    const D = JSON.parse(crudo.textContent);
    const N = D.ejes.length, MAX = 4;
    const ui = D.ui;
    const W = 560, H = 480, cx = W / 2, cy = H / 2 + 4, R = 150;
    const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
    const pt = (i, v, r = R) => [cx + ((r * v) / MAX) * Math.cos(ang(i)), cy + ((r * v) / MAX) * Math.sin(ang(i))];
    const poli = (vals) => vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");

    let actual = D.casos[0];
    let valores = [...actual.valores];
    let mostrados = [...valores];       // lo que se dibuja (se interpola)
    let comparado = null;
    let editado = false;

    // — estructura —
    raiz.textContent = "";
    const izq = h("div");
    const svg = el("svg", { class: "radar", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": ui.radar });
    izq.append(svg);
    const leyendaR = h("p", { class: "leyenda-r" });
    izq.append(leyendaR);

    const der = h("div", { class: "controles" });
    const chips = h("fieldset", { class: "chips" });
    chips.append(h("legend", {}, ui.caso));
    const botones = D.casos.map((c) => {
      const b = h("button", { type: "button", class: "chip", "aria-pressed": "false" }, c.nombre);
      b.addEventListener("click", () => elegir(c));
      chips.append(b);
      return b;
    });
    const etiqueta = h("span", { class: "etiqueta-caso" });
    const titulo = h("h3", { class: "caso-titulo" });
    const resumen = h("p", { class: "caso-resumen" });

    const campo = h("label", { class: "campo" });
    campo.append(h("span", {}, ui.comparar));
    const sel = h("select");
    sel.append(h("option", { value: "" }, ui.ninguno));
    D.casos.forEach((c) => sel.append(h("option", { value: c.id }, c.nombre)));
    campo.append(sel);

    const lista = h("ul", { class: "sliders" });
    const rangos = [], salidas = [];
    D.ejes.forEach((e, i) => {
      const li = h("li", { class: "slider" });
      const id = `crit-${i}`;
      const lab = h("label", { for: id });
      lab.append(h("span", {}, e.pregunta));
      const out = h("output", { for: id }, "0");
      lab.append(out);
      const r = h("input", { type: "range", id, min: "0", max: String(MAX), step: "1", value: "0", "aria-describedby": "escala-ayuda" });
      r.addEventListener("input", () => { valores[i] = +r.value; editado = true; mostrados[i] = valores[i]; refrescar(true); });
      li.append(lab, r);
      lista.append(li);
      rangos.push(r); salidas.push(out);
    });

    const lectura = h("div", { class: "lectura" });
    const mk = (txt) => { const d = h("div"); const s = h("span", {}, txt); const b = h("b"); d.append(s, b); lectura.append(d); return b; };
    const bProm = mk(ui.promedio), bDebil = mk(ui.debil), bFuerte = mk(ui.fuerte);

    der.append(chips, etiqueta, titulo, resumen, campo, lista, lectura);

    const pie = h("div", { class: "app-pie" });
    pie.append(h("p", { class: "nota", id: "escala-ayuda" }, `${ui.escala}. ${ui.nota}`));
    const reiniciar = h("button", { type: "button", class: "btn-mini", hidden: "" }, ui.reiniciar);
    reiniciar.addEventListener("click", () => elegir(actual));
    pie.append(reiniciar);

    raiz.append(izq, der, pie);

    // — dibujo del radar —
    for (let k = 1; k <= MAX; k++) {
      svg.append(el("polygon", { class: "r-anillo" + (k === MAX ? " fuerte" : ""), points: poli(Array(N).fill(k)) }));
      svg.append(el("text", { class: "r-escala", x: cx + 4, y: cy - (R * k) / MAX + 11 }, String(k)));
    }
    D.ejes.forEach((e, i) => {
      const [x, y] = pt(i, MAX);
      svg.append(el("line", { class: "r-eje", x1: cx, y1: cy, x2: x, y2: y }));
      const [lx, ly] = pt(i, MAX, R + 30);
      const c = Math.cos(ang(i));
      const t = el("text", { class: "r-etq", x: lx, y: ly, "text-anchor": c > 0.3 ? "start" : c < -0.3 ? "end" : "middle" });
      const palabras = e.corto.split(" ");
      const mitad = palabras.length > 2 ? Math.ceil(palabras.length / 2) : palabras.length > 1 && e.corto.length > 14 ? 1 : palabras.length;
      const lineas = [palabras.slice(0, mitad).join(" "), palabras.slice(mitad).join(" ")].filter(Boolean);
      lineas.forEach((ln, k) => t.append(el("tspan", { x: lx, dy: k === 0 ? (lineas.length > 1 ? "-0.3em" : "0.35em") : "1.2em" }, ln)));
      svg.append(t);
    });
    const polComp = el("polygon", { class: "r-comp", points: poli(Array(N).fill(0)), visibility: "hidden" });
    const polForma = el("polygon", { class: "r-forma", points: poli(Array(N).fill(0)) });
    svg.append(polComp, polForma);
    const puntos = D.ejes.map((_, i) => {
      const p = el("circle", { class: "r-punto", r: 8, cx: cx, cy: cy });
      svg.append(p);
      p.addEventListener("pointerdown", (e) => {
        p.setPointerCapture(e.pointerId); p.classList.add("arrastra");
        const mover = (ev) => {
          const m = svg.getScreenCTM().inverse();
          const q = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m);
          const d = (q.x - cx) * Math.cos(ang(i)) + (q.y - cy) * Math.sin(ang(i));
          const v = Math.max(0, Math.min(MAX, Math.round((d / R) * MAX)));
          if (v !== valores[i]) { valores[i] = v; mostrados[i] = v; editado = true; refrescar(true); }
        };
        const fin = () => { p.classList.remove("arrastra"); p.removeEventListener("pointermove", mover); p.removeEventListener("pointerup", fin); p.removeEventListener("pointercancel", fin); };
        p.addEventListener("pointermove", mover); p.addEventListener("pointerup", fin); p.addEventListener("pointercancel", fin);
      });
      return p;
    });

    // — estado y animación —
    let anim = 0;
    const pintar = () => {
      polForma.setAttribute("points", poli(mostrados));
      puntos.forEach((p, i) => { const [x, y] = pt(i, mostrados[i]); p.setAttribute("cx", x); p.setAttribute("cy", y); });
    };
    const animarA = (destino) => {
      cancelAnimationFrame(anim);
      if (sinMovimiento) { mostrados = [...destino]; pintar(); return; }
      const desde = [...mostrados], t0 = performance.now(), dur = 550;
      const paso = (ahora) => {
        const k = Math.min(1, (ahora - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        mostrados = desde.map((v, i) => v + (destino[i] - v) * e);
        pintar();
        if (k < 1) anim = requestAnimationFrame(paso);
      };
      anim = requestAnimationFrame(paso);
    };

    const refrescar = (inmediato = false) => {
      rangos.forEach((r, i) => { r.value = valores[i]; salidas[i].textContent = valores[i]; });
      const suma = valores.reduce((a, b) => a + b, 0);
      bProm.textContent = `${(suma / N).toFixed(1)} / ${MAX}`;
      const min = Math.min(...valores), max = Math.max(...valores);
      bDebil.textContent = `${D.ejes[valores.indexOf(min)].corto} (${min})`;
      bFuerte.textContent = `${D.ejes[valores.indexOf(max)].corto} (${max})`;
      reiniciar.hidden = !editado;
      if (inmediato) { cancelAnimationFrame(anim); pintar(); }
      // comparación
      if (comparado) {
        polComp.setAttribute("points", poli(comparado.valores));
        polComp.setAttribute("visibility", "visible");
      } else polComp.setAttribute("visibility", "hidden");
      leyendaR.textContent = "";
      const a = h("span"); a.append(h("i"), document.createTextNode(actual.nombre + (editado ? ` · ${ui.editado}` : "")));
      leyendaR.append(a);
      if (comparado) { const b = h("span"); b.append(h("i", { class: "b" }), document.createTextNode(comparado.nombre)); leyendaR.append(b); }
    };

    function elegir(caso) {
      actual = caso; editado = false;
      valores = [...caso.valores];
      botones.forEach((b, i) => b.setAttribute("aria-pressed", String(D.casos[i] === caso)));
      etiqueta.textContent = caso.ficticio ? ui.ficticio : ui.real;
      etiqueta.className = "etiqueta-caso " + (caso.ficticio ? "ficticio" : "real");
      titulo.textContent = caso.nombre;
      resumen.textContent = caso.resumen;
      refrescar();
      animarA(valores);
    }
    sel.addEventListener("change", () => { comparado = D.casos.find((c) => c.id === sel.value) || null; refrescar(); });

    elegir(D.casos[0]);
  }
})();
