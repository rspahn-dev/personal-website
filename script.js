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
let particles = [];

// Particle Class for Trail Dots
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 1;
    this.radius = 40;
    this.hue = hue;
  }

  update() {
    this.alpha -= 0.01;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 60%, ${this.alpha})`;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();
  }
}

// Animate Trail
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.alpha > 0);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("mousemove", (e) => {
  particles.push(new Particle(e.clientX, e.clientY));
  hue = (hue + 5) % 360;
});
