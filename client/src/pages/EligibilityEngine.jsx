import React, { useState, useRef, useEffect } from "react";
import "./EligibilityEngine.css";

const EligibilityEngine = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    enrollment: "",
    income: "",
    housing: "",
    citizenship: "",
  });
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! Based on your profile, I'll match you with resources you actually qualify for!", sender: "bot" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelect = (category, value) => {
    setProfile(prev => ({ ...prev, [category]: value }));
  };

  const handleFindResources = () => {
    if (!profile.enrollment || !profile.income || !profile.housing || !profile.citizenship) {
      alert("Please select an option for each category!");
      return;
    }
    setStep(2);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userMessage = { id: messages.length + 1, text: inputText, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText, profile })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { id: messages.length + 2, text: data.reply, sender: "bot" }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: messages.length + 2, text: "Sorry, I'm having trouble connecting. Please try again!", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (step === 1) {
    return (
      <div className="eligibility-container">
        <p className="step-label">Step 1 of 1</p>
        <h1 className="eligibility-title">Your Profile</h1>
        <p className="eligibility-subtitle">We'll match you with the resources you actually qualify for</p>
        <div className="quiz-cards">
          <div className="quiz-card">
            <h3>Enrollment Status</h3>
            {["Full-Time", "Part-Time", "Non-Degree"].map(option => (
              <label key={option} className="quiz-option">
                <input type="radio" name="enrollment" checked={profile.enrollment === option} onChange={() => handleSelect("enrollment", option)} />
                {option}
              </label>
            ))}
          </div>
          <div className="quiz-card">
            <h3>Income Bracket</h3>
            {["Under 25k/year", "25k-50k/year", "50k+ year"].map(option => (
              <label key={option} className="quiz-option">
                <input type="radio" name="income" checked={profile.income === option} onChange={() => handleSelect("income", option)} />
                {option}
              </label>
            ))}
          </div>
          <div className="quiz-card">
            <h3>Housing</h3>
            {["Renting off campus", "Living at home", "Unstable/at Risk"].map(option => (
              <label key={option} className="quiz-option">
                <input type="radio" name="housing" checked={profile.housing === option} onChange={() => handleSelect("housing", option)} />
                {option}
              </label>
            ))}
          </div>
          <div className="quiz-card">
            <h3>Citizenship</h3>
            {["US Citizen/Resident", "International Student", "DACA Undocumented"].map(option => (
              <label key={option} className="quiz-option">
                <input type="radio" name="citizenship" checked={profile.citizenship === option} onChange={() => handleSelect("citizenship", option)} />
                {option}
              </label>
            ))}
          </div>
        </div>
        <button className="find-resources-btn" onClick={handleFindResources}>
          Find my resources
        </button>
      </div>
    );
  }

  return (
    <div className="eligibility-layout">
      <div className="profile-sidebar">
        <h3>Your Profile</h3>
        <div className="profile-section">
          <h4>Enrollment Status</h4>
          <p>● {profile.enrollment}</p>
        </div>
        <div className="profile-section">
          <h4>Income Bracket</h4>
          <p>● {profile.income}</p>
        </div>
        <div className="profile-section">
          <h4>Housing Situation</h4>
          <p>● {profile.housing}</p>
        </div>
        <div className="profile-section">
          <h4>Citizenship Status</h4>
          <p>● {profile.citizenship}</p>
        </div>
      </div>
      <div className="chatbot-container">
        <div className="chat-header">
          <h2>HunterHugs AI</h2>
          <p>Your personal resource assistant</p>
        </div>
        <div className="messages-container">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}>
              <p>{message.text}</p>
            </div>
          ))}
          {isLoading && <div className="bot-message message"><p>Typing...</p></div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Message HunterHugs..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="send-button" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default EligibilityEngine;