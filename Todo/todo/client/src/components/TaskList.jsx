import TaskItem from "./TaskItem.jsx";

function TaskList({ tasks, onDelete, loading }) {
  if (loading && tasks.length === 0) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div className="empty-state">No tasks yet. Add one above!</div>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          disabled={loading}
        />
      ))}
    </ul>
  );
}

export default TaskList;
