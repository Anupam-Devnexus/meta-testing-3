// Appointments.jsx
import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

const Appointments = () => {
  const [events, setEvents] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Initialize Google API client
  useEffect(() => {
    const initClient = () => {
      console.log("Initializing gapi client...");
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
          console.log("GAPI client initialized");
          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());

          // Listen for sign-in status changes
          authInstance.isSignedIn.listen((status) => {
            console.log("Sign-in status changed:", status);
            setIsSignedIn(status);
            if (status) fetchEvents();
          });

          // If already signed in, fetch events
          if (authInstance.isSignedIn.get()) {
            fetchEvents();
            setupTokenRefresh(authInstance);
          }
        })
        .catch((err) => console.error("Error initializing gapi client:", err));
    };

    gapi.load("client:auth2", initClient);
  }, []);

  // Sign-in handler
  const handleSignIn = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance
      .signIn()
      .then(() => {
        console.log("Signed in successfully");
        setIsSignedIn(true);
        fetchEvents();
        setupTokenRefresh(authInstance);
      })
      .catch((err) => {
        console.error("Sign-in error:", err);
        toast.error("Google sign-in failed");
      });
  };

  // Sign-out handler
  const handleSignOut = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut().then(() => {
      console.log("Signed out");
      setIsSignedIn(false);
      setEvents([]);
    });
  };

  // Fetch Google Calendar events
  const fetchEvents = () => {
    console.log("Fetching Google Calendar events...");
    gapi.client.calendar.events
      .list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      })
      .then((response) => {
        const fetchedEvents = response.result.items.map((event) => ({
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
        }));
        console.log("Events fetched:", fetchedEvents);
        setEvents(fetchedEvents);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        toast.error(
          "Failed to fetch events. Check your Google Calendar API permissions."
        );
      });
  };

  // Setup automatic token refresh
  const setupTokenRefresh = (authInstance) => {
    const refreshInterval = 5 * 60 * 1000; // 5 minutes
    setInterval(() => {
      const user = authInstance.currentUser.get();
      if (user) {
        user.reloadAuthResponse().then((authResponse) => {
          console.log("Token refreshed:", authResponse.access_token);
        });
      }
    }, refreshInterval);
  };

  return (
    <div className="appointments-container">
      <h2>My Appointments</h2>
      {!isSignedIn ? (
        <button onClick={handleSignIn} className="btn btn-primary">
          Sign in with Google
        </button>
      ) : (
        <button onClick={handleSignOut} className="btn btn-secondary">
          Sign out
        </button>
      )}

      {isSignedIn && (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={(info) => alert(`Event: ${info.event.title}`)}
        />
      )}
    </div>
  );
};

export default Appointments;
