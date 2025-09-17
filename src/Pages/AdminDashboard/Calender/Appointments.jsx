// CalendarScheduler.jsx
import React, { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";
import { gapi } from "gapi-script";

// ----------------------------
// ENV Variables
// ----------------------------
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES =
  "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar";

const BACKEND_AUTH_URL = "https://dbbackend.devnexussolutions.com/auth/google";

// ----------------------------
// Main Component
// ----------------------------
export default function CalendarScheduler() {
  const [events, setEvents] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    duration: "30",
    attendees: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ----------------------------
  // Init Google API Client
  // ----------------------------
  const initClient = useCallback(async () => {
    try {
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
        scope: SCOPES,
      });

      // Load stored token from backend login
      const token = localStorage.getItem("googleToken");
      if (token) {
        gapi.client.setToken({ access_token: token });
        setIsSignedIn(true);
      }
    } catch (err) {
      console.error("Error initializing gapi client:", err);
    }
  }, []);

  useEffect(() => {
    gapi.load("client", initClient);
  }, [initClient]);

  // ----------------------------
  // Fetch Events
  // ----------------------------
  const fetchEvents = useCallback(async () => {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      });

      const mapped = response.result.items.map((ev) => ({
        id: ev.id,
        title: ev.summary,
        start: ev.start.dateTime || ev.start.date,
        end: ev.end.dateTime || ev.end.date,
        extendedProps: {
          meetLink: ev.hangoutLink,
          attendees: ev.attendees || [],
        },
      }));

      setEvents(mapped);
    } catch (err) {
      toast.error("Failed to load events");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) fetchEvents();
  }, [isSignedIn, fetchEvents]);

  // ----------------------------
  // Handle Create Appointment
  // ----------------------------
  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setFormData({ title: "", duration: "30", attendees: "" });
    setIsCreateModalOpen(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    try {
      const attendeeEmails = formData.attendees
        .split(/[,;\s]+/)
        .filter((email) => email.trim() !== "")
        .map((email) => ({ email }));

      const startTime = new Date(selectedDate);
      const endTime = new Date(
        startTime.getTime() + formData.duration * 60000
      );

      const event = {
        summary: formData.title,
        start: { dateTime: startTime.toISOString(), timeZone: "Asia/Kolkata" },
        end: { dateTime: endTime.toISOString(), timeZone: "Asia/Kolkata" },
        attendees: attendeeEmails,
        conferenceData: {
          createRequest: {
            requestId: String(Date.now()),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      };

      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
      });

      const created = response.result;

      setEvents((prev) => [
        ...prev,
        {
          id: created.id,
          title: created.summary,
          start: created.start.dateTime,
          end: created.end.dateTime,
          extendedProps: {
            meetLink: created.hangoutLink,
            attendees: created.attendees || [],
          },
        },
      ]);

      toast.success("Meeting scheduled!");
      setIsCreateModalOpen(false);
    } catch (err) {
      toast.error("Failed to create event");
      console.error(err);
    }
  };

  // ----------------------------
  // Auth Handlers
  // ----------------------------
  const handleLogin = () => {
    window.location.href = BACKEND_AUTH_URL;
  };

  const handleLogout = () => {
    localStorage.removeItem("googleToken");
    setIsSignedIn(false);
    setEvents([]);
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold mb-4">
          Google Calendar Scheduler
        </h2>

        {!isSignedIn ? (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Sign in with Google
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Logout
          </button>
        )}
      </div>

      {/* Calendar */}
      {isSignedIn && (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          height="auto"
        />
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Modal
          title="New Google Meet Appointment"
          onClose={() => setIsCreateModalOpen(false)}
        >
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <InputField
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <InputField
              type="number"
              label="Duration (minutes)"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, duration: e.target.value }))
              }
            />
            <InputField
              label="Attendees (comma separated emails)"
              value={formData.attendees}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  attendees: e.target.value,
                }))
              }
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Schedule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ----------------------------
// Reusable Components
// ----------------------------
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded-md p-2"
      />
    </div>
  );
}
