import React, { useState, useEffect, useCallback } from "react";
import { FaFacebook, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import IntegrationCard from "../../../Components/Cards/IntigrationCard";
import { getUserPages, getPageInsights } from "../../../utils/facebookApi";

/**
 * --------------------------------------------
 * 🧩 Hook: useFacebookSDK
 * Dynamically loads the FB SDK and initializes it
 * --------------------------------------------
 */
const useFacebookSDK = (appId) => {
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    console.log("[FB SDK] Checking if SDK is already loaded...");

    if (window.FB) {
      console.log("[FB SDK] Already initialized ✅");
      setIsReady(true);
      return;
    }

    window.fbAsyncInit = function () {
      try {
        console.log("[FB SDK] Initializing...");
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: "v19.0",
        });
        console.log("[FB SDK] Initialization complete ✅");
        setIsReady(true);
      } catch (err) {
        console.error("[FB SDK] Initialization error ❌", err);
        setLoadError(err.message);
      }
    };

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
 * ⚙️ Main Integration Page
 * Handles Facebook Login + Page Fetch
 * --------------------------------------------
 */
const IntegrationPage = () => {
  const [fbStatus, setFbStatus] = useState("idle");
  const [selectedPage, setSelectedPage] = useState(null);
  const [pages, setPages] = useState([]);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);

  const { isReady, loadError } = useFacebookSDK(import.meta.env.VITE_FACEBOOK_APP_ID);

  /**
   * --------------------------------------------
   * 🔐 Login flow using FB OAuth
   * --------------------------------------------
   */
  const handleFacebookLogin = useCallback(() => {
    console.log("[FB] ▶️ Connect button clicked");

    if (!isReady) {
      setError("Facebook SDK not loaded yet");
      return;
    }

    window.FB.getLoginStatus((response) => {
      console.log("[FB] Current login status:", response);

      if (response.status === "connected") {
        const { accessToken } = response.authResponse;
        console.log("[FB] ✅ Already connected, using stored token:", accessToken);
        setFbStatus("connected");
        handleFetchPages(accessToken);
        return;
      }

      // 🔹 Trigger FB login popup
      console.log("[FB] Opening login popup...");
      window.FB.login(
        (loginResp) => {
          console.log("[FB] Login response:", loginResp);

          if (!loginResp.authResponse) {
            setError("Login cancelled or failed");
            return;
          }

          const { accessToken, userID } = loginResp.authResponse;
          console.log("[FB] ✅ Logged in:", { userID, accessToken });

          localStorage.setItem("fb_user_token", accessToken);
          setFbStatus("connected");
          handleFetchPages(accessToken);
        },
        {
          scope:
            "public_profile,email",
          auth_type: "rerequest",
          return_scopes: true,
        }
      );
    });
  }, [isReady]);

  /**
   * --------------------------------------------
   * 📦 Fetch Pages (using helper)
   * --------------------------------------------
   */
  const handleFetchPages = async (accessToken) => {
    try {
      const data = await getUserPages(accessToken);
      setPages(data);
      if (data.length > 0) {
        setSelectedPage(data[0]);
        console.log("[FB] ✅ Selected first page:", data[0]);
      } else {
        console.warn("[FB] No pages found for this user.");
      }
    } catch (err) {
      setError(err?.message || "Failed to fetch pages");
    }
  };

  /**
   * --------------------------------------------
   * 📊 Fetch Page Insights (optional demo)
   * --------------------------------------------
   */
  const handleFetchInsights = async () => {
    if (!selectedPage) return;
    const accessToken = selectedPage.access_token;
    try {
      const data = await getPageInsights(selectedPage.id, accessToken);
      setInsights(data);
    } catch (err) {
      console.error("[FB] ❌ Error fetching insights:", err);
    }
  };

  /**
   * --------------------------------------------
   * 🔓 Disconnect Facebook
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
      setInsights([]);
    });
  };

  /**
   * --------------------------------------------
   * 🧱 Integration Card Config
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
            : "Connected"
          : "Connect Facebook",
      buttonColor: fbStatus === "connected" ? "bg-green-600" : "bg-blue-600",
      onClick: fbStatus === "connected" ? handleDisconnect : handleFacebookLogin,
      status: fbStatus,
    },
  ];

  // --------------------------------------------
  // 🖼️ UI
  // --------------------------------------------
  return (
    <div className="grid gap-4">
      {/* Error Banner */}
      {(error || loadError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3" />
          <div>
            <p className="text-red-800 font-medium">Facebook Error</p>
            <p className="text-red-600 text-sm">{error || loadError}</p>
          </div>
        </div>
      )}

      {/* Connection Success */}
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

      {/* Integration Card */}
      {integrationsData.map((integration) => (
        <IntegrationCard
          key={integration.id}
          {...integration}
          isConnected={fbStatus === "connected"}
        />
      ))}

      {/* Display Pages */}
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

          {/* Optional: Fetch Insights Button */}
          {selectedPage && (
            <button
              onClick={handleFetchInsights}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Fetch Insights for {selectedPage.name}
            </button>
          )}
        </div>
      )}

      {/* Display Insights */}
      {insights.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2">Page Insights</h3>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify(insights, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;
