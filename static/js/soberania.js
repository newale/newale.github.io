// /soberania-digital/ — olas de puntos, órbitas de proyectos y radar de criterios.
// Sin dependencias ni rastreadores.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Pausa global de las animaciones decorativas (WCAG 2.2.2): botón visible solo si hay movimiento.
  const anim = { pausado: false, cambios: [] };
  const btnPausa = document.querySelector("#btn-pausa");
  if (btnPausa && !sinMovimiento) {
    btnPausa.hidden = false;
    btnPausa.addEventListener("click", () => {
      anim.pausado = !anim.pausado;
      btnPausa.setAttribute("aria-pressed", String(anim.pausado));
      btnPausa.textContent = anim.pausado ? btnPausa.dataset.reanudar : btnPausa.dataset.pausar;
      anim.cambios.forEach((f) => f());
    });
  }
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

  // Ruido de Perlin 3D (Ken Perlin, "improved noise") con semilla fija: devuelve valores en [-1, 1].
  const ruido3 = (() => {
    let sem = 1337;
    const azar = () => ((sem = (sem * 1664525 + 1013904223) >>> 0) / 4294967296);
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const k = Math.floor(azar() * (i + 1)); [p[i], p[k]] = [p[k], p[i]]; }
    const perm = new Uint8Array(512).map((_, i) => p[i & 255]);
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (t, a, b) => a + t * (b - a);
    const grad = (h, x, y, z) => {
      const g = h & 15, u = g < 8 ? x : y, v = g < 4 ? y : g === 12 || g === 14 ? x : z;
      return ((g & 1) === 0 ? u : -u) + ((g & 2) === 0 ? v : -v);
    };
    return (x, y, z) => {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      const u = fade(x), v = fade(y), w = fade(z);
      const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z, B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
      return lerp(w,
        lerp(v, lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z)), lerp(u, grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z))),
        lerp(v, lerp(u, grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1)), lerp(u, grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1))));
    };
  })();

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
    const glitch = { fin: 0, k0: 0, k1: 0, dx: 0, prox: 2.5 };
    let w = 0, h_ = 0, tema = {};

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
        fondo: (getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g) || [14, 21, 25]).slice(0, 3).map(Number),
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
      if (t > glitch.prox) {
        glitch.k0 = 8 + Math.floor(Math.random() * 40); glitch.k1 = glitch.k0 + 1 + Math.floor(Math.random() * 4);
        glitch.dx = (Math.random() - 0.5) * 70; glitch.fin = t + 0.12 + Math.random() * 0.18;
        glitch.prox = t + 3 + Math.random() * 5;
      }
      for (let k = 0; ; k++) {
        const z = k * SZ, s = 1 / (1 + z / FOCAL);
        if (s < S_MIN) break;
        const niebla = suave(S_MIN, 0.26, s);                 // se pierde hacia el fondo
        const uMax = cx / s + SX;
        const y0 = yH + K * s;
        for (let u = -uMax + (k % 2) * (SX / 2); u <= uMax; u += SX) {
          const x = cx + u * s + (t < glitch.fin && k >= glitch.k0 && k <= glitch.k1 ? glitch.dx * s : 0);
          if (x < -8 || x > w + 8) continue;
          const dx = u - BX, dz = z - BZ;
          const a = dx * AH[0] + dz * AH[1], b = dx * BH[0] + dz * BH[1];
          const f = costa(b);
          const prof = f - a;                                  // >0 mar, <0 tierra
          let r, c, alfa, lift = 0;

          if (prof > 0) {
            // mar: los frentes de ola se curvan con la costa y se aplanan mar adentro.
            // Ruido de Perlin: deforma los frentes, modula la altura por tramos y agrega agitación.
            const nt = t * 0.18;
            const wa = ruido3(u * 0.0016, z * 0.0016, nt) * 340;
            const wb = ruido3(u * 0.0016 + 40, z * 0.0016 + 40, nt) * 160;
            const m = Math.exp(-prof / (0.9 * R));
            const frente = a + wa - f * m;
            const racha = 0.55 + 0.9 * (ruido3(u * 0.0032 + 9, z * 0.0032, t * 0.22) * 0.5 + 0.5);
            const onda = Math.sin(frente * 0.022 - t * 0.95 + ruido3(u * 0.004, z * 0.004, t * 0.3) * 2.2)
                       + 0.3 * Math.sin((b + wb) * 0.008 + frente * 0.008 - t * 0.4);
            const agitacion = ruido3(u * 0.011, z * 0.011, t * 0.85) * 0.55 + ruido3(u * 0.027, z * 0.027, t * 1.6) * 0.25;
            const amp = 24 * clamp(prof / (0.5 * R), 0.22, 1) * racha;
            lift = (onda + agitacion) * amp * s;
            const cresta = clamp(((onda + agitacion) / 1.5 + 1) / 2, 0, 1);
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

          const y = y0 - lift;
          const af = alfa * (0.35 + 0.65 * niebla) * brillo;
          if (af < 0.04) continue;
          const col = mezcla(tema.fondo, c, Math.pow(niebla, 0.9));   // lejos: se acerca al color del fondo
          const rad = Math.max(0.45, r * Math.pow(s, 0.5) * 1.6) * AUMENTO;
          ctx.fillStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${af.toFixed(2)})`;
          ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fill();
        }
      }
    };

    const VELOCIDAD = 0.5;                 // 1 = ritmo original; menos = más lenta
    let raf = 0, visible = true, tAnim = 2.4, ultimo = 0;
    const cuadro = (ahora) => {
      tAnim += ((ahora - ultimo) / 1000) * VELOCIDAD; ultimo = ahora;
      dibujar(tAnim); raf = requestAnimationFrame(cuadro);
    };
    const arrancar = () => {
      cancelAnimationFrame(raf);
      if (sinMovimiento) dibujar(2.4);
      else if (anim.pausado) dibujar(tAnim);
      else if (visible && !document.hidden) { ultimo = performance.now(); raf = requestAnimationFrame(cuadro); }
    };
    anim.cambios.push(arrancar);
    paleta(); medir(); arrancar();
    new ResizeObserver(() => { medir(); if (sinMovimiento) dibujar(2.4); }).observe(lienzo);
    matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => { paleta(); if (sinMovimiento) dibujar(2.4); });
    document.addEventListener("visibilitychange", arrancar);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; arrancar(); }).observe(lienzo);
  }

  // ───────────── Red de proyectos ─────────────
  // Una red anisomorfa: sin centro, con nodos de formas y tamaños distintos y aristas
  // de naturalezas distintas (concepto, práctica, relato). La tesis es un nodo más.
  const svgRed = $("#red");
  const datosRed = $("#datos-red");
  const tarjetas = $$(".proyectos:not(.abordar) .proyecto");
  if (svgRed && datosRed) {
    const D = JSON.parse(datosRed.textContent);
    const mapa = {};
    const gAr = el("g"), gEt = el("g"), gPu = el("g"), gNo = el("g");

    D.nodos.forEach((n, i) => {
      const g = el("g", { class: "rd-nodo", "data-id": n.id, "data-anillo": n.anillo });
      g.append(el("circle", { class: "rd-forma", r: n.tam }));
      const t = el("text", { class: "rd-n" }, n.corto);
      g.append(t);
      n.etq = t;
      const ir = () => {
        if (n.url?.startsWith("#")) document.querySelector(n.url)?.scrollIntoView({ behavior: sinMovimiento ? "auto" : "smooth", block: "start" });
        else if (n.url) location.href = n.url;
        else tarjetas.find((c) => c.dataset.id === n.id)?.scrollIntoView({ behavior: sinMovimiento ? "auto" : "smooth", block: "center" });
      };
      g.addEventListener("click", ir);
      mapa[n.id] = { n, g, fase: i * 1.7 };
      gNo.append(g);
    });

    const aristas = D.aristas.map((a, i) => {
      const linea = el("line", { class: `rd-arista ${a.tipo}` });
      const etq = el("text", { class: "rd-etq-arista" }, a.etiqueta);
      const pulsos = [0, 1].map((k) => { const c = el("circle", { class: "rd-pulso", r: k ? 2.6 : 3.6 }); gPu.append(c); return { c, fase: (i * 0.37 + k * 0.5) % 1, vel: 0.05 + 0.03 * ((i + k) % 3) }; });
      gAr.append(linea); gEt.append(etq);
      return { a, linea, etq, pulsos };
    });
    svgRed.append(gAr, gPu, gNo, gEt);

    const marcar = (id, on) => {
      mapa[id]?.g.classList.toggle("on", on);
      tarjetas.find((c) => c.dataset.id === id)?.classList.toggle("on", on);
      aristas.forEach((e) => { if (e.a.a === id || e.a.b === id) { e.linea.classList.toggle("on", on); e.etq.classList.toggle("on", on); } });
    };
    Object.keys(mapa).forEach((id) => {
      const g = mapa[id].g;
      g.addEventListener("mouseenter", () => marcar(id, true));
      g.addEventListener("mouseleave", () => marcar(id, false));
    });
    tarjetas.forEach((c) => {
      c.addEventListener("mouseenter", () => marcar(c.dataset.id, true));
      c.addEventListener("mouseleave", () => marcar(c.dataset.id, false));
      c.addEventListener("focusin", () => marcar(c.dataset.id, true));
      c.addEventListener("focusout", () => marcar(c.dataset.id, false));
    });

    // Todos gravitan, a ritmos distintos, en torno a un centro invisible; las órbitas quedan implícitas.
    const CX = 500, CY = 380;
    const pos = (id, t) => {
      const { n } = mapa[id];
      const ang = (n.angulo * Math.PI) / 180 + (sinMovimiento ? 0 : n.vel * t);
      return [CX + n.radio * Math.cos(ang), CY + n.radio * Math.sin(ang)];
    };
    // La etiqueta se coloca hacia afuera del centro, para que nunca tape el interior de la red.
    const ubicarEtiqueta = (n, x, y) => {
      const dx = x - CX, dy = y - CY, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const ancla = ux > 0.4 ? "start" : ux < -0.4 ? "end" : "middle";
      const ex = ancla === "start" ? n.tam + 12 : ancla === "end" ? -(n.tam + 12) : 0;
      const ey = ancla === "middle" ? (uy > 0 ? n.tam + 26 : -(n.tam + 12)) : 7;
      n.etq.setAttribute("x", ex); n.etq.setAttribute("y", ey); n.etq.setAttribute("text-anchor", ancla);
    };
    const pintarRed = (t) => {
      Object.keys(mapa).forEach((id) => { const [x, y] = pos(id, t); mapa[id].g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`); ubicarEtiqueta(mapa[id].n, x, y); });
      aristas.forEach((e) => {
        const [x1, y1] = pos(e.a.a, t), [x2, y2] = pos(e.a.b, t);
        e.linea.setAttribute("x1", x1); e.linea.setAttribute("y1", y1); e.linea.setAttribute("x2", x2); e.linea.setAttribute("y2", y2);
        e.etq.setAttribute("x", (x1 + x2) / 2); e.etq.setAttribute("y", (y1 + y2) / 2 + 5);
        e.pulsos.forEach((p) => {
          const k = sinMovimiento ? 0.35 + p.fase * 0.3 : (p.fase + t * p.vel) % 1;
          p.c.setAttribute("cx", x1 + (x2 - x1) * k); p.c.setAttribute("cy", y1 + (y2 - y1) * k);
        });
      });
    };
    pintarRed(0);
    if (!sinMovimiento) {
      let visibleRed = true, rafRed = 0, tRed = 0, ultimoRed = 0;
      const bucle = (ahora) => { tRed += ((ahora - ultimoRed) / 1000) * 0.6; ultimoRed = ahora; pintarRed(tRed); rafRed = requestAnimationFrame(bucle); };
      const gira = () => { cancelAnimationFrame(rafRed); if (visibleRed && !document.hidden && !anim.pausado) { ultimoRed = performance.now(); rafRed = requestAnimationFrame(bucle); } };
      anim.cambios.push(gira);
      new IntersectionObserver(([e]) => { visibleRed = e.isIntersecting; gira(); }).observe(svgRed);
      document.addEventListener("visibilitychange", gira);
      gira();
    }
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
    let editado = false;

    // — estructura —
    raiz.textContent = "";
    const izq = h("div");
    const svg = el("svg", { class: "radar", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": ui.radar });
    const caja = h("div", { class: "radar-caja" });
    caja.append(svg);
    izq.append(caja);

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


    const lista = h("ul", { class: "sliders" });
    const rangos = [], salidas = [];
    D.ejes.forEach((e, i) => {
      const li = h("li", { class: "slider" });
      const id = `crit-${i}`;
      const lab = h("label", { for: id });
      const q = h("span"); q.append(h("b", { class: "num" }, String(i + 1)), document.createTextNode(e.pregunta));
      lab.append(q);
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

    const info = h("div", { class: "app-info" });
    info.append(etiqueta, titulo, resumen);
    const colCasos = h("div", { class: "app-casos" });
    colCasos.append(chips);
    const config = h("div", { class: "app-config" });
    config.append(lista, lectura);

    const pie = h("div", { class: "app-pie" });
    pie.append(h("p", { class: "nota", id: "escala-ayuda" }, `${ui.escala}. ${ui.nota}`));
    const reiniciar = h("button", { type: "button", class: "btn-mini", hidden: "" }, ui.reiniciar);
    reiniciar.addEventListener("click", () => elegir(actual));
    pie.append(reiniciar);

    config.append(pie);
    izq.className = "app-radar";
    raiz.append(colCasos, izq, info, config);

    // — dibujo del radar —
    for (let k = 1; k <= MAX; k++) {
      svg.append(el("polygon", { class: "r-anillo" + (k === MAX ? " fuerte" : ""), points: poli(Array(N).fill(k)) }));
    }
    D.ejes.forEach((e, i) => {
      const [x, y] = pt(i, MAX);
      svg.append(el("line", { class: "r-eje", x1: cx, y1: cy, x2: x, y2: y }));
      const [lx, ly] = pt(i, MAX, R + 30);
      const c = Math.cos(ang(i)), sn = Math.sin(ang(i));
      // etiquetas en HTML: así nunca bajan de 14 px, ni en pantallas angostas (ahí quedan solo con su número)
      const et = h("div", { class: "r-et" });
      et.style.left = `${(lx / W) * 100}%`;
      et.style.top = `${(ly / H) * 100}%`;
      et.style.transform = c > 0.3 ? "translate(0,-50%)" : c < -0.3 ? "translate(-100%,-50%)" : sn < 0 ? "translate(-50%,-100%)" : "translate(-50%,0)";
      et.style.textAlign = c > 0.3 ? "left" : c < -0.3 ? "right" : "center";
      et.append(h("b", { class: "num" }, String(i + 1)), h("span", { class: "txt" }, e.corto));
      caja.append(et);
    });
    const polForma = el("polygon", { class: "r-forma", points: poli(Array(N).fill(0)) });
    svg.append(polForma);
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

    elegir(D.casos[0]);
  }
})();
