// consent.js — MKN Studio
// Bandeau de consentement + chargement de Google Analytics 4 uniquement après accord.
// Rien n'est envoyé à Google tant que le visiteur n'a pas cliqué sur « Accepter ».
(function () {
  "use strict";

  var GA_ID = "G-MK9EGV1Q6C"; // ID de mesure GA4 (compte « MKN Studio », flux mknstudio.fr)
  var KEY = "mkn-consent";
  var MAX_AGE = 1000 * 60 * 60 * 24 * 395; // ~13 mois (recommandation CNIL)

  function getConsent() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY));
      if (!raw || Date.now() - raw.date > MAX_AGE) return null;
      return raw.value;
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ value: value, date: Date.now() }));
    } catch (e) {}
  }

  function loadGA() {
    if (window.__mknGaLoaded || /X{6,}/.test(GA_ID)) return;
    window.__mknGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  function removeGACookies() {
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name.indexOf("_ga") === 0) {
        document.cookie = name + "=; Max-Age=0; path=/; domain=.mknstudio.fr";
        document.cookie = name + "=; Max-Age=0; path=/";
      }
    });
  }

  function injectStyles() {
    if (document.getElementById("mkn-consent-style")) return;
    var css =
      "#mkn-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:620px;margin:0 auto;" +
      "padding:18px 20px;background:#1C1733;color:#EDEBFA;border:1px solid #2C2648;border-radius:18px;" +
      "box-shadow:0 18px 40px rgba(0,0,0,.45);font:15px/1.55 Inter,system-ui,sans-serif}" +
      "#mkn-consent p{margin:0}" +
      "#mkn-consent a{color:#FB923C}" +
      "#mkn-consent .mkn-consent-btns{display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}" +
      "#mkn-consent button{min-width:120px;padding:10px 18px;border-radius:999px;font:inherit;font-weight:600;" +
      "cursor:pointer;border:1px solid #6D28D9;background:transparent;color:#EDEBFA}" +
      "#mkn-consent button[data-v=granted]{background:#6D28D9}" +
      "#mkn-consent button:focus-visible{outline:2px solid #FB923C;outline-offset:2px}";
    var st = document.createElement("style");
    st.id = "mkn-consent-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function showBanner() {
    if (document.getElementById("mkn-consent")) return;
    injectStyles();
    var el = document.createElement("div");
    el.id = "mkn-consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Mesure d'audience");
    el.innerHTML =
      "<p>Ce site mesure son audience avec Google Analytics, uniquement si vous l'acceptez. " +
      'Votre choix est conservé 13 mois. <a href="/confidentialite.html">En savoir plus</a></p>' +
      '<div class="mkn-consent-btns">' +
      '<button type="button" data-v="denied">Refuser</button>' +
      '<button type="button" data-v="granted">Accepter</button>' +
      "</div>";
    el.addEventListener("click", function (e) {
      var v = e.target && e.target.getAttribute("data-v");
      if (!v) return;
      setConsent(v);
      el.remove();
      if (v === "granted") loadGA();
      else removeGACookies();
    });
    document.body.appendChild(el);
  }

  // Lien « Gérer les cookies » : <a href="#" data-consent-open>
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest && e.target.closest("[data-consent-open]");
    if (t) {
      e.preventDefault();
      showBanner();
    }
  });

  var c = getConsent();
  if (c === "granted") loadGA();
  else if (c === null) {
    if (document.body) showBanner();
    else document.addEventListener("DOMContentLoaded", showBanner);
  }
})();
