const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let conversationState = {
  lastIntent: null,
  history: [],
  misunderstandCount: 0,
};

// Define possible intents and related keywords
const intents = {
  greeting: [
    "hello",
    "hi",
    "hey",
    "greetings",
    "what's up",
    "good morning",
    "good afternoon",
    "good evening",
  ],
  studyHelp: [
    "study",
    "focus",
    "learn",
    "concentrate",
    "exam",
    "revision",
    "memorize",
    "recall",
    "notes",
  ],
  motivation: [
    "motivate",
    "motivation",
    "inspire",
    "encourage",
    "give up",
    "tired",
    "goal",
    "achieve",
    "positive",
  ],
  productivity: [
    "productivity",
    "time",
    "efficient",
    "manage",
    "plan",
    "schedule",
    "procrastinate",
    "organize",
  ],
  wellness: [
    "self-care",
    "break",
    "stress",
    "relax",
    "mental health",
    "well-being",
    "rest",
    "energy",
  ],
  examPrep: [
    "exam",
    "test",
    "prepare",
    "study plan",
    "review",
    "revision",
    "practice",
    "quiz",
    "mock test",
  ],
  timeManagement: [
    "time management",
    "schedule",
    "deadline",
    "plan",
    "prioritize",
    "organize",
    "goal setting",
  ],
};

// Expanded responses for each intent
const responses = {
  greeting: [
    "Hello! How can I help you with your studies today?",
    "Hi there! Ready to get some work done?",
    "Hey! What study goals can I help you achieve today?",
    "Hello! Need motivation, study tips, or anything else?",
    "Hi! I’m here to support you in reaching your study goals.",
  ],
  studyHelp: [
    "Try summarizing your notes and reviewing them at regular intervals. It helps with retention.",
    "Break down complex topics into smaller parts. Master each part before moving to the next.",
    "Use flashcards to memorize key points, and quiz yourself regularly.",
    "Find a study buddy! Explaining concepts to others is a great way to reinforce your own understanding.",
    "Switch study locations to keep your mind engaged – but avoid noisy places if they’re distracting.",
  ],
  motivation: [
    "Remember why you started! Visualize your goal and keep pushing forward.",
    "Set small, achievable goals to maintain motivation. Reward yourself for completing each one.",
    "Surround yourself with supportive people who encourage your growth.",
    "Stay positive, even when things get tough. Progress is progress, no matter how small.",
    "Keep a journal to track your accomplishments – it’ll remind you of how far you’ve come.",
  ],
  productivity: [
    "Make a to-do list and prioritize your tasks. Focus on the most important ones first.",
    "Try the 2-Minute Rule: if a task takes less than 2 minutes, do it immediately.",
    "Set up a study schedule and follow it strictly. Consistency is key!",
    "Limit distractions – turn off notifications and create a dedicated study space.",
    "Break big projects into smaller steps and tackle them one by one to avoid feeling overwhelmed.",
  ],
  wellness: [
    "Don’t forget to take regular breaks! Short breaks every hour can keep your mind fresh.",
    "Stay hydrated and eat nutritious snacks to fuel your brain during study sessions.",
    "Consider doing a short meditation or breathing exercise to reduce stress.",
    "Sleep is crucial for memory – aim for at least 7-8 hours to keep your mind sharp.",
    "A bit of exercise, like a quick walk, can help you stay focused and energized.",
  ],
  examPrep: [
    "Practice with mock tests to simulate exam conditions. It’ll help you manage time better.",
    "Review past exams if available to get an idea of the format and typical questions.",
    "Make a revision plan that covers all topics and stick to it. Consistency is key!",
    "Use different colors and highlighters in your notes to organize information visually.",
    "Explain concepts aloud to yourself or a friend. Teaching is a powerful learning tool.",
  ],
  timeManagement: [
    "Use a planner to map out your deadlines and goals for each week or month.",
    "Set aside a fixed time each day for studying, and stick to it as much as possible.",
    "Avoid multitasking; focus on one task at a time to improve efficiency.",
    "Prioritize tasks based on urgency and importance. Use a system like the Eisenhower Matrix.",
    "Break your study time into blocks, with short breaks in between to stay productive.",
  ],
  softFallback:
    "I'm sorry, I didn't quite understand that. Could you rephrase?",
  hardFallback:
    "It seems I'm struggling to understand. Let’s start over. What would you like help with?",
};

function processUserMessage(msg) {
  // Reset if hard fallback previously triggered
  if (conversationState.misunderstandCount >= 3) {
    conversationState.history = [];
    conversationState.misunderstandCount = 0;
    conversationState.lastIntent = null;
    return responses.hardFallback;
  }

  // Detect intent
  let intentDetected = null;
  for (let intent in intents) {
    if (
      intents[intent].some((keyword) => msg.toLowerCase().includes(keyword))
    ) {
      intentDetected = intent;
      break;
    }
  }

  // Generate response based on intent
  if (intentDetected) {
    conversationState.misunderstandCount = 0; // Reset misunderstand count
    conversationState.lastIntent = intentDetected;
    const responseList = responses[intentDetected];
    const response =
      responseList[Math.floor(Math.random() * responseList.length)];
    conversationState.history.push({ user: msg, bot: response });
    return response;
  } else {
    // No intent found, trigger soft fallback
    conversationState.misunderstandCount += 1;
    return responses.softFallback;
  }
}

// Handle socket connections and message exchanges
io.on("connection", (socket) => {
  console.log("User connected");

  // Handle incoming user messages
  socket.on("userMessage", (msg) => {
    const botResponse = processUserMessage(msg);
    socket.emit("botMessage", botResponse);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
