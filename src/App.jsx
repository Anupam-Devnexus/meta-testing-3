// App.jsx
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
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

import Stats from "./Pages/AdminDashboard/Stats/Stats";
import Contact from "./Pages/AdminDashboard/Contact/Contact";
import Calender from "./Pages/AdminDashboard/Calender/Calender";
import { Oppur } from "./Pages/AdminDashboard/Oppur";

// User Layout + Pages
import UserLayout from "./Pages/UserDashboard/UserLayout";

// Edit Mannual Pages
import EditMannualLeads from "./Pages/AdminDashboard/Leads/EditMannulLeads";
import EditUser from "./Pages/AdminDashboard/Leads/EditUser";
import Caleads from "./Pages/AdminDashboard/Caleads/Caleads";
import UserDashboard from "./Components/UserDashboardleads";
import FollowUpStatus from "./Pages/UserDashboard/Follow-up Status";
import ForgotPass from "./Pages/UserDashboard/ChangePass";
import BlogsPage from "./Pages/Blogs/BlogsPage";
import IntegrationPage from "./Pages/AdminDashboard/Interagtion/IntegrationPage";
import Appointments from "./Pages/AdminDashboard/Calender/Appointments";
import AppointmentForm from "./Pages/AdminDashboard/Calender/AppointmentForm";
import GoogleAds from "./Pages/AdminDashboard/Google/GoogleAds";

// Unauthorized
// import Unauthorized from "./Pages/Unauthorized";


function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  const hideNavbar = location.pathname === "/" || location.pathname === "/signup" || location.pathname === "/unauthorized";

  return (
    <div className="pl-64">
      {!hideNavbar && user && <Navbar />}

      <main className={`flex-1 ${mainMarginClass} min-h-screen overflow-auto`}>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgetPass />} />
          <Route path="/confirm-otp" element={<ConfirmOtp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/terms" element={<Terms/>}/>
          <Route path="/privacy" element={<Privacy/>}/>

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="/admin-dashboard/users" element={<AllUsers />} />
          <Route path="/admin-dashboard/meta" element={<Meta />} />
          <Route path="/admin-dashboard/users/add" element={<AddUser />} />
          <Route path="/admin-dashboard/mannual-leads/add" element={<AddLeads/>}/>
          <Route path="/admin-dashboard/upload-excel" element={<UploadExcel/>}/>
          <Route path="/admin-dashboard/mannual-leads" element={<MannualLeads/>}/>
          <Route path="/admin-dashboard/stats" element={<Stats/>}/>
          <Route path="/admin-dashboard/contact" element={<Contact/>}/>
          {/* Add more nested admin routes here */}


          {/* Dynamic Routes */}

 {/* Edit manual lead */}
 <Route path="/admin-dashboard/mannual-leads/edit/:leadId" element={<EditMannualLeads />} />
 <Route path="/admin-dashboard/users/edit/:userId" element={<EditUser/>}/>

        
        </Route>

        {/* User Routes */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["User"]}>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="/user-dashboard/leads" element={<UserDashboard />} />
          <Route path="/user-dashboard/follow-up" element={<FollowUpStatus />} />
          <Route path="/user-dashboard/change-password" element={<ForgotPass />} />
          {/* Add more nested user routes here */}
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
    // </div>
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
