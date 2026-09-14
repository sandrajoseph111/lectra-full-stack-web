import { useState } from "react";

function Login({ onLogin, onShowSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    // Temporary login
    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <span className="logo-icon">L</span>
          <span>Lectra</span>
        </div>

        <h1>Welcome Back 👋</h1>

        <p className="login-subtitle">
          Login to continue your learning journey.
        </p>

        <form onSubmit={handleLogin}>

          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

        </form>

        <p className="signup-text">
          Don't have an account?{" "}
          <button
            type="button"
            className="signup-link"
            onClick={onShowSignup}
          >
            Sign Up
          </button>
        </p>

      </div>
    </div>
  );
}

export default Login;