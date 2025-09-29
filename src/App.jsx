// App.jsx
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectRoute";
import Navbar from "./Components/Navbar";

// Auth Pages
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ForgetPass from "./Pages/ForgetPass";
import ConfirmOtp from "./Pages/Confimotp";

// Admin Pages
import AdminLayout from "./Pages/AdminDashboard/AdminLayout";
import AdminDashboard from "./Pages/AdminDashboard/Dashboard";
import AllUsers from "./Pages/AdminDashboard/Users/AllUsers";
import Meta from "./Pages/AdminDashboard/Leads/Meta";
import AddUser from "./Pages/AdminDashboard/Users/AddUser";
import AddLeads from "./Pages/AdminDashboard/Leads/AddLeads";
import UploadExcel from "./Pages/AdminDashboard/Leads/UploadExcel";
import MannualLeads from "./Pages/AdminDashboard/Leads/MannualLeads";
import EditMannualLeads from "./Pages/AdminDashboard/Leads/EditMannulLeads";
import EditUser from "./Pages/AdminDashboard/Leads/EditUser";
import Caleads from "./Pages/AdminDashboard/Caleads/Caleads";
import Stats from "./Pages/AdminDashboard/Stats/Stats";
import Appointments from "./Pages/AdminDashboard/Calender/Appointments";
import AppointmentForm from "./Pages/AdminDashboard/Calender/AppointmentForm";
import IntegrationPage from "./Pages/AdminDashboard/Interagtion/IntegrationPage";
import GoogleAds from "./Pages/AdminDashboard/Google/GoogleAds";
import { Oppur } from "./Pages/AdminDashboard/Oppur";
import Proflie from "./Pages/AdminDashboard/Proflie";
import Website from "./Pages/AdminDashboard/Website/Website";

// User Pages
import UserLayout from "./Pages/User/UserLayout";
import UserDashboard from "./Pages/User/UserDashboard";
import FollowUpStatus from "./Pages/User/Follow-up Status";
import UserProfile from "./Pages/User/UserProfile";

// Misc
import Unauthorized from "./Pages/Unauthorized";
import Privacy from "./Pages/Privacy";
import Terms from "./Pages/Terms";
import Home from "./Pages/Home";

// ================= Route Configurations =================
const adminRoutes = [
  { path: "", element: <AdminDashboard /> },
  { path: "admin-profile", element: <Proflie /> },
  { path: "users", element: <AllUsers /> },
  { path: "users/add", element: <AddUser /> },
  { path: "users/edit/:userId", element: <EditUser /> },
  { path: "meta", element: <Meta /> },
  { path: "mannual-leads", element: <MannualLeads /> },
  { path: "mannual-leads/add", element: <AddLeads /> },
  { path: "mannual-leads/edit/:leadId", element: <EditMannualLeads /> },
  { path: "upload-excel", element: <UploadExcel /> },
  { path: "ca-leads", element: <Caleads /> },
  { path: "digital-leads", element: <Caleads /> },
  { path: "web-development-leads", element: <Caleads /> },
  { path: "travel-agency-leads", element: <Caleads /> },
  { path: "appointments", element: <Appointments /> },
  { path: "appointment-form", element: <AppointmentForm /> },
  { path: "integrations", element: <IntegrationPage /> },
  { path: "google-ads", element: <GoogleAds /> },
  { path: "oppurtunity", element: <Oppur /> },
  { path: "stats", element: <Stats /> },
  { path: "website", element: <Website /> },
];

const userRoutes = [
  { path: "", element: <UserDashboard /> },
  { path: "follow-up-status", element: <FollowUpStatus /> },
  { path: "user-profile", element: <UserProfile /> },
];

// ================= App Content =================
function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  // Hide navbar on public pages
  const hideNavbar = ["/login", "/privacy", "/terms", "/home", "/signup", "/forgot-password", "/confirm-otp"].includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {!hideNavbar && user && <Navbar />}

      <main className={`flex-1 min-h-screen overflow-auto ${!hideNavbar ? "ml-64" : ""}`}>
        <Routes>
          {/* Default redirect to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgetPass />} />
          <Route path="/confirm-otp" element={<ConfirmOtp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {adminRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/* User Routes */}
          <Route
            path="/user-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            {userRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <h1 className="text-red-500 text-2xl flex justify-center mt-20">
                404 - Page Not Found
              </h1>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

// ================= App =================
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
