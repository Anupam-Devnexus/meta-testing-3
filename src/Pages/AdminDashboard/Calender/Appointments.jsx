// Appointments.jsx
import React, { useEffect, useState, useRef } from "react";
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
  const [user, setUser] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const gapiLoaded = useRef(false);
  const tokenClient = useRef(null);

  // -------------------------
  // Load gapi script
  // -------------------------
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      console.log("[Init] gapi loaded");
      gapi.load("client", initGapiClient);
    };
    document.body.appendChild(script);
  }, []);

  // -------------------------
  // Initialize Google API client
  // -------------------------
  const initGapiClient = async () => {
    try {
      console.log("[Init] Initializing gapi client...");
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
      });
      console.log("[Init] gapi client initialized");
      gapiLoaded.current = true;
      initTokenClient();
    } catch (err) {
      console.error("[Init] Failed to init gapi client:", err);
      toast.error("Google client initialization failed");
    }
  };

  // -------------------------
  // Initialize Token Client (GIS)
  // -------------------------
  const initTokenClient = () => {
    tokenClient.current = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: handleTokenResponse,
    });
    console.log("[Init] Token client ready");
  };

  // -------------------------
  // Handle token response
  // -------------------------
  const handleTokenResponse = async (tokenResponse) => {
    console.log("[Auth] Token response:", tokenResponse);
    if (tokenResponse.access_token) {
      localStorage.setItem("accessToken", tokenResponse.access_token);
      setSignedIn(true);
      await fetchUserProfile(tokenResponse.access_token);
      fetchEvents(tokenResponse.access_token);
    }
  };

  // -------------------------
  // Fetch user profile (from People API)
  // -------------------------
  const fetchUserProfile = async (accessToken) => {
    try {
      const res = await gapi.client.request({
        path: "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profile = res.result;
      console.log("[User] Profile fetched:", profile);

      const userDetails = {
        name: profile.names?.[0]?.displayName || "User",
        email: profile.emailAddresses?.[0]?.value || "",
        image: profile.photos?.[0]?.url || "",
        token: accessToken,
      };

      setUser(userDetails);
      localStorage.setItem("userDetails", JSON.stringify(userDetails));

      // Optional: send token to backend
      try {
        await axios.post(BACKEND_AUTH_URL, { token: accessToken });
        console.log("[User] Backend auth successful");
      } catch (err) {
        console.error("[User] Backend auth failed:", err);
      }
    } catch (err) {
      console.error("[User] Failed to fetch profile:", err);
      toast.error("Failed to fetch user profile");
    }
  };

  // -------------------------
  // Login
  // -------------------------
  const handleLogin = () => {
    if (!tokenClient.current) return toast.error("Token client not initialized");
    console.log("[Auth] Requesting access token...");
    tokenClient.current.requestAccessToken({ prompt: "" });
  };

  // -------------------------
  // Fetch events
  // -------------------------
  const fetchEvents = async (accessToken = localStorage.getItem("accessToken")) => {
    if (!accessToken) return console.log("[Fetch] No access token, skipping events fetch");
    console.log("[Fetch] Fetching events...");

    try {
      gapi.client.setToken({ access_token: accessToken });
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      });

      console.log("[Fetch] Raw events response:", response);

      const mappedEvents = response.result.items.map((event) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error("[Fetch] Failed to fetch events:", err);
      toast.error("Could not load calendar events");
    }
  };

  // -------------------------
  // Create event
  // -------------------------
  const handleCreateMeeting = async (info) => {
    if (!signedIn) return toast.warning("Please login first");
    setLoading(true);

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return toast.warning("Please login first");

    const event = {
      summary: "Devnexus Meeting",
      description: "Scheduled via Devnexus App",
      start: { dateTime: info.dateStr + "T10:00:00", timeZone: "Asia/Kolkata" },
      end: { dateTime: info.dateStr + "T11:00:00", timeZone: "Asia/Kolkata" },
    };

    try {
      gapi.client.setToken({ access_token: accessToken });
      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });

      console.log("[Event] Created:", response);
      toast.success("Meeting created!");
      fetchEvents();
    } catch (err) {
      console.error("[Event] Creation failed:", err);
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Restore session
  // -------------------------
  useEffect(() => {
    const saved = localStorage.getItem("userDetails");
    if (saved) {
      const userDetails = JSON.parse(saved);
      console.log("[App] Restoring session:", userDetails);
      setUser(userDetails);
      setSignedIn(true);
      fetchEvents(userDetails.token);
    }
  }, []);

  // -------------------------
  // Render
  // -------------------------
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
            <img src={user?.image} alt="profile" className="w-10 h-10 rounded-full border" />
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
            <p className="text-lg font-semibold text-gray-600">Please login to schedule meetings</p>
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
