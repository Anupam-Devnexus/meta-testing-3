// Appointments.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES =
  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
const BACKEND_AUTH_URL = "https://dbbackend.devnexussolutions.com/auth/google";
const BACKEND_EVENT_URL = "https://dbbackend.devnexussolutions.com/auth/api/appointment";

const Appointments = () => {
  console.log("[App] Render start");

  const [user, setUser] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gapiReady, setGapiReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [meetLink, setMeetLink] = useState("");

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    attendees: [""],
  });

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
  // Load gapi & GIS scripts
  // -------------------------
  useEffect(() => {
    console.log("[Init] Loading gapi & GIS scripts...");
    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.onload = () => {
      console.log("[Init] gapi loaded");
      gapi.load("client", initGapiClient);
    };
    gapiScript.onerror = () => logError("Init", "Failed to load gapi script");
    document.body.appendChild(gapiScript);

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
  const initGapiClient = useCallback(async () => {
    console.log("[Init] Initializing gapi client...");
    try {
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
      });
      console.log("[Init] gapi client ready");
      setGapiReady(true);
    } catch (err) {
      logError("Init", "Failed to init gapi", err);
    }
  }, []);

  // -------------------------
  // Initialize GIS token client
  // -------------------------
  const initTokenClient = useCallback(() => {
    console.log("[Init] Initializing GIS token client...");
    if (!window.google) return logError("Init", "GIS not available yet");
    try {
      tokenClientRef.current = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: handleTokenResponse,
        error_callback: (err) => logError("Auth", "Token client error", err),
      });
      console.log("[Init] GIS token client initialized");
    } catch (err) {
      logError("Init", "Failed to initialize GIS token client", err);
    }
  }, []);

  // -------------------------
  // Token response handler
  // -------------------------
  const handleTokenResponse = useCallback(async (tokenResponse) => {
    console.log("[Auth] Token response received:", tokenResponse);
    if (!tokenResponse?.access_token)
      return logError("Auth", "No access token received");

    const accessToken = tokenResponse.access_token;
    localStorage.setItem("accessToken", accessToken);
    setSignedIn(true);
    console.log("[Auth] User signed in");

    await fetchUserProfile(accessToken);
    fetchEvents(accessToken);

    try {
      await axios.post(BACKEND_AUTH_URL, { token: accessToken });
      console.log("[Backend] Token sent successfully");
      toast.success("Logged in successfully!");
    } catch (err) {
      logError("Backend", "Backend auth failed", err);
    }
  }, []);

  // -------------------------
  // Fetch user profile
  // -------------------------
  const fetchUserProfile = useCallback(async (accessToken) => {
    console.log("[User] Fetching user profile...");
    try {
      const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userDetails = { name: res.data.name, email: res.data.email, image: res.data.picture };
      setUser(userDetails);
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
      console.log("[User] Profile fetched:", userDetails);
    } catch (err) {
      logError("User", "Failed to fetch profile", err);
    }
  }, []);

  // -------------------------
  // Login & Logout
  // -------------------------
  const handleLogin = () => {
    console.log("[Auth] Login clicked");
    if (!tokenClientRef.current) return logError("Auth", "Token client not initialized");
    tokenClientRef.current.requestAccessToken({ prompt: "consent" });
    console.log("[Auth] Requesting token...");
  };

  const handleLogout = () => {
    console.log("[Auth] Logging out...");
    const token = localStorage.getItem("accessToken");
    if (token) google.accounts.oauth2.revoke(token, () => console.log("[Auth] Token revoked"));
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userDetails");
    setUser(null);
    setSignedIn(false);
    setEvents([]);
    setMeetLink("");
    console.log("[Auth] User logged out");
    toast.info("Logged out");
  };

  // -------------------------
  // Fetch events
  // -------------------------
  const fetchEvents = useCallback(async (accessToken = localStorage.getItem("accessToken")) => {
    console.log("[Events] Fetching events...");
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
      console.log("[Events] Raw events:", res.result.items);
      const mapped = res.result.items.map(event => ({
        id: event.id,
        title: event.summary || "No Title",
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));
      console.log("[Events] Mapped events:", mapped);
      setEvents(mapped);
    } catch (err) {
      logError("Events", "Failed to fetch events", err);
    }
  }, []);

  // -------------------------
  // Restore session
  // -------------------------
  useEffect(() => {
    console.log("[App] Restoring session...");
    const savedUser = localStorage.getItem("userDetails");
    const accessToken = localStorage.getItem("accessToken");
    if (savedUser && accessToken && gapiReady) {
      setUser(JSON.parse(savedUser));
      setSignedIn(true);
      fetchEvents(accessToken);
      console.log("[App] Session restored", savedUser);
    }
  }, [gapiReady, fetchEvents]);

  // -------------------------
  // Modal handlers
  // -------------------------
  const handleDateClick = (info) => {
    console.log("[UI] Date clicked:", info.dateStr);
    if (!signedIn) return toast.info("Please login first");
    setNewEvent(prev => ({ ...prev, date: info.dateStr }));
    setModalOpen(true);
    setMeetLink("");
  };

  const handleAddAttendee = () => {
    console.log("[UI] Adding attendee");
    setNewEvent(prev => ({ ...prev, attendees: [...prev.attendees, ""] }));
  };

  const handleAttendeeChange = (i, value) => {
    console.log(`[UI] Attendee ${i} changed to: ${value}`);
    setNewEvent(prev => {
      const attendees = [...prev.attendees];
      attendees[i] = value;
      return { ...prev, attendees };
    });
  };

  const handleRemoveAttendee = (i) => {
    console.log(`[UI] Removing attendee ${i}`);
    setNewEvent(prev => ({ ...prev, attendees: prev.attendees.filter((_, idx) => idx !== i) }));
  };

  // -------------------------
  // Create meeting and post to backend
  // -------------------------
  const handleCreateMeeting = async () => {
    console.log("[Event] Creating meeting...");
    if (!signedIn) return logError("Event", "Not signed in");
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`).toISOString();
      const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`).toISOString();

      const eventPayload = {
        summary: newEvent.title || "Untitled Meeting",
        description: newEvent.description,
        start: { dateTime: startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        attendees: newEvent.attendees.filter(a => a.trim() !== "").map(email => ({ email })),
        conferenceData: { createRequest: { requestId: String(Date.now()), conferenceSolutionKey: { type: "hangoutsMeet" } } },
      };
      console.log("[Event] Event payload:", eventPayload);

      gapi.client.setToken({ access_token: accessToken });
      const res = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: eventPayload,
        conferenceDataVersion: 1,
        sendUpdates: "all",
      });
      console.log("[Event] Event created in Google Calendar:", res.result);

      const link = res.result.conferenceData?.entryPoints?.[0]?.uri || "";
      setMeetLink(link);
      console.log("[Event] Meet link:", link);

      // -------------------------
      // Post to backend
      // -------------------------
      try {
        await axios.post(BACKEND_EVENT_URL, {
          event: { ...eventPayload, meetLink: link, gcalId: res.result.id },
        });
        console.log("[Backend] Event posted successfully");
        toast.success("Event posted to backend successfully!");
      } catch (err) {
        logError("Backend", "Failed to post event", err);
      }

      setEvents(prev => [...prev, { id: res.result.id, title: res.result.summary, start: res.result.start.dateTime, end: res.result.end.dateTime }]);
      setModalOpen(false);
      setNewEvent({ title: "", description: "", date: "", startTime: "09:00", endTime: "10:00", attendees: [""] });
    } catch (err) {
      logError("Event", "Failed to create meeting", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Render
  // -------------------------
  console.log("[App] Rendering...");
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        {!signedIn ? (
          <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Login with Google</button>
        ) : (
          <div className="flex items-center gap-4">
            <img src={user?.image} alt="profile" className="w-10 h-10 rounded-full border" />
            <div>
              <p>{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded-lg">Logout</button>
          </div>
        )}
      </div>

      <div className="relative">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={(info) => {
            console.log("[UI] Event clicked:", info.event);
            toast.info(`Event: ${info.event.title}`);
          }}
          height="80vh"
        />
        {!signedIn && <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded"><p>Please login to schedule meetings</p></div>}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create Meeting on {newEvent.date}</h2>

            <input
              type="text"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              className="border p-2 rounded w-full mb-2"
            />

            <textarea
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              className="border p-2 rounded w-full mb-2"
            />

            <div className="flex gap-2 mb-2">
              <input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))} className="border p-2 rounded w-1/2" />
              <input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))} className="border p-2 rounded w-1/2" />
            </div>

            <div className="mb-2">
              <p className="font-medium">Attendees:</p>
              {newEvent.attendees.map((att, i) => (
                <div key={i} className="flex gap-2 mb-1">
                  <input
                    type="email"
                    placeholder="Email"
                    value={att}
                    onChange={(e) => handleAttendeeChange(i, e.target.value)}
                    className="border p-2 rounded flex-1"
                  />
                  {i > 0 && <button onClick={() => handleRemoveAttendee(i)} className="text-red-500">✕</button>}
                </div>
              ))}
              <button onClick={handleAddAttendee} className="text-sm text-blue-600 mt-1">+ Add attendee</button>
            </div>

            {meetLink && (
              <div className="mb-2 p-2 bg-green-100 rounded text-green-800 text-sm">
                Meet Link: <a href={meetLink} target="_blank" rel="noopener noreferrer" className="underline">{meetLink}</a>
                <button onClick={() => navigator.clipboard.writeText(meetLink)} className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs">Copy</button>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalOpen(false)} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleCreateMeeting} className="px-3 py-1 bg-green-600 text-white rounded">{loading ? "Creating..." : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
