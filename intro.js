/* Intro animée du logo MKN Studio : jouée une fois par visite, puis disparaît.
   Passée par un clic ou une touche ; ignorée si l'utilisateur a désactivé les animations. */
(function () {
  try {
    if (sessionStorage.getItem("mkn-intro")) return;
    sessionStorage.setItem("mkn-intro", "1");
  } catch (e) { /* stockage indisponible : on joue l'intro quand même */ }
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var lang = (document.documentElement.lang || "fr").slice(0, 2);
  var tagline = {
    fr: "Applis et logiciels utiles, faits en Alsace",
    en: "Useful apps and software, made in Alsace",
    de: "Nützliche Apps und Software aus dem Elsass"
  }[lang] || "Applis et logiciels utiles, faits en Alsace";

  var css = document.createElement("style");
  css.textContent =
    "#mkn-intro{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "background:radial-gradient(ellipse at 50% 40%,#2a1f63 0%,#1a1438 40%,#0F0C1B 78%);cursor:pointer;transition:opacity .5s ease}" +
    "#mkn-intro.out{opacity:0;pointer-events:none}" +
    "#mkn-intro .mi-logo{position:relative;width:min(34vw,34vh,260px);aspect-ratio:1}" +
    "#mkn-intro svg{width:100%;height:100%;display:block;overflow:visible}" +
    "#mkn-intro .mi-glow{position:absolute;width:80%;aspect-ratio:1;border-radius:50%;left:72.5%;top:30%;transform:translate(-50%,-50%);" +
    "background:radial-gradient(circle,rgba(249,115,22,.38) 0%,rgba(249,115,22,0) 65%);opacity:0;pointer-events:none}" +
    "#mkn-intro .mi-line{position:absolute;left:50%;top:80.5%;transform:translateX(-50%);height:3px;border-radius:2px;background:linear-gradient(90deg,#4338CA,#6D28D9,#F97316);width:0}" +
    "#mkn-intro .mi-title{margin-top:min(3vw,18px);font-family:'Bricolage Grotesque','Inter',system-ui,sans-serif;font-weight:800;" +
    "font-size:min(11vw,64px);letter-spacing:-.02em;color:#fff;opacity:0;white-space:nowrap}" +
    "#mkn-intro .mi-tag{margin-top:10px;font-family:'Inter',system-ui,sans-serif;font-weight:500;font-size:min(4vw,19px);color:#c4b5fd;opacity:0;" +
    "text-align:center;padding:0 16px}" +
    "#mkn-intro .mi-skip{position:absolute;bottom:22px;right:24px;font:500 13px 'Inter',system-ui,sans-serif;color:rgba(255,255,255,.45)}";
  document.head.appendChild(css);

  var el = document.createElement("div");
  el.id = "mkn-intro";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML =
    '<div class="mi-logo"><div class="mi-glow"></div>' +
    '<svg viewBox="0 0 40 40"><defs><clipPath id="mi-ground"><rect x="0" y="0" width="40" height="32.2"/></clipPath>' +
    '<linearGradient id="mi-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#6D28D9"/></linearGradient>' +
    '<linearGradient id="mi-i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b52e6"/><stop offset="1" stop-color="#4338CA"/></linearGradient></defs>' +
    '<circle class="mi-sun" cx="29" cy="12" r="4.2" fill="#F97316" opacity="0"/>' +
    '<g clip-path="url(#mi-ground)"><g class="mi-right"><path d="M5 32 L14 13 L20 24 L26 15 L35 32 Z" fill="url(#mi-a)"/></g>' +
    '<g class="mi-left"><path d="M5 32 L14 13 L20 24 L17 32 Z" fill="url(#mi-i)"/></g></g></svg><div class="mi-line"></div></div>' +
    '<div class="mi-title">MKN Studio</div>' +
    '<div class="mi-tag"></div>' +
    '<div class="mi-skip">' + ({ fr: "Passer", en: "Skip", de: "Überspringen" }[lang] || "Passer") + " ›</div>";
  el.querySelector(".mi-tag").textContent = tagline;
  (document.body || document.documentElement).appendChild(el);

  var q = function (s) { return el.querySelector(s); };
  var left = q(".mi-left"), right = q(".mi-right"), sun = q(".mi-sun"), glow = q(".mi-glow"),
      line = q(".mi-line"), title = q(".mi-title"), tag = q(".mi-tag"), logo = q(".mi-logo");

  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var seg = function (t, a, b) { return clamp((t - a) / (b - a)); };
  var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
  var easeBack = function (x) { var c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

  var END = 3.0, done = false, start = null;

  function render(t) {
    var l = easeBack(seg(t, 0.1, 0.8)), r = easeBack(seg(t, 0.3, 1.0));
    left.setAttribute("transform", "translate(0 " + (1 - l) * 22 + ")");
    right.setAttribute("transform", "translate(0 " + (1 - r) * 22 + ")");
    line.style.width = (logo.offsetWidth * 0.78 * easeOut(seg(t, 0, 0.7))) + "px";
    var s = easeBack(seg(t, 0.8, 1.5));
    sun.setAttribute("cy", 32 - 20 * s);
    sun.setAttribute("r", 4.2 * (0.6 + 0.4 * easeOut(seg(t, 0.8, 1.5))));
    sun.setAttribute("opacity", seg(t, 0.8, 1.0));
    glow.style.top = ((32 - 20 * s) / 40 * 100) + "%";
    glow.style.opacity = seg(t, 1.0, 1.6) * (0.8 + 0.2 * Math.sin(Math.max(0, t - 1.6) * 4));
    var ti = easeOut(seg(t, 1.4, 2.0));
    title.style.opacity = ti;
    title.style.transform = "translateY(" + (1 - ti) * 18 + "px)";
    title.style.letterSpacing = (-0.02 + 0.12 * (1 - ti)) + "em";
    var tg = easeOut(seg(t, 1.8, 2.4));
    tag.style.opacity = tg;
    tag.style.transform = "translateY(" + (1 - tg) * 10 + "px)";
  }

  function finish() {
    if (done) return;
    done = true;
    el.classList.add("out");
    setTimeout(function () { el.remove(); css.remove(); }, 550);
    document.removeEventListener("keydown", finish);
  }

  function frame(now) {
    if (done) return;
    if (start === null) start = now;
    var t = (now - start) / 1000;
    render(t);
    if (t >= END) finish(); else requestAnimationFrame(frame);
  }

  el.addEventListener("click", finish);
  document.addEventListener("keydown", finish);
  render(0);
  requestAnimationFrame(frame);
  setTimeout(finish, 6000); // filet de sécurité si l'onglet est en arrière-plan
})();
