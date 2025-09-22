// Appointments.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES =
  "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar";
const BACKEND_AUTH_URL = "https://dbbackend.devnexussolutions.com/auth/google";
const AUTO_REFRESH_INTERVAL = 60000; // 1 minute

const Appointments = () => {
  const [user, setUser] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const tokenClient = useRef(null);
  const accessTokenRef = useRef(null);
  const refreshTimer = useRef(null);

  // -------------------------
  // Load Google Identity Services
  // -------------------------
  useEffect(() => {
    console.log("[App] Loading Google Identity Services...");
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("[App] GIS script loaded");
      initTokenClient();
    };
    document.body.appendChild(script);

    // Restore previous session
    const savedUser = localStorage.getItem("userDetails");
    const savedToken = localStorage.getItem("accessToken");
    if (savedUser && savedToken) {
      console.log("[App] Restoring session from localStorage...");
      setUser(JSON.parse(savedUser));
      accessTokenRef.current = savedToken;
      setSignedIn(true);
      fetchEvents(savedToken);
      startAutoRefresh(savedToken);
    }

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, []);

  // -------------------------
  // Initialize Token Client
  // -------------------------
  const initTokenClient = () => {
    if (!window.google) {
      console.error("[Init] Google Identity Services not loaded");
      return;
    }
    console.log("[Init] Initializing token client...");
    tokenClient.current = window.google.accounts.oauth2.initTokenClient({
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
    console.log("[Auth] Token response received:", tokenResponse);
    if (!tokenResponse.access_token) return;
    accessTokenRef.current = tokenResponse.access_token;
    setSignedIn(true);
    localStorage.setItem("accessToken", tokenResponse.access_token);
    console.log("[Auth] Access token stored");
    await fetchUserProfile(tokenResponse.access_token);
    fetchEvents(tokenResponse.access_token);
    startAutoRefresh(tokenResponse.access_token);
  };

  // -------------------------
  // Login with consent
  // -------------------------
  const handleLogin = () => {
    if (!tokenClient.current) return toast.error("Token client not initialized");
    console.log("[Auth] Requesting access token with consent...");
    tokenClient.current.requestAccessToken({ prompt: "consent" });
  };

  // -------------------------
  // Silent token refresh
  // -------------------------
  const refreshToken = async () => {
    console.log("[Auth] Attempting silent token refresh...");
    return new Promise((resolve, reject) => {
      if (!tokenClient.current) return reject("Token client not ready");
      tokenClient.current.requestAccessToken({ prompt: "" }); // silent refresh
      const checkToken = () => {
        if (accessTokenRef.current) {
          console.log("[Auth] Token refreshed:", accessTokenRef.current);
          resolve(accessTokenRef.current);
        } else {
          setTimeout(checkToken, 500);
        }
      };
      checkToken();
    });
  };

  // -------------------------
  // Fetch user profile
  // -------------------------
  const fetchUserProfile = async (accessToken) => {
    try {
      console.log("[User] Fetching profile...");
      const res = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("[User] Profile fetched:", res.data);

      const userDetails = {
        name: res.data.name,
        email: res.data.email,
        image: res.data.picture,
        token: accessToken,
      };
      setUser(userDetails);
      localStorage.setItem("userDetails", JSON.stringify(userDetails));

      // Optional backend auth
      try {
        console.log("[User] Sending token to backend...");
        await axios.post(BACKEND_AUTH_URL, { token: accessToken });
        console.log("[User] Backend auth successful");
      } catch (err) {
        console.error("[User] Backend auth failed:", err);
      }
    } catch (err) {
      console.error("[User] Failed to fetch profile:", err.response || err);
      toast.error("Failed to fetch user profile");
    }
  };

  // -------------------------
  // Fetch events
  // -------------------------
  const fetchEvents = async (accessToken = accessTokenRef.current) => {
    if (!accessToken) {
      try {
        accessToken = await refreshToken();
      } catch {
        return toast.error("Session expired, please login again");
      }
    }

    console.log("[Fetch] Fetching calendar events...");
    try {
      const res = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            timeMin: new Date().toISOString(),
            singleEvents: true,
            orderBy: "startTime",
          },
        }
      );

      const mappedEvents = res.data.items.map((event) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      console.log("[Fetch] Events mapped:", mappedEvents);
      setEvents(mappedEvents);
    } catch (err) {
      console.error("[Fetch] Failed to fetch events:", err.response || err);
      if (err.response?.status === 403) {
        toast.error("Permission denied: Check calendar access");
      } else {
        toast.error("Failed to load events. Please re-login.");
      }
    }
  };

  // -------------------------
  // Create event
  // -------------------------
  const handleCreateMeeting = async (info) => {
    if (!signedIn) return toast.warning("Please login first");
    setLoading(true);

    let accessToken = accessTokenRef.current;
    if (!accessToken) {
      try {
        accessToken = await refreshToken();
      } catch {
        setLoading(false);
        return toast.error("Session expired, please login again");
      }
    }

    const event = {
      summary: "Devnexus Meeting",
      description: "Scheduled via Devnexus App",
      start: { dateTime: info.dateStr + "T10:00:00", timeZone: "Asia/Kolkata" },
      end: { dateTime: info.dateStr + "T11:00:00", timeZone: "Asia/Kolkata" },
    };

    console.log("[Event] Creating event:", event);

    try {
      const res = await axios.post(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        event,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      console.log("[Event] Event created:", res.data);
      toast.success("Meeting created!");
      fetchEvents(accessToken);
    } catch (err) {
      console.error("[Event] Creation failed:", err.response || err);
      if (err.response?.status === 403) {
        toast.error("Permission denied: Check calendar access");
      } else {
        toast.error("Failed to create meeting. Please re-login.");
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Auto-refresh calendar
  // -------------------------
  const startAutoRefresh = (accessToken) => {
    console.log("[AutoRefresh] Starting auto-refresh every 1 minute");
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(() => {
      console.log("[AutoRefresh] Refreshing events...");
      fetchEvents(accessToken);
    }, AUTO_REFRESH_INTERVAL);
  };

  // -------------------------
  // Render UI
  // -------------------------
  return (
    <div className="p-2 max-w-5xl mx-auto">
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
