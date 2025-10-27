import React, { useState, useEffect, useRef } from 'react';
import { Button } from "baseui/button";
import { Input } from "baseui/input";
import { Checkbox } from "baseui/checkbox";
import './App.css';

function App() {
  const [activeTasks, setActiveTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setActiveTasks(parsedTasks.filter(t => t.state !== "done"));
        setDoneTasks(parsedTasks.filter(t => t.state === "done"));
      } catch (error) {
        console.error("Error parsing tasks from localStorage:", error);
        setActiveTasks([]);
        setDoneTasks([]);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    const allTasks = [...activeTasks, ...doneTasks];
    localStorage.setItem("tasks", JSON.stringify(allTasks));
  }, [activeTasks, doneTasks]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysDuration = (start, end) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return diff === 1 ? `${diff} día` : `${diff} días`;
  };

  const getDaysPending = (start) => {
    if (!start) return "";
    const startDate = new Date(start);
    const now = new Date();
    const diff = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    return diff === 1 ? `Pendiente hace ${diff} día` : `Pendiente hace ${diff} días`;
  };

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      if (editIndex !== null) {
        // Guardar edición
        const updatedTasks = activeTasks.map((task, i) =>
          i === editIndex ? { ...task, task: newTask } : task
        );
        setActiveTasks(updatedTasks);
        setEditIndex(null);
      } else {
        // Agregar nueva tarea
        const task = {
          date: new Date().toISOString(),
          state: "active",
          task: newTask.trim(),
        };
        setActiveTasks([...activeTasks, task]);
      }
      setNewTask("");
    }
  };

  const startEditTask = (index) => {
    setNewTask(activeTasks[index].task);
    setEditIndex(index);
  };

  const toggleTaskState = (index, isActive) => {
    if (isActive) {
      // Mover de activas a done y guardar fecha de completado
      const task = { ...activeTasks[index], state: "done", completedAt: new Date().toISOString() };
      setActiveTasks(activeTasks.filter((_, i) => i !== index));
      setDoneTasks([...doneTasks, task]);
    } else {
      // Mover de done a activas y borrar fecha de completado
      const { completedAt, ...rest } = doneTasks[index];
      const task = { ...rest, state: "active" };
      setDoneTasks(doneTasks.filter((_, i) => i !== index));
      setActiveTasks([...activeTasks, task]);
    }
    setEditIndex(null);
    setNewTask("");
  };

  const deleteTask = (index, isActive) => {
    if (isActive) {
      setActiveTasks(activeTasks.filter((_, i) => i !== index));
      if (editIndex === index) {
        setEditIndex(null);
        setNewTask("");
      }
    } else {
      setDoneTasks(doneTasks.filter((_, i) => i !== index));
    }
  };

  // Descargar tasks como JSON
  const handleDownload = () => {
    const allTasks = [...activeTasks, ...doneTasks];
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:]/g, "-").replace(/[T]/g, "_").replace(/[.]/g, "-").split('Z')[0];
    const filename = `tasks_${dateStr}.json`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allTasks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Cargar tasks desde archivo JSON
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target.result);
        setActiveTasks(importedTasks.filter(t => t.state !== "done"));
        setDoneTasks(importedTasks.filter(t => t.state === "done"));
      } catch (err) {
        alert("Error al cargar el archivo. ¿Es un JSON válido?");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="App">
      <header className="App-header" style={{ position: "relative" }}>
        <div style={{ marginTop: 16, marginRight: 16, display: "flex", justifyContent: "right", gap: "0.5rem" }}>
          <Button
            onClick={handleDownload}
            kind="minimal"
            size="compact"
            overrides={{ BaseButton: { style: { padding: 0, minWidth: 0 } } }}
            title="Descargar tareas"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 5v14" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </Button>
          <Button
            onClick={() => fileInputRef.current.click()}
            kind="minimal"
            size="compact"
            overrides={{ BaseButton: { style: { padding: 0, minWidth: 0 } } }}
            title="Cargar tareas"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 19V5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </Button>
          <input
            type="file"
            accept="application/json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </div>
        <h1>Por hacer ({activeTasks.length})</h1>
        <form
          onSubmit={addTask}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            width: "100%",
            marginBottom: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Ingresa una tarea"
              clearOnEscape
              overrides={{
                Input: { style: { width: "100%" } },
                Root: { style: { width: "100%" } },
              }}
            />
          </div>
          <Button type="submit">{editIndex !== null ? "Guardar" : "Agregar"}</Button>
        </form>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {activeTasks
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((task) => {
              const realIndex = activeTasks.findIndex(t => t.date === task.date);
              return (
                <li
                  key={`${task.date}-${realIndex}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={false}
                      onChange={() => toggleTaskState(realIndex, true)}
                      overrides={{ Root: { style: { marginRight: "0.5rem" } } }}
                    >
                      <span
                        style={{
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                      >
                        {task.task}
                      </span>
                      <small
                        style={{
                          marginLeft: "0.5rem",
                          color: "#888",
                        }}
                      >
                        ({formatDate(task.date)}) · {getDaysPending(task.date)}
                      </small>
                    </Checkbox>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Button
                      onClick={() => startEditTask(realIndex)}
                      kind="tertiary"
                      size="compact"
                      aria-label={`Editar ${task.task}`}
                      overrides={{
                        BaseButton: {
                          style: {
                            marginLeft: "0.5rem",
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ display: "block" }}
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </Button>
                    <Button
                      onClick={() => deleteTask(realIndex, true)}
                      kind="tertiary"
                      size="compact"
                      aria-label={`Eliminar ${task.task}`}
                      overrides={{
                        BaseButton: {
                          style: {
                            marginLeft: "0.5rem",
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ display: "block" }}
                      >
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
        <details style={{ marginTop: "2rem" }}>
          <summary style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            Completadas ({doneTasks.length})
          </summary>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
            {doneTasks.map((task, index) => (
              <li
                key={`${task.date}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  justifyContent: "space-between",
                  opacity: 0.7,
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={true}
                    onChange={() => toggleTaskState(index, false)}
                    overrides={{ Root: { style: { marginRight: "0.5rem" } } }}
                  >
                    <span
                      style={{
                        textDecoration: "line-through",
                        cursor: "pointer",
                      }}
                    >
                      {task.task}
                    </span>
                    <small
                      style={{
                        marginLeft: "0.5rem",
                        color: "#888",
                        textDecoration: "line-through",
                      }}
                    >
                      {getDaysDuration(task.date, task.completedAt)}
                    </small>
                  </Checkbox>
                </div>
                <Button
                  onClick={() => deleteTask(index, false)}
                  kind="tertiary"
                  size="compact"
                  aria-label={`Eliminar ${task.task}`}
                  overrides={{
                    BaseButton: {
                      style: {
                        marginLeft: "0.5rem",
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: "block" }}
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                  </svg>
                </Button>
              </li>
            ))}
          </ul>
        </details>
      </header>
    </div>
  );
}

export default App;
