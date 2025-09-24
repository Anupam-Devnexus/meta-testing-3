// src/Pages/Dashboard/Integrations/IntegrationPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaFacebook } from "react-icons/fa";
import IntegrationCard from "../../../Components/Cards/IntigrationCard";

const useFacebookSDK = (appId) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    console.log("[FB SDK] Checking SDK load...");
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

      console.log("[FB SDK] Initialized ✅");

      window.FB.getLoginStatus((response) => {
        console.log("[FB SDK] Initial login status:", response);
      });

      setIsSDKLoaded(true);
    };

    if (!document.getElementById("facebook-jssdk")) {
      console.log("[FB SDK] Injecting SDK script...");
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
    console.log("[FB Status Callback]:", response);

    if (response.status === "connected") {
      const { accessToken, userID } = response.authResponse;
      console.log("[FB] Connected", { userID, accessToken });
      localStorage.setItem("fb_access_token", accessToken);
      setFbStatus("connected");
    } else if (response.status === "not_authorized") {
      console.warn("[FB] Logged in but not authorized ❌");
      setFbStatus("not_authorized");
    } else {
      console.warn("[FB] Not authenticated ❌");
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

    setLoadingId(1);

    try {
      window.FB.login(
        (response) => {
          console.log("[FB] Login response:", response);

          if (!response.authResponse) {
            console.warn("[FB] Login cancelled or failed ❌");
            setLoadingId(null);
            return;
          }

          const { accessToken, userID } = response.authResponse;
          console.log("[FB] Login success ✅", { userID, accessToken });
          localStorage.setItem("fb_user_token", accessToken);
          setFbStatus("connected");

          // Fetch pages connected to the user
          window.FB.api("/me/accounts", "GET", {}, (pageResponse) => {
            if (pageResponse && !pageResponse.error) {
              const pages = pageResponse.data || [];
              if (pages.length > 0) {
                const page = pages[0];
                console.log("[FB] Connected Page ✅", page);

                localStorage.setItem("fb_page_token", page.access_token);
                localStorage.setItem("fb_page_id", page.id);

                window.FB.api(
                  `/${page.id}?fields=id,name,fan_count,category`,
                  "GET",
                  { access_token: page.access_token },
                  (details) => {
                    console.log("[FB] Page details:", details);
                  }
                );
              } else {
                console.warn("[FB] No pages found ❌");
              }
            } else {
              console.error("[FB] Error fetching pages:", pageResponse?.error);
            }
            setLoadingId(null);
          });
        },
        {
          scope:
            "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,leads_retrieval",
          auth_type: "rerequest",
          return_scopes: true,
        }
      );
    } catch (err) {
      console.error("[FB Login Error]:", err.message);
      setLoadingId(null);
    }
  }, [isSDKLoaded]);

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

  console.log("[IntegrationPage] Rendering integrations:", integrationsData);

  return (
    <div className="grid gap-4">
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
