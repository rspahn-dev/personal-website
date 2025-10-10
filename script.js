// Toggle Dark Mode
document.getElementById("theme-toggle").addEventListener("click", () => {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  html.setAttribute("data-theme", currentTheme === "dark" ? "light" : "dark");
});

// Canvas Setup
const canvas = document.getElementById("background-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Trail Variables
let hue = 0;

// Rainbow Circle Draw
function drawRainbowCircle(x, y) {
  const radius = 40;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();
  hue = (hue + 5) % 360;
}

// Gentle Fade Without Darkening
function fadeCanvas() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.02)"; // light fade
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Animate on mouse move
window.addEventListener("mousemove", (e) => {
  fadeCanvas();
  drawRainbowCircle(e.clientX, e.clientY);
});
