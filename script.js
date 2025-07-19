const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fontSize = Math.min(canvas.width * 0.1, 140);
ctx.font = `${fontSize}px Tangiela`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

const text = "Valeria Bazán Molero";
let textIndex = 0;
let particles = [];
let writingDone = false;
let explosionComplete = false;
let meltProgress = 0;

// Tornasolado para texto y partículas
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, "#FF8FA3");
gradient.addColorStop(0.5, "#E09EFF");
gradient.addColorStop(1, "#F7C873");

// ---- 1. ANIMACIÓN DE TEXTO ESCRITO ----
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

// ---- 2. CLASE DE PARTÍCULA ----
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 4 + 3;
    this.speedX = (Math.random() - 0.5) * 10;
    this.speedY = (Math.random() - 0.5) * 10;
    this.opacity = 1;
    this.color = getTornasolColor();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x <= 0 || this.x >= canvas.width) this.speedX *= -1;
    if (this.y <= 0 || this.y >= canvas.height) this.speedY *= -1;

    this.radius *= 1.01;
    this.opacity -= 0.005;
    this.opacity = Math.max(this.opacity, 0);
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = `${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function getTornasolColor() {
  const colors = ["#FF8FA3", "#E09EFF", "#F7C873"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ---- 3. EXPLOSIÓN ----
function startExplosion() {
  for (let i = 0; i < 1000; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 50;
    const x = canvas.width / 2 + Math.cos(angle) * dist;
    const y = canvas.height / 2 + Math.sin(angle) * dist;
    particles.push(new Particle(x, y));
  }
  animateExplosion();
}

function animateExplosion() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fdfaf5"; // fondo blanco perla
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  if (particles.length < 3000) {
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push(new Particle(x, y));
    }
  }

  if (particles.length > 3000) {
    setTimeout(() => {
      startMelting();
    }, 2000); // Espera 2 segundos antes de derretir
    return;
  }

  requestAnimationFrame(animateExplosion);
}

// ---- 4. DERRETIMIENTO ----
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

// ---- 5. MOSTRAR HOME ----
function showHomePage() {
  document.getElementById("animationCanvas").style.display = "none";
  document.getElementById("title-text").style.display = "block";
  document.getElementById("carousel-container").style.display = "flex";
  document.getElementById("contact-banner").style.display = "block";
  document.getElementById("menu-icon").style.display = "block";
}

// ---- 6. CARRUSEL DE IMÁGENES ----
let currentIndex = 0;
const images = document.querySelectorAll(".carousel-image");

function updateCarousel(index) {
  images.forEach((img, i) => {
    img.classList.remove("active");
    img.style.opacity = "0";
    if (i === index) {
      img.classList.add("active");
      img.style.opacity = "1";
    }
  });
}

setInterval(() => {
  currentIndex = (currentIndex + 1) % images.length;
  updateCarousel(currentIndex);
}, 4000);

// ---- 7. INICIO ----
window.onload = () => {
  drawTextFrame();
};
