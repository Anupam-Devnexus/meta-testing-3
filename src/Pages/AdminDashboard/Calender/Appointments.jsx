import React, { useState } from "react";
import AppointmentForm from "./AppointmentForm";
import Calendar from "./Calender";
import { useNavigate } from "react-router-dom";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  // Separate active and cancelled appointments
  const activeAppointments = appointments.filter(appt => appt.status !== "cancelled");
  const cancelledAppointments = appointments.filter(appt => appt.status === "cancelled");

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
        <button
          onClick={() => navigate("/admin-dashboard/appointment-form")}
          className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-full text-white font-semibold shadow-md"
        >
          + New Appointment
        </button>
      </div>

      {/* Calendar Container */}
      <div className="mb-6">
        <Calendar appointments={appointments} />
      </div>

      {/* Active Appointments */}
      {activeAppointments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Upcoming Appointments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAppointments.map((appt, index) => (
              <div
                key={index}
                className="bg-blue-50 p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-blue-700">{appt.title}</h3>
                <p className="text-gray-600 mt-1">
                  {appt.date} {appt.time ? `at ${appt.time}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Appointments */}
      {cancelledAppointments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Cancelled Appointments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cancelledAppointments.map((appt, index) => (
              <div
                key={index}
                className="bg-red-50 p-4 rounded-lg shadow-inner border-l-4 border-red-400"
              >
                <h3 className="text-lg font-semibold text-red-700">{appt.title}</h3>
                <p className="text-gray-600 mt-1">
                  {appt.date} {appt.time ? `at ${appt.time}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
