import "./App.css";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectRoute";

import Navbar from "./Components/Navbar";

// Auth pages
import Login from "./auth/Login";
import Signup from "./auth/Signup";

// Admin Layout + Pages
import AdminLayout from "./Pages/AdminDashboard/AdminLayout";
import AdminDashboard from "./Pages/AdminDashboard/Dashboard";
import AllUsers from "./Pages/AdminDashboard/Users/AllUsers";
import Meta from "./Pages/AdminDashboard/Leads/Meta"
import AddUser from "./Pages/AdminDashboard/Users/AddUser";
import AddLeads from "./Pages/AdminDashboard/Leads/AddLeads";
import UploadExcel from "./Pages/AdminDashboard/Leads/UploadExcel"
import MannualLeads from "./Pages/AdminDashboard/Leads/MannualLeads";
import Stats from "./Pages/AdminDashboard/Stats/Stats"
import Contact from "./Pages/AdminDashboard/Contact/Contact";


// User Layout + Pages
import UserLayout from "./Pages/UserDashboard/UserLayout";
import UserDashboard from "./Pages/UserDashboard/UserDashboard";

// Edit Mannual Pages
import EditMannualLeads from "./Pages/AdminDashboard/Leads/EditMannulLeads";
import EditUser from "./Pages/AdminDashboard/Leads/EditUser";


// Unauthorized
// import Unauthorized from "./Pages/Unauthorized";

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  const hideNavbar = location.pathname === "/" || location.pathname === "/signup" || location.pathname === "/unauthorized";

  return (
    <div className="">
      {!hideNavbar && user && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route index path="/auth/api/signin-users" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
          {/* Add more nested user routes here */}
        </Route>

        {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
      </Routes>
    </div>
  );
}

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
