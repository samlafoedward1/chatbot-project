import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { Button } from "react-bootstrap";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Socket connection
const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle incoming bot messages
  useEffect(() => {
    socket.on("botMessage", (botMessage) => {
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "bot", text: botMessage },
      ]);
    });

    // Clean up the effect
    return () => socket.off("botMessage");
  }, []);

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

  return (
    <div className={`app ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="navbar">
        <Button onClick={toggleDarkMode} className="dark-mode-btn">
          {isDarkMode ? <FaSun /> : <FaMoon />} Toggle Dark Mode
        </Button>
        <Button variant="link" className="study-plans-btn">
          Study Plans
        </Button>
      </div>

      <div className="chat-container">
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
                {msg.text}
              </div>
            ))}
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
      </div>
    </div>
  );
}

export default App;
