// Appointments.jsx
import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES =
  "https://www.googleapis.com/auth/calendar.eventshttps://www.googleapis.com/auth/calendar";

const BACKEND_AUTH_URL = "https://dbbackend.devnexussolutions.com/auth/google";

const Appointments = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState(null);

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
          setSignedIn(authInstance.isSignedIn.get());

          if (authInstance.isSignedIn.get()) {
            const googleUser = authInstance.currentUser.get();
            saveUserDetails(googleUser);
          }

          authInstance.isSignedIn.listen((status) => {
            setSignedIn(status);
            if (!status) {
              setUser(null);
              localStorage.removeItem("userDetails");
            }
          });
        });
    }

    gapi.load("client:auth2", initClient);
  }, []);

  const saveUserDetails = async (googleUser) => {
    const profile = googleUser.getBasicProfile();
    const idToken = googleUser.getAuthResponse().id_token;

    const userDetails = {
      name: profile.getName(),
      email: profile.getEmail(),
      image: profile.getImageUrl(),
      token: idToken,
    };
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
    setUser(userDetails);

    // send token to backend
    try {
      await axios.post(BACKEND_AUTH_URL, { token: idToken });
    } catch (err) {
      console.error("Backend auth failed", err);
    }
  };

  const handleLogin = async () => {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    try {
      const user = await GoogleAuth.signIn();
      saveUserDetails(user);
      setSignedIn(true);
    } catch (err) {
      console.error("Login error", err);
    }
  };

  const handleLogout = () => {
    gapi.auth2.getAuthInstance().signOut();
    localStorage.removeItem("userDetails");
    setSignedIn(false);
    setUser(null);
  };

  const handleDateClick = async (info) => {
    if (!signedIn) return;

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

      alert("Meeting created: " + response.result.hangoutLink);
    } catch (err) {
      console.error("Meeting creation failed", err);
    }
  };

  return (
    <div className="p-2 max-w-6xl mx-auto">
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
      </div>
    </div>
  );
};

export default Appointments;
