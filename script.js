const canvas = document.getElementById("animation-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fontSize = Math.min(canvas.width * 0.1, 145); // Más grande el texto
ctx.font = `${fontSize}px Tangiela`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

const text = "Valeria Bazán Molero.";
let textIndex = 0;
let writingDone = false;
let particles = [];
let explosionStarted = false;
let explosionComplete = false;
let meltProgress = 0;
let melted = false;
let animationFrame;

const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, "#FF8FA3");   // Rosa
gradient.addColorStop(0.5, "#E09EFF"); // Lila
gradient.addColorStop(1, "#F7C873");   // Naranja

// --- 1. ANIMACION TEXTO ---
function drawTextFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = gradient;
  ctx.font = `${fontSize}px Tangiela`;

  const displayText = text.slice(0, textIndex);
  ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);

  if (textIndex < text.length) {
    textIndex++;
    setTimeout(drawTextFrame, 100);
  } else {
    writingDone = true;
    setTimeout(startExplosion, 500);
  }
}

// --- 2. PARTICULAS Y EXPLOSION MÁS DURAS Y TORNASOLADAS ---
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 3 + 3; // Más grandes
    this.speedX = (Math.random() - 0.5) * 7; // Más velocidad
    this.speedY = (Math.random() - 0.5) * 7;
    this.opacity = 1;
    // Color tornasolado: calculamos un color con gradiente para cada partícula
    const t = Math.random();
    if (t < 0.33) this.color = "rgba(255,143,163,1)";    // Rosa
    else if (t < 0.66) this.color = "rgba(224,158,255,1)"; // Lila
    else this.color = "rgba(247,200,115,1)";             // Naranja
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x <= 0 || this.x >= canvas.width) this.speedX *= -1;
    if (this.y <= 0 || this.y >= canvas.height) this.speedY *= -1;

    // Las partículas crecen lentamente mientras mantienen la opacidad alta
    this.radius *= 1.01;
    if (this.opacity > 0.1) {
      this.opacity -= 0.0015;  // Lenta reducción de opacidad para durar más
    }
  }

  draw() {
    ctx.beginPath();
    // Se usa el color tornasolado con opacidad variable
    const rgba = this.color.replace(/1\)$/, `${this.opacity})`);
    ctx.fillStyle = rgba;
    ctx.shadowColor = rgba;
    ctx.shadowBlur = 5;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function startExplosion() {
  explosionStarted = true;
  particles = [];

  for (let i = 0; i < 700; i++) {
    // Posición inicial: letras (centro) + pequeña dispersión
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 40;
    const x = canvas.width / 2 + Math.cos(angle) * distance;
    const y = canvas.height / 2 + Math.sin(angle) * distance;
    particles.push(new Particle(x, y));
  }

  animateExplosion();
}

function animateExplosion() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  // Comprobamos si las partículas siguen visibles y el fondo no está lleno aún
  if (!explosionComplete) {
    // Si las partículas casi no tienen opacidad, pasamos a explosión completa
    const anyVisible = particles.some(p => p.opacity > 0.15);
    if (!anyVisible) {
      explosionComplete = true;
      // Animar 1 segundo más hasta completar llenado
      setTimeout(() => {
        startMelting();
      }, 1000);
      return;
    }
    animationFrame = requestAnimationFrame(animateExplosion);
  }
}

// --- 3. DERRETIMIENTO TIPO HELADO (igual que antes) ---
function startMelting() {
  function meltFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const waveHeight = 30;
    const wave = (x) => Math.sin((x + Date.now() / 200) * 0.02) * waveHeight;

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= canvas.width; x++) {
      ctx.lineTo(x, meltProgress + wave(x));
    }
    ctx.lineTo(canvas.width, 0);
    ctx.closePath();
    ctx.fill();

    meltProgress += 3;

    if (meltProgress < canvas.height) {
      requestAnimationFrame(meltFrame);
    } else {
      melted = true;
      showHomePage();
    }
  }

  meltFrame();
}

// --- 4. MOSTRAR HOME CON COLOR BLANCO PERLA EN TÍTULO ---
function showHomePage() {
  canvas.style.display = "none";

  const title = document.getElementById("title-text");
  title.style.display = "block";
  title.style.color = "#F5F5F0"; // Blanco perla

  document.getElementById("carousel-container").style.display = "flex";
  document.getElementById("contact-banner").style.display = "block";
  document.getElementById("menu-icon").style.display = "block";
}

// --- 5. CARRUSEL RESPONSIVE Y FLECHAS MÁS PEQUEÑAS ---
let currentIndex = 0;
const images = document.querySelectorAll(".carousel-image");
const leftArrow = document.getElementById("left-arrow");
const rightArrow = document.getElementById("right-arrow");

function updateCarousel(index) {
  images.forEach((img, i) => {
    img.classList.remove("active");
    if (i === index) img.classList.add("active");
  });
}

leftArrow.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateCarousel(currentIndex);
});

rightArrow.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % images.length;
  updateCarousel(currentIndex);
});

setInterval(() => {
  currentIndex = (currentIndex + 1) % images.length;
  updateCarousel(currentIndex);
}, 4000);

// --- 6. INICIAR ---
window.onload = () => {
  drawTextFrame();
};
