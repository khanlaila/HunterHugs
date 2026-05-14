import React, { useState, useEffect } from "react";
import "./Resources.css";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Resources");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

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
      {
        _id: "4",
        name: "Pell Grant Assistance",
        description: "Federal financial aid for eligible students",
        category: "financial aid",
        location: "Administration Building, Room 100",
        phone: "(123) 456-7893",
        eligibility: "Eligible",
      },
      {
        _id: "5",
        name: "Emergency Grant Program",
        description: "Emergency funds for students in crisis",
        category: "financial aid",
        location: "Financial Aid Office, Room 203",
        phone: "(123) 456-7894",
        eligibility: "Likely",
      },
      {
        _id: "6",
        name: "CUNY SNAP Benefits",
        description: "Food stamp assistance for qualifying students",
        category: "financial aid",
        location: "Student Services, Room 301",
        phone: "(123) 456-7895",
        eligibility: "Eligible",
      },
      {
        _id: "7",
        name: "Legal Aid Society",
        description: "Free legal advice and representation",
        category: "legal services",
        location: "West Building, Room 110",
        phone: "(123) 456-7896",
        eligibility: "Eligible",
      },
      {
        _id: "8",
        name: "Immigration Legal Help",
        description: "Legal support for international students",
        category: "legal services",
        location: "International Student Office",
        phone: "(123) 456-7897",
        eligibility: "Likely",
      },
      {
        _id: "9",
        name: "Student Health Center",
        description: "Primary healthcare services for students",
        category: "healthcare",
        location: "Health Building, Room 001",
        phone: "(123) 456-7898",
        eligibility: "Eligible",
      },
      {
        _id: "10",
        name: "Mental Health Clinic",
        description: "Psychiatric and therapy services",
        category: "mental health",
        location: "East Building, Room 405",
        phone: "(123) 456-7899",
        eligibility: "Eligible",
      },
      {
        _id: "11",
        name: "TAP Program",
        description: "Tuition assistance for New York State students",
        category: "financial aid",
        location: "Financial Aid Office",
        phone: "(123) 456-7800",
        eligibility: "Eligible",
      },
      {
        _id: "12",
        name: "CUNY Single Stop",
        description: "Connects students to public benefits and resources",
        category: "legal services",
        location: "Student Union, Room 102",
        phone: "(123) 456-7801",
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

  const filteredResources = resources
    .filter(resource =>
      selectedCategory === "All Resources" || resource.category === selectedCategory.toLowerCase()
    )
    .filter(resource =>
      resource.name.toLowerCase().includes(searchText.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchText.toLowerCase())
    );

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
            <input
              type="text"
              className="search-bar"
              placeholder="🔍 Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
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