import { useState } from "react";
import "./Login.css";
import Register from "./Register";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  // Show Register page
  if (showRegister) {
    return (
      <Register
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8080/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      if (response.ok) {
        const token = await response.text();

        localStorage.setItem("jwt_token", token);

        onLogin();
      } else {
        alert("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>Login</h1>
<p>Login to Smart Contact Management System</p>

        <form onSubmit={handleSubmit}>

          <div className="input-box">
            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />
          </div>

          <div className="input-box">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button type="submit">
            Login
          </button>

        </form>

        {/* Register option */}
        <div className="register-option">
          <span>Don't have an account?</span>

          <button
            type="button"
            className="register-link"
            onClick={() => setShowRegister(true)}
          >
            Register here
          </button>
        </div>

        <div className="footer">
          Smart Contact Management System
        </div>

      </div>
    </div>
  );
}

export default Login;