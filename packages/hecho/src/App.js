import React, { useState, useEffect, useRef } from 'react';
import { Button } from "baseui/button";
import { Input } from "baseui/input";
import { Select } from "baseui/select";
import './App.css';

const PALETTE = [
  "#4fc3f7", "#a5d6a7", "#ffcc80", "#ce93d8", "#ef9a9a",
  "#80cbc4", "#ffab91", "#b0bec5", "#fff176", "#f48fb1",
];

function colorForCategoria(cat) {
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToDuration(mins) {
  if (mins <= 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function localToday() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function getDayKey(fechaStr) {
  if (!fechaStr) return "";
  if (fechaStr.length <= 10) return fechaStr;
  const d = new Date(fechaStr);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function formatDayLabel(dayKey) {
  const date = new Date(dayKey + "T12:00:00");
  return date.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DayStats({ items }) {
  const counts = {};
  items.forEach(item => { counts[item.categoria] = (counts[item.categoria] || 0) + 1; });

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
      {Object.entries(counts).map(([cat, n]) => (
        <span
          key={cat}
          style={{
            background: colorForCategoria(cat),
            color: "#1a1a1a",
            borderRadius: "999px",
            padding: "2px 10px",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          {cat} {n}
        </span>
      ))}
      <span style={{ color: "#aaa", fontSize: "0.75rem", alignSelf: "center" }}>
        {items.length} {items.length === 1 ? "registro" : "registros"}
      </span>
    </div>
  );
}

function defaultTimes() {
  const now = new Date();
  const fin = now.toTimeString().slice(0, 5);
  const inicio = new Date(now.getTime() - 30 * 60 * 1000).toTimeString().slice(0, 5);
  return { inicio, fin };
}

const timeInputStyle = {
  background: "#3a3f4b",
  border: "1px solid #555",
  borderRadius: "4px",
  color: "white",
  padding: "8px",
  fontSize: "0.9rem",
  outline: "none",
  colorScheme: "dark",
};

const toggleButtonStyle = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  background: "#3a3f4b",
  border: "none",
  borderRadius: "6px",
  color: "white",
  padding: "8px 12px",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  gap: "0.5rem",
};

const itemStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  padding: "6px 0",
  borderBottom: "1px solid #3a3f4b",
};

function addDays(dateKey, n) {
  const d = new Date(dateKey + "T12:00:00");
  d.setDate(d.getDate() + n);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function shortDay(dateKey) {
  return new Date(dateKey + "T12:00:00").toLocaleDateString("es-CL", { weekday: "short" });
}


function VistaEstadisticas({ registros }) {
  const [winWidth, setWinWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const today = localToday();
  const count = winWidth < 640 ? 3 : 7;
  const days = Array.from({ length: count }, (_, i) => addDays(today, i - Math.floor(count / 2)));

  // Largest total minutes across visible days — used to scale column heights
  const dayTotals = days.map(dayKey => {
    const items = registros.filter(r => getDayKey(r.fecha) === dayKey);
    return items.reduce((sum, r) => {
      if (r.horaInicio && r.horaFin) return sum + Math.max(0, timeToMinutes(r.horaFin) - timeToMinutes(r.horaInicio));
      return sum + 30; // untimed items count as 30 min for sizing
    }, 0);
  });
  const maxMins = Math.max(...dayTotals, 60);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: "4px", width: "100%", alignItems: "flex-start" }}>
        {days.map((dayKey, di) => {
          const items = registros.filter(r => getDayKey(r.fecha) === dayKey);
          const isToday = dayKey === today;
          const dayNum = new Date(dayKey + "T12:00:00").getDate();

          const timedMins = items.reduce((sum, r) => {
            if (r.horaInicio && r.horaFin) return sum + Math.max(0, timeToMinutes(r.horaFin) - timeToMinutes(r.horaInicio));
            return sum;
          }, 0);

          // Sort timed items by start time; untimed go at end
          const sorted = [
            ...items.filter(r => r.horaInicio).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
            ...items.filter(r => !r.horaInicio),
          ];

          return (
            <div key={dayKey} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch", minWidth: 0 }}>
              {/* Header */}
              <div style={{
                textAlign: "center",
                padding: "5px 2px",
                borderRadius: "6px",
                background: isToday ? "#4fc3f7" : "#3a3f4b",
                color: isToday ? "#1a1a1a" : "white",
                marginBottom: "4px",
              }}>
                <div style={{ fontSize: "0.65rem", textTransform: "capitalize", opacity: 0.8 }}>{shortDay(dayKey)}</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.1 }}>{dayNum}</div>
                {timedMins > 0 && (
                  <div style={{ fontSize: "0.6rem", fontWeight: 600, opacity: 0.85, marginTop: "1px" }}>
                    {minutesToDuration(timedMins)}
                  </div>
                )}
              </div>

              {/* Stacked blocks */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {sorted.map(r => {
                  const mins = r.horaInicio && r.horaFin
                    ? Math.max(timeToMinutes(r.horaFin) - timeToMinutes(r.horaInicio), 0)
                    : 30;
                  const blockH = Math.max((mins / maxMins) * 260, 8);
                  return (
                    <div
                      key={r.id}
                      title={r.horaInicio ? `${r.texto} (${r.horaInicio}–${r.horaFin})` : r.texto}
                      style={{
                        height: `${blockH}px`,
                        background: colorForCategoria(r.categoria),
                        borderRadius: "3px",
                        overflow: "hidden",
                        fontSize: "12px",
                        color: "#1a1a1a",
                        fontWeight: 600,
                        padding: "2px 4px",
                        lineHeight: 1.3,
                        flexShrink: 0,
                      }}
                    >
                      {blockH > 20 ? r.texto : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function readLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function App() {
  const [registros, setRegistros] = useState(() => readLS("hecho_registros", []));
  const [categorias, setCategorias] = useState(() => readLS("hecho_categorias", []));
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState([]);
  const [horaInicio, setHoraInicio] = useState(() => defaultTimes().inicio);
  const [horaFin, setHoraFin] = useState(() => defaultTimes().fin);
  const [openDays, setOpenDays] = useState(() => ({ [localToday()]: true }));
  const [fecha, setFecha] = useState(() => localToday());
  const [editId, setEditId] = useState(null);
  const [vista, setVista] = useState("registros");
  const [showCats, setShowCats] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [editCatLabel, setEditCatLabel] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("hecho_registros", JSON.stringify(registros));
  }, [registros]);

  useEffect(() => {
    localStorage.setItem("hecho_categorias", JSON.stringify(categorias));
  }, [categorias]);

  const exportar = () => {
    const data = { registros, categorias };
    const dateStr = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hecho_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data.registros)) setRegistros(data.registros);
        if (Array.isArray(data.categorias)) setCategorias(data.categorias);
      } catch {
        alert("Archivo JSON inválido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const eliminarCategoria = (id) => {
    setCategorias(prev => prev.filter(c => c.id !== id));
    if (editCatId === id) { setEditCatId(null); setEditCatLabel(""); }
  };

  const iniciarEditCat = (c) => { setEditCatId(c.id); setEditCatLabel(c.label); };

  const guardarEditCat = (id) => {
    const label = editCatLabel.trim();
    if (!label) return;
    setCategorias(prev => prev.map(c => c.id === id ? { id: label.toLowerCase(), label } : c));
    setRegistros(prev => prev.map(r => r.categoria === categorias.find(c => c.id === id)?.label ? { ...r, categoria: label } : r));
    setEditCatId(null);
    setEditCatLabel("");
  };

  const agregarCategoria = () => {
    const label = newCatLabel.trim();
    if (!label) return;
    if (!categorias.find(c => c.id === label.toLowerCase())) {
      setCategorias(prev => [...prev, { id: label.toLowerCase(), label }]);
    }
    setNewCatLabel("");
  };

  const resetForm = () => {
    setTexto("");
    setCategoria([]);
    setFecha(localToday());
    const t = defaultTimes();
    setHoraInicio(t.inicio);
    setHoraFin(t.fin);
    setEditId(null);
  };

  const guardarCategoria = (cat) => {
    if (cat && !categorias.find(c => c.id === cat.toLowerCase())) {
      setCategorias(prev => [...prev, { id: cat.toLowerCase(), label: cat }]);
    }
  };

  const guardar = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    const catLabel = categoria[0]?.label || categoria[0]?.id || "";
    const catFinal = catLabel.trim() || "otros";
    guardarCategoria(catFinal);

    if (editId !== null) {
      setRegistros(prev => prev.map(r =>
        r.id === editId
          ? { ...r, fecha, texto: texto.trim(), categoria: catFinal, horaInicio: horaInicio || null, horaFin: horaFin || null }
          : r
      ));
    } else {
      setRegistros(prev => [{
        id: Date.now(),
        fecha,
        texto: texto.trim(),
        categoria: catFinal,
        horaInicio: horaInicio || null,
        horaFin: horaFin || null,
      }, ...prev]);
    }
    resetForm();
  };

  const editar = (r) => {
    setTexto(r.texto);
    setCategoria(r.categoria ? [{ id: r.categoria, label: r.categoria }] : []);
    setFecha(getDayKey(r.fecha));
    setHoraInicio(r.horaInicio || "");
    setHoraFin(r.horaFin || "");
    setEditId(r.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = (id) => {
    if (editId === id) resetForm();
    setRegistros(prev => prev.filter(r => r.id !== id));
  };

  const toggleDay = (dayKey) => {
    setOpenDays(prev => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const byDay = {};
  registros.forEach(r => {
    const key = getDayKey(r.fecha);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(r);
  });
  const sortedDays = Object.keys(byDay).sort((a, b) => b.localeCompare(a));

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "0.5rem" }}>
          <h1 style={{ margin: 0 }}>Hecho</h1>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <Button
              kind="minimal" size="compact"
              onClick={() => setVista(v => v === "estadisticas" ? "registros" : "estadisticas")}
              title="Estadísticas"
              overrides={{ BaseButton: { style: { padding: "4px", color: vista === "estadisticas" ? "#4fc3f7" : undefined } } }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="4" height="18" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="18" y="13" width="4" height="8" rx="1"/>
              </svg>
            </Button>
            <Button
              kind="minimal" size="compact"
              onClick={() => setShowCats(v => !v)}
              title="Categorías"
              overrides={{ BaseButton: { style: { padding: "4px" } } }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </Button>
            <Button
              kind="minimal" size="compact"
              onClick={exportar}
              title="Exportar JSON"
              overrides={{ BaseButton: { style: { padding: "4px" } } }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" /><polyline points="19 12 12 19 5 12" />
              </svg>
            </Button>
            <Button
              kind="minimal" size="compact"
              onClick={() => fileInputRef.current.click()}
              title="Importar JSON"
              overrides={{ BaseButton: { style: { padding: "4px" } } }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" /><polyline points="5 12 12 5 19 12" />
              </svg>
            </Button>
            <input ref={fileInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={importar} />
          </div>
        </div>

        {showCats && (
          <div style={{ width: "100%", background: "#3a3f4b", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 600 }}>Categorías</span>
              <Button kind="minimal" size="compact" onClick={() => setShowCats(false)} overrides={{ BaseButton: { style: { padding: "2px" } } }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0.75rem 0" }}>
              {categorias.length === 0 && <li style={{ color: "#888", fontSize: "0.85rem" }}>Sin categorías guardadas.</li>}
              {categorias.map(c => (
                <li key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: colorForCategoria(c.label), display: "inline-block", flexShrink: 0 }} />
                  {editCatId === c.id ? (
                    <>
                      <input
                        value={editCatLabel}
                        onChange={e => setEditCatLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") guardarEditCat(c.id); if (e.key === "Escape") { setEditCatId(null); setEditCatLabel(""); } }}
                        style={{ ...timeInputStyle, flex: 1, padding: "4px 8px" }}
                        autoFocus
                      />
                      <Button kind="tertiary" size="mini" onClick={() => guardarEditCat(c.id)}>Ok</Button>
                      <Button kind="tertiary" size="mini" onClick={() => { setEditCatId(null); setEditCatLabel(""); }}>✕</Button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1 }}>{c.label}</span>
                      <Button kind="minimal" size="mini" onClick={() => iniciarEditCat(c)} overrides={{ BaseButton: { style: { padding: "2px" } } }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </Button>
                      <Button kind="minimal" size="mini" onClick={() => eliminarCategoria(c.id)} overrides={{ BaseButton: { style: { padding: "2px", color: "#d32f2f" } } }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        </svg>
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                value={newCatLabel}
                onChange={e => setNewCatLabel(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); agregarCategoria(); } }}
                placeholder="Nueva categoría..."
                style={{ ...timeInputStyle, flex: 1, padding: "6px 8px" }}
              />
              <Button size="compact" onClick={agregarCategoria}>Agregar</Button>
            </div>
          </div>
        )}
        {vista === "estadisticas" && <VistaEstadisticas registros={registros} />}

        {vista === "registros" && <>
        <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", marginBottom: "1.5rem" }}>
          <Input
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="¿Qué hiciste?"
            clearOnEscape
            overrides={{ Root: { style: { width: "100%" } } }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <Select
                options={categorias}
                value={categoria}
                onChange={({ value }) => setCategoria(value)}
                placeholder="Categoría"
                labelKey="label"
                valueKey="id"
                creatable
                clearable
                overrides={{ Root: { style: { width: "100%" } } }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                style={timeInputStyle}
                title="Fecha"
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <input
                type="time"
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                style={timeInputStyle}
                title="Hora inicio"
              />
              <span style={{ color: "#aaa" }}>→</span>
              <input
                type="time"
                value={horaFin}
                onChange={e => setHoraFin(e.target.value)}
                style={timeInputStyle}
                title="Hora fin"
              />
            </div>
            <Button type="submit">{editId !== null ? "Guardar cambios" : "Agregar"}</Button>
            {editId !== null && (
              <Button type="button" kind="tertiary" onClick={resetForm}>Cancelar</Button>
            )}
          </div>
        </form>

        <div style={{ width: "100%" }}>
          {sortedDays.length === 0 && (
            <p style={{ color: "#888", textAlign: "center" }}>Sin registros aún.</p>
          )}
          {sortedDays.map(dayKey => {
            const items = byDay[dayKey];
            const isOpen = !!openDays[dayKey];
            return (
              <div key={dayKey} style={{ marginBottom: "1rem" }}>
                <button onClick={() => toggleDay(dayKey)} style={toggleButtonStyle}>
                  <span style={{ flex: 1, textAlign: "left", textTransform: "capitalize" }}>
                    {formatDayLabel(dayKey)}
                  </span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isOpen && (
                  <div style={{ paddingLeft: "0.5rem", paddingTop: "0.5rem" }}>
                    <DayStats items={items} />
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {items.map(r => {
                        const dur = r.horaInicio && r.horaFin
                          ? minutesToDuration(timeToMinutes(r.horaFin) - timeToMinutes(r.horaInicio))
                          : null;
                        return (
                          <li key={r.id} style={itemStyle}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flex: 1 }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 8, height: 8,
                                  borderRadius: "50%",
                                  background: colorForCategoria(r.categoria),
                                  marginTop: 6,
                                  flexShrink: 0,
                                }}
                              />
                              <div>
                                <span>{r.texto}</span>
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "2px" }}>
                                  <small style={{ color: "#888" }}>
                                    {r.categoria}
                                  </small>
                                  {r.horaInicio && (
                                    <small style={{ color: "#888" }}>
                                      {r.horaInicio}{r.horaFin ? ` → ${r.horaFin}` : ""}
                                      {dur ? ` (${dur})` : ""}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "flex" }}>
                              <Button
                                onClick={() => editar(r)}
                                kind="tertiary"
                                size="compact"
                                overrides={{
                                  BaseButton: {
                                    style: {
                                      paddingTop: "4px",
                                      paddingBottom: "4px",
                                      minWidth: "32px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    },
                                  },
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                </svg>
                              </Button>
                              <Button
                                onClick={() => eliminar(r.id)}
                                kind="tertiary"
                                size="compact"
                                overrides={{
                                  BaseButton: {
                                    style: {
                                      color: "#d32f2f",
                                      paddingTop: "4px",
                                      paddingBottom: "4px",
                                      minWidth: "32px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    },
                                  },
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                                </svg>
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </>}
      </header>
    </div>
  );
}

export default App;
