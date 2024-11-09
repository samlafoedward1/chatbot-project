// frontend/src/App.js

import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Custom styles can be adjusted here

// Connect to the backend (adjust the port if your backend runs on a different one)
const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null); // Ref to scroll to the bottom of the chat

  // Listen for messages from the bot
  useEffect(() => {
    socket.on("botMessage", (botMessage) => {
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "bot", text: botMessage },
      ]);
    });

    return () => socket.off("botMessage");
  }, []);

  // Auto-scroll to the latest message whenever the chat history changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Handle sending a message
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

  return (
    <div className="App container mt-5">
      <h1 className="text-center mb-4">Study Buddy Chatbot</h1>
      <div className="chat-window card shadow-lg">
        <div
          className="chat-history card-body overflow-auto"
          style={{ height: "400px" }}
        >
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender} mb-2 p-2 rounded`}
              style={{
                backgroundColor: msg.sender === "bot" ? "#f1f1f1" : "#d1f1d1",
              }}
            >
              <span className="font-weight-bold">
                {msg.sender === "user" ? "You" : "Bot"}:
              </span>{" "}
              {msg.text}
            </div>
          ))}
          {/* Add an empty div to scroll into view */}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input card-footer d-flex align-items-center">
          <input
            type="text"
            className="form-control mr-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <button className="btn btn-primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
