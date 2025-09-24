// src/Pages/Dashboard/Integrations/IntegrationPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaFacebook } from "react-icons/fa";
import IntegrationCard from "../../../Components/Cards/IntigrationCard";

// Custom hook to load FB SDK
const useFacebookSDK = (appId) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    if (window.FB) {
      setIsSDKLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      setIsSDKLoaded(true);
      console.log("[FB SDK] Initialized");
    };

    // Inject script once
    if (!document.getElementById("facebook-jssdk")) {
      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      document.body.appendChild(js);
    }
  }, [appId]);

  return isSDKLoaded;
};

const IntegrationPage = () => {
  const [loadingId, setLoadingId] = useState(null);
  const [fbStatus, setFbStatus] = useState(null);

  const isSDKLoaded = useFacebookSDK(import.meta.env.VITE_FACEBOOK_APP_ID);

  const statusChangeCallback = useCallback((response) => {
    console.log("[FB Login Status]:", response);

    if (response.status === "connected") {
      const { accessToken, userID } = response.authResponse;
      console.log("[FB] Logged in:", { userID, accessToken });
      localStorage.setItem("fb_access_token", accessToken);
      setFbStatus("connected");
    } else {
      console.warn("[FB] Not authenticated.");
      setFbStatus("not_authenticated");
    }
  }, []);

  const checkLoginState = useCallback(() => {
    if (!window.FB) return;
    window.FB.getLoginStatus(statusChangeCallback);
  }, [statusChangeCallback]);

  const handleFacebook = useCallback(async () => {
    if (!isSDKLoaded) {
      console.error("[FB] SDK not loaded yet.");
      return;
    }

    try {
      setLoadingId(1);

      window.FB.login(
        (response) => {
          if (response.authResponse) {
            console.log("[FB] Login success:", response);
            statusChangeCallback(response);
          } else {
            console.warn("[FB] Login cancelled or failed.");
          }
          setLoadingId(null);
        },
        {
          scope:
            "public_profile,email,pages_show_list,pages_read_engagement,leads_retrieval",
        }
      );
    } catch (err) {
      console.error("[FB Login Error]:", err.message);
      setLoadingId(null);
    }
  }, [isSDKLoaded, statusChangeCallback]);

  const integrationsData = [
    {
      id: 1,
      name: "Facebook",
      icon: FaFacebook,
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      buttonText:
        fbStatus === "connected" ? "Connected to Facebook" : "Connect Facebook",
      buttonColor:
        fbStatus === "connected" ? "bg-green-600" : "bg-blue-600",
      onClick: handleFacebook,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      {integrationsData.map((integration) => (
        <IntegrationCard
          key={integration.id}
          {...integration}
          isLoading={loadingId === integration.id}
        />
      ))}
    </div>
  );
};

export default IntegrationPage;
