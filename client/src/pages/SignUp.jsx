import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Landing.css";

function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    studentId: "",
    estimatedIncome: "",
    citizenshipStatus: "",
    address: "",
    campus: "",
    major: "",
    enrollmentStatus: "",
  });
  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(false);
  const [verificationLink, setVerificationLink] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");
    setIsError(false);
    setVerificationLink("");
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        studentId: form.studentId,
        estimatedIncome: Number(form.estimatedIncome),
        citizenshipStatus: form.citizenshipStatus,
        address: form.address,
        campus: form.campus,
        major: form.major,
        enrollmentStatus: form.enrollmentStatus,
      };
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ? `${data.message} ${data.error}` : data.message || "Failed to create account.");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      let resolvedUser = data.user;
      if (data.token) {
        try {
          const meResponse = await fetch(
            `${API_BASE_URL}/api/users/me?email=${encodeURIComponent(form.email || "")}`,
            {
              headers: { Authorization: `Bearer ${data.token}` },
              cache: "no-store",
            }
          );
          if (meResponse.ok) {
            const meData = await meResponse.json();
            if (meData?.user) {
              resolvedUser = meData.user;
            }
          }
        } catch {
        }
      }
      if (resolvedUser) {
        localStorage.setItem("user", JSON.stringify(resolvedUser));
      }
      setFeedback(data.message || "Account created and signed in.");
      navigate("/home");
    } catch (error) {
      setIsError(true);
      setFeedback(error.message);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Create account</h1>
        <p className="auth-subtitle">Join HunterHugs and personalize your support journey.</p>
        <form className="auth-form" onSubmit={onSubmit}>
          <input
            className="auth-input"
            name="fullName"
            type="text"
            placeholder="Full name"
            value={form.fullName}
            onChange={onChange}
            required
          />
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
            minLength={6}
            required
          />
          <input
            className="auth-input"
            name="studentId"
            type="text"
            placeholder="Student ID"
            value={form.studentId}
            onChange={onChange}
            required
          />
          <input
            className="auth-input"
            name="estimatedIncome"
            type="number"
            min="0"
            step="1"
            placeholder="Estimated Income"
            value={form.estimatedIncome}
            onChange={onChange}
            required
          />
          <select
            className="auth-input"
            name="citizenshipStatus"
            value={form.citizenshipStatus}
            onChange={onChange}
          >
            <option value="">Citizenship Status (optional)</option>
            <option value="Citizen">Citizen</option>
            <option value="Permanent-Resident">Permanent Resident</option>
            <option value="International">International</option>
            <option value="Undocumented">Undocumented</option>
            <option value="Other">Other</option>
          </select>
          <input
            className="auth-input"
            name="address"
            type="text"
            placeholder="Address (optional)"
            value={form.address}
            onChange={onChange}
          />
          <input
            className="auth-input"
            name="campus"
            type="text"
            placeholder="Campus (optional)"
            value={form.campus}
            onChange={onChange}
          />
          <input
            className="auth-input"
            name="major"
            type="text"
            placeholder="Major"
            value={form.major}
            onChange={onChange}
            required
          />
          <select
            className="auth-input"
            name="enrollmentStatus"
            value={form.enrollmentStatus}
            onChange={onChange}
          >
            <option value="">Enrollment Status (optional)</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
          </select>
          <button type="submit" className="auth-btn">
            Create Account
          </button>
        </form>
        {feedback ? <p className={`auth-feedback ${isError ? "auth-error" : ""}`}>{feedback}</p> : null}
        {verificationLink ? <p className="auth-footer-link"><a href={verificationLink}>Verify your account here</a>.</p> : null}
        <p className="auth-footer-link">
          Already registered? <Link to="/signin">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default SignUp;
