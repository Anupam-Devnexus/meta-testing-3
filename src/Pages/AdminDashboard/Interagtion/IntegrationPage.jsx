// src/Pages/Dashboard/Integrations/IntegrationPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaFacebook, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import IntegrationCard from "../../../Components/Cards/IntigrationCard";

const useFacebookSDK = (appId) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    console.log("[FB SDK] Checking SDK load...");

    if (window.FB) {
      console.log("[FB SDK] Already loaded ✅");
      setIsSDKLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      console.log("[FB SDK] Initializing...");
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: true,
          version: "v19.0",
          autoLogAppEvents: true,
        });
        console.log("[FB SDK] Initialized ✅");
        setIsSDKLoaded(true);
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

  return { isSDKLoaded, loadError };
};

const IntegrationPage = () => {
  const [loadingId, setLoadingId] = useState(null);
  const [fbStatus, setFbStatus] = useState("idle"); // idle | connected | error
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const { isSDKLoaded, loadError } = useFacebookSDK(import.meta.env.VITE_FACEBOOK_APP_ID);

  const clearFacebookData = () => {
    console.log("[FB] Clearing stored tokens...");
    localStorage.removeItem("fb_user_token");
    localStorage.removeItem("fb_page_token");
    localStorage.removeItem("fb_page_id");
    setFbStatus("idle");
    setSelectedPage(null);
    setError(null);
  };

  const checkExistingConnection = useCallback(async () => {
    if (!isSDKLoaded) return;
    console.log("[FB] Checking existing connection...");

    const userToken = localStorage.getItem("fb_user_token");
    const pageToken = localStorage.getItem("fb_page_token");
    const pageId = localStorage.getItem("fb_page_id");

    if (userToken && pageToken && pageId) {
      console.log("[FB] Tokens found in localStorage, verifying...");
      setFbStatus("connected");
      setSelectedPage({ id: pageId, access_token: pageToken });

      window.FB.api(`/me?access_token=${userToken}`, (resp) => {
        if (resp.error) {
          console.warn("[FB] Stored token expired, clearing...");
          clearFacebookData();
        } else {
          console.log("[FB] Stored token valid ✅");
        }
      });
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    checkExistingConnection();
  }, [checkExistingConnection]);

  const handlePageSelect = async (page) => {
    console.log("[FB] Selecting page:", page);
    try {
      localStorage.setItem("fb_page_token", page.access_token);
      localStorage.setItem("fb_page_id", page.id);
      setSelectedPage(page);
      setShowModal(false);
      setError(null);

      const pageDetails = await new Promise((resolve, reject) => {
        window.FB.api(
          `/${page.id}?fields=id,name,fan_count,category,picture{url},access_token,link`,
          "GET",
          { access_token: page.access_token },
          (res) => {
            if (res.error) reject(res.error);
            else resolve(res);
          }
        );
      });

      console.log("[FB] Page details fetched:", pageDetails);
      setSelectedPage((prev) => ({ ...prev, ...pageDetails }));
    } catch (err) {
      console.error("[FB] Error fetching page details:", err);
      setError("Failed to fetch page details");
    }
  };

  const fetchUserPages = async (accessToken) => {
    console.log("[FB] Fetching user pages...");
    try {
      const pageResp = await new Promise((resolve) =>
        window.FB.api("/me/accounts", "GET", { access_token: accessToken }, resolve)
      );

      console.log("[FB] Pages response:", pageResp);

      if (pageResp.error) throw new Error(pageResp.error.message);

      const allPages = pageResp.data || [];
      console.log("[FB] Pages fetched:", allPages);

      if (allPages.length === 0) {
        setError("No Facebook pages found. Make sure you are admin of at least one page.");
      } else if (allPages.length === 1) {
        console.log("[FB] Single page found, auto-selecting...");
        await handlePageSelect(allPages[0]);
      } else {
        console.log("[FB] Multiple pages found, opening modal...");
        setPages(allPages);
        setShowModal(true);
      }
    } catch (err) {
      console.error("[FB] Error fetching pages:", err);
      setError("Failed to fetch Facebook pages");
    } finally {
      setLoadingId(null);
    }
  };

  const verifyPermissionsAndFetchPages = async (accessToken) => {
    console.log("[FB] Verifying permissions...");
    try {
      const permResp = await new Promise((resolve) =>
        window.FB.api("/me/permissions", { access_token: accessToken }, resolve)
      );

      console.log("[FB] Permissions response:", permResp);

      const required = ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "leads_retrieval"];
      const granted = permResp.data.filter((p) => p.status === "granted").map((p) => p.permission);
      const missing = required.filter((perm) => !granted.includes(perm));

      if (missing.length > 0) {
        console.warn("[FB] Missing permissions:", missing);
        setError(`Missing permissions: ${missing.join(", ")}. Please grant them.`);
        setLoadingId(null);
        return;
      }

      await fetchUserPages(accessToken);
    } catch (err) {
      console.error("[FB] Permission check failed:", err);
      setError("Failed to verify permissions");
      setLoadingId(null);
    }
  };

  const handleFacebookLogin = useCallback(async () => {
    console.log("[FB] Connect button clicked...");
    if (!isSDKLoaded) {
      setError("Facebook SDK not loaded");
      console.error("[FB] SDK not loaded ❌");
      return;
    }

    setLoadingId(1);
    setError(null);

    try {
      const loginStatus = await new Promise((resolve) => window.FB.getLoginStatus(resolve));
      console.log("[FB] Current login status:", loginStatus);

      if (loginStatus.status === "connected") {
        console.log("[FB] Already connected, fetching pages...");
        await fetchUserPages(loginStatus.authResponse.accessToken);
        return;
      }

      const loginResp = await new Promise((resolve) =>
        window.FB.login(resolve, {
          scope: "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,leads_retrieval,business_management",
          auth_type: "rerequest",
          return_scopes: true,
        })
      );

      console.log("[FB] Login response:", loginResp);

      if (!loginResp.authResponse) {
        setError(loginResp.status === "user_cancelled" ? "Login cancelled" : "Facebook login failed");
        setLoadingId(null);
        return;
      }

      const { accessToken } = loginResp.authResponse;
      localStorage.setItem("fb_user_token", accessToken);
      setFbStatus("connected");

      await verifyPermissionsAndFetchPages(accessToken);
    } catch (err) {
      console.error("[FB] Login error:", err);
      setError("Facebook login failed. Please try again.");
      setLoadingId(null);
    }
  }, [isSDKLoaded]);

  const handleDisconnect = () => {
    console.log("[FB] Disconnecting...");
    if (!isSDKLoaded) return clearFacebookData();

    window.FB.logout(() => {
      console.log("[FB] Logged out successfully");
      clearFacebookData();
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
      selectedPage,
    },
  ];

  return (
    <div className="grid gap-4">
      {(error || loadError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3" />
          <div>
            <p className="text-red-800 font-medium">Facebook Connection Error</p>
            <p className="text-red-600 text-sm">{error || loadError}</p>
          </div>
        </div>
      )}

      {fbStatus === "connected" && selectedPage && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <FaCheck className="text-green-500 mr-3" />
          <div>
            <p className="text-green-800 font-medium">Successfully Connected!</p>
            <p className="text-green-600 text-sm">
              Connected to {selectedPage.name} ({selectedPage.fan_count || 0} fans)
            </p>
          </div>
        </div>
      )}

      {integrationsData.map((integration) => (
        <IntegrationCard
          key={integration.id}
          {...integration}
          isLoading={loadingId === integration.id}
          isConnected={fbStatus === "connected"}
        />
      ))}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Select a Facebook Page</h2>
            <p className="text-gray-600 text-sm mb-4 text-center">Choose which page you want to connect:</p>

            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {pages.map((page) => (
                <li key={page.id}>
                  <button
                    onClick={() => handlePageSelect(page)}
                    className="flex items-center p-3 w-full border rounded-lg hover:bg-blue-50 transition duration-200"
                  >
                    <img
                      src={`https://graph.facebook.com/${page.id}/picture?type=square&width=50&height=50`}
                      alt={page.name}
                      className="w-12 h-12 rounded mr-3 object-cover"
                    />
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-800 truncate">{page.name}</p>
                      <p className="text-sm text-gray-500">{page.category} • {page.fan_count || 0} fans</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <button
              className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
              onClick={() => {
                setShowModal(false);
                setLoadingId(null);
              }}
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
  