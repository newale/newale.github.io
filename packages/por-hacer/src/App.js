import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

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
      const task = {
        date: new Date().toISOString(),
        state: "active",
        task: newTask.trim(),
      };
      setTasks((prevTasks) => sortTasks([...prevTasks, task]));
      setNewTask("");
    }
  };

  const toggleTaskState = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, state: task.state === "active" ? "done" : "active" } : task
    );
    setTasks(sortTasks(updatedTasks));
  };

  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => (a.state === "done" ? 1 : -1));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo List</h1>
        <form onSubmit={addTask}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
          />
          <button type="submit">Add</button>
        </form>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task, index) => (
            <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                type="checkbox"
                checked={task.state === "done"}
                onChange={() => toggleTaskState(index)}
                style={{ marginRight: "0.5rem" }}
              />
              <span
                style={{
                  textDecoration: task.state === "done" ? "line-through" : "none",
                  cursor: "pointer",
                }}
              >
                {task.task}
              </span>
              <small style={{ marginLeft: "0.5rem", color: "#888" }}>
                ({new Date(task.date).toLocaleDateString()})
              </small>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
