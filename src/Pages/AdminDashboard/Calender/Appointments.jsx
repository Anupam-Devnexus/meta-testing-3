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

const Appointments = () => {
  const [user, setUser] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const tokenClient = useRef(null);
  const accessTokenRef = useRef(null);

  // -------------------------
  // Load Google Identity Services
  // -------------------------
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initTokenClient;
    document.body.appendChild(script);

    // Restore previous session
    const saved = localStorage.getItem("userDetails");
    const token = localStorage.getItem("accessToken");
    if (saved && token) {
      setUser(JSON.parse(saved));
      accessTokenRef.current = token;
      setSignedIn(true);
      fetchEvents(token);
    }
  }, []);

  // -------------------------
  // Initialize Token Client (GIS)
  // -------------------------
  const initTokenClient = () => {
    if (!window.google) return console.error("Google Identity Services not loaded");
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
    console.log("[Auth] Token response:", tokenResponse);
    if (tokenResponse.access_token) {
      accessTokenRef.current = tokenResponse.access_token;
      setSignedIn(true);
      localStorage.setItem("accessToken", tokenResponse.access_token);
      await fetchUserProfile(tokenResponse.access_token);
      fetchEvents(tokenResponse.access_token);
    }
  };

  // -------------------------
  // Login
  // -------------------------
  const handleLogin = () => {
    if (!tokenClient.current) return toast.error("Token client not initialized");
    console.log("[Auth] Requesting access token...");
    tokenClient.current.requestAccessToken({ prompt: "consent" });
  };

  // -------------------------
  // Silent token refresh
  // -------------------------
  const refreshToken = async () => {
    return new Promise((resolve, reject) => {
      if (!tokenClient.current) return reject("Token client not ready");
      tokenClient.current.requestAccessToken({ prompt: "" }); // silent refresh
      const checkToken = () => {
        if (accessTokenRef.current) resolve(accessTokenRef.current);
        else setTimeout(checkToken, 500);
      };
      checkToken();
    });
  };

  // -------------------------
  // Fetch user profile
  // -------------------------
  const fetchUserProfile = async (accessToken) => {
    try {
      const res = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profile = res.data;
      console.log("[User] Profile fetched:", profile);

      const userDetails = {
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        token: accessToken,
      };

      setUser(userDetails);
      localStorage.setItem("userDetails", JSON.stringify(userDetails));

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
  // Fetch events
  // -------------------------
  const fetchEvents = async (accessToken) => {
    if (!accessToken) {
      console.log("[Fetch] No access token, attempting silent refresh...");
      try {
        accessToken = await refreshToken();
      } catch {
        return toast.error("Session expired, please login again");
      }
    }

    console.log("[Fetch] Fetching events with access token:", accessToken);

    try {
      const res = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { timeMin: new Date().toISOString(), singleEvents: true, orderBy: "startTime" },
        }
      );

      const mappedEvents = res.data.items.map((event) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error("[Fetch] Failed to fetch events:", err.response || err);
      toast.error("Failed to load events. Please re-login if needed.");
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

    try {
      const res = await axios.post(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        event,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      console.log("[Event] Created:", res.data);
      toast.success("Meeting created!");
      fetchEvents(accessToken);
    } catch (err) {
      console.error("[Event] Creation failed:", err.response || err);
      toast.error("Failed to create meeting. Please re-login if needed.");
    } finally {
      setLoading(false);
    }
  };

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
