import React, { useEffect, useState, useRef } from "react";
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

  const gapiLoaded = useRef(false);
  const tokenClient = useRef(null);

  // -------------------------
  // Utility Functions
  // -------------------------
  const log = (context, message, data = null) => {
    console.log(`[${context}] ${message}`, data || "");
  };

  const logError = (context, message, error = null) => {
    console.error(`[${context}] ${message}`, error || "");
    toast.error(message);
  };

  // -------------------------
  // Token Validation
  // -------------------------
  const isTokenValid = async (token) => {
    try {
      log("Token", "Validating token");
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
      );
      const isValid = response.ok;
      log("Token", `Token validation result: ${isValid}`);
      return isValid;
    } catch (error) {
      logError("Token", "Token validation failed", error);
      return false;
    }
  };

  // -------------------------
  // Load gapi script
  // -------------------------
  useEffect(() => {
    log("Init", "Loading gapi script");
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      log("Init", "gapi script loaded successfully");
      setGapiStatus("Script loaded");
      gapi.load("client", initGapiClient, (error) => {
        if (error) {
          logError("Init", "Failed to load gapi client", error);
          setGapiStatus("Load failed");
        }
      });
    };
    script.onerror = () => {
      logError("Init", "Failed to load gapi script");
      setGapiStatus("Script load failed");
    };
    document.body.appendChild(script);
  }, []);

  // -------------------------
  // Initialize Google API client
  // -------------------------
  const initGapiClient = async () => {
    try {
      log("Init", "Initializing gapi client...");
      setGapiStatus("Initializing");

      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
      });

      log("Init", "gapi client initialized successfully");
      setGapiStatus("Initialized");
      gapiLoaded.current = true;
      initTokenClient();
    } catch (err) {
      logError("Init", "Failed to init gapi client", err);
      setGapiStatus("Initialization failed");
    }
  };

  // -------------------------
  // Initialize Token Client (GIS)
  // -------------------------
  const initTokenClient = () => {
    try {
      log("Init", "Initializing token client");
      tokenClient.current = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: handleTokenResponse,
        error_callback: (error) => {
          logError("Auth", "Token client error", error);
        }
      });
      log("Init", "Token client ready");
    } catch (err) {
      logError("Init", "Failed to initialize token client", err);
    }
  };

  // -------------------------
  // Handle token response
  // -------------------------
  const handleTokenResponse = async (tokenResponse) => {
    log("Auth", "Token response received", tokenResponse);

    if (tokenResponse.error) {
      logError("Auth", "Token response error", tokenResponse.error);
      return;
    }

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
      log("User", "Fetching user profile");

      const res = await gapi.client.request({
        path: "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profile = res.result;
      log("User", "Profile fetched successfully", profile);

      const userDetails = {
        name: profile.name?.[0]?.displayName || "User",
        email: profile.email?.[0]?.value || "",
        image: profile.photos?.[0]?.url || "",
        token: token,
        role: profile.role || ""
      };

      setUser(userDetails);
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
      console.log(user)

      // Optional: send token to backend
      try {
        await axios.post(BACKEND_AUTH_URL, { token: accessToken });
        log("User", "Backend auth successful");
      } catch (err) {
        logError("User", "Backend auth failed", err);
      }
    } catch (err) {
      logError("User", "Failed to fetch profile", err);
    }
  };

  // -------------------------
  // Login
  // -------------------------
  const handleLogin = () => {
    if (!tokenClient.current) {
      logError("Auth", "Token client not initialized");
      return;
    }


    log("Auth", "Requesting access token...");
    try {
      tokenClient.current.requestAccessToken({ prompt: "consent" });
    } catch (err) {
      logError("Auth", "Login request failed", err);
    }
  };


  // -------------------------
  // Logout
  // -------------------------
  const handleLogout = () => {
    log("Auth", "Logging out");

    if (localStorage.getItem("accessToken")) {
      google.accounts.oauth2.revoke(localStorage.getItem("accessToken"), () => {
        log("Auth", "Token revoked");
      });
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userDetails");
    setSignedIn(false);
    setUser(null);
    setEvents([]);

    log("Auth", "Logout completed");
    toast.success("Logged out successfully");
  };

  // -------------------------
  // Fetch events
  // -------------------------
  const fetchEvents = async (accessToken = localStorage.getItem("accessToken")) => {
    const tokenValid = await isTokenValid(accessToken);
    if (!tokenValid) {
      handleLogin(); // Request new token
      return;
    }


    // Validate token before making request
    if (!(await isTokenValid(accessToken))) {
      log("Fetch", "Invalid token, skipping events fetch");
      handleLogout();
      return;
    }

    log("Fetch", "Fetching events...");

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

      log("Fetch", "Events fetched successfully", response);

      const mappedEvents = response.result.items.map((event) => ({
        id: event.id,
        title: event.summary || "No Title",
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      setEvents(mappedEvents);
      log("Fetch", `Mapped ${mappedEvents.length} events`);
    } catch (err) {
      logError("Fetch", "Failed to fetch events", err);

      // Handle 403 error specifically
      if (err.status === 403) {
        logError("Fetch", "Access denied. Check Google Cloud Console permissions.");
      }
    }
  };

  // -------------------------
  // Create event
  // -------------------------
  const handleCreateMeeting = async (info) => {
    log("Event", "Creating meeting", info);

    if (!signedIn) {
      logError("Event", "User not signed in");
      return;
    }

    setLoading(true);

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      logError("Event", "No access token available");
      setLoading(false);
      return;
    }

    // Validate token before making request
    if (!(await isTokenValid(accessToken))) {
      logError("Event", "Invalid token");
      handleLogout();
      setLoading(false);
      return;
    }

    const event = {
      summary: "Devnexus Meeting",
      description: "Scheduled via Devnexus App",
      start: {
        dateTime: new Date(info.date).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: new Date(new Date(info.date).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 }
        ]
      }
    };

    try {
      gapi.client.setToken({ access_token: accessToken });

      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });

      log("Event", "Meeting created successfully", response);
      toast.success("Meeting created!");

      // Refresh events list
      fetchEvents();
    } catch (err) {
      logError("Event", "Failed to create meeting", err);

      // Handle specific error cases
      if (err.status === 403) {
        logError("Event", "Calendar access denied. Check permissions in Google Cloud Console.");
      } else if (err.status === 401) {
        logError("Event", "Authentication failed. Please login again.");
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Restore session
  // -------------------------
  useEffect(() => {
    const restoreSession = async () => {
      log("App", "Attempting to restore session");

      const saved = localStorage.getItem("userDetails");
      const accessToken = localStorage.getItem("accessToken");

      if (saved && accessToken) {
        // Validate token before restoring session
        if (await isTokenValid(accessToken)) {
          const userDetails = JSON.parse(saved);
          log("App", "Restoring session", userDetails);
          setUser(userDetails);
          setSignedIn(true);
          fetchEvents(accessToken);
        } else {
          log("App", "Token invalid, clearing session");
          handleLogout();
        }
      } else {
        log("App", "No saved session found");
      }
    };

    if (gapiLoaded.current) {
      restoreSession();
    }
  }, [gapiLoaded.current]);

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="p-2 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-sm text-gray-500">gAPI Status: {gapiStatus}</p>
        </div>
        {!signedIn ? (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Login with Google
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={user?.image} alt="profile" className="w-10 h-10 rounded-full border" />
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
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
          eventClick={(info) => {
            log("Calendar", "Event clicked", info.event);
            toast.info(`Event: ${info.event.title}`);
          }}
        />

        {!signedIn && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded">
            <p className="text-lg font-semibold text-gray-600">Please login to schedule meetings</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-lg font-semibold rounded">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
              Creating meeting...
            </div>
          </div>
        )}
      </div>

      {/* Debug Info (only shown in development) */}
      {import.meta.env.DEV && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <p>Signed In: {signedIn ? "Yes" : "No"}</p>
          <p>Events Count: {events.length}</p>
          <p>gAPI Loaded: {gapiLoaded.current ? "Yes" : "No"}</p>
          <p>Token Client: {tokenClient.current ? "Initialized" : "Not initialized"}</p>
          <button
            onClick={() => console.log("User:", user, "Events:", events)}
            className="mt-2 px-2 py-1 bg-gray-300 rounded"
          >
            Log State to Console
          </button>
        </div>
      )}
    </div>
  );
};

export default Appointments;
