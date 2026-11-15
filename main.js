document.getElementById("year").textContent = new Date().getFullYear();

const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Offre de lancement : l'encart disparaît tout seul après sa date de fin
document.querySelectorAll('.promo[data-until]').forEach(function (el) {
  if (new Date() > new Date(el.dataset.until + 'T23:59:59')) el.remove();
});
