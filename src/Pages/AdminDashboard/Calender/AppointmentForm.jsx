import React, { useState } from "react";

const AppointmentForm = ({ addAppointment }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30"); // default 30 mins
  const [description, setDescription] = useState("");
  const [emails, setEmails] = useState(""); // New field for multiple emails
  const [meetLink, setMeetLink] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!title || !date || !time) {
      setError("Please fill all mandatory fields.");
      return;
    }

    // Optional: validate email format
    const emailList = emails
      .split(/[,;\s]+/)
      .filter((email) => email.trim() !== "");
    const invalidEmails = emailList.filter(
      (email) => !/^\S+@\S+\.\S+$/.test(email)
    );
    if (invalidEmails.length > 0) {
      setError(`Invalid email(s): ${invalidEmails.join(", ")}`);
      return;
    }

    setError("");

    // Generate Meet link
    const generatedLink = `https://meet.google.com/${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    const newAppointment = {
      title,
      date,
      time,
      duration,
      description,
      emails: emailList,
      meetLink: generatedLink,
    };

    addAppointment(newAppointment);

    // Reset form
    setMeetLink(generatedLink);
    setTitle("");
    setDate("");
    setTime("");
    setDuration("30");
    setDescription("");
    setEmails("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 w-full max-w-6xl mx-auto flex flex-col gap-4"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Book Appointment
      </h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        placeholder="Appointment Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <input
        type="number"
        min="5"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* New Field: Multiple Email Input */}
      <input
        type="text"
        placeholder="Invite Emails (comma, semicolon, or space separated)"
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
      >
        Book Appointment
      </button>

      {meetLink && (
        <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-md">
          <p className="text-green-700">
            Appointment booked! Meet link:{" "}
            <a
              href={meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {meetLink}
            </a>
          </p>
          {emails && (
            <p className="text-green-700 mt-1">
              Link will be sent to: {emails.split(/[,;\s]+/).join(", ")}
            </p>
          )}
        </div>
      )}
    </form>
  );
};

export default AppointmentForm;
