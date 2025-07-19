const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fontSize = Math.min(canvas.width * 0.1, 140);
ctx.font = `${fontSize}px Tangiela`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

const text = "Valeria Bazán Molero";  // Sin punto final
let textIndex = 0;
let writingDone = false;

let particles = [];
let maxParticles = 1500; // Cantidad máxima de partículas para llenar pantalla
let explosionStarted = false;
let explosionComplete = false;
let meltProgress = 0;
let melted = false;
let animationFrame;

const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, "#FF8FA3");
gradient.addColorStop(0.5, "#E09EFF");
gradient.addColorStop(1, "#F7C873");

// Partícula más dura, borde definido, menos transparente
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 3 + 2; // Tamaño variable
    this.speedX = (Math.random() - 0.5) * 8;
    this.speedY = (Math.random() - 0.5) * 8;
    this.opacity = 1;
    this.color = this.getTornasolColor();
  }

  getTornasolColor() {
    // Color tornasolado basado en gradiente RGB aproximado
    const colors = [
      'rgba(255, 143, 163, 1)',  // #FF8FA3
      'rgba(224, 158, 255, 1)',  // #E09EFF
      'rgba(247, 200, 115, 1)'   // #F7C873
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Rebotes en bordes con pérdida mínima para simular dureza
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.speedX *= -1;
    } else if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.speedX *= -1;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.speedY *= -1;
    } else if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.speedY *= -1;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color; // Da un ligero resplandor para dureza
    ctx.shadowBlur = 4;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow
  }
}

// ---- 1. Animación de escritura ----
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

// ---- 2. Explosión y llenado con partículas ----
function startExplosion() {
  explosionStarted = true;

  // Iniciar con algunas partículas desde el centro del texto
  for (let i = 0; i < 300; i++) {
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

  // Fondo rosa tornasolado difuso con el mismo gradiente
  let bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGradient.addColorStop(0, "#FF8FA3");
  bgGradient.addColorStop(0.5, "#E09EFF");
  bgGradient.addColorStop(1, "#F7C873");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Agregar nuevas partículas gradualmente hasta máximo
  if (particles.length < maxParticles) {
    const newParticlesCount = 10; // cantidad por frame para acelerar llenado
    for (let i = 0; i < newParticlesCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 40;
      const x = canvas.width / 2 + Math.cos(angle) * distance;
      const y = canvas.height / 2 + Math.sin(angle) * distance;
      particles.push(new Particle(x, y));
    }
  }

  // Actualizar y dibujar partículas
  particles.forEach(p => {
    p.update();
    p.draw();
  });

  // Verificar si se llenó la pantalla (partículas más que maxParticles)
  if (particles.length >= maxParticles) {
    // Esperar 2 segundos con pantalla llena
    setTimeout(() => {
      explosionComplete = true;
      cancelAnimationFrame(animationFrame);
      startMelting();
    }, 2000);
  } else {
    animationFrame = requestAnimationFrame(animateExplosion);
  }
}

// ---- 3. Derretimiento ----
function startMelting() {
  function meltFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo rosa tornasolado debajo del efecto
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, "#FF8FA3");
    bgGradient.addColorStop(0.5, "#E09EFF");
    bgGradient.addColorStop(1, "#F7C873");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Efecto de derretimiento (onda)
    const waveHeight = 30;
    const wave = (x) => Math.sin((x + Date.now() / 200) * 0.02) * waveHeight;

    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= canvas.width; x++) {
      ctx.lineTo(x, meltProgress + wave(x));
    }
    ctx.lineTo(canvas.width, 0);
    ctx.closePath();
    ctx.fill();

    meltProgress += 4; // Velocidad del derretimiento

    if (meltProgress < canvas.height) {
      requestAnimationFrame(meltFrame);
    } else {
      melted = true;
      showHomePage();
    }
  }

  meltFrame();
}

// ---- 4. Mostrar home ----
function showHomePage() {
  document.getElementById("animationCanvas").style.display = "none";
  document.getElementById("title-text").style.display = "block";
  document.getElementById("carousel-container").style.display = "flex";
  document.getElementById("contact-banner").style.display = "block";
  document.getElementById("menu-icon").style.display = "block";
}

// ---- 5. Carrusel ----
let currentIndex = 0;
const images = document.querySelectorAll(".carousel-image");

function updateCarousel(index) {
  images.forEach((img, i) => {
    img.classList.remove("active");
    if (i === index) img.classList.add("active");
  });
}

document.getElementById("carousel-container").addEventListener('click', () => {
  // Avanzar al siguiente con clic
  currentIndex = (currentIndex + 1) % images.length;
  updateCarousel(currentIndex);
});

setInterval(() => {
  currentIndex = (currentIndex + 1) % images.length;
  updateCarousel(currentIndex);
}, 4000);

// ---- 6. Inicio ----
window.onload = () => {
  drawTextFrame();
};
