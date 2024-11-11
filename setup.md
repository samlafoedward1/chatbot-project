# Setup Manual

This guide covers the steps to install, configure, and run the **Chatbot Project** offline. It includes instructions for setting up the local environment, installing dependencies, and testing the project.

---

## 1. Prerequisites

Before starting, ensure that you have the following software installed on your machine:

- **Node.js** (v14 or higher) and **npm** (Node Package Manager)

You can verify if these are installed by running:

```bash
node -v
npm -v
If they’re not installed, download and install Node.js and npm from https://nodejs.org/.


2. Project Structure
After unzipping the project folder, ensure it follows this structure:

chatbot-project/
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── study-planner.js
│   │   └── index.js
│   ├── package.json
│   ├── package-lock.json
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
├── README.md
├── usage.md
└── setup.md


3. Installing Dependencies
Since the node_modules folders are excluded, you will need to install dependencies separately for both the frontend and backend.

Step-by-Step Installation
Navigate to the backend directory:
bash
cd chatbot-project/backend
npm install

Navigate to the frontend directory:
bash
cd ../frontend
npm install


4. Running the Application Locally
Once all dependencies are installed, you can start the backend and frontend servers.

Step-by-Step Guide to Run the Project
Start the Backend Server

Open a terminal, navigate to the backend directory, and run:

bash
cd chatbot-project/backend
node index.js
This will start the server on http://localhost:3001 by default.


Start the Frontend Server
Open a new terminal, navigate to the frontend directory, and run:

bash
cd chatbot-project/frontend
npm start
This will open the frontend application in your default web browser at http://localhost:3000.



5. Testing the Application
Manual Testing Instructions
Chatbot Functionality:

Open the application in your browser at http://localhost:3000.
Interact with the chatbot by asking questions related to study planning, motivation, productivity, wellness, and time management.
Refer to the sample interactions in usage.md for a list of supported queries and responses.



Study Planner:
Use the “Study Plans” tab to manually create and view study sessions.
The chatbot can also generate a plan automatically based on your conversation prompts and can be viewed in the "Study Plans" tab.



```
