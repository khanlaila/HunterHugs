import React, { useState, useEffect } from "react";
import "./Resources.css";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Resources");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = () => {
    const mockData = [
      {
        _id: "1",
        name: "Hunter Food Pantry",
        description: "Free food for Hunter College students",
        category: "food",
        location: "Thomas Hunter Hall, Room 101",
        phone: "(123) 456-7890",
        eligibility: "Eligible",
      },
      {
        _id: "2",
        name: "Hunter House Assistance",
        description: "Housing support for students in need",
        category: "housing",
        location: "North Building, Room 203",
        phone: "(123) 456-7891",
        eligibility: "Eligible",
      },
      {
        _id: "3",
        name: "Counseling & Wellness",
        description: "Free mental health services",
        category: "mental health",
        location: "Brookdale Campus",
        phone: "(123) 456-7892",
        eligibility: "Likely",
      },
    ];
    setResources(mockData);
    setLoading(false);
  };

  const categories = [
    "All Resources",
    "Food",
    "Housing",
    "Mental Health",
    "Financial Aid",
    "Legal Services",
    "Healthcare",
  ];

  const filteredResources = selectedCategory === "All Resources"
    ? resources
    : resources.filter(resource => resource.category === selectedCategory.toLowerCase());

  return (
    <div className="resources-container">
      {loading ? (
        <p className="loading-text">Loading resources...</p>
      ) : (
        <div>
          <h1 className="welcome-text">Welcome, Student!</h1>
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={selectedCategory === category ? "category-btn active" : "category-btn"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="resources-grid">
            {filteredResources.map(resource => (
              <div key={resource._id} className="resource-card">
                <div className="card-header">
                  <h3>{resource.name}</h3>
                  <span className={`eligibility-badge ${resource.eligibility}`}>
                    {resource.eligibility}
                  </span>
                </div>
                <p>{resource.description}</p>
                <p className="card-location">📍 {resource.location}</p>
                <p className="card-phone">📞 {resource.phone}</p>
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