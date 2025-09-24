// src/Pages/Dashboard/Integrations/IntegrationPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaFacebook } from "react-icons/fa";
import IntegrationCard from "../../../Components/Cards/IntigrationCard";

// Custom hook to load FB SDK
const useFacebookSDK = (appId) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    console.log("[FB SDK] Checking if SDK is already loaded...");
    if (window.FB) {
      console.log("[FB SDK] Already loaded ✅");
      setIsSDKLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      console.log("[FB SDK] Initializing...");
      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      console.log("[FB SDK] Initialized successfully ✅");
      setIsSDKLoaded(true);
    };

    if (!document.getElementById("facebook-jssdk")) {
      console.log("[FB SDK] Injecting script...");
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
  const [fbStatus, setFbStatus] = useState("idle");

  const isSDKLoaded = useFacebookSDK(import.meta.env.VITE_FACEBOOK_APP_ID);

  const statusChangeCallback = useCallback((response) => {
    console.log("[FB Login Status Callback]:", response);

    if (response.status === "connected") {
      const { accessToken, userID } = response.authResponse;
      console.log("[FB] Connected ✅", { userID, accessToken });
      localStorage.setItem("fb_access_token", accessToken);
      setFbStatus("connected");
    } else if (response.status === "not_authorized") {
      console.warn("[FB] User logged in but not authorized ❌");
      setFbStatus("not_authorized");
    } else {
      console.warn("[FB] User not authenticated ❌");
      setFbStatus("not_authenticated");
    }
  }, []);

  const checkLoginState = useCallback(() => {
    console.log("[FB] Checking login state...");
    if (!window.FB) {
      console.error("[FB] SDK not available ❌");
      return;
    }
    window.FB.getLoginStatus(statusChangeCallback);
  }, [statusChangeCallback]);

  const handleFacebook = useCallback(async () => {
    console.log("[FB] Connect button clicked 🚀");

    if (!isSDKLoaded) {
      console.error("[FB] SDK not loaded yet ❌");
      return;
    }

    try {
      setLoadingId(1);
      console.log("[FB] Triggering FB.login...");

      window.FB.login(
        (response) => {
          console.log("[FB] Login response received:", response);
          if (response.authResponse) {
            console.log("[FB] Login success ✅");
            statusChangeCallback(response);
          } else {
            console.warn("[FB] Login cancelled or failed ❌");
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
    // 🔮 Future integrations can be added here (Google, LinkedIn, etc.)
  ];

  console.log("[IntegrationPage] Rendering integrations:", integrationsData);

  return (
    <div className="">
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
