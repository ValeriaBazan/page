const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const text = "Valeria Bazan Molero";
const fontSize = 70;
const textColor = "#ffffff";

// Ocultar menú al inicio
document.getElementById("menu-icon").style.display = "none";

// Configurar fuente y mostrar texto desde el principio
ctx.font = `${fontSize}px cursive`;
ctx.fillStyle = textColor;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText(text, centerX, centerY);

// Esperar 2 segundos y luego lanzar explosión
setTimeout(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(text + ".", centerX, centerY);
  createExplosion(centerX, centerY);
}, 2000);

// 🎇 Generar partículas
let particles = [];

function createExplosion(x, y) {
  const totalParticles = 1500;
  for (let i = 0; i < totalParticles; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 8 + 2; // Velocidad variada
    particles.push({
      x: x,
      y: y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      radius: Math.random() * 3 + 1,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.005,
      color: textColor
    });
  }
  animateExplosion();
}

// 💥 Animar partículas
function animateExplosion() {
  let duration = 0;
  const explosionAnimation = setInterval(() => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, index) => {
      ctx.beginPath();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      p.alpha -= p.decay;
    });

    // Quitar partículas invisibles
    particles = particles.filter(p => p.alpha > 0);

    ctx.globalAlpha = 1;
    duration += 16;

    if (duration > 3000) {
      clearInterval(explosionAnimation);
      transitionToFinalScene();
    }
  }, 16);
}

// 🧊 Transición suave: derretimiento + nuevo texto
function transitionToFinalScene() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  let melt = setInterval(() => {
    for (let y = canvas.height - 1; y > 0; y--) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const iAbove = ((y - 1) * canvas.width + x) * 4;
        pixels[i] = pixels[iAbove];
        pixels[i + 1] = pixels[iAbove + 1];
        pixels[i + 2] = pixels[iAbove + 2];
        pixels[i + 3] = pixels[iAbove + 3];
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, 30);

  // Finalizar transición y mostrar texto superior + menú
  setTimeout(() => {
    clearInterval(melt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `50px cursive`;
    ctx.fillStyle = textColor;
    ctx.fillText(text, centerX, 80);

    // Mostrar menú hamburguesa
    document.getElementById("menu-icon").style.display = "block";
  }, 3000);
}

// Menú hamburguesa
document.getElementById("menu-icon").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("hidden");
});
