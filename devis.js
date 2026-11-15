// devis.js — prépare un e-mail de demande de devis dans la messagerie du visiteur.
// Rien n'est envoyé à un serveur.
(function () {
  "use strict";
  var form = document.getElementById("devis-form");
  if (!form) return;
  var need = form.elements.besoin;
  var other = document.getElementById("field-other");
  var otherInput = form.elements.autre;
  var done = document.getElementById("form-done");

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

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var lines = [];
    Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (el) {
      if (!el.name || el.closest("[hidden]")) return;
      var v = valueOf(el);
      if (!v) return;
      if (el.tagName === "TEXTAREA") lines.push("", labelOf(el) + " :", v);
      else lines.push(labelOf(el) + " : " + v);
    });
    var body = lines.join("\n");
    var what = need.value === "other" ? otherInput.value.trim() : valueOf(need);
    var subject = form.dataset.subject + " – " + what + " – " + form.elements.nom.value.trim();
    var href = "mailto:contact@mknstudio.fr?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    done.hidden = false;
    done.querySelector("[data-copy]").onclick = function () {
      var txt = subject + "\n\n" + body;
      var btn = this;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(function () { btn.textContent = btn.dataset.ok; })
        .catch(function () { window.prompt("", txt); });
    };
    window.location.href = href;
  });
})();
