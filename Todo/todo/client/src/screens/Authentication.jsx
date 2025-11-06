import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userProvider';

// Export the AuthenticationMode enum
export const AuthenticationMode = {
  SignIn: 'signin',
  SignUp: 'signup'
};

function Authentication({ authenticationMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const isSignIn = authenticationMode === AuthenticationMode.SignIn;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isSignIn 
        ? 'http://localhost:3001/user/signin' 
        : 'http://localhost:3001/user/signup';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            email: email,
            password: password
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
      }

      if (!isSignIn) {
        // After successful signup, redirect to signin
        setError('Account created successfully! Please sign in.');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        // After successful signin, save token and user data
        localStorage.setItem('token', data.token);
        setUser({
          id: data.id,
          email: data.email,
          token: data.token
        });
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    if (isSignIn) {
      navigate('/signup');
    } else {
      navigate('/signin');
    }
  };

  return (
    <div className="auth-container">
      <h1>Todo App</h1>
      <h2>{isSignIn ? 'Sign In' : 'Sign Up'}</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : isSignIn ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <p className="auth-toggle">
        {isSignIn ? "Don't have an account? " : "Already have an account? "}
        <button onClick={toggleMode} className="link-btn" disabled={loading}>
          {isSignIn ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  );
}

export default Authentication;