// devis.js — envoi de la demande de devis via Web3Forms (https://web3forms.com).
// La clé d'accès est publique par conception : elle ne permet que d'envoyer des e-mails vers contact@mknstudio.fr.
// Tant que la clé n'est pas renseignée, repli sur un e-mail pré-rempli (mailto).
(function () {
  "use strict";
  var ACCESS_KEY = "WEB3FORMS_ACCESS_KEY"; // à remplacer par la clé reçue de Web3Forms
  var form = document.getElementById("devis-form");
  if (!form) return;
  var need = form.elements.besoin;
  var other = document.getElementById("field-other");
  var otherInput = form.elements.autre;
  var done = document.getElementById("form-done");
  var sent = document.getElementById("form-sent");
  var error = document.getElementById("form-error");
  var submitBtn = form.querySelector("button[type=submit]");

  function syncOther() {
    var isOther = need.value === "other";
    other.hidden = !isOther;
    otherInput.required = isOther;
  }
  need.addEventListener("change", syncOther);
  syncOther();

  function labelOf(el) {
    var l = form.querySelector('label[for="' + el.id + '"]');
    return l ? l.firstChild.textContent.trim().replace(/\s*\*$/, "") : el.name;
  }
  function valueOf(el) {
    if (el.tagName === "SELECT") return el.value ? el.options[el.selectedIndex].text : "";
    return el.value.trim();
  }
  function collect() {
    var fields = [];
    Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (el) {
      if (!el.name || el.name === "botcheck" || el.closest("[hidden]")) return;
      var v = valueOf(el);
      if (v) fields.push({ name: el.name, label: labelOf(el), value: v, long: el.tagName === "TEXTAREA" });
    });
    var what = need.value === "other" ? otherInput.value.trim() : valueOf(need);
    var subject = form.dataset.subject + " – " + what + " – " + form.elements.nom.value.trim();
    return { fields: fields, subject: subject };
  }
  function asText(d) {
    return d.fields.map(function (f) { return f.long ? "\n" + f.label + " :\n" + f.value : f.label + " : " + f.value; }).join("\n");
  }

  function viaMailto(d) {
    var body = asText(d);
    done.hidden = false;
    done.querySelector("[data-copy]").onclick = function () {
      var txt = d.subject + "\n\n" + body, btn = this;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(function () { btn.textContent = btn.dataset.ok; })
        .catch(function () { window.prompt("", txt); });
    };
    window.location.href = "mailto:contact@mknstudio.fr?subject=" + encodeURIComponent(d.subject) + "&body=" + encodeURIComponent(body);
  }

  function viaApi(d) {
    var payload = { access_key: ACCESS_KEY, subject: d.subject, from_name: "mknstudio.fr", botcheck: form.elements.botcheck.checked };
    payload.name = form.elements.nom.value.trim();
    payload.email = form.elements.email.value.trim();
    d.fields.forEach(function (f) { if (f.name !== "nom" && f.name !== "email") payload[f.label] = f.value; });
    submitBtn.disabled = true;
    submitBtn.textContent = submitBtn.dataset.sending;
    error.hidden = true;
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success) throw new Error(res.message);
        form.hidden = true;
        sent.hidden = false;
        sent.focus();
        if (window.gtag) window.gtag("event", "generate_lead");
      })
      .catch(function () {
        error.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.label;
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var d = collect();
    if (/^WEB3FORMS/.test(ACCESS_KEY)) viaMailto(d);
    else viaApi(d);
  });
})();
