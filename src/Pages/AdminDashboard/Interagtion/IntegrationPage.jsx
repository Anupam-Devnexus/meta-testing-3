import React, { useState, useEffect, useCallback } from "react";
import { FaFacebook, FaCheck, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import IntegrationCard from "../../../Components/Cards/IntigrationCard";
import { getUserPages } from "../../../utils/facebookApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Initialize Toastify

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
      else setFbStatus("false");
    }
  }, [fbStatus, isReady]);

  /* -------------------------------------------------------
   🔐 Facebook Login
  ------------------------------------------------------- */
  const handleFacebookLogin = useCallback(() => {
    if (!isReady) return toast.error("Facebook SDK not loaded yet");

    setLoading(true);
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
            setLoading(false);
            return toast.error("Facebook login cancelled or failed");
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
      toast.success("Pages loaded successfully!");
    } catch (err) {
      toast.error(err?.message || "Failed to fetch pages");
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
      toast.info("Facebook disconnected");
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

    const results = [];

    for (const metric of SAFE_METRICS) {
      try {
        const res = await new Promise((resolve, reject) => {
          window.FB.api(`/${pageId}/insights`, "GET", { metric, access_token: accessToken }, (r) =>
            r && !r.error ? resolve(r.data) : reject(r?.error)
          );
        });
        if (res?.length) results.push(...res);
      } catch {
        // skip unavailable metrics
      }
    }

    if (!results.length) {
      setInsights({});
      setLoadingInsights(false);
      return toast.warning("No insights available for this page");
    }

    const formatted = {};
    results.forEach((metric) => {
      if (metric.values?.length) formatted[metric.name] = metric.values[0].value ?? 0;
    });

    setInsights(formatted);
    setLoadingInsights(false);
    toast.success("Insights fetched successfully!");
  };

  /* -------------------------------------------------------
   🔹 Integration Card Data
  ------------------------------------------------------- */
  const integrationsData = [
    {
      id: 1,
      name: "Facebook",
      icon: FaFacebook,
      bgColor: "bg-[#002b5b",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      buttonText:
        loading ? "Connecting..." : fbStatus === "true" ? (selectedPage ? `Connected to ${selectedPage.name}` : "Connected") : "Connect Facebook",
      buttonColor: fbStatus === "true" ? "bg-green-600" : "bg-[#002b5b",
      onClick: fbStatus === "true" ? handleDisconnect : handleFacebookLogin,
      status: fbStatus,
      loading,
    },
  ];

  /* -------------------------------------------------------
   🖼️ Render UI
  ------------------------------------------------------- */
  return (
    <div className="flex  items-center gap-5 p-2 sm:p-4">
      {/* Error Alerts */}
      {(loadError || fbStatus === "false") && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3 text-lg" />
          <div>
            <p className="text-red-800 font-semibold">Facebook Error</p>
            <p className="text-red-600 text-sm">{loadError || "Not connected"}</p>
          </div>
        </div>
      )}

      {/* Connected Status */}
      {fbStatus === "true" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center transition-all duration-300">
          <FaCheck className="text-green-500 mr-3 text-lg" />
          <p className="text-green-800 font-medium">
            Connected {selectedPage ? `to ${selectedPage.name}` : "to Facebook"}
          </p>
        </div>
      )}

      {/* Integration Card */}
      {integrationsData.map((integration) => (
        <IntegrationCard
          key={integration.id}
          {...integration}
          isConnected={fbStatus === "true"}
        />
      ))}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center mt-3 text-[#002b5b]">
          <FaSpinner className="animate-spin mr-2" />
          <span>Connecting to Facebook...</span>
        </div>
      )}

      {/* Pages List */}
      {pages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mt-4 transition-all duration-300">
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">Your Facebook Pages</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {pages.map((p) => (
              <li
                key={p.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedPage?.id === p.id
                    ? "bg-indigo-50 border-[#002b5b"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedPage(p)}
              >
                <strong>{p.name}</strong> — ID: {p.id}
              </li>
            ))}
          </ul>

          {/* Fetch Insights Button */}
          {selectedPage && (
            <button
              onClick={handleFetchInsights}
              disabled={loadingInsights}
              className={`mt-4 px-5 py-2 rounded-md shadow transition-all duration-200 ${
                loadingInsights
                  ? "bg-[#002b5b] cursor-not-allowed"
                  : "bg-[#002b5b] hover:bg-[#002b5b] text-white"
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

      {/* Insights Cards */}
      {Object.keys(insights).length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(insights).map(([key, value]) => {
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            const colors = {
              page_impressions: "bg-blue-50 text-blue-800",
              page_engaged_users: "bg-green-50 text-green-800",
              page_fan_adds: "bg-indigo-50 text-indigo-800",
              page_fan_removes: "bg-red-50 text-red-800",
              page_views_login_total: "bg-yellow-50 text-yellow-800",
              page_posts_impressions_organic: "bg-purple-50 text-purple-800",
              page_posts_impressions_paid: "bg-pink-50 text-pink-800",
            };
            const colorClass = colors[key] || "bg-gray-50 text-gray-800";

            return (
              <div
                key={key}
                className={`flex flex-col justify-between p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 ${colorClass}`}
              >
                <h4 className="text-sm font-semibold mb-2">{label}</h4>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;
