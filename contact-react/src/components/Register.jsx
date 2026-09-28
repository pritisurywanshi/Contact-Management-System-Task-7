import { useState } from "react";
import "./Login.css";

function Register({ onBackToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8080/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const result = await response.text();

      if (response.ok) {
        alert(
          "Registration successful! Registration email has been sent."
        );

        onBackToLogin();
      } else {
        alert(result);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>Create Account</h1>

        <p>Register for Smart Contact Management System</p>

        <form onSubmit={handleRegister}>

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
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
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
            Register
          </button>

        </form>

        <p
          onClick={onBackToLogin}
          style={{
            cursor: "pointer",
            color: "#2563eb",
            marginTop: "15px",
          }}
        >
          Already have an account? Login
        </p>

        <div className="footer">
          Smart Contact Management System
        </div>

      </div>
    </div>
  );
}

export default Register;