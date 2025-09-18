import React, { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://dbbackend.devnexussolutions.com";

const Appointments = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get JWT token from localStorage (set after Google login redirect)
  const token = localStorage.getItem("crm_token");

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BACKEND_URL}/calendar/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents(res.data.events || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle create new event
  const createEvent = async () => {
    try {
      const newEvent = {
        summary: "CRM Test Meeting",
        description: "This is a test event created from CRM",
        start: {
          dateTime: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour later
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // 2 hours later
          timeZone: "Asia/Kolkata",
        },
      };

      const res = await axios.post(`${BACKEND_URL}/calendar/events`, newEvent, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Event created: " + res.data.htmlLink);
      fetchEvents(); // refresh list
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event");
    }
  };

  // Handle "Connect Google" button (starts OAuth)
  const handleGoogleConnect = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>

      {!token ? (
        <button
          onClick={handleGoogleConnect}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Connect Google Calendar
        </button>
      ) : (
        <>
          <button
            onClick={createEvent}
            className="px-4 py-2 bg-green-600 text-white rounded mb-4"
          >
            Create Test Event
          </button>

          {loading && <p>Loading events...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <ul className="space-y-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="p-3 border rounded shadow-sm hover:bg-gray-100"
              >
                <strong>{ev.summary}</strong> <br />
                {ev.start?.dateTime} → {ev.end?.dateTime}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Appointments;
