import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import "./App.css";
import { API_BASE_URL } from "./config/api";

function statusClassName(status) {
  if (status === "open") return "status-open";
  if (status === "closed") return "status-closed";
  return "status-unknown";
}

function App() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResources() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/resources`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        setResources(Array.isArray(data.resources) ? data.resources : []);
      } catch (err) {
        setError(err.message || "Failed to load resources");
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, []);
  return (
    <>
      <Navbar />
      <main className="app-main">
        <h1>Welcome, !</h1>
        {loading && <p>Loading resources...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && (
          <section className="resource-grid">
            {resources.map((resource) => (
              <article className="resource-card" key={resource._id || resource.name}>
                <h3>{resource.name}</h3>
                <p className="resource-description">
                  {resource.description || "No description available."}
                </p>
                <p><strong>Category:</strong> {resource.category}</p>
                <p><strong>Location:</strong> {resource.location || "N/A"}</p>
                <p><strong>Phone:</strong> {resource.contact?.phone || "N/A"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-pill ${statusClassName(resource.status)}`}>
                    {resource.status || "unknown"}
                  </span>
                </p>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

export default App;