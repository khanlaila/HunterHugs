import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Landing.css";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    async function verify() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Verification failed.");
        }
        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Verification failed.");
      }
    }

    verify();
  }, [searchParams]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Email verification</h1>
        <p className={`auth-feedback ${status === "error" ? "auth-error" : ""}`}>{message}</p>
        <p className="auth-footer-link">
          {status === "success" ? (
            <>
              Verification complete. <Link to="/signin">Sign in</Link>
            </>
          ) : (
            <>
              Need a new link? <Link to="/signup">Create account again</Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
}

export default VerifyEmail;
