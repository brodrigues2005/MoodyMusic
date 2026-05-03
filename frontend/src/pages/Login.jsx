import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styling/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    // Remove old token if one exists
    localStorage.removeItem("token");

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.token) {
        // Store JWT
        localStorage.setItem("token", data.token);

        // Redirect user
        navigate("/musicplayer");
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Welcome Back</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
