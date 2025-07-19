const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// === CONFIGURACIÓN ===
const fullText = "Valeria Bazán Molero.";
const fontSize = Math.min(canvas.width * 0.08, 90); // Escala con ancho
ctx.font = `${fontSize}px 'Tangiela', cursive`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

let currentText = "";
let index = 0;
let particles = [];
let exploded = false;
let showFinal = false;
let startMelt = false;
let meltProgress = 0;

// === FUNCIONES AUXILIARES ===
function drawBackground() {
  ctx.fillStyle = "#fdfaf6"; // blanco perla
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawText() {
  // Simula un gradiente tornasolado
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#f78da7");
  gradient.addColorStop(0.5, "#e09eff");
  gradient.addColorStop(1, "#f7c873");

  ctx.fillStyle = gradient;
  ctx.fillText(currentText, canvas.width / 2, canvas.height / 2);
}

function typeWriter() {
  if (index < fullText.length) {
    currentText += fullText[index];
    index++;
    render();
    setTimeout(typeWriter, 140);
  } else {
    setTimeout(() => explodeParticles(), 400);
  }
}

function explodeParticles() {
  exploded = true;
  for (let i = 0; i < 600; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 10,
      speedY: (Math.random() - 0.5) * 10,
      color: ["#f78da7", "#e09eff", "#f7c873"][Math.floor(Math.random() * 3)],
      alpha: 1
    });
  }

  setTimeout(() => {
    startMelt = true;
  }, 3000);
}

function updateParticles() {
  for (let p of particles) {
    p.x += p.speedX;
    p.y += p.speedY;

    // Rebote en bordes
    if (p.x <= 0 || p.x >= canvas.width) p.speedX *= -1;
    if (p.y <= 0 || p.y >= canvas.height) p.speedY *= -1;

    // Expansión progresiva
    p.radius += 0.05;
  }
}

function drawParticles() {
  for (let p of particles) {
    ctx.beginPath();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function meltEffect() {
  meltProgress += 0.01;
  ctx.fillStyle = "#fdfaf6";
  ctx.fillRect(0, canvas.height * meltProgress, canvas.width, canvas.height);
  if (meltProgress >= 1) {
    showFinal = true;
    document.getElementById('animationCanvas').style.display = "none";
    document.getElementById('title-text').style.display = "block";
    document.getElementById('carousel-container').style.display = "block";
    document.getElementById('menu-icon').style.display = "block";
  }
}

function render() {
  drawBackground();

  if (!exploded) {
    drawText();
  } else {
    updateParticles();
    drawParticles();
  }

  if (startMelt) {
    meltEffect();
  }

  requestAnimationFrame(render);
}

// === INICIO ===
window.onload = () => {
  document.getElementById('title-text').style.display = "none";
  document.getElementById('carousel-container').style.display = "none";
  document.getElementById('menu-icon').style.display = "none";

  setTimeout(() => {
    render();
    typeWriter();
  }, 500);
};
