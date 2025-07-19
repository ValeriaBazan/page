const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fontSize = Math.min(canvas.width * 0.1, 140);
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
gradient.addColorStop(0, "#FF8FA3");
gradient.addColorStop(0.5, "#E09EFF");
gradient.addColorStop(1, "#F7C873");

// ---- 1. ANIMACIÓN DEL TEXTO MANUSCRITO ----
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
    setTimeout(startExplosion, 500); // inicia explosión tras el punto
  }
}

// ---- 2. PARTICULAS Y EXPLOSIÓN ----
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 4 + 2;
    this.speedX = (Math.random() - 0.5) * 6;
    this.speedY = (Math.random() - 0.5) * 6;
    this.opacity = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x <= 0 || this.x >= canvas.width) this.speedX *= -1;
    if (this.y <= 0 || this.y >= canvas.height) this.speedY *= -1;

    this.radius *= 1.02; // Crecen
    this.opacity -= 0.004;
    this.opacity = Math.max(this.opacity, 0);
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function startExplosion() {
  explosionStarted = true;

  for (let i = 0; i < 500; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50;
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

  if (particles.some(p => p.opacity > 0.1)) {
    animationFrame = requestAnimationFrame(animateExplosion);
  } else {
    explosionComplete = true;
    setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      startMelting();
    }, 3000); // Espera 3 segundos antes de empezar a derretirse
  }
}

// ---- 3. DERRETIMIENTO TIPO HELADO ----
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

// ---- 4. MOSTRAR HOME ----
function showHomePage() {
  document.getElementById("animationCanvas").style.display = "none";
  document.getElementById("title-text").style.display = "block";
  document.getElementById("carousel-container").style.display = "flex";
  document.getElementById("contact-banner").style.display = "block";
  document.getElementById("menu-icon").style.display = "block";
}

// ---- 5. CARRUSEL RESPONSIVE ----
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

// ---- 6. INICIAR ----
window.onload = () => {
  drawTextFrame();
};




