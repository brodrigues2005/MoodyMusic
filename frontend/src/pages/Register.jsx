import { useState } from "react";
import "../styling/register.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/registration", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        alert("Registration successful!");
        navigate("/");
      } else {
        alert(data.detail || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  }

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h1>Create Account</h1>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
