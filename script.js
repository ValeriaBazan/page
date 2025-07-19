const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fontSize = Math.min(canvas.width * 0.1, 160);
ctx.font = `${fontSize}px Tangiela`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

const text = "Valeria Bazán Molero.";
let textIndex = 0;
let particles = [];
let explosionStartTime = null;
let meltProgress = 0;

// Gradiente tornasolado para derretimiento
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, "#FF8FA3");
gradient.addColorStop(0.5, "#E09EFF");
gradient.addColorStop(1, "#F7C873");

// ---- 1. ANIMACIÓN TEXTO ----
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
    explosionStartTime = Date.now();
    setTimeout(startExplosion, 300);
  }
}

// ---- 2. PARTÍCULAS ----
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 3 + 2.5;
    this.speedX = (Math.random() - 0.5) * 8;
    this.speedY = (Math.random() - 0.5) * 8;
    this.opacity = 1;
    const colors = ["#FF8FA3", "#E09EFF", "#F7C873"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.radius *= 1.01;
    this.opacity -= 0.01;
    this.opacity = Math.max(this.opacity, 0);
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function startExplosion() {
  for (let i = 0; i < 400; i++) {
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
  ctx.fillStyle = "#fdfaf5"; // fondo blanco perla
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  if (Date.now() - explosionStartTime < 3000) {
    requestAnimationFrame(animateExplosion);
  } else {
    startMelting();
  }
}

// ---- 3. DERRETIMIENTO ----
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

    meltProgress += 4;

    if (meltProgress < canvas.height) {
      requestAnimationFrame(meltFrame);
    } else {
      showHomePage();
    }
  }

  meltFrame();
}

// ---- 4. MOSTRAR PÁGINA PRINCIPAL ----
function showHomePage() {
  document.getElementById("animationCanvas").style.display = "none";
  document.getElementById("title-text").style.display = "block";
  document.getElementById("carousel-container").style.display = "flex";
  document.getElementById("contact-banner").style.display = "block";
  document.getElementById("menu-icon").style.display = "block";
}

// ---- 5. CARRUSEL AUTOMÁTICO ----
let currentIndex = 0;
const images = document.querySelectorAll(".carousel-image");

function updateCarousel(index) {
  images.forEach((img, i) => {
    img.classList.remove("active");
    if (i === index) img.classList.add("active");
  });
}

setInterval(() => {
  currentIndex = (currentIndex + 1) % images.length;
  updateCarousel(currentIndex);
}, 4000);

// ---- 6. INICIAR ----
window.onload = () => {
  drawTextFrame();
};

