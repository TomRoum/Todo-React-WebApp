import { useState } from "react";

function AuthForm({ mode, onSubmit, onToggleMode, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      onSubmit(email, password);
    }
  };

  return (
    <div className="auth-container">
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          disabled={loading}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
        </button>
      </form>
      <p className="auth-toggle">
        {mode === "login"
          ? "Don't have an account? "
          : "Already have an account? "}
        <button onClick={onToggleMode} disabled={loading} className="link-btn">
          {mode === "login" ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
