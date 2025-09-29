// src/Pages/Dashboard/Integrations/IntegrationPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaFacebook, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import IntegrationCard from "../../../Components/Cards/IntigrationCard";

/**
 * Hook to load & initialize FB SDK properly
 */
const useFacebookSDK = (appId) => {
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    console.log("[FB SDK] Checking if already loaded...");

    if (window.FB) {
      console.log("[FB SDK] Already loaded ✅");
      setIsReady(true);
      return;
    }

    window.fbAsyncInit = function () {
      console.log("[FB SDK] Initializing...");
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false, // don’t need social plugins here
          version: "v19.0",
        });
        console.log("[FB SDK] Init complete ✅");
        setIsReady(true);
      } catch (err) {
        console.error("[FB SDK] Init error:", err);
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

const IntegrationPage = () => {
  const [fbStatus, setFbStatus] = useState("idle");
  const [selectedPage, setSelectedPage] = useState(null);
  const [error, setError] = useState(null);

  const { isReady, loadError } = useFacebookSDK(import.meta.env.VITE_FACEBOOK_APP_ID);

  /**
   * Handles FB Login flow
   */
  const handleFacebookLogin = useCallback(() => {
    console.log("[FB] Connect button clicked...");

    if (!isReady) {
      console.error("[FB] SDK not ready ❌");
      setError("Facebook SDK not loaded yet");
      return;
    }

    // Always check login status AFTER SDK is initialized
    window.FB.getLoginStatus((response) => {
      console.log("[FB] Initial login status:", response);

      if (response.status === "connected") {
        console.log("[FB] Already connected ✅");
        setFbStatus("connected");
        return;
      }

      // Otherwise, trigger login
      window.FB.login(
        (loginResp) => {
          console.log("[FB] Login response:", loginResp);

          if (!loginResp.authResponse) {
            setError("Login cancelled or failed");
            return;
          }

          const { accessToken, userID } = loginResp.authResponse;
          console.log("[FB] Logged in ✅", { userID, accessToken });

          localStorage.setItem("fb_user_token", accessToken);
          setFbStatus("connected");
        },
        {
          scope: "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,leads_retrieval,business_management",
          auth_type: "rerequest",
          return_scopes: true,
        }
      );
    });
  }, [isReady]);

  const handleDisconnect = () => {
    if (!isReady) return;
    console.log("[FB] Logging out...");
    window.FB.logout(() => {
      console.log("[FB] Logged out ✅");
      localStorage.removeItem("fb_user_token");
      setFbStatus("idle");
      setSelectedPage(null);
    });
  };

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
      {(error || loadError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3" />
          <div>
            <p className="text-red-800 font-medium">Facebook Error</p>
            <p className="text-red-600 text-sm">{error || loadError}</p>
          </div>
        </div>
      )}

      {fbStatus === "connected" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <FaCheck className="text-green-500 mr-3" />
          <div>
            <p className="text-green-800 font-medium">Connected!</p>
          </div>
        </div>
      )}

      {integrationsData.map((integration) => (
        <IntegrationCard
          key={integration.id}
          {...integration}
          isConnected={fbStatus === "connected"}
        />
      ))}
    </div>
  );
};

export default IntegrationPage;
