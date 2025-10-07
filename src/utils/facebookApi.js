// --------------------------------------------
// 🧠 Facebook Graph API Utility
// Handles Graph API calls (Pages, Insights, Ads)
// --------------------------------------------

/**
 * Fetch all pages the user manages
 * @param {string} accessToken
 * @returns {Promise<Array>} List of pages
 */
export const getUserPages = (accessToken) => {
  return new Promise((resolve, reject) => {
    console.log("[FB API] 📡 Fetching pages for user...");
    console.log("Using Access Token:", accessToken);
    window.FB.api(
      "/me/accounts",
      "GET",
      { access_token: accessToken },
      (response) => {
        if (!response || response.error) {
          console.error("[FB API] ❌ Failed to fetch pages:", response.error);
          reject(response?.error);
        } else {
          console.log("[FB API] ✅ Pages fetched successfully:", response.data);
          resolve(response.data);
        }
      }
    );
  });
};

/**
 * Fetch insights (metrics) for a specific page
 * @param {string} pageId
 * @param {string} accessToken
 * @returns {Promise<Object>} Insights data
 */
export const getPageInsights = (pageId, accessToken) => {
  return new Promise((resolve, reject) => {
    console.log(`[FB API] 📊 Fetching insights for Page ID: ${pageId}`);
console.log("Using Access Token:", accessToken);
    window.FB.api(
      `/${pageId}/insights`,
      "GET",
      { access_token: accessToken },
      (response) => {
        if (!response || response.error) {
          console.error("[FB API] ❌ Failed to fetch insights:", response.error);
          reject(response?.error);
        } else {
          console.log("[FB API] ✅ Insights fetched:", response.data);
          resolve(response.data);
        }
      }
    );
  });
};
