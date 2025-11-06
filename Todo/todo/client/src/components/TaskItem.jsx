function TaskItem({ task, onDelete, disabled }) {
  return (
    <li className="task-item">
      <span className="task-description">{task.description}</span>
      <button
        onClick={() => onDelete(task.id)}
        disabled={disabled}
        className="delete-btn"
      >
        Delete
      </button>
    </li>
  );
}

export default TaskItem;
