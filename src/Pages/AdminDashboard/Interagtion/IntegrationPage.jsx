import React, { useState, useEffect, useCallback } from "react";
import { FaFacebook, FaCheck, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import IntegrationCard from "../../../Components/Cards/IntigrationCard";
import { getUserPages } from "../../../utils/facebookApi";

/* -------------------------------------------------------
 🧩 Hook: useFacebookSDK
------------------------------------------------------- */
const useFacebookSDK = (appId) => {
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (window.FB) {
      setIsReady(true);
      return;
    }

    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: "v19.0",
        });
        setIsReady(true);
      } catch (err) {
        setLoadError(err.message);
      }
    };

    if (!document.getElementById("facebook-jssdk")) {
      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.async = true;
      js.defer = true;
      js.onerror = () => setLoadError("Failed to load Facebook SDK");
      document.body.appendChild(js);
    }
  }, [appId]);

  return { isReady, loadError };
};

/* -------------------------------------------------------
 ⚙️ Integration Page
------------------------------------------------------- */
const IntegrationPage = () => {
  const { isReady, loadError } = useFacebookSDK(import.meta.env.VITE_FACEBOOK_APP_ID);

  const [fbStatus, setFbStatus] = useState(localStorage.getItem("fb_connected") || "false");
  const [selectedPage, setSelectedPage] = useState(null);
  const [pages, setPages] = useState([]);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);

  /* -------------------------------------------------------
   🔹 Auto-load token from localStorage
  ------------------------------------------------------- */
  useEffect(() => {
    if (fbStatus === "true" && isReady) {
      const token = localStorage.getItem("fb_user_token");
      if (token) handleFetchPages(token);
      else {
        localStorage.setItem("fb_connected", "false");
        setFbStatus("false");
      }
    }
  }, [fbStatus, isReady]);

  /* -------------------------------------------------------
   🔐 Facebook Login
  ------------------------------------------------------- */
  const handleFacebookLogin = useCallback(() => {
    if (!isReady) {
      setError("Facebook SDK not loaded yet");
      return;
    }

    setLoading(true);
    setError(null);

    window.FB.getLoginStatus((response) => {
      if (response.status === "connected") {
        const { accessToken } = response.authResponse;
        localStorage.setItem("fb_user_token", accessToken);
        localStorage.setItem("fb_connected", "true");
        setFbStatus("true");
        handleFetchPages(accessToken).finally(() => setLoading(false));
        return;
      }

      window.FB.login(
        (loginResp) => {
          if (!loginResp.authResponse) {
            setError("Login cancelled or failed");
            setLoading(false);
            return;
          }
          const { accessToken } = loginResp.authResponse;
          localStorage.setItem("fb_user_token", accessToken);
          localStorage.setItem("fb_connected", "true");
          setFbStatus("true");
          handleFetchPages(accessToken).finally(() => setLoading(false));
        },
        {
          scope:
            "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,leads_retrieval,business_management,ads_read",
          auth_type: "rerequest",
          return_scopes: true,
        }
      );
    });
  }, [isReady]);

  /* -------------------------------------------------------
   📦 Fetch User Pages
  ------------------------------------------------------- */
  const handleFetchPages = async (accessToken) => {
    try {
      const data = await getUserPages(accessToken);
      setPages(data);
      if (data.length > 0) setSelectedPage(data[0]);
    } catch (err) {
      setError(err?.message || "Failed to fetch pages");
    }
  };

  /* -------------------------------------------------------
   🔓 Disconnect Facebook
  ------------------------------------------------------- */
  const handleDisconnect = () => {
    if (!isReady) return;

    window.FB.logout(() => {
      localStorage.removeItem("fb_user_token");
      localStorage.setItem("fb_connected", "false");
      setFbStatus("false");
      setSelectedPage(null);
      setPages([]);
      setInsights({});
    });
  };

  /* -------------------------------------------------------
   📊 Fetch Page Insights
  ------------------------------------------------------- */
  const handleFetchInsights = async () => {
    if (!selectedPage) return;
    setLoadingInsights(true);

    const { id: pageId, access_token: accessToken } = selectedPage;

    const SAFE_METRICS = [
      "page_impressions",
      "page_engaged_users",
      "page_fan_adds",
      "page_fan_removes",
      "page_views_login_total",
      "page_posts_impressions_organic",
      "page_posts_impressions_paid",
    ];

    const validResults = [];

    for (const metric of SAFE_METRICS) {
      try {
        const result = await new Promise((resolve, reject) => {
          window.FB.api(
            `/${pageId}/insights`,
            "GET",
            { metric, access_token: accessToken },
            (res) => (res && !res.error ? resolve(res.data) : reject(res?.error))
          );
        });
        if (result?.length) validResults.push(...result);
      } catch {
        // Skip metric if unavailable
      }
    }

    if (!validResults.length) {
      setLoadingInsights(false);
      return setInsights({});
    }

    const formatted = {};
    validResults.forEach((metric) => {
      if (metric.values?.length)
        formatted[metric.name] = metric.values[0].value ?? 0;
    });

    setInsights(formatted);
    localStorage.setItem("fb_connected", "true");
    setLoadingInsights(false);
  };

  /* -------------------------------------------------------
   🔹 Integration Card Data
  ------------------------------------------------------- */
  const integrationsData = [
    {
      id: 1,
      name: "Facebook",
      icon: FaFacebook,
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      buttonText: loading
        ? "Connecting..."
        : fbStatus === "true"
        ? selectedPage
          ? `Connected to ${selectedPage.name}`
          : "Connected"
        : "Connect Facebook",
      buttonColor: fbStatus === "true" ? "bg-green-600" : "bg-blue-600",
      onClick: fbStatus === "true" ? handleDisconnect : handleFacebookLogin,
      status: fbStatus,
      loading,
    },
  ];

  /* -------------------------------------------------------
   🖼️ UI
  ------------------------------------------------------- */
  return (
    <div className="grid gap-5 p-2 sm:p-4">
      {(error || loadError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3 text-lg" />
          <div>
            <p className="text-red-800 font-semibold">Facebook Error</p>
            <p className="text-red-600 text-sm">{error || loadError}</p>
          </div>
        </div>
      )}

      {fbStatus === "true" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center transition-all duration-300">
          <FaCheck className="text-green-500 mr-3 text-lg" />
          <p className="text-green-800 font-medium">
            Connected {selectedPage ? `to ${selectedPage.name}` : "to Facebook"}
          </p>
        </div>
      )}

      {integrationsData.map((integration) => (
        <IntegrationCard
          key={integration.id}
          {...integration}
          isConnected={fbStatus === "true"}
        />
      ))}

      {loading && (
        <div className="flex justify-center items-center mt-3 text-blue-600">
          <FaSpinner className="animate-spin mr-2" />
          <span>Connecting to Facebook...</span>
        </div>
      )}

      {pages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mt-4 transition-all duration-300">
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">
            Your Facebook Pages
          </h3>
          <ul className="list-disc ml-6 space-y-1 text-gray-700">
            {pages.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> — ID: {p.id}
              </li>
            ))}
          </ul>

          {selectedPage && (
            <button
              onClick={handleFetchInsights}
              disabled={loadingInsights}
              className={`mt-4 px-5 py-2 rounded-md shadow transition-all duration-200 ${
                loadingInsights
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {loadingInsights ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" /> Fetching Insights...
                </span>
              ) : (
                `Fetch Insights for ${selectedPage.name}`
              )}
            </button>
          )}
        </div>
      )}

      {Object.keys(insights).length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-4 shadow-inner transition-all duration-300">
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">
            Page Insights
          </h3>
          <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-auto text-gray-700">
            {JSON.stringify(insights, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;
