// Appointments.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar";
const BACKEND_AUTH_URL = "https://dbbackend.devnexussolutions.com/auth/google";

const Appointments = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const tokenClientRef = useRef(null);
  const refreshTimerRef = useRef(null);

  // ======================
  // Initialize GIS
  // ======================
  useEffect(() => {
    console.log("[Init] Waiting for Google Identity Services script...");
    const waitForGoogle = setInterval(() => {
      if (window.google) {
        clearInterval(waitForGoogle);
        console.log("[Init] Google script loaded, initializing token client...");
        initTokenClient();
      }
    }, 100);
  }, []);

  const initTokenClient = () => {
    console.log("[Init] Initializing token client...");
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          console.error("[Auth] Token error:", tokenResponse);
          toast.error("Authentication failed");
          return;
        }
        console.log("[Auth] Access token received:", tokenResponse.access_token);
        setAccessToken(tokenResponse.access_token);
        localStorage.setItem("access_token", tokenResponse.access_token);
        setSignedIn(true);

        await fetchProfile(tokenResponse.access_token);
        await fetchEvents(tokenResponse.access_token);

        // Start auto-refresh timer
        startTokenAutoRefresh(tokenResponse.expires_in);
      },
    });

    // Restore session
    const savedToken = localStorage.getItem("access_token");
    if (savedToken) {
      console.log("[Init] Restoring session from saved token");
      setAccessToken(savedToken);
      setSignedIn(true);
      fetchProfile(savedToken);
      fetchEvents(savedToken);
      startTokenAutoRefresh(3600); // assume 1 hour
    }
  };

  // ======================
  // Auto-refresh token
  // ======================
  const startTokenAutoRefresh = (expiresIn) => {
    console.log("[Token] Starting auto-refresh timer, expires in:", expiresIn, "seconds");
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    // refresh 1 minute before expiration
    refreshTimerRef.current = setTimeout(async () => {
      console.log("[Token] Auto-refreshing token...");
      if (tokenClientRef.current) {
        tokenClientRef.current.requestAccessToken({ prompt: "" });
      }
    }, (expiresIn - 60) * 1000);
  };

  // ======================
  // Login handler
  // ======================
  const handleLogin = () => {
    console.log("[Auth] Login button clicked");
    if (!tokenClientRef.current) {
      toast.error("Google client not ready");
      console.warn("[Auth] Token client not initialized yet");
      return;
    }
    tokenClientRef.current.requestAccessToken();
  };

  // ======================
  // Fetch user profile
  // ======================
  const fetchProfile = async (token) => {
    console.log("[User] Fetching profile...");
    try {
      const resp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await resp.json();
      console.log("[User] Profile fetched:", profile);
      setUser(profile);
      localStorage.setItem("userDetails", JSON.stringify(profile));

      // Send token to backend
      try {
        console.log("[User] Sending token to backend...");
        await axios.post(BACKEND_AUTH_URL, { token });
        console.log("[User] Backend authentication successful");
      } catch (err) {
        console.error("[User] Backend authentication failed:", err);
        toast.error("Backend authentication failed");
      }
    } catch (err) {
      console.error("[User] Failed to fetch profile:", err);
      toast.error("Failed to fetch user profile");
    }
  };

  // ======================
  // Fetch calendar events
  // ======================
  const fetchEvents = async (token) => {
    console.log("[Events] Fetching events...");
    try {
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=" + new Date().toISOString(),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      console.log("[Events] Raw data:", data);

      const mappedEvents = data.items.map((ev) => ({
        id: ev.id,
        title: ev.summary,
        start: ev.start.dateTime || ev.start.date,
        end: ev.end.dateTime || ev.end.date,
      }));
      console.log("[Events] Mapped events:", mappedEvents);
      setEvents(mappedEvents);
    } catch (err) {
      console.error("[Events] Failed to fetch events:", err);
      toast.error("Failed to fetch calendar events");
    }
  };

  // ======================
  // Create meeting
  // ======================
  const handleCreateMeeting = async (info) => {
    console.log("[Event] Date clicked:", info.dateStr);

    if (!signedIn || !accessToken) {
      console.warn("[Event] Cannot create meeting, user not signed in");
      toast.warn("Please login first");
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
      console.log("[Event] Creating meeting with data:", event);

      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(event),
        }
      );

      const createdEvent = await res.json();
      console.log("[Event] Created successfully:", createdEvent);
      toast.success(`Meeting created! Link: ${createdEvent.hangoutLink || "No Meet link"}`);

      fetchEvents(accessToken);
    } catch (err) {
      console.error("[Event] Failed to create meeting:", err);
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

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
            <img src={user?.picture} alt="profile" className="w-10 h-10 rounded-full border" />
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
