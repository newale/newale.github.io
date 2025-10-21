import React, { useState, useEffect } from 'react';
import { Button } from "baseui/button";
import { Input } from "baseui/input";
import { Checkbox } from "baseui/checkbox";
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks.sort((a, b) => (a.state === "done" ? 1 : -1)));
      } catch (error) {
        console.error("Error parsing tasks from localStorage:", error);
        setTasks([]);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault(); // Prevent page reload
    if (newTask.trim()) {
      if (editIndex !== null) {
        // Guardar edición
        const updatedTasks = tasks.map((task, i) =>
          i === editIndex ? { ...task, task: newTask } : task
        );
        setTasks(sortTasks(updatedTasks));
        setEditIndex(null);
      } else {
        // Agregar nueva tarea
        const task = {
          date: new Date().toISOString(),
          state: "active",
          task: newTask.trim(),
        };
        setTasks((prevTasks) => sortTasks([...prevTasks, task]));
      }
      setNewTask("");
    }
  };

  const startEditTask = (index) => {
    setNewTask(tasks[index].task);
    setEditIndex(index);
  };

  const toggleTaskState = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, state: task.state === "active" ? "done" : "active" } : task
    );
    setTasks(sortTasks(updatedTasks));
  };

  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    if (editIndex === index) {
      setEditIndex(null);
      setNewTask("");
    }
  };

  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => (a.state === "done" ? 1 : -1));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Por hacer</h1>
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
          {tasks.map((task, index) => (
            <li
              key={`${task.date}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  checked={task.state === "done"}
                  onChange={() => toggleTaskState(index)}
                  overrides={{ Root: { style: { marginRight: "0.5rem" } } }}
                >
                  <span
                    style={{
                      textDecoration: task.state === "done" ? "line-through" : "none",
                      cursor: "pointer",
                    }}
                  >
                    {task.task}
                  </span>
                  <small
                    style={{
                      marginLeft: "0.5rem",
                      color: "#888",
                      textDecoration: task.state === "done" ? "line-through" : "none",
                    }}
                  >
                    ({new Date(task.date).toLocaleDateString()})
                  </small>
                </Checkbox>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Button
                  onClick={() => startEditTask(index)}
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
                  onClick={() => deleteTask(index)}
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
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
