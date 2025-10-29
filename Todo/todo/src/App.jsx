import { useState } from "react";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  
  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, task]);
      setTask("");
    }
  };
  
  const deleteTask = (taskToDelete) => {
    setTasks(tasks.filter(item => item !== taskToDelete));
  };
  
  return (
    <div id="container">
      <div className="card">
        <h3>Todos</h3>
        <div>
          <input
            placeholder="Add new task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTask();
              }
            }}
          />
        </div>
        <ul>
          {tasks.map((item, index) => (
            <li key={index}>
              <span>{item}</span>
              <button className="delete-button" onClick={() => deleteTask(item)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
