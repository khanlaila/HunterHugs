import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Landing.css";

function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");
    setIsError(false);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to sign in.");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      navigate("/home");
    } catch (error) {
      setIsError(true);
      setFeedback(error.message);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Sign in</h1>
        <p className="auth-subtitle">Access your HunterHugs profile and saved resources.</p>
        <form className="auth-form" onSubmit={onSubmit}>
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />
          <input
            className="auth-input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
          />
          <button type="submit" className="auth-btn">
            Sign In
          </button>
        </form>
        {feedback ? <p className={`auth-feedback ${isError ? "auth-error" : ""}`}>{feedback}</p> : null}
        <p className="auth-footer-link">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default SignIn;
