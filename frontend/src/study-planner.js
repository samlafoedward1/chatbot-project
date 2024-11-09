import React, { useState } from "react";

function StudyPlanner() {
  const [studySessions, setStudySessions] = useState([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  // Handle input changes for subject, date, time, and notes
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
      };
      setStudySessions([...studySessions, newSession]);
      setSubject("");
      setDate("");
      setTime("");
      setNotes("");
    } else {
      alert("Please fill in all fields");
    }
  };

  // Function to render the study sessions
  const renderStudySessions = () => {
    return studySessions.map((session, index) => (
      <div key={index} className="study-session">
        <h3>{session.subject}</h3>
        <p>Date: {session.date}</p>
        <p>Time: {session.time}</p>
        <p>Notes: {session.notes || "No additional notes"}</p>
      </div>
    ));
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
        <h3>Upcoming Study Sessions</h3>
        {renderStudySessions()}
      </div>
    </div>
  );
}

export default StudyPlanner;
