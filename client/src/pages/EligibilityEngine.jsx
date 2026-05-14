import React, { useState, useRef, useEffect } from "react";
import "./EligibilityEngine.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm HunterHugs AI. How can I help you today?", sender: "bot" }
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
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: "user"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText })
      });
      const data = await response.json();
      const botMessage = {
        id: messages.length + 2,
        text: data.reply,
        sender: "bot"
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting. Please try again!",
        sender: "bot"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };
  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h2>HunterHugs AI</h2>
        <p>Your personal resource assistant</p>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}
          >
            <p>{message.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bot-message message">
            <p>Typing...</p>
          </div>
        )}
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
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;