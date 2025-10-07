// --------------------------------------------
// 🧠 Facebook Graph API Utility
// Handles Graph API calls (Pages, Insights, Ads)
// Optimized and ready for React / Vite
// --------------------------------------------

/**
 * Fetch all pages the user manages.
 * Uses a **user access token** to get pages and page access tokens.
 *
 * @param {string} accessToken - User Access Token
 * @returns {Promise<Array>} Resolves with array of page objects: {id, name, access_token}
 */
export const getUserPages = (accessToken) => {
  return new Promise((resolve, reject) => {
    console.log("[FB API] 📡 Fetching pages for user...");
    console.log("Using Access Token:", accessToken);

    if (!accessToken) {
      reject({ message: "Access token is required" });
      return;
    }

    window.FB.api(
      "/me/accounts",
      "GET",
      { access_token: accessToken },
      (response) => {
        if (!response || response.error) {
          console.error("[FB API] ❌ Failed to fetch pages:", response?.error);
          reject(response?.error || { message: "Unknown error fetching pages" });
        } else {
          console.log("[FB API] ✅ Pages fetched successfully:", response.data);
          // Each page includes: id, name, access_token, category, perms
          resolve(response.data);
        }
      }
    );
  });
};

/**
 * Fetch insights for a specific page.
 * ⚠️ **Important:** Must provide a valid Page Access Token
 * and specify at least one metric (Facebook API requirement).
 *
 * @param {string} pageId - Facebook Page ID
 * @param {string} pageAccessToken - Page Access Token
 * @param {string[]} metrics - Array of metrics to fetch (e.g., ['page_impressions','page_engaged_users'])
 * @returns {Promise<Object>} Resolves with insights data
 */
export const getPageInsights = (pageId, pageAccessToken, metrics = []) => {
  return new Promise((resolve, reject) => {
    console.log(`[FB API] 📊 Fetching insights for Page ID: ${pageId}`);
    console.log("Using Page Access Token:", pageAccessToken);

    if (!pageId || !pageAccessToken) {
      reject({ message: "Page ID and Page Access Token are required" });
      return;
    }

    if (!metrics.length) {
      reject({ message: "At least one metric must be specified" });
      return;
    }

    // Join metrics array into a comma-separated string
    const metricParam = metrics.join(',');

    window.FB.api(
      `/${pageId}/insights`,
      "GET",
      { access_token: pageAccessToken, metric: metricParam },
      (response) => {
        if (!response || response.error) {
          console.error("[FB API] ❌ Failed to fetch insights:", response?.error);
          reject(response?.error || { message: "Unknown error fetching insights" });
        } else {
          console.log("[FB API] ✅ Insights fetched:", response.data);
          resolve(response.data);
        }
      }
    );
  });
};
