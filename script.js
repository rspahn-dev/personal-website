document.getElementById("theme-toggle").addEventListener("click", () => {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  html.setAttribute("data-theme", currentTheme === "dark" ? "light" : "dark");
});

const canvas = document.getElementById("background-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let hue = 0;
let particles = [];

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.radius = 40;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsl(${this.hue}, 100%, 60%)`;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();
  }
}

function animate() {
  // 🛑 Do NOT clear the canvas
  requestAnimationFrame(animate);
  particles.forEach(p => p.draw());
}
animate();

window.addEventListener("mousemove", (e) => {
  if (particles.length >= 5) particles.shift(); // keep only 5
  particles.push(new Particle(e.clientX, e.clientY));
  hue = (hue + 30) % 360;
});
