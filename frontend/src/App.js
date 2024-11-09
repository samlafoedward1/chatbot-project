// frontend/src/App.js

import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css"; // Create a CSS file to style the chat

// Connect to the backend (adjust the port if your backend runs on a different one)
const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  // Listen for messages from the bot
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

  // Handle sending a message
  const sendMessage = () => {
    if (message.trim()) {
      // Add user message to chat history
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "user", text: message },
      ]);

      // Send message to the backend
      socket.emit("userMessage", message);

      // Clear the message input
      setMessage("");
    }
  };

  // Handle "Enter" key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="App">
      <h1>Study Buddy Chatbot</h1>
      <div className="chat-window">
        <div className="chat-history">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              <span>{msg.sender === "user" ? "You" : "Bot"}: </span>
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
  );
}

export default App;
