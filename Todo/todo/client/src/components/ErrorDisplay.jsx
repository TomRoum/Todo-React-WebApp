function ErrorDisplay({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="error-container">
      <div className="error-message">
        <span>{error}</span>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
    </div>
  );
}

export default ErrorDisplay;