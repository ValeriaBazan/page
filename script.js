const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");

// Ajustar canvas a tamaño de ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuración de fuente
let fontSize = Math.min(canvas.width * 0.1, 140);
ctx.font = `${fontSize}px Tangiela`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// Texto a mostrar con animación manuscrita
const text = "Valeria Bazán Molero.";
let textIndex = 0;
let writingDone = false;

// Variables de partículas
let particles = [];
let explosionStartTime = 0;
let meltProgress = 0;

// Gradiente tornasolado
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, "#FF8FA3");
gradient.addColorStop(0.5, "#E09EFF");
gradient.addColorStop(1, "#F7C873");

// ---- 1. Animación de escritura letra por letra ----
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
    explosionStartTime = Date.now();
    setTimeout(startExplosion, 500);
  }
}

// ---- 2. Clase de partículas tornasoladas ----
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 5 + 4;
    this.speedX = (Math.random() - 0.5) * 14;
    this.speedY = (Math.random() - 0.5) * 14;
    this.opacity = 1;

    const colors = ["#FF8FA3", "#E09EFF", "#F7C873"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Rebote en los bordes
    if (this.x <= 0 || this.x >= canvas.width) this.speedX *= -1;
    if (this.y <= 0 || this.y >= canvas.height) this.speedY *= -1;

    // Crecimiento suave y reducción de opacidad
    this.radius *= 1.01;
    this.opacity = Math.max(0, this.opacity - 0.008);
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

// ---- 3. Inicio de explosión de partículas ----
function startExplosion() {
  for (let i = 0; i < 1000; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 100;
    const x = canvas.width / 2 + Math.cos(angle) * distance;
    const y = canvas.height / 2 + Math.sin(angle) * distance;
    particles.push(new Particle(x, y));
  }

  animateExplosion();
}

// ---- 4. Animación continua de partículas ----
function animateExplosion() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fondo blanco perla constante
  ctx.fillStyle = "#fdfaf5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Actualizar partículas existentes
  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  // Agregar nuevas partículas continuamente durante 3 segundos
  if (Date.now() - explosionStartTime < 3000) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100;
      const x = canvas.width / 2 + Math.cos(angle) * distance;
      const y = canvas.height / 2 + Math.sin(angle) * distance;
      particles.push(new Particle(x, y));
    }
    requestAnimationFrame(animateExplosion);
  } else {
    startMelting();
  }
}

// ---- 5. Efecto de derretimiento tornasolado ----
function startMelting() {
  function meltFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const waveHeight = 40;
    const wave = (x) => Math.sin((x + Date.now() / 150) * 0.02) * waveHeight;

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
      showHomePage();
    }
  }

  meltFrame();
}

// ---- 6. Mostrar elementos tras animación ----
function showHomePage() {
  document.getElementById("animationCanvas").style.display = "none";
  document.getElementById("title-text").style.display = "block";
  document.getElementById("carousel-container").style.display = "flex";
  document.getElementById("contact-banner").style.display = "block";
  document.getElementById("menu-icon").style.display = "block";
}

// ---- 7. Carrusel automático sin flash blanco ----
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

// ---- 8. Iniciar animación al cargar ----
window.onload = () => {
  drawTextFrame();
};

