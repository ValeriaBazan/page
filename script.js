const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let text = "Valeria Bazán Molero.";
let currentIndex = 0;
let drawingText = true;
let particles = [];
let explosionStarted = false;
let gradientColor;

// Fuente y estilo
ctx.font = "95px 'Tangiela', cursive"; // AUMENTADO
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// Gradiente tornasolado
function createGradient() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#ff8fa3");
  gradient.addColorStop(0.5, "#e09eff");
  gradient.addColorStop(1, "#f7c873");
  return gradient;
}

// Animar escritura tipo máquina de escribir
function animateText() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  gradientColor = createGradient();
  ctx.fillStyle = gradientColor;
  ctx.fillText(text.substring(0, currentIndex), canvas.width / 2, canvas.height / 2);

  if (currentIndex < text.length) {
    currentIndex++;
    setTimeout(animateText, 150);
  } else {
    setTimeout(() => {
      drawSignatureLine();
      setTimeout(() => {
        explosionStarted = true;
        triggerExplosion();
      }, 1000); // espera breve tras firma
    }, 400);
  }
}

// Dibujo de línea de firma
function drawSignatureLine() {
  ctx.strokeStyle = gradientColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 150, canvas.height / 2 + 70);
  ctx.lineTo(canvas.width / 2 + 150, canvas.height / 2 + 70);
  ctx.stroke();
}

// Partícula tornasolada
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 3 + 2;
    this.color = gradientColor;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.opacity = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Rebote
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    this.opacity -= 0.005;
    if (this.opacity < 0) this.opacity = 0;

    // Hinchamiento suave
    this.radius += 0.05;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// Generar partículas
function triggerExplosion() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  for (let i = 0; i < 800; i++) {
    particles.push(new Particle(centerX, centerY));
  }

  animateParticles();
}

function animateParticles() {
  ctx.fillStyle = "#fef9f4"; // Blanco perla semitransparente
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle, index) => {
    particle.update();
    particle.draw();
  });

  // Mientras las partículas llenan, seguimos animando
  if (particles.length > 0) {
    requestAnimationFrame(animateParticles);
  }

  // Luego del efecto principal, derretimos
  setTimeout(() => {
    startMeltTransition();
  }, 3000);
}

// Derretimiento del canvas como helado
function startMeltTransition() {
  let meltY = 0;
  const meltSpeed = 10;

  const meltInterval = setInterval(() => {
    ctx.fillStyle = gradientColor;
    ctx.fillRect(0, meltY, canvas.width, meltSpeed);
    meltY += meltSpeed;

    if (meltY >= canvas.height) {
      clearInterval(meltInterval);

      setTimeout(() => {
        canvas.style.display = "none";
        doc

