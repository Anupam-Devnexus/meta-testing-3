// Appointments.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar";
const BACKEND_AUTH_URL = "https://dbbackend.devnexussolutions.com/auth/google";

const Appointments = () => {
  const [user, setUser] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gapiStatus, setGapiStatus] = useState("Not loaded");
  const [gapiReady, setGapiReady] = useState(false);

  const tokenClientRef = React.useRef(null);

  // -------------------------
  // Logging helpers
  // -------------------------
  const log = (context, message, data = null) =>
    console.log(`[${context}] ${message}`, data || "");

  const logError = (context, message, error = null) => {
    console.error(`[${context}] ${message}`, error || "");
    toast.error(message);
  };

  // -------------------------
  // Load gapi script
  // -------------------------
  useEffect(() => {
    log("Init", "Loading gapi script...");
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      log("Init", "gapi script loaded");
      setGapiStatus("Script loaded");
      gapi.load("client", initGapiClient);
    };
    script.onerror = () => {
      logError("Init", "Failed to load gapi script");
      setGapiStatus("Script load failed");
    };
    document.body.appendChild(script);
  }, []);

  // -------------------------
  // Initialize gapi client
  // -------------------------
  const initGapiClient = async () => {
    try {
      log("Init", "Initializing gapi client...");
      setGapiStatus("Initializing");
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
      });
      log("Init", "gapi client initialized");
      setGapiStatus("Initialized");
      setGapiReady(true);
      initTokenClient();
    } catch (err) {
      logError("Init", "Failed to init gapi client", err);
      setGapiStatus("Initialization failed");
    }
  };

  // -------------------------
  // Initialize token client
  // -------------------------
  const initTokenClient = () => {
    try {
      log("Init", "Initializing token client...");
      tokenClientRef.current = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: handleTokenResponse,
        error_callback: (error) => logError("Auth", "Token client error", error),
      });
      log("Init", "Token client ready");
    } catch (err) {
      logError("Init", "Failed to initialize token client", err);
    }
  };

  // -------------------------
  // Token response handler
  // -------------------------
  const handleTokenResponse = async (tokenResponse) => {
    log("Auth", "Token response received", tokenResponse);

    if (tokenResponse.error) return logError("Auth", "Token response error", tokenResponse.error);

    const { access_token } = tokenResponse;
    localStorage.setItem("accessToken", access_token);
    setSignedIn(true);

    // Fetch profile & events
    await fetchUserProfile(access_token);
    fetchEvents(access_token);

    // Hit backend with token
    try {
      await axios.post(BACKEND_AUTH_URL, { token: access_token });
      log("Backend", "Token sent to backend successfully");
    } catch (err) {
      logError("Backend", "Backend auth failed", err);
    }
  };

  // -------------------------
  // Fetch user profile
  // -------------------------
  const fetchUserProfile = async (accessToken) => {
    try {
      log("User", "Fetching user profile...");
      const res = await gapi.client.request({
        path: "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profile = res.result;
      const userDetails = {
        name: profile.names?.[0]?.displayName || "User",
        email: profile.emailAddresses?.[0]?.value || "",
        image: profile.photos?.[0]?.url || "",
      };

      setUser(userDetails);
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
      log("User", "User profile fetched", userDetails);
    } catch (err) {
      logError("User", "Failed to fetch profile", err);
    }
  };

  // -------------------------
  // Login & Logout
  // -------------------------
  const handleLogin = () => {
    if (!tokenClientRef.current) return logError("Auth", "Token client not initialized");
    log("Auth", "Requesting access token...");
    tokenClientRef.current.requestAccessToken({ prompt: "consent" });
  };

  const handleLogout = () => {
    log("Auth", "Logging out");
    const token = localStorage.getItem("accessToken");
    if (token) google.accounts.oauth2.revoke(token, () => log("Auth", "Token revoked"));

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userDetails");
    setSignedIn(false);
    setUser(null);
    setEvents([]);
    toast.success("Logged out successfully");
  };

  // -------------------------
  // Fetch events
  // -------------------------
  const fetchEvents = async (accessToken = localStorage.getItem("accessToken")) => {
    if (!accessToken) return logError("Fetch", "No access token available");

    try {
      gapi.client.setToken({ access_token: accessToken });
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 50,
        orderBy: "startTime",
      });

      const mappedEvents = response.result.items.map((event) => ({
        id: event.id,
        title: event.summary || "No Title",
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      setEvents(mappedEvents);
      log("Fetch", `Fetched ${mappedEvents.length} events`, mappedEvents);
    } catch (err) {
      logError("Fetch", "Failed to fetch events", err);
    }
  };

  // -------------------------
  // Create meeting
  // -------------------------
  const handleCreateMeeting = async (info) => {
    if (!signedIn) return logError("Event", "User not signed in");

    setLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    const event = {
      summary: "Devnexus Meeting",
      description: "Scheduled via Devnexus App",
      start: { dateTime: new Date(info.date).toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end: { dateTime: new Date(new Date(info.date).getTime() + 60 * 60 * 1000).toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      reminders: { useDefault: false, overrides: [{ method: "email", minutes: 24 * 60 }, { method: "popup", minutes: 30 }] },
    };

    try {
      gapi.client.setToken({ access_token: accessToken });
      const response = await gapi.client.calendar.events.insert({ calendarId: "primary", resource: event });
      log("Event", "Meeting created", response);
      toast.success("Meeting created!");
      fetchEvents(accessToken);
    } catch (err) {
      logError("Event", "Failed to create meeting", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Restore session
  // -------------------------
  useEffect(() => {
    const restoreSession = async () => {
      const savedUser = localStorage.getItem("userDetails");
      const accessToken = localStorage.getItem("accessToken");
      if (savedUser && accessToken) {
        log("App", "Restoring session...");
        setUser(JSON.parse(savedUser));
        setSignedIn(true);
        fetchEvents(accessToken);
      }
    };
    if (gapiReady) restoreSession();
  }, [gapiReady]);

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="p-2 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        {!signedIn ? (
          <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Login with Google
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <img src={user?.image} alt="profile" className="w-10 h-10 rounded-full border" />
            <div>
              <p>{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded-lg">
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={signedIn ? handleCreateMeeting : null}
          eventClick={(info) => toast.info(`Event: ${info.event.title}`)}
          height="80vh"
        />

        {!signedIn && <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded">
          <p>Please login to schedule meetings</p>
        </div>}

        {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-lg font-semibold rounded">
          <div className="flex flex-col items-center animate-spin">Creating meeting...</div>
        </div>}
      </div>
    </div>
  );
};

export default Appointments;
