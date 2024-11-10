import React, { useState, useEffect } from "react";

const StudyPlanner = ({ botStudyPlan }) => {
  const [studySessions, setStudySessions] = useState([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [activePlan, setActivePlan] = useState(null);

  // Handle bot study plan when received
  useEffect(() => {
    if (botStudyPlan) {
      setActivePlan(botStudyPlan);
      setSubject(botStudyPlan.subject || "");
    }
  }, [botStudyPlan]);

  // Handle input changes
  const handleSubjectChange = (e) => setSubject(e.target.value);
  const handleDateChange = (e) => setDate(e.target.value);
  const handleTimeChange = (e) => setTime(e.target.value);
  const handleNotesChange = (e) => setNotes(e.target.value);

  // Function to add a new study session
  const addStudySession = () => {
    if (subject && date && time) {
      const newSession = {
        subject,
        date,
        time,
        notes,
        isFromBotPlan: !!activePlan,
      };
      setStudySessions([...studySessions, newSession]);
      setDate("");
      setTime("");
      setNotes("");
    } else {
      alert("Please fill in all required fields");
    }
  };

  // Render study sessions
  const renderStudySessions = () => {
    return studySessions.map((session, index) => (
      <div
        key={index}
        className={`study-session ${
          session.isFromBotPlan ? "bot-session" : ""
        }`}
      >
        <h3>{session.subject}</h3>
        <p>Date: {session.date}</p>
        <p>Time: {session.time}</p>
        <p>Notes: {session.notes || "No additional notes"}</p>
        {session.isFromBotPlan && (
          <span className="text-sm text-blue-600">Based on bot study plan</span>
        )}
      </div>
    ));
  };

  // Render bot-generated study plan if available
  const renderBotPlan = () => {
    if (!activePlan) return null;

    return (
      <div className="study-session bot-session p-4 mb-4 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Bot-Generated Study Plan</h3>
        <p>
          <strong>Subject:</strong> {activePlan.subject}
        </p>
        <p>
          <strong>Weekly Hours:</strong> {activePlan.hoursPerWeek}
        </p>
        <p>
          <strong>Topics:</strong> {activePlan.topics?.join(", ")}
        </p>
        <p>
          <strong>Goals:</strong> {activePlan.goals}
        </p>
        <p>
          <strong>Preferred Schedule:</strong> {activePlan.schedule}
        </p>
        <div className="mt-3">
          <h4 className="font-medium mb-2">Recommended Session Breakdown:</h4>
          <p>
            {Math.round(activePlan.hoursPerWeek / 3)} hours per session, in the{" "}
            {activePlan.schedule}s
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="study-planner">
      <h2>Study Planner</h2>

      {/* Input fields to add a new study session */}
      <div className="study-planner-form">
        <label>
          Subject:
          <input
            type="text"
            value={subject}
            onChange={handleSubjectChange}
            placeholder="Enter subject"
          />
        </label>
        <label>
          Date:
          <input type="date" value={date} onChange={handleDateChange} />
        </label>
        <label>
          Time:
          <input type="time" value={time} onChange={handleTimeChange} />
        </label>
        <label>
          Notes:
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Enter any notes"
          />
        </label>

        <button onClick={addStudySession}>Add Study Session</button>
      </div>

      {/* Display the list of study sessions */}
      <div className="study-session-list">
        <h2>Upcoming Study Sessions</h2>
        {renderBotPlan()}
        {renderStudySessions()}
      </div>
    </div>
  );
};

export default StudyPlanner;
