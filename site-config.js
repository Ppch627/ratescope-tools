/*
 * RateScope launch configuration
 * Edit the values in this one file before deployment.
 * Leave a monetization value empty to keep that feature disabled.
 */
window.RateScopeConfig = {
  siteUrl: "https://ppch627.github.io/ratescope-tools",
  contactEmail: "",

  // Google Analytics 4 measurement ID, for example "G-XXXXXXXXXX".
  analyticsMeasurementId: "",

  // Google AdSense publisher ID, for example "ca-pub-1234567890123456".
  adsenseClient: "",

  // Replace each blank value with the numeric ad-unit slot created in AdSense.
  adsenseSlots: {
    "home-middle": "",
    "hourly-after-calculator": "",
    "quote-after-calculator": "",
    "late-fee-after-calculator": "",
    "margin-after-calculator": "",
    "guides-index": ""
  },

  // Add approved affiliate URLs after you join a program. Empty values keep controls hidden.
  affiliateLinks: {
    accounting: "",
    invoicing: "",
    projectManagement: ""
  },

  // Optional direct support or digital-product URL.
  supportUrl: ""
};
