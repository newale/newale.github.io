import React, { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';

// Rompe la recursión si el dashboard se carga dentro de su propio iframe
if (window !== window.top) {
  document.body.innerHTML = '';
  throw new Error('dashboard loaded inside iframe — aborting');
}

const ORIGIN = process.env.REACT_APP_APPS_ORIGIN ?? window.location.origin;
const BASE = `${ORIGIN}/aplicaciones`;

const APPS = [
  {
    id: 'por-hacer',
    label: 'Por hacer',
    url: `${BASE}/por-hacer/`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: 'hecho',
    label: 'Hecho',
    url: `${BASE}/hecho/`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

function useResize(initialPct = 50) {
  const [splitPct, setSplitPct] = useState(initialPct);
  const dragging = useRef(false);
  const containerRef = useRef(null);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(80, Math.max(20, pct)));
    };
    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return { splitPct, containerRef, onMouseDown };
}

function Window({ app, minimized, maximized, onMinimize, onMaximize, onRestore, onOpenTab, style }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
  const iframeRef = useRef(null);

  const handleLoad = () => {
    try {
      // Si el iframe cargó el dashboard recursivamente, el guard lanza un error
      // y el contenido queda vacío — lo detectamos por título vacío o body vacío.
      const doc = iframeRef.current?.contentDocument;
      if (doc && doc.title === 'Dashboard') {
        setStatus('error');
      } else {
        setStatus('ok');
      }
    } catch {
      // Cross-origin cargado correctamente
      setStatus('ok');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#282c34',
      ...style,
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 10px',
        height: '34px',
        background: '#20232a',
        borderBottom: '1px solid #333',
        flexShrink: 0,
        userSelect: 'none',
      }}>
        <span style={{ color: '#888', display: 'flex', alignItems: 'center' }}>{app.icon}</span>
        <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: '#ccc', letterSpacing: '0.02em' }}>
          {app.label}
          {status === 'loading' && <span style={{ marginLeft: 8, color: '#555', fontWeight: 400, fontSize: '0.72rem' }}>cargando…</span>}
          {status === 'error' && <span style={{ marginLeft: 8, color: '#c0392b', fontWeight: 400, fontSize: '0.72rem' }}>no disponible</span>}
        </span>
        <WindowButton title="Abrir en pestaña" onClick={onOpenTab}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </WindowButton>
        <WindowButton title={minimized ? 'Restaurar' : 'Minimizar'} onClick={minimized ? onRestore : onMinimize} color="#f0c040">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </WindowButton>
        <WindowButton title={maximized ? 'Restaurar' : 'Maximizar'} onClick={maximized ? onRestore : onMaximize} color="#50c878">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {maximized
              ? <><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="21" y2="3"/><line x1="3" y1="21" x2="14" y2="10"/></>
              : <rect x="3" y="3" width="18" height="18" rx="1"/>
            }
          </svg>
        </WindowButton>
      </div>

      {minimized && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '0.85rem' }}>
          Minimizado — click en la barra para restaurar
        </div>
      )}

      {!minimized && status === 'error' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#666' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: '0.85rem' }}>App no disponible en este entorno</span>
          <button onClick={onOpenTab} style={{ background: '#2a2d35', border: '1px solid #444', color: '#aaa', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Abrir en pestaña nueva
          </button>
        </div>
      )}

      {!minimized && (
        <iframe
          ref={iframeRef}
          src={app.url}
          title={app.label}
          onLoad={handleLoad}
          style={{ flex: 1, border: 'none', width: '100%', display: status === 'error' ? 'none' : 'block' }}
          allow="clipboard-read; clipboard-write"
        />
      )}
    </div>
  );
}

function WindowButton({ onClick, title, color = '#555', children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color,
        cursor: 'pointer',
        padding: '3px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        lineHeight: 1,
        opacity: 0.7,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
    >
      {children}
    </button>
  );
}

export default function App() {
  const { splitPct, containerRef, onMouseDown } = useResize(50);
  const [states, setStates] = useState({ 'por-hacer': 'normal', hecho: 'normal' });

  const setState = (id, s) => setStates(prev => ({ ...prev, [id]: s }));

  const maximized = Object.entries(states).find(([, s]) => s === 'maximized')?.[0] ?? null;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* Topbar */}
      <div style={{
        height: '36px',
        background: '#13151a',
        borderBottom: '1px solid #2a2d35',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7eb8f7', letterSpacing: '0.08em' }}>OS</span>
        <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
          {APPS.map(app => (
            <button
              key={app.id}
              onClick={() => setState(app.id, states[app.id] === 'minimized' ? 'normal' : 'minimized')}
              style={{
                background: states[app.id] === 'minimized' ? '#2a2d35' : 'none',
                border: '1px solid',
                borderColor: states[app.id] === 'minimized' ? '#444' : 'transparent',
                color: '#aaa',
                borderRadius: '5px',
                padding: '2px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {app.icon} {app.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#666' }}>{dateLabel}</span>
        <Clock />
      </div>

      {/* Window area */}
      <div ref={containerRef} style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {APPS.map((app, i) => {
          const isMax = maximized === app.id;
          const otherMax = maximized && maximized !== app.id;

          if (otherMax) return null;

          const leftPct = i === 0 ? 0 : splitPct;
          const widthPct = maximized
            ? 100
            : i === 0 ? splitPct : 100 - splitPct;

          return (
            <Window
              key={app.id}
              app={app}
              minimized={states[app.id] === 'minimized'}
              maximized={isMax}
              onMinimize={() => setState(app.id, 'minimized')}
              onMaximize={() => setState(app.id, 'maximized')}
              onRestore={() => setState(app.id, 'normal')}
              onOpenTab={() => window.open(app.url, '_blank')}
              style={{
                position: 'absolute',
                top: 0,
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                height: '100%',
                transition: dragging => dragging ? 'none' : undefined,
              }}
            />
          );
        })}

        {/* Divider */}
        {!maximized && (
          <div
            onMouseDown={onMouseDown}
            style={{
              position: 'absolute',
              top: 0,
              left: `calc(${splitPct}% - 3px)`,
              width: '6px',
              height: '100%',
              cursor: 'col-resize',
              background: '#2a2d35',
              zIndex: 10,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#4a7fa5'}
            onMouseLeave={e => e.currentTarget.style.background = '#2a2d35'}
          />
        )}
      </div>
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  );
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontSize: '0.75rem', color: '#888', fontVariantNumeric: 'tabular-nums' }}>{time}</span>;
}
