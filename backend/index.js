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
  studyPlanStep: 0,
  awaitingYesNo: false, // Track if bot is waiting for Yes/No response
  awaitingContext: "", // Track the context for Yes/No (like "study plan")
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

// Process incoming messages
function processUserMessage(msg) {
  // If bot is awaiting Yes/No response, handle accordingly
  if (conversationState.awaitingYesNo) {
    if (msg.toLowerCase() === "yes") {
      conversationState.awaitingYesNo = false; // Reset awaiting state
      return continueStudyPlan();
    } else if (msg.toLowerCase() === "no") {
      conversationState.awaitingYesNo = false; // Reset awaiting state
      return "Alright, feel free to ask anytime if you change your mind!";
    } else {
      return responses.softFallback; // Handle invalid "yes" or "no" responses
    }
  }

  // Detect the user's intent based on the message
  let intentDetected = null;
  for (let intent in intents) {
    if (
      intents[intent].some((keyword) => msg.toLowerCase().includes(keyword))
    ) {
      intentDetected = intent;
      break;
    }
  }

  // Handle study plan flow
  if (
    intentDetected === "studyPlan" &&
    conversationState.lastIntent !== "studyPlan"
  ) {
    conversationState.lastIntent = "studyPlan";
    conversationState.studyPlanStep = 1; // Set the first step
    return responses.studyPlan[0];
  } else if (conversationState.lastIntent === "studyPlan") {
    return continueStudyPlan();
  }

  // If intent is detected, provide appropriate response
  if (intentDetected) {
    conversationState.misunderstandCount = 0;
    conversationState.lastIntent = intentDetected;
    conversationState.history.push({
      sender: "bot",
      text: responses[intentDetected][
        Math.floor(Math.random() * responses[intentDetected].length)
      ],
    });
    return conversationState.history[conversationState.history.length - 1].text;
  } else {
    // Increase misunderstand count if no intent is detected
    conversationState.misunderstandCount += 1;
    return responses.softFallback;
  }
}

// Continue study plan flow
function continueStudyPlan() {
  const response = responses.studyPlan[conversationState.studyPlanStep];
  conversationState.studyPlanStep += 1;

  // Check if there are more steps or ask for confirmation
  if (conversationState.studyPlanStep >= responses.studyPlan.length) {
    conversationState.awaitingYesNo = true; // Wait for Yes/No response
    return "Would you like to proceed with the study plan? (Yes/No)";
  }

  return response;
}

// Handle socket connections
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("userMessage", (msg) => {
    const botMessage = processUserMessage(msg);
    socket.emit("botMessage", botMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
server.listen(3001, () => {
  console.log("Server running on port 3001");
});
