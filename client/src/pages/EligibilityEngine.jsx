import React, { useMemo, useState } from "react";
import "./EligibilityEngine.css";
import { mockResources } from "../data/mockResources";
import resourceCatalog from "../data/resources.json";
import { API_BASE_URL } from "../config/api";

const profileQuestions = [
  {
    key: "enrollment",
    title: "Enrollment Status",
    options: ["Full-Time", "Part-Time", "Non-Degree"],
  },
  {
    key: "income",
    title: "Income Bracket",
    options: ["Under 25k/year", "25k-50k/year", "50k+ year"],
  },
  {
    key: "housing",
    title: "Housing Situation",
    options: ["Renting off campus", "Living at home", "Unstable/at Risk"],
  },
  {
    key: "citizenship",
    title: "Citizenship Status",
    options: ["US Citizen/Resident", "International Student", "DACA Undocumented"],
  },
];

function ruleMatches(ruleValues, userValue) {
  if (!ruleValues || ruleValues.length === 0) {
    return true;
  }

  return ruleValues.includes(userValue);
}

function formatCategoryLabel(category) {
  if (!category) {
    return "";
  }

  return category
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getMatchedReasons(resource, profile) {
  const rules = resource.eligibilityRules;
  const reasons = [];

  if (ruleMatches(rules.enrollment, profile.enrollment)) {
    reasons.push("Matches your enrollment status");
  }

  if (ruleMatches(rules.income, profile.income)) {
    reasons.push("Relevant to your income bracket");
  }

  if (ruleMatches(rules.housing, profile.housing)) {
    reasons.push("Relevant to your housing situation");
  }

  if (ruleMatches(rules.citizenship, profile.citizenship)) {
    reasons.push("Matches your citizenship status");
  }

  return reasons;
}

function getMatchScore(resource, profile) {
  const rules = resource.eligibilityRules;

  const checks = [
    ruleMatches(rules.enrollment, profile.enrollment),
    ruleMatches(rules.income, profile.income),
    ruleMatches(rules.housing, profile.housing),
    ruleMatches(rules.citizenship, profile.citizenship),
  ];

  const score = checks.filter(Boolean).length;

  return Math.round((score / checks.length) * 100);
}

const EligibilityEngine = () => {
  const [profile, setProfile] = useState({
    enrollment: "",
    income: "",
    housing: "",
    citizenship: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Fill out your profile and I’ll help you find resources that may fit your situation.",
    },
  ]);

  //const [resources, setResources] = useState([]);
  //useEffect(() => {
  //FUTURE MONGODB CONNECTION:
  //Uncomment this when the backend resources endpoint is ready
  /*
  async function fetchResources() {
    try {
      const response = await fetch("http://localhost:5000/api/resources");
      const data = await response.json();
      setResources(data.resources);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  }

  fetchResources();
  */
 //}, []);

  const isProfileComplete = Object.values(profile).every(Boolean);

  const matchedResources = useMemo(() => {
    if (!hasSearched) {
      return [];
    }

    return mockResources
      .map((resource) => ({
        ...resource,
        matchScore: getMatchScore(resource, profile),
        matchedReasons: getMatchedReasons(resource, profile),
      }))
      .filter((resource) => resource.matchScore >= 50)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [hasSearched, profile, /*resources*/]);

  const handleSelect = (key, value) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      [key]: value,
    }));
  };

  const handleFindResources = () => {
    if (!isProfileComplete) {
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "bot",
          text: "Please answer each profile question first so I can give you better matches.",
        },
      ]);
      return;
    }

    setHasSearched(true);

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        sender: "bot",
        text: "I found resources that may match your profile. You can ask me which one to start with, what each resource does, or what documents you may need.",
      },
    ]);
  };

  const handleSendMessage = () => {
    const question = chatInput.trim();

    if (!question || isSending) {
      return;
    }

    const topMatches = matchedResources.slice(0, 5).map((resource) => ({
      id: resource.id,
      name: resource.name,
      category: resource.category,
      location: resource.location,
      description: resource.description,
      eligibilitySummary: resource.eligibilitySummary,
      sourceUrl: resource.sourceUrl,
    }));

    setMessages((previousMessages) => [
      ...previousMessages,
      { sender: "user", text: question },
    ]);
    setChatInput("");
    setIsSending(true);

    async function sendChatMessage() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            profile,
            matchedResources: topMatches,
            resourceCatalog,
          }),
        });

        const data = await response.json();
        const botReply =
          data.reply ||
          "I could not generate a response just now. Try again in a moment.";

        setMessages((previousMessages) => [
          ...previousMessages,
          { sender: "bot", text: botReply },
        ]);
      } catch (error) {
        setMessages((previousMessages) => [
          ...previousMessages,
          {
            sender: "bot",
            text: "I could not reach the chat service. Check your server connection and try again.",
          },
        ]);
      } finally {
        setIsSending(false);
      }
    }

    sendChatMessage();
  };

  return (
    <div className="eligibility-page">
      <aside className="profile-sidebar">
        <h2>Your Profile</h2>
        <p className="sidebar-subtitle">
          Select the options that best describe your current situation.
        </p>

        {profileQuestions.map((question) => (
          <div className="profile-question" key={question.key}>
            <h3>{question.title}</h3>

            <div className="option-list">
              {question.options.map((option) => {
                const isSelected = profile[question.key] === option;

                return (
                  <button
                    type="button"
                    key={option}
                    className={`profile-option ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(question.key, option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button className="find-resources-btn" onClick={handleFindResources}>
          Find my resources
        </button>
      </aside>

      <main className="eligibility-main">
        <section className="results-panel">
          <div className="section-heading">
            <p className="eyebrow">HunterHugs Eligibility Engine</p>
            <h1>Recommended Resources</h1>
            <p>
              These matches are based on your profile. This mock version is ready
              to connect to MongoDB and Gemini later.
            </p>
          </div>

          {!hasSearched && (
            <div className="empty-state">
              <h2>No matches yet</h2>
              <p>
                Complete your profile on the left, then click Find my resources.
              </p>
            </div>
          )}

          {hasSearched && matchedResources.length === 0 && (
            <div className="empty-state">
              <h2>No strong matches found</h2>
              <p>
                Try changing your profile answers or browsing all resources.
              </p>
            </div>
          )}

          {hasSearched && matchedResources.length > 0 && (
            <div className="resource-grid">
              {matchedResources.map((resource) => (
                <article className="resource-card" key={resource.id}>
                  <div className="resource-card-header">
                    <span className="category-pill">{formatCategoryLabel(resource.category)}</span>
                    <span className="match-score">{resource.matchScore}% match</span>
                  </div>

                  <h2>{resource.name}</h2>
                  <p className="resource-location">{resource.location}</p>
                  <p className="resource-description">{resource.description}</p>

                  <div className="reason-list">
                    {resource.matchedReasons.slice(0, 3).map((reason) => (
                      <span key={reason}>{reason}</span>
                    ))}
                  </div>

                  <a href={resource.sourceUrl} target="_blank" rel="noreferrer">
                    View resource
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="chat-panel">
          <div className="chat-header">
            <h2>Hunter Navigator</h2>
            <p>Your personal resource assistant</p>
          </div>

          <div className="messages-container">
            {messages.map((message, index) => (
              <div
                key={`${message.sender}-${index}`}
                className={`message ${
                  message.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about your matched resources..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              disabled={isSending}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />

            <button className="send-button" onClick={handleSendMessage} disabled={isSending}>
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EligibilityEngine;
