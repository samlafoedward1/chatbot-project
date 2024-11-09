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
  studyPlanStep: 0, // Track steps in the study plan
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
  studyPlan: ["study plan", "schedule", "plan my studies"],
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
    "Have you tried summarizing your notes? It can really help with retention. Would you like more tips on effective study habits?",
    "Breaking down complex topics can make studying easier. Need some techniques on organizing your study sessions?",
    "Flashcards are great for memorizing key points. Would you like me to suggest a few more methods to memorize better?",
    "How’s your study environment? Sometimes, adjusting it can improve focus. Want to know more on this?",
    "Learning with a study buddy can be really effective. Do you want more tips on studying in groups?",
  ],
  motivation: [
    "Remember why you started! Visualize your goal and keep pushing forward. Would you like a few words of encouragement?",
    "Set small, achievable goals and reward yourself. Need help breaking down your study goals?",
    "Surround yourself with supportive people. Need tips on keeping a positive mindset?",
    "Stay positive, even when things get tough. How about some advice on staying resilient?",
    "Journaling can help track accomplishments. Do you want to hear more about reflection techniques?",
  ],
  productivity: [
    "Make a to-do list and prioritize tasks. Would you like advice on structuring your list?",
    "Set aside distraction-free blocks of time. Need some pointers on reducing distractions?",
    "Consistency is key! Want some more ideas on building productive habits?",
    "Try using a planner. Do you want to know how to organize your study sessions better?",
    "Break projects into small steps. Need help creating a manageable study schedule?",
  ],
  wellness: [
    "Don’t forget to take regular breaks! Would you like ideas on balancing study and self-care?",
    "Stay hydrated! It’s a small thing that makes a big difference. Want some tips on energizing study snacks?",
    "A quick meditation can reduce stress. Interested in relaxation techniques?",
    "Sleep is crucial for memory – do you get enough rest? Need tips on balancing sleep and study?",
    "A short walk can boost focus. Would you like advice on fitting in short exercises during study breaks?",
  ],
  examPrep: [
    "Practice with mock tests to simulate exam conditions. Need more tips on practicing for exams?",
    "Reviewing past exams helps get familiar with the format. Do you want advice on structuring your reviews?",
    "Create a revision plan and stick to it. Need help breaking down topics into a plan?",
    "Using color coding in notes can make a big difference. Want to know more about this technique?",
    "Explaining concepts out loud can reinforce knowledge. Want tips on how to teach yourself?",
  ],
  timeManagement: [
    "A planner can help map out your goals. Need suggestions for creating an effective schedule?",
    "Setting fixed times for study each day can help with discipline. Want tips on forming study habits?",
    "Avoid multitasking; it can be counterproductive. Need help structuring your tasks?",
    "Use the Eisenhower Matrix to prioritize tasks. Would you like to learn more about this method?",
    "Break your study time into blocks with short breaks. Do you want to hear more about the Pomodoro technique?",
  ],
  studyPlan: [
    "Let's create a study plan! What subject do you need to focus on?",
    "How many hours per week can you dedicate to studying this subject?",
    "What specific topics do you want to cover in this subject?",
  ],
  softFallback:
    "I'm sorry, I didn't quite understand that. Could you rephrase?",
  hardFallback:
    "It seems I'm struggling to understand. Let’s start over. What would you like help with?",
};

function processUserMessage(msg) {
  // Check for a hard fallback if misunderstandCount reaches 3
  if (conversationState.misunderstandCount >= 3) {
    conversationState.history = [];
    conversationState.misunderstandCount = 0;
    conversationState.lastIntent = null;
    conversationState.studyPlanStep = 0;
    return responses.hardFallback;
  }

  // Determine the user's intent
  let intentDetected = null;
  for (let intent in intents) {
    if (
      intents[intent].some((keyword) => msg.toLowerCase().includes(keyword))
    ) {
      intentDetected = intent;
      break;
    }
  }

  // Handle the study plan multi-step conversation
  if (
    intentDetected === "studyPlan" &&
    conversationState.lastIntent !== "studyPlan"
  ) {
    // Starting the study plan flow
    conversationState.lastIntent = "studyPlan";
    conversationState.studyPlanStep = 1; // Set the first step
    return responses.studyPlan[0];
  } else if (conversationState.lastIntent === "studyPlan") {
    // Continue study plan steps based on the current step
    const response = responses.studyPlan[conversationState.studyPlanStep];
    conversationState.studyPlanStep =
      (conversationState.studyPlanStep + 1) % responses.studyPlan.length;
    return response;
  }

  // Reset misunderstand count if intent is detected
  if (intentDetected) {
    conversationState.misunderstandCount = 0;
    conversationState.lastIntent = intentDetected;
    return responses[intentDetected][
      Math.floor(Math.random() * responses[intentDetected].length)
    ];
  } else {
    // Increment misunderstand count and return soft fallback if intent not detected
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
