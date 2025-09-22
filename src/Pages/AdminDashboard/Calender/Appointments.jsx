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
  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
const BACKEND_AUTH_URL =
  "https://dbbackend.devnexussolutions.com/auth/google";

const Appointments = () => {
  const [user, setUser] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gapiReady, setGapiReady] = useState(false);

  const tokenClientRef = useRef(null);

  // -------------------------
  // Logging helpers
  // -------------------------
  const log = (ctx, msg, data = null) =>
    console.log(`[${ctx}] ${msg}`, data || "");
  const logError = (ctx, msg, err = null) => {
    console.error(`[${ctx}] ${msg}`, err || "");
    toast.error(msg);
  };

  // -------------------------
  // Load gapi + GIS scripts
  // -------------------------
  useEffect(() => {
    log("Init", "Loading gapi & GIS scripts...");

    // gapi
    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.onload = () => {
      log("Init", "gapi loaded");
      gapi.load("client", initGapiClient);
    };
    gapiScript.onerror = () => logError("Init", "Failed to load gapi script");
    document.body.appendChild(gapiScript);

    // GIS
    const gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = initTokenClient;
    gisScript.onerror = () => logError("Init", "Failed to load GIS script");
    document.body.appendChild(gisScript);
  }, []);

  // -------------------------
  // Initialize gapi client
  // -------------------------
  const initGapiClient = async () => {
    try {
      log("Init", "Initializing gapi client...");
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
      });
      log("Init", "gapi client ready");
      setGapiReady(true);
    } catch (err) {
      logError("Init", "Failed to init gapi", err);
    }
  };

  // -------------------------
  // Initialize GIS token client
  // -------------------------
  const initTokenClient = () => {
    if (!window.google) return logError("Init", "GIS not available yet");
    try {
      log("Init", "Initializing GIS token client...");
      tokenClientRef.current = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: handleTokenResponse,
        error_callback: (err) =>
          logError("Auth", "Token client error", err),
      });
    } catch (err) {
      logError("Init", "Failed to initialize GIS token client", err);
    }
  };

  // -------------------------
  // Token response handler
  // -------------------------
  const handleTokenResponse = async (tokenResponse) => {
    log("Auth", "Token response", tokenResponse);
    if (!tokenResponse?.access_token)
      return logError("Auth", "No access token received");

    const accessToken = tokenResponse.access_token;
    localStorage.setItem("accessToken", accessToken);
    setSignedIn(true);

    await fetchUserProfile(accessToken);
    fetchEvents(accessToken);

    // Send token to backend
    try {
      await axios.post(BACKEND_AUTH_URL, { token: accessToken });
      log("Backend", "Token sent to backend successfully");
      toast.success("Logged in successfully!");
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
      log("User", "Profile fetched", userDetails);
    } catch (err) {
      logError("User", "Failed to fetch profile", err);
    }
  };

  // -------------------------
  // Login & Logout
  // -------------------------
  const handleLogin = () => {
    if (!tokenClientRef.current)
      return logError("Auth", "Token client not initialized");
    log("Auth", "Requesting token...");
    tokenClientRef.current.requestAccessToken({ prompt: "consent" });
  };

  const handleLogout = () => {
    log("Auth", "Logging out...");
    const token = localStorage.getItem("accessToken");
    if (token)
      google.accounts.oauth2.revoke(token, () =>
        log("Auth", "Token revoked")
      );

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userDetails");
    setUser(null);
    setSignedIn(false);
    setEvents([]);
    toast.info("Logged out");
  };

  // -------------------------
  // Fetch events
  // -------------------------
  const fetchEvents = async (
    accessToken = localStorage.getItem("accessToken")
  ) => {
    if (!accessToken) return logError("Events", "No access token");

    try {
      gapi.client.setToken({ access_token: accessToken });
      const res = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 50,
        orderBy: "startTime",
      });

      const mapped = res.result.items.map((event) => ({
        id: event.id,
        title: event.summary || "No Title",
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      setEvents(mapped);
      log("Events", `Fetched ${mapped.length}`, mapped);
    } catch (err) {
      logError("Events", "Failed to fetch events", err);
    }
  };

  // -------------------------
  // Create meeting
  // -------------------------
  const handleCreateMeeting = async (info) => {
    if (!signedIn) return logError("Event", "Not signed in");
    setLoading(true);

    const accessToken = localStorage.getItem("accessToken");
    const event = {
      summary: "Devnexus Meeting",
      description: "Scheduled via Devnexus App",
      start: {
        dateTime: new Date(info.date).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(
          new Date(info.date).getTime() + 60 * 60 * 1000
        ).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    try {
      gapi.client.setToken({ access_token: accessToken });
      await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
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
    const savedUser = localStorage.getItem("userDetails");
    const accessToken = localStorage.getItem("accessToken");
    if (savedUser && accessToken && gapiReady) {
      log("App", "Restoring session...");
      setUser(JSON.parse(savedUser));
      setSignedIn(true);
      fetchEvents(accessToken);
    }
  }, [gapiReady]);

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="p-2 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        {!signedIn ? (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Login with Google
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <img
              src={user?.image}
              alt="profile"
              className="w-10 h-10 rounded-full border"
            />
            <div>
              <p>{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded-lg"
            >
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

        {!signedIn && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded">
            <p>Please login to schedule meetings</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-lg font-semibold rounded">
            <div className="animate-spin">Creating meeting...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
