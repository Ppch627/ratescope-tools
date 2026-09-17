(function () {
  "use strict";
  const config = window.RateScopeConfig || {};

  function loadScript(src, attributes = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initAnalytics() {
    const id = config.analyticsMeasurementId;
    if (!id) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`).catch(() => {});
  }

  function initAds() {
    const slots = Array.from(document.querySelectorAll("[data-ad-slot]"));
    if (!config.adsenseClient) {
      slots.forEach((slot) => { slot.hidden = true; });
      return;
    }

    loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.adsenseClient)}`, {
      crossorigin: "anonymous"
    }).then(() => {
      slots.forEach((slot) => {
        const key = slot.dataset.adSlot;
        const unit = config.adsenseSlots && config.adsenseSlots[key];
        if (!unit) {
          slot.hidden = true;
          return;
        }
        slot.replaceChildren();
        const ad = document.createElement("ins");
        ad.className = "adsbygoogle";
        ad.style.display = "block";
        ad.setAttribute("data-ad-client", config.adsenseClient);
        ad.setAttribute("data-ad-slot", unit);
        ad.setAttribute("data-ad-format", "auto");
        ad.setAttribute("data-full-width-responsive", "true");
        slot.appendChild(ad);
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    }).catch(() => {
      slots.forEach((slot) => { slot.hidden = true; });
    });
  }

  function initContact() {
    const email = config.contactEmail;
    document.querySelectorAll("[data-contact-email]").forEach((link) => {
      if (email) {
        link.textContent = email;
        link.href = `mailto:${email}`;
      } else {
        link.textContent = "Contact details will be published before launch";
        link.removeAttribute("href");
      }
    });
  }

  function initAffiliateLinks() {
    let visibleCards = 0;
    document.querySelectorAll("[data-affiliate-card]").forEach((card) => {
      const key = card.dataset.affiliateCard;
      const url = config.affiliateLinks && config.affiliateLinks[key];
      if (url) {
        card.href = url;
        card.hidden = false;
        card.setAttribute("rel", "sponsored nofollow noopener");
        card.setAttribute("target", "_blank");
        visibleCards += 1;
      } else {
        card.hidden = true;
      }
    });
    document.querySelectorAll('[data-monetization-section="affiliate"]').forEach((section) => {
      section.hidden = visibleCards === 0;
    });
  }

  function initSupport() {
    document.querySelectorAll("[data-support-link]").forEach((link) => {
      if (config.supportUrl) {
        link.href = config.supportUrl;
        link.hidden = false;
        link.setAttribute("rel", "noopener");
      } else {
        link.hidden = true;
      }
    });
  }

  initAnalytics();
  initAds();
  document.addEventListener("DOMContentLoaded", () => {
    initContact();
    initAffiliateLinks();
    initSupport();
  });
})();
