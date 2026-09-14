import { useState } from "react";

function Signup({ onSignup, onShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Temporary signup
   onSignup(name);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <span className="logo-icon">L</span>
          <span>Lectra</span>
        </div>

        <h1>Create Account 🚀</h1>

        <p className="login-subtitle">
          Create your account and start learning smarter.
        </p>

        <form onSubmit={handleSignup}>

          <div className="login-field">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn">
            Sign Up
          </button>

        </form>

        <p className="signup-text">
          Already have an account?{" "}
          <button
            type="button"
            className="signup-link"
            onClick={onShowLogin}
          >
            Login
          </button>
        </p>

      </div>
    </div>
  );
}

export default Signup;