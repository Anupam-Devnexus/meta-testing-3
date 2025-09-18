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

  // Load client
  useEffect(() => {
    function initClient() {
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
          const authInstance = gapi.auth2.getAuthInstance();
          const isSignedIn = authInstance.isSignedIn.get();
          setSignedIn(isSignedIn);

          if (isSignedIn) {
            const googleUser = authInstance.currentUser.get();
            saveUserDetails(googleUser);
            fetchEvents();
          }

          // Listen for login/logout
          authInstance.isSignedIn.listen((status) => {
            setSignedIn(status);
            if (!status) {
              setUser(null);
              setEvents([]);
              localStorage.removeItem("userDetails");
            }
          });
        });
    }

    gapi.load("client:auth2", initClient);

    // Rehydrate from localStorage
    const saved = localStorage.getItem("userDetails");
    console.log(saved)
    if (saved) {
      setUser(JSON.parse(saved));
      setSignedIn(true);
    }
  }, []);

  const saveUserDetails = async (googleUser) => {
    const profile = googleUser.getBasicProfile();
    const authResponse = googleUser.getAuthResponse(true);

    const userDetails = {
      name: profile.getName(),
      email: profile.getEmail(),
      image: profile.getImageUrl(),
      token: authResponse.id_token,
    };

    localStorage.setItem("userDetails", JSON.stringify(userDetails));
    setUser(userDetails);

    // send token to backend
    try {
      await axios.post(BACKEND_AUTH_URL, { token: authResponse.id_token });
    } catch (err) {
      console.error("Backend auth failed", err);
      toast.error("Backend authentication failed");
    }
  };

  const refreshToken = async () => {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    const user = GoogleAuth.currentUser.get();
    if (user) {
      const newAuth = await user.reloadAuthResponse();
      const updatedUser = {
        ...user,
        token: newAuth.id_token,
      };
      localStorage.setItem("userDetails", JSON.stringify(updatedUser));
      return newAuth.id_token;
    }
    return null;
  };

  const handleLogin = async () => {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    try {
      const user = await GoogleAuth.signIn();
      saveUserDetails(user);
      setSignedIn(true);
      fetchEvents();
      toast.success("Logged in successfully");
    } catch (err) {
      console.error("Login error", err);
      toast.error("Login failed");
    }
  };

  const handleLogout = () => {
    gapi.auth2.getAuthInstance().signOut();
    localStorage.removeItem("userDetails");
    setSignedIn(false);
    setUser(null);
    setEvents([]);
    toast.info("Logged out");
  };

  const handleDateClick = async (info) => {
    if (!signedIn) return toast.warn("Please login first");

    setLoading(true);
    try {
      const event = {
        summary: "Devnexus Meeting",
        description: "Scheduled via Devnexus App",
        start: { dateTime: info.dateStr + "T10:00:00", timeZone: "Asia/Kolkata" },
        end: { dateTime: info.dateStr + "T11:00:00", timeZone: "Asia/Kolkata" },
        conferenceData: { createRequest: { requestId: "meet-" + Date.now() } },
      };

      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
      });

      const link = response.result.hangoutLink || "No Meet link available";
      toast.success(`Meeting created! Link: ${link}`);

      // Refresh events
      fetchEvents();
    } catch (err) {
      console.error("Meeting creation failed", err);
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      });

      const mappedEvents = response.result.items.map((event) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Failed to fetch events", err);
      toast.error("Could not load calendar events");
    }
  };

  return (
    <div className="p-2 max-w-4xl mx-auto">
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
          <div className="flex items-center gap-4">
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
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
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
          dateClick={handleDateClick}
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


