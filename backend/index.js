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
  studyPlan: {
    subject: null,
    hoursPerWeek: null,
    topics: [],
    goals: null,
    schedule: null,
  },
  currentStep: null,
  awaitingResponse: false,
};

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
  studyPlan: ["plan", "schedule", "organize"],
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
    "review",
    "revision",
    "practice",
    "quiz",
    "mock test",
  ],
  timeManagement: ["time management", "deadline", "prioritize", "goal setting"],
  confirmation: ["yes", "yeah", "sure", "okay", "ok", "yep", "yup"],
  rejection: ["no", "nope", "nah", "not", "don't", "cant", "cannot"],
};

const studyPlanSteps = {
  SUBJECT: "SUBJECT",
  HOURS: "HOURS",
  TOPICS: "TOPICS",
  GOALS: "GOALS",
  SCHEDULE_PREFERENCE: "SCHEDULE_PREFERENCE",
  CONFIRM: "CONFIRM",
};

const responses = {
  greeting: [
    "Hello! I'm your study planning assistant. I can help with study plans, motivation, productivity, and exam prep. What would you like help with?",
    "Hi there! Whether you need a study plan, focus tips, or motivation, I'm here to help. What's on your mind?",
    "Welcome! I can assist with study planning, time management, and maintaining wellness while studying. What do you need today?",
  ],
  studyHelp: [
    "Here are some effective study techniques:\n1. Active recall through practice questions\n2. Spaced repetition\n3. Teaching concepts to others\nWould you like me to explain any of these in detail?",
    "Let's improve your study habits! Some key strategies:\n1. The Pomodoro Technique\n2. Mind mapping\n3. The Feynman Technique\nWhich one interests you most?",
    "To enhance your learning, consider:\n1. Creating summary sheets\n2. Using mnemonics\n3. Taking practice tests\nShall we discuss these methods in detail?",
  ],
  motivation: [
    "Remember: every study session brings you closer to your goals. What specific goal are you working toward?",
    "Let's break down your big goal into smaller, manageable tasks. Would you like help creating milestone targets?",
    "Success comes from consistent effort, not perfection. What small win can you celebrate today?",
  ],
  studyTechniques: [
    "Let me explain some effective study techniques:\n1. The Pomodoro Technique: Study for 25 minutes, then take a 5-minute break\n2. Active Recall: Test yourself instead of re-reading\n3. Spaced Repetition: Review material at increasing intervals\nWhich technique would you like to learn more about?",
    "Here are some proven study methods:\n1. Mind Mapping: Create visual connections between concepts\n2. The Feynman Technique: Explain concepts in simple terms\n3. Cornell Note-Taking: Organize notes systematically\nWould you like me to elaborate on any of these?",
  ],
  productivity: [
    "Here's a productivity boost:\n1. Set specific study goals\n2. Eliminate distractions\n3. Use time-blocking\nWould you like tips on implementing any of these?",
    "Let's optimize your study routine! Consider:\n1. Your peak energy hours\n2. Environment setup\n3. Task batching\nWhich aspect should we focus on?",
    "To maximize productivity, try:\n1. The 2-minute rule\n2. Focus sprints\n3. Energy management\nWould you like to learn more about these techniques?",
  ],
  wellness: [
    "Remember to take care of yourself! Try:\n1. 5-minute meditation breaks\n2. Simple stretching exercises\n3. Proper hydration\nWould you like specific wellness tips?",
    "Study success requires balance. Consider:\n1. Regular exercise breaks\n2. Healthy snacks\n3. Power naps\nShall we discuss maintaining wellness while studying?",
    "Your well-being matters! Important aspects:\n1. Sleep schedule\n2. Stress management\n3. Social connections\nWhich area would you like to focus on?",
  ],
  examPrep: [
    "Effective exam preparation includes:\n1. Practice tests\n2. Review schedules\n3. Memory techniques\nWould you like help with any of these?",
    "Let's ace that exam! Key strategies:\n1. Past paper practice\n2. Topic summaries\n3. Mock exams\nWhich would you like to explore?",
    "For exam success, focus on:\n1. Understanding concepts\n2. Time management\n3. Stress control\nShall we discuss these in detail?",
  ],
  timeManagement: [
    "Let's manage your time better! Consider:\n1. Priority matrices\n2. Time blocking\n3. The 80/20 rule\nWould you like to learn more about any of these?",
    "Effective time management includes:\n1. Setting deadlines\n2. Breaking tasks down\n3. Regular reviews\nWhich aspect interests you most?",
    "Master your schedule with:\n1. Weekly planning\n2. Daily reviews\n3. Buffer time\nShall we explore these techniques?",
  ],
  askSubject:
    "What subject would you like to focus on? (For example: Math, History, Programming)",
  askHours:
    "How many hours per week can you realistically dedicate to studying {subject}?",
  askTopics:
    "What specific topics in {subject} do you need to cover? List the main ones.",
  askGoals:
    "What are your learning goals for {subject}? What do you want to achieve?",
  askSchedulePreference:
    "When do you prefer to study? (Morning, Afternoon, Evening)",
  confirmPlan:
    "Great! Here's your personalized study plan for {subject}:\n{planSummary}\nYou're welcome",
  softFallback: [
    "I didn't quite catch that. Could you rephrase?",
    "I'm not sure I understood. Could you say that differently?",
    "Could you explain that another way?",
    "I want to help, but I need you to rephrase that. Could you try again?",
  ],
  hardFallback: [
    "Let's start fresh. Would you like to create a study plan, get motivation tips, or discuss study techniques?",
    "I seem to be having trouble understanding. Should we begin again? I can help with study planning, productivity, or exam preparation.",
    "Let's reset our conversation. What would you like help with: study planning, time management, or learning techniques?",
  ],
  followUp: [
    "Is there anything specific you'd like to know more about?",
    "Would you like more detailed information about any of these points?",
    "Should we explore any of these topics further?",
    "What aspect would you like me to elaborate on?",
  ],
  planComplete: [
    "Great! Let me share some study techniques that work well with your plan. We can focus on:\n1. Time management strategies\n2. Subject-specific study methods\n3. Maintaining motivation\nWhich would you like to explore?",
    "Perfect! To help you succeed with this plan, I can provide:\n1. Memory techniques for your subject\n2. Focus enhancement strategies\n3. Progress tracking methods\nWhat interests you most?",
  ],
};

function createPlanSummary(plan) {
  return `
📚 Study Plan Summary:
───────────────────\n
📋 Subject: ${plan.subject}\n
⏰ Weekly Hours: ${plan.hoursPerWeek}\n
📑 Topics: ${plan.topics.join(", ")}\n
🎯 Goals: ${plan.goals}\n
📅 Preferred Schedule: ${plan.schedule}\n

📋 Structured Breakdown:
───────────────────\n
1. Session Length: ${Math.round(plan.hoursPerWeek / 3)} hours per session\n
2. Topic Progression: ${plan.topics.join(" → ")}\n
3. Weekly Schedule: ${plan.schedule} sessions, ${Math.round(
    plan.hoursPerWeek / 3
  )} times per week

💡 Recommendations:
───────────────────\n
• Take a 5-minute break every 25 minutes\n
• Review previous topics before starting new ones\n
• Use active recall techniques during study sessions \n
• Keep track of your progress for each topic\n
`;
}

function processUserMessage(msg) {
  const message = msg.toLowerCase();
  conversationState.history.push({ role: "user", content: message });

  // Handle repeated misunderstandings
  if (conversationState.misunderstandCount >= 3) {
    conversationState.misunderstandCount = 0;
    conversationState.currentStep = null;
    conversationState.awaitingResponse = false;
    return getRandomResponse(responses.hardFallback);
  }

  // Detect intents
  let detectedIntent = null;
  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some((keyword) => message.includes(keyword))) {
      detectedIntent = intent;
      break;
    }
  }

  // Handle study plan flow
  if (conversationState.currentStep) {
    return handleStudyPlanStep(message, detectedIntent);
  }

  // Handle confirmation after plan completion
  if (
    detectedIntent === "confirmation" &&
    conversationState.history.length >= 2 &&
    conversationState.history[
      conversationState.history.length - 2
    ].content.includes("You're welcome")
  ) {
    return getRandomResponse(responses.studyTechniques);
  }

  // Handle other intents
  if (detectedIntent) {
    conversationState.misunderstandCount = 0;

    if (detectedIntent === "studyPlan") {
      conversationState.currentStep = studyPlanSteps.SUBJECT;
      return responses.askSubject;
    }

    const response = getRandomResponse(responses[detectedIntent]);
    return response
      ? response + "\n\n" + getRandomResponse(responses.followUp)
      : getRandomResponse(responses.softFallback);
  }

  // Handle fallback
  conversationState.misunderstandCount++;
  return getRandomResponse(responses.softFallback);
}

function handleStudyPlanStep(message, detectedIntent) {
  switch (conversationState.currentStep) {
    case studyPlanSteps.SUBJECT:
      conversationState.studyPlan.subject = message;
      conversationState.currentStep = studyPlanSteps.HOURS;
      return responses.askHours.replace("{subject}", message);

    case studyPlanSteps.HOURS:
      const hours = parseInt(message.match(/\d+/)?.[0]);
      if (!hours) {
        conversationState.misunderstandCount++;
        return "I need a number of hours. How many hours per week can you study?";
      }
      conversationState.studyPlan.hoursPerWeek = hours;
      conversationState.currentStep = studyPlanSteps.TOPICS;
      return responses.askTopics.replace(
        "{subject}",
        conversationState.studyPlan.subject
      );

    case studyPlanSteps.TOPICS:
      conversationState.studyPlan.topics = message
        .split(/[,.]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      conversationState.currentStep = studyPlanSteps.GOALS;
      return responses.askGoals.replace(
        "{subject}",
        conversationState.studyPlan.subject
      );

    case studyPlanSteps.GOALS:
      conversationState.studyPlan.goals = message;
      conversationState.currentStep = studyPlanSteps.SCHEDULE_PREFERENCE;
      return responses.askSchedulePreference;

    case studyPlanSteps.SCHEDULE_PREFERENCE:
      conversationState.studyPlan.schedule = message;
      conversationState.currentStep = studyPlanSteps.CONFIRM;
      return responses.confirmPlan
        .replace("{subject}", conversationState.studyPlan.subject)
        .replace(
          "{planSummary}",
          createPlanSummary(conversationState.studyPlan)
        );

    case studyPlanSteps.CONFIRM:
      if (detectedIntent === "confirmation") {
        conversationState.currentStep = null;
        return getRandomResponse(responses.planComplete);
      } else if (detectedIntent === "rejection") {
        conversationState.currentStep = studyPlanSteps.SUBJECT;
        return "Let's revise the plan. " + responses.askSubject;
      } else {
        conversationState.misunderstandCount++;
        return "Please confirm if you're happy with the plan (yes/no)?";
      }
  }
}

function getRandomResponse(responseArray) {
  if (
    !responseArray ||
    !Array.isArray(responseArray) ||
    responseArray.length === 0
  ) {
    return responses.softFallback[0]; // Default fallback response
  }
  return responseArray[Math.floor(Math.random() * responseArray.length)];
}

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

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
