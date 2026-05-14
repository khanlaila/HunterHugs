import React, { useEffect, useState } from "react";
import "./Resources.css";
import { API_BASE_URL } from "../config/api";

const categories = [
  { label: "All Resources", value: "all" },
  { label: "Food", value: "food" },
  { label: "Housing", value: "housing" },
  { label: "Mental Health", value: "mental-health" },
  { label: "Financial Aid", value: "financial-aid" },
  { label: "Legal Services", value: "legal-services" },
  { label: "Healthcare", value: "healthcare" },
];

const SearchIcon = () => (
  <svg
    className="resource-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LocationIcon = () => (
  <svg
    className="resource-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 21s7-5.77 7-11a7 7 0 1 0-14 0c0 5.23 7 11 7 11Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    className="resource-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.62a2 2 0 0 1-.45 2.11L9.1 10.58a16 16 0 0 0 4.32 4.32l1.13-1.13a2 2 0 0 1 2.11-.45c.85.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Resources");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/api/resources`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setResources(Array.isArray(data.resources) ? data.resources : []);
      } catch (err) {
        setError(err.message || "Failed to load resources");
        setResources([]);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  const selectedCategoryValue =
    categories.find((item) => item.label === selectedCategory)?.value || "all";

  const filteredResources = resources
    .filter(
      (resource) =>
        selectedCategoryValue === "all" || resource.category === selectedCategoryValue
    )
    .filter(
      (resource) =>
        resource.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (resource.description || "").toLowerCase().includes(searchText.toLowerCase())
    );

  return (
    <div className="resources-container">
      {loading ? (
        <p className="loading-text">Loading resources...</p>
      ) : (
        <div>
          <h1 className="welcome-text">Welcome, Student!</h1>
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category.value}
                className={selectedCategory === category.label ? "category-btn active" : "category-btn"}
                onClick={() => setSelectedCategory(category.label)}
              >
                {category.label}
              </button>
            ))}
            <div className="search-wrap">
              <SearchIcon />
              <input
                type="text"
                className="search-bar"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="resources-grid">
            {filteredResources.map((resource) => (
              <div key={resource._id || resource.name} className="resource-card">
                <div className="card-header">
                  <h3>{resource.name}</h3>
                  <span className={`status-badge ${(resource.status || "unknown").toLowerCase()}`}>
                    {(resource.status || "unknown").toUpperCase()}
                  </span>
                </div>
                <p>{resource.description || "No description available."}</p>
                <p className="card-location">
                  <span className="icon-text">
                    <LocationIcon />
                    <span>{resource.location || "N/A"}</span>
                  </span>
                </p>
                <p className="card-phone">
                  <span className="icon-text">
                    <PhoneIcon />
                    <span>{resource.contact?.phone || "N/A"}</span>
                  </span>
                </p>
                <button className="view-details-btn">View Details</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;