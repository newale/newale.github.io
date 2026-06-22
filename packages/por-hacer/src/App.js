import React, { useState, useEffect, useRef } from 'react';
import { Button } from "baseui/button";
import { Input } from "baseui/input";
import { Checkbox } from "baseui/checkbox";
import { CategorySelect, colorForCategoria } from '@newale/ui';
import './App.css';

function App() {
  const [activeTasks, setActiveTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem("projects")) ?? []; } catch { return []; }
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [taskProject, setTaskProject] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setActiveTasks(parsedTasks.filter(t => t.state !== "done"));
        setDoneTasks(parsedTasks.filter(t => t.state === "done"));
      } catch {
        setActiveTasks([]);
        setDoneTasks([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify([...activeTasks, ...doneTasks]));
  }, [activeTasks, doneTasks]);

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const getDaysDuration = (start, end) => {
    if (!start || !end) return "";
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return diff === 1 ? `${diff} día` : `${diff} días`;
  };

  const getDaysPending = (start) => {
    if (!start) return "";
    const diff = Math.ceil((new Date() - new Date(start)) / (1000 * 60 * 60 * 24));
    return diff === 1 ? `Pendiente hace ${diff} día` : `Pendiente hace ${diff} días`;
  };

  const ensureProject = (label) => {
    const id = label.toLowerCase();
    if (!projects.find(p => p.id === id)) {
      setProjects(prev => [...prev, { id, label }]);
    }
    return id;
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const rawProject = taskProject[0];
    let projectId = null;
    if (rawProject) {
      projectId = ensureProject(rawProject.label || rawProject.id);
    }

    if (editIndex !== null) {
      setActiveTasks(prev => prev.map((task, i) =>
        i === editIndex ? { ...task, task: newTask, projectId } : task
      ));
      setEditIndex(null);
    } else {
      setActiveTasks(prev => [...prev, {
        date: new Date().toISOString(),
        state: "active",
        task: newTask.trim(),
        projectId,
      }]);
    }
    setNewTask("");
    setTaskProject([]);
  };

  const startEditTask = (index) => {
    const task = activeTasks[index];
    setNewTask(task.task);
    setEditIndex(index);
    if (task.projectId) {
      const proj = projects.find(p => p.id === task.projectId);
      setTaskProject(proj ? [{ id: proj.id, label: proj.label }] : []);
    } else {
      setTaskProject([]);
    }
  };

  const toggleTaskState = (index, isActive) => {
    if (isActive) {
      const task = { ...activeTasks[index], state: "done", completedAt: new Date().toISOString() };
      setActiveTasks(prev => prev.filter((_, i) => i !== index));
      setDoneTasks(prev => [...prev, task]);
    } else {
      const { completedAt, ...rest } = doneTasks[index];
      setDoneTasks(prev => prev.filter((_, i) => i !== index));
      setActiveTasks(prev => [...prev, { ...rest, state: "active" }]);
    }
    setEditIndex(null);
    setNewTask("");
    setTaskProject([]);
  };

  const deleteTask = (index, isActive) => {
    if (isActive) {
      setActiveTasks(prev => prev.filter((_, i) => i !== index));
      if (editIndex === index) { setEditIndex(null); setNewTask(""); setTaskProject([]); }
    } else {
      setDoneTasks(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDownload = () => {
    const allTasks = [...activeTasks, ...doneTasks];
    const dateStr = new Date().toISOString().replace(/[:T.Z]/g, "-").slice(0, 19);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allTasks, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `tasks_${dateStr}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setActiveTasks(imported.filter(t => t.state !== "done"));
        setDoneTasks(imported.filter(t => t.state === "done"));
      } catch {
        alert("Error al cargar el archivo. ¿Es un JSON válido?");
      }
    };
    reader.readAsText(file);
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProject === id) setSelectedProject(null);
  };

  const getProjectLabel = (projectId) => projects.find(p => p.id === projectId)?.label ?? null;

  const filteredActive = selectedProject
    ? activeTasks.filter(t => t.projectId === selectedProject)
    : activeTasks;

  const filteredDone = selectedProject
    ? doneTasks.filter(t => t.projectId === selectedProject)
    : doneTasks;

  return (
    <div className="App">
      <header className="App-header" style={{ position: "relative" }}>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Button onClick={handleDownload} kind="minimal" size="compact" overrides={{ BaseButton: { style: { padding: 0, minWidth: 0 } } }} title="Descargar tareas">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 5v14" /><polyline points="19 12 12 19 5 12" />
            </svg>
          </Button>
          <Button onClick={() => fileInputRef.current.click()} kind="minimal" size="compact" overrides={{ BaseButton: { style: { padding: 0, minWidth: 0 } } }} title="Cargar tareas">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 19V5" /><polyline points="5 12 12 5 19 12" />
            </svg>
          </Button>
          <input type="file" accept="application/json" ref={fileInputRef} style={{ display: "none" }} onChange={handleUpload} />
        </div>

        {projects.length > 0 && (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem", width: "100%", marginTop: "0.75rem" }}>
            <ProjectChip label="Todos" active={selectedProject === null} onClick={() => setSelectedProject(null)} />
            {projects.map(p => (
              <ProjectChip
                key={p.id}
                label={p.label}
                color={colorForCategoria(p.label)}
                active={selectedProject === p.id}
                onClick={() => setSelectedProject(p.id === selectedProject ? null : p.id)}
                onDelete={() => deleteProject(p.id)}
              />
            ))}
          </div>
        )}

        <h1>Por hacer ({filteredActive.length})</h1>

        {(() => {
          const selectedProjId = taskProject[0]?.id ?? null;
          const suggestions = activeTasks
            .filter(t => selectedProjId ? t.projectId === selectedProjId : true)
            .map(t => t.task);
          return (
            <datalist id="por-hacer-suggestions">
              {suggestions.map((t, i) => <option key={i} value={t} />)}
            </datalist>
          );
        })()}
        <form onSubmit={addTask} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Ingresa una tarea"
                clearOnEscape
                overrides={{
                  Input: { style: { width: "100%" }, props: { list: "por-hacer-suggestions" } },
                  Root: { style: { width: "100%" } },
                }}
              />
            </div>
            <Button type="submit">{editIndex !== null ? "Guardar" : "Agregar"}</Button>
          </div>
          <CategorySelect
            options={projects}
            value={taskProject}
            onChange={({ value }) => setTaskProject(value)}
            onCreateOption={(label) => ensureProject(label)}
            placeholder="Proyecto (opcional)"
          />
        </form>

        <ul style={{ listStyle: "none", padding: 0, width: "100%" }}>
          {filteredActive
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((task) => {
              const realIndex = activeTasks.findIndex(t => t.date === task.date && t.task === task.task);
              const projLabel = getProjectLabel(task.projectId);
              return (
                <li key={`${task.date}-${realIndex}`} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <Checkbox checked={false} onChange={() => toggleTaskState(realIndex, true)} overrides={{ Root: { style: { marginRight: "0.5rem" } } }}>
                      <span>{task.task}</span>
                      {projLabel && (
                        <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", background: colorForCategoria(projLabel), color: "#1a1a1a", padding: "1px 8px", borderRadius: 10, fontWeight: 600 }}>
                          {projLabel}
                        </span>
                      )}
                      <small style={{ marginLeft: "0.5rem", color: "#888" }}>
                        ({formatDate(task.date)}) · {getDaysPending(task.date)}
                      </small>
                    </Checkbox>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => startEditTask(realIndex)} label={`Editar ${task.task}`}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => deleteTask(realIndex, true)} label={`Eliminar ${task.task}`} danger>
                      <TrashIcon />
                    </IconButton>
                  </div>
                </li>
              );
            })}
        </ul>

        <details style={{ marginTop: "2rem", width: "100%" }}>
          <summary style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Completadas ({filteredDone.length})</summary>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
            {filteredDone.map((task, index) => {
              const realIndex = doneTasks.findIndex(t => t.date === task.date && t.task === task.task);
              const projLabel = getProjectLabel(task.projectId);
              return (
                <li key={`${task.date}-${index}`} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", justifyContent: "space-between", opacity: 0.7 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Checkbox checked={true} onChange={() => toggleTaskState(realIndex, false)} overrides={{ Root: { style: { marginRight: "0.5rem" } } }}>
                      <span style={{ textDecoration: "line-through" }}>{task.task}</span>
                      {projLabel && (
                        <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", background: colorForCategoria(projLabel), color: "#1a1a1a", padding: "1px 8px", borderRadius: 10, fontWeight: 600 }}>
                          {projLabel}
                        </span>
                      )}
                      <small style={{ marginLeft: "0.5rem", color: "#888", textDecoration: "line-through" }}>
                        {getDaysDuration(task.date, task.completedAt)}
                      </small>
                    </Checkbox>
                  </div>
                  <IconButton onClick={() => deleteTask(realIndex, false)} label={`Eliminar ${task.task}`} danger>
                    <TrashIcon />
                  </IconButton>
                </li>
              );
            })}
          </ul>
        </details>
      </header>
    </div>
  );
}

function ProjectChip({ label, color, active, onClick, onDelete }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px 3px 10px", borderRadius: 16, border: "1px solid #555", background: active ? (color || "#fff") : "transparent", color: active ? "#1a1a1a" : "#fff", cursor: "pointer", fontSize: "0.82rem", fontWeight: active ? 600 : 400 }}>
      <span onClick={onClick}>{label}</span>
      {onDelete && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "0 0 0 2px", lineHeight: 1, opacity: 0.6, fontSize: "0.9rem" }} title="Eliminar proyecto">×</button>
      )}
    </span>
  );
}

function IconButton({ onClick, label, danger, children }) {
  return (
    <Button onClick={onClick} kind="tertiary" size="compact" aria-label={label}
      overrides={{ BaseButton: { style: { marginLeft: "0.5rem", color: danger ? "#d32f2f" : undefined, paddingTop: "4px", paddingBottom: "4px", minWidth: "32px", display: "flex", alignItems: "center", justifyContent: "center" } } }}>
      {children}
    </Button>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default App;
