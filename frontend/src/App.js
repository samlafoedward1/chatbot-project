import React, { useState, useEffect, useRef } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { Button } from "react-bootstrap";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import StudyPlanner from "./study-planner"; // Import the StudyPlanner component

// Socket connection
const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showStudyPlanner, setShowStudyPlanner] = useState(false); // New state to toggle study planner
  const chatEndRef = useRef(null);

  // Handle incoming bot messages
  useEffect(() => {
    socket.on("botMessage", (botMessage) => {
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "bot", text: botMessage },
      ]);
    });

    return () => socket.off("botMessage");
  }, []);

  // Scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Send message to bot
  const sendMessage = () => {
    if (message.trim()) {
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "user", text: message },
      ]);
      socket.emit("userMessage", message);
      setMessage("");
    }
  };

  // Handle "Enter" key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Toggle study planner visibility
  const toggleStudyPlanner = () => {
    setShowStudyPlanner(!showStudyPlanner);
  };

  return (
    <div className={`app ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="topbar">
        <Button onClick={toggleDarkMode} className="topbar-btn">
          {isDarkMode ? <FaSun /> : <FaMoon />} Toggle Dark Mode
        </Button>
        {/* Change button text based on study planner state */}
        <Button onClick={toggleStudyPlanner} className="topbar-btn">
          {showStudyPlanner ? "Bot" : "Study Plans"}
        </Button>
      </div>

      <div className="chat-container">
        {/* Conditionally render chat or study planner */}
        {!showStudyPlanner && (
          <div className="chat-window">
            <h1>Study Buddy Chatbot</h1>
            <div className="chat-history">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    msg.sender === "user" ? "user" : "bot"
                  }`}
                >
                  <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong>{" "}
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}

        {/* Conditionally render the Study Planner */}
        {showStudyPlanner && (
          <div className="study-planner-container">
            <StudyPlanner />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
