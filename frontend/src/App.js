import React, { useState, useEffect, useRef } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { Button } from "react-bootstrap";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import StudyPlanner from "./study-planner";

// Socket connection
const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showStudyPlanner, setShowStudyPlanner] = useState(false);
  const [botStudyPlan, setBotStudyPlan] = useState(null);
  const chatEndRef = useRef(null);

  // Handle incoming bot messages
  useEffect(() => {
    socket.on("botMessage", (botMessage) => {
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "bot", text: botMessage },
      ]);

      // Check if the message contains a study plan
      if (
        typeof botMessage === "string" &&
        botMessage.includes("📚 Study Plan Summary")
      ) {
        const planData = parseBotStudyPlan(botMessage);
        setBotStudyPlan(planData);
        // Optionally auto-switch to planner view when plan is received
        // setShowStudyPlanner(true);
      }
    });

    return () => socket.off("botMessage");
  }, []);

  // Parse bot study plan from message
  const parseBotStudyPlan = (message) => {
    const lines = message.split("\n");
    return {
      subject: lines
        .find((l) => l.includes("Subject:"))
        ?.split(":")[1]
        ?.trim(),
      hoursPerWeek: parseInt(
        lines
          .find((l) => l.includes("Weekly Hours:"))
          ?.split(":")[1]
          ?.trim()
      ),
      topics: lines
        .find((l) => l.includes("Topics:"))
        ?.split(":")[1]
        ?.trim()
        .split(",")
        .map((t) => t.trim()),
      goals: lines
        .find((l) => l.includes("Goals:"))
        ?.split(":")[1]
        ?.trim(),
      schedule: lines
        .find((l) => l.includes("Preferred Schedule:"))
        ?.split(":")[1]
        ?.trim(),
    };
  };

  // Scroll to latest message
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

  // Handle Enter key press
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
        <Button onClick={toggleStudyPlanner} className="topbar-btn">
          {showStudyPlanner ? "Chat Bot" : "Study Plans"}
        </Button>
      </div>

      <div className="chat-container">
        {!showStudyPlanner ? (
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
        ) : (
          <div className="study-planner-container">
            <StudyPlanner botStudyPlan={botStudyPlan} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
