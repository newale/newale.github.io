import React, { useState } from "react";
import { Input } from "baseui/input";
import { Table } from "baseui/table";
import { calcularNota } from "./NotaScale";
import IncrementSelector from "./IncrementSelector";
import './App.css';

const DEFAULTS = {
  puntajeMax: 50,
  exigencia: 0.6,
  notaMin: 1,
  notaMax: 7,
  notaAprobacion: 4,
  incremento: 1,
};

function App() {
  const [puntajeMax, setPuntajeMax] = useState(DEFAULTS.puntajeMax);
  const [exigencia, setExigencia] = useState(DEFAULTS.exigencia);
  const [notaMin, setNotaMin] = useState(DEFAULTS.notaMin);
  const [notaMax, setNotaMax] = useState(DEFAULTS.notaMax);
  const [notaAprobacion, setNotaAprobacion] = useState(DEFAULTS.notaAprobacion);
  const [incremento, setIncremento] = useState(DEFAULTS.incremento);

  // Generar tablas de 10 puntajes cada una
  const tables = [];
  for (let start = 0; start <= puntajeMax; start += 10) {
    const end = Math.min(start + 9, puntajeMax);
    const columns = ["Puntaje", "Nota"];
    const data = [];
    for (let p = start; p <= end; p++) {
      const nota = calcularNota({
        puntaje: p,
        puntajeMax,
        exigencia,
        notaMin,
        notaMax,
        notaAprobacion,
      });
      data.push([p, (Math.round(nota * 10) / 10).toFixed(1)]);
    }
    tables.push({ range: `${start} - ${end}`, columns, data });
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Escala de Notas</h1>
      </header>
      <main>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 32,
          maxWidth: '100vw',
          margin: '2rem auto',
          padding: 16,
        }}>
          <form style={{
            display: "grid",
            gap: 8,
            minWidth: 260,
            flex: '0 0 260px',
            position: 'sticky',
            left: 0,
            top: 0,
            zIndex: 2,
          }}>
            <label>
              Puntaje máximo:
              <Input type="number" value={puntajeMax} min={1} onChange={e => setPuntajeMax(Number(e.target.value))} />
            </label>
            <label>
              Exigencia (%):
              <Input type="number" value={exigencia * 100} min={1} max={100} onChange={e => setExigencia(Number(e.target.value) / 100)} />
            </label>
            <label>
              Nota mínima:
              <Input type="number" value={notaMin} step="0.01" onChange={e => setNotaMin(Number(e.target.value))} />
            </label>
            <label>
              Nota máxima:
              <Input type="number" value={notaMax} step="0.01" onChange={e => setNotaMax(Number(e.target.value))} />
            </label>
            <label>
              Nota aprobación:
              <Input type="number" value={notaAprobacion} step="0.01" onChange={e => setNotaAprobacion(Number(e.target.value))} />
            </label>
            <label>
              Incremento:
              <IncrementSelector value={incremento} onChange={setIncremento} />
            </label>
          </form>
          <div style={{
            flex: 1,
            overflowX: 'auto',
            display: 'flex',
            gap: 24,
            paddingBottom: 8,
            maxWidth: '100%',
          }}>
            {tables.map((table, idx) => (
              <div key={table.range} style={{  }}>
                <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>{table.range}</div>
                <Table columns={table.columns} data={table.data} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
