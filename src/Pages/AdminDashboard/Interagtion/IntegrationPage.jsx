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
  const [pages, setPages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const isSDKLoaded = useFacebookSDK(import.meta.env.VITE_FACEBOOK_APP_ID);

  const handlePageSelect = (page) => {
    console.log("[FB] Page selected ✅", page);
    localStorage.setItem("fb_page_token", page.access_token);
    localStorage.setItem("fb_page_id", page.id);
    setShowModal(false);

    window.FB.api(
      `/${page.id}?fields=id,name,fan_count,category,picture{url}`,
      "GET",
      { access_token: page.access_token },
      (details) => {
        console.log("[FB] Selected Page details:", details);
      }
    );
  };

  const handleFacebook = useCallback(() => {
    console.log("[FB] Connect button clicked 🚀");

    if (!isSDKLoaded) {
      console.error("[FB] SDK not loaded yet ❌");
      return;
    }

    setLoadingId(1);

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

        window.FB.api("/me/accounts", "GET", {}, (pageResponse) => {
          if (pageResponse && !pageResponse.error) {
            const allPages = pageResponse.data || [];
            console.log("[FB] All Pages fetched:", allPages);

            if (allPages.length === 0) {
              console.warn("[FB] No pages found ❌");
            } else if (allPages.length === 1) {
              handlePageSelect(allPages[0]);
            } else {
              setPages(allPages);
              setShowModal(true);
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

  return (
    <div className="grid gap-4">
      {integrationsData.map((integration) => (
        <IntegrationCard
          key={integration.id}
          {...integration}
          isLoading={loadingId === integration.id}
        />
      ))}

      {/* Modal for multiple pages */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">
              Select a Facebook Page
            </h2>
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {pages.map((page) => (
                <li key={page.id}>
                  <button
                    onClick={() => handlePageSelect(page)}
                    className="flex items-center p-2 w-full border rounded-lg hover:bg-blue-50 transition"
                  >
                    <img
                      src={`https://graph.facebook.com/${page.id}/picture?type=square`}
                      alt={page.name}
                      className="w-12 h-12 rounded mr-3 object-cover"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">{page.name}</p>
                      <p className="text-sm text-gray-500">
                        {page.category} • Fans: {page.fan_count}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;
