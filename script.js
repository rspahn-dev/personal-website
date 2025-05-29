document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();
  document.getElementById("formResponse").textContent = "Thanks! I'll be in touch.";
});
