// src/Pages/Dashboard/Integrations/IntegrationPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaFacebook, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import IntegrationCard from "../../../Components/Cards/IntigrationCard";

/**
 * --------------------------------------------
 * 🧩 Custom Hook: useFacebookSDK
 * Loads and initializes the Facebook SDK dynamically
 * --------------------------------------------
 */
const useFacebookSDK = (appId) => {
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    console.log("[FB SDK] Checking if SDK is already loaded...");

    // ✅ If FB object already exists, SDK is ready
    if (window.FB) {
      console.log("[FB SDK] Already initialized ✅");
      setIsReady(true);
      return;
    }

    // 🔹 Initialize Facebook SDK
    window.fbAsyncInit = function () {
      try {
        console.log("[FB SDK] Initializing...");
        window.FB.init({
          appId, // Your Facebook App ID from .env
          cookie: true,
          xfbml: false, // Disable social plugins parsing
          version: "v19.0",
        });
        console.log("[FB SDK] Initialization complete ✅");
        setIsReady(true);
      } catch (err) {
        console.error("[FB SDK] Initialization error ❌", err);
        setLoadError(err.message);
      }
    };

    // 🔹 Inject SDK <script> into the document if not loaded yet
    if (!document.getElementById("facebook-jssdk")) {
      console.log("[FB SDK] Injecting SDK script...");
      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.async = true;
      js.defer = true;
      js.onerror = () => {
        console.error("[FB SDK] Failed to load SDK ❌");
        setLoadError("Failed to load Facebook SDK");
      };
      document.body.appendChild(js);
    }
  }, [appId]);

  return { isReady, loadError };
};

/**
 * --------------------------------------------
 * ⚙️ Main Integration Page Component
 * Handles:
 * - FB Login via OAuth
 * - Fetching connected Pages
 * - Showing connection status
 * --------------------------------------------
 */
const IntegrationPage = () => {
  const [fbStatus, setFbStatus] = useState("idle"); // idle | connected
  const [selectedPage, setSelectedPage] = useState(null);
  const [pages, setPages] = useState([]);
  const [error, setError] = useState(null);

  const { isReady, loadError } = useFacebookSDK(import.meta.env.VITE_FACEBOOK_APP_ID);

  /**
   * --------------------------------------------
   * 📦 Fetch all Facebook Pages connected to user
   * API: GET /me/accounts
   * --------------------------------------------
   */
  const fetchFacebookPages = useCallback((accessToken) => {
    console.log("[FB] Fetching pages with accessToken:", accessToken);

    window.FB.api(
      "https://dbbackend.devnexussolutions.com/auth/api/get-all-users",
      "GET",
      { access_token: accessToken },
      (response) => {
        if (!response || response.error) {
          console.error("[FB] ❌ Error fetching pages:", response.error);
          setError(response?.error?.message || "Failed to fetch pages");
          return;
        }

        console.log("[FB] ✅ Pages fetched successfully:", response.data);
        setPages(response.data);

        // Optional: Automatically select the first Page
        if (response.data.length > 0) {
          console.log("[FB] Selecting first page:", response.data[0]);
          setSelectedPage(response.data[0]);
        } else {
          console.warn("[FB] No Pages found for this user.");
        }
      }
    );
  }, []);

  /**
   * --------------------------------------------
   * 🔐 Handle Facebook Login Flow
   * - Checks if user is already logged in
   * - If not, triggers FB Login popup
   * - Stores accessToken and fetches Pages
   * --------------------------------------------
   */
  const handleFacebookLogin = useCallback(() => {
    console.log("[FB] ▶️ Connect button clicked");

    if (!isReady) {
      console.error("[FB] SDK not ready ❌");
      setError("Facebook SDK not loaded yet");
      return;
    }

    // 1️⃣ Check current login status
    window.FB.getLoginStatus((response) => {
      console.log("[FB] Current login status:", response);

      if (response.status === "connected") {
        // Already logged in
        const { accessToken } = response.authResponse;
        console.log("[FB] ✅ Already connected, using stored token:", accessToken);
        setFbStatus("connected");
        fetchFacebookPages(accessToken);
        return;
      }

      // 2️⃣ Trigger FB login popup
      console.log("[FB] Opening Facebook Login popup...");
      window.FB.login(
        (loginResp) => {
          console.log("[FB] Login response:", loginResp);

          // Check if login was successful
          if (!loginResp.authResponse) {
            console.error("[FB] ❌ Login cancelled or failed");
            setError("Login cancelled or failed");
            return;
          }

          const { accessToken, userID } = loginResp.authResponse;
          console.log("[FB] ✅ Logged in successfully:", { userID, accessToken });

          // Store token for later use
          localStorage.setItem("fb_user_token", accessToken);

          // Update UI state
          setFbStatus("connected");

          // Fetch the user's connected Pages
          fetchFacebookPages(accessToken);
        },
        {
          scope:
            "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,leads_retrieval,business_management,ads_read",
          auth_type: "rerequest",
          return_scopes: true,
        }
      );
    });
  }, [isReady, fetchFacebookPages]);

  /**
   * --------------------------------------------
   * 🔓 Handle Disconnect / Logout
   * --------------------------------------------
   */
  const handleDisconnect = () => {
    if (!isReady) return;
    console.log("[FB] Logging out...");
    window.FB.logout(() => {
      console.log("[FB] Logged out ✅");
      localStorage.removeItem("fb_user_token");
      setFbStatus("idle");
      setSelectedPage(null);
      setPages([]);
    });
  };

  /**
   * --------------------------------------------
   * 🧱 UI Data for Integration Cards
   * --------------------------------------------
   */
  const integrationsData = [
    {
      id: 1,
      name: "Facebook",
      icon: FaFacebook,
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      buttonText:
        fbStatus === "connected"
          ? selectedPage
            ? `Connected to ${selectedPage.name}`
            : "Connected to Facebook"
          : "Connect Facebook",
      buttonColor: fbStatus === "connected" ? "bg-green-600" : "bg-blue-600",
      onClick: fbStatus === "connected" ? handleDisconnect : handleFacebookLogin,
      status: fbStatus,
    },
  ];

  return (
    <div className="grid gap-4">
      {/* ❌ Error Message Display */}
      {(error || loadError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3" />
          <div>
            <p className="text-red-800 font-medium">Facebook Error</p>
            <p className="text-red-600 text-sm">{error || loadError}</p>
          </div>
        </div>
      )}

      {/* ✅ Connection Success Banner */}
      {fbStatus === "connected" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <FaCheck className="text-green-500 mr-3" />
          <div>
            <p className="text-green-800 font-medium">
              Connected {selectedPage ? `to ${selectedPage.name}` : "to Facebook"}
            </p>
          </div>
        </div>
      )}

      {/* 💡 Integration Card Display */}
      {integrationsData.map((integration) => (
        <IntegrationCard
          key={integration.id}
          {...integration}
          isConnected={fbStatus === "connected"}
        />
      ))}

      {/* 🧾 Show fetched Facebook Pages */}
      {pages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2">Your Facebook Pages</h3>
          <ul className="list-disc ml-6 space-y-1">
            {pages.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> — ID: {p.id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;
