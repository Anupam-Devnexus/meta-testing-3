// Appointments.jsx
import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES =
  "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar";

const BACKEND_AUTH_URL = "https://dbbackend.devnexussolutions.com/auth/google";

const Appointments = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  // ======================
  // GOOGLE INIT
  // ======================
  const initGoogleClient = () => {
    console.log("[Init] Initializing Google API client...");
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
        scope: SCOPES,
      })
      .then(() => {
        console.log("[Init] Google API client initialized successfully");

        const authInstance = gapi.auth2.getAuthInstance();
        const isSignedIn = authInstance.isSignedIn.get();
        console.log("[Init] User signed in status:", isSignedIn);

        setSignedIn(isSignedIn);

        if (isSignedIn) {
          const googleUser = authInstance.currentUser.get();
          console.log("[Init] Found signed-in user:", googleUser);
          saveUserDetails(googleUser);
          fetchEvents();
        }
      })
      .catch((err) => {
        console.error("[Init] Failed to initialize Google API:", err);
        toast.error("Google client initialization failed");
      });
  };

  // ======================
  // SAVE USER
  // ======================
  const saveUserDetails = async (googleUser) => {
    console.log("[User] Saving user details...");
    const profile = googleUser.getBasicProfile();
    const authResponse = googleUser.getAuthResponse(true);

    const userDetails = {
      name: profile.getName(),
      email: profile.getEmail(),
      image: profile.getImageUrl(),
      token: authResponse.id_token,
    };

    console.log("[User] User profile:", userDetails);

    localStorage.setItem("userDetails", JSON.stringify(userDetails));
    setUser(userDetails);

    try {
      console.log("[User] Sending token to backend...");
      await axios.post(BACKEND_AUTH_URL, { token: authResponse.id_token });
      console.log("[User] Backend authentication successful");
    } catch (err) {
      console.error("[User] Backend authentication failed:", err);
      toast.error("Backend authentication failed");
    }
  };

  // ======================
  // LOGIN
  // ======================
  const handleLogin = async () => {
    console.log("[Auth] Attempting login...");
    const GoogleAuth = gapi.auth2.getAuthInstance();
    try {
      const user = await GoogleAuth.signIn();
      console.log("[Auth] Login successful:", user);
      saveUserDetails(user);
      setSignedIn(true);
      fetchEvents();
      toast.success("Logged in successfully");
    } catch (err) {
      console.error("[Auth] Login failed:", err);
      toast.error("Login failed");
    }
  };

  // ======================
  // CREATE MEETING
  // ======================
  const handleCreateMeeting = async (info) => {
    console.log("[Event] Attempting to create meeting on date:", info.dateStr);

    if (!signedIn) {
      toast.log("Please login first");
      console.log("[Event] User not signed in, meeting creation blocked");
      return;
    }

    setLoading(true);
    try {
      const event = {
        summary: "Devnexus Meeting",
        description: "Scheduled via Devnexus App",
        start: { dateTime: info.dateStr + "T10:00:00", timeZone: "Asia/Kolkata" },
        end: { dateTime: info.dateStr + "T11:00:00", timeZone: "Asia/Kolkata" },
        conferenceData: { createRequest: { requestId: "meet-" + Date.now() } },
      };

      console.log("[Event] Sending event to Google Calendar:", event);

      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
      });

      console.log("[Event] Meeting created successfully:", response);

      const link = response.result.hangoutLink || "No Meet link available";
      toast.success(`Meeting created! Link: ${link}`);

      fetchEvents();
    } catch (err) {
      console.error("[Event] Meeting creation failed:", err);
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // FETCH EVENTS
  // ======================
  const fetchEvents = async () => {
    console.log("[Fetch] Fetching events from Google Calendar...");
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      });

      console.log("[Fetch] Raw response:", response);

      const mappedEvents = response.result.items.map((event) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      console.log("[Fetch] Mapped events:", mappedEvents);
      setEvents(mappedEvents);
    } catch (err) {
      console.error("[Fetch] Failed to fetch events:", err);
      toast.error("Could not load calendar events");
    }
  };

  // ======================
  // USE EFFECT: INIT
  // ======================
  useEffect(() => {
    console.log("[App] Loading Google client...");
    gapi.load("client:auth2", initGoogleClient);

    // Restore session
    const saved = localStorage.getItem("userDetails");
    if (saved) {
      console.log("[App] Restoring user session from localStorage:", saved);
      setUser(JSON.parse(saved));
      setSignedIn(true);
    }
  }, []);

  // ======================
  // UI
  // ======================
  return (
    <div className="p-2 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>

        {!signedIn ? (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Login with Google
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <img
              src={user?.image}
              alt="profile"
              className="w-10 h-10 rounded-full border"
            />
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="relative">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleCreateMeeting}
          height="80vh"
        />

        {!signedIn && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded">
            <p className="text-lg font-semibold text-gray-600">
              Please login to schedule meetings
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-lg font-semibold rounded">
            Creating meeting...
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
