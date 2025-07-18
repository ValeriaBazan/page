// script.js

// Obtener referencias a elementos del DOM
const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
const titleText = document.getElementById('title-text');
const menuIcon = document.getElementById('menu-icon');
const menu = document.getElementById('menu');
const carouselContainer = document.getElementById('carousel-container');
const carouselImages = document.querySelectorAll('#carousel img');
const leftArrow = document.getElementById('left-arrow');
const rightArrow = document.getElementById('right-arrow');
const contactBanner = document.getElementById('contact-banner');

// Ajuste tamaño canvas al viewport
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Texto a escribir
const fullText = "Valeria Bazán Molero";
const fontFamily = "'Tangiela', cursive";
const baseFontSize = 48; // Tamaño inicial grande
const textColorStops = ['#d36fa3', '#a471bc', '#f78b4f']; // Rosa, lila y naranja tornasolados

// --- Función para crear gradiente tornasolado para texto/partículas ---
function createGradient(ctx, width) {
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, textColorStops[0]);
  gradient.addColorStop(0.5, textColorStops[1]);
  gradient.addColorStop(1, textColorStops[2]);
  return gradient;
}

// --- Escritura progresiva simulando mano ---
async function writeText() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize}px ${fontFamily}`;

  const gradient = createGradient(ctx, canvas.width / 2);
  ctx.fillStyle = gradient;

  let displayedText = '';
  for (let i = 0; i < fullText.length; i++) {
    displayedText += fullText[i];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(displayedText, canvas.width / 2, canvas.height / 2);
    await new Promise(r => setTimeout(r, 150)); // Velocidad de escritura
  }
}

// --- Partículas para explosión ---
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = 4 + Math.random() * 3;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 15; // velocidad horizontal
    this.vy = (Math.random() - 0.5) * 15; // velocidad vertical
    this.alpha = 1;
    this.life = 60; // duración en frames
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Rebote en bordes canvas
    if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
    if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;

    // Incrementar tamaño hacia el final para llenar canvas
    if (this.life < 20) {
      this.size += 0.5;
    }

    this.life--;
    this.alpha = Math.max(this.life / 60, 0);
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size, this.size * 0.6, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

let particles = [];

// --- Crear partículas en centro ---
function createParticles(num, color) {
  particles = [];
  for (let i = 0; i < num; i++) {
    particles.push(new Particle(canvas.width / 2, canvas.height / 2, color));
  }
}

// --- Animar explosión ---
function animateExplosion() {
  return new Promise((resolve) => {
    let frames = 0;
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Fondo blanco hueso casi perla mientras se anima
      ctx.fillStyle = '#f9f7f3';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      frames++;
      if (frames < 180) { // 3 segundos a 60fps
        requestAnimationFrame(loop);
      } else {
        resolve();
      }
    }
    loop();
  });
}

// --- Rellenar el fondo con el color tornasolado difuminado ---
function fillBackgroundGradient() {
  return new Promise((resolve) => {
    let progress = 0;
    function draw() {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, textColorStops[0]);
      gradient.addColorStop(0.5, textColorStops[1]);
      gradient.addColorStop(1, textColorStops[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      progress++;
      if (progress < 180) { // 3 segundos
        requestAnimationFrame(draw);
      } else {
        resolve();
      }
    }
    draw();
  });
}

// --- Flash de cámara ---
function flashEffect() {
  return new Promise((resolve) => {
    let alpha = 1;
    function flash() {
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      alpha -= 0.05;
      if (alpha > 0) {
        requestAnimationFrame(flash);
      } else {
        resolve();
      }
    }
    flash();
  });
}

// --- Mostrar UI principal tras animación ---
function showMainUI() {
  titleText.style.display = 'block';
  menuIcon.style.display = 'block';
  carouselContainer.style.display = 'block';
  contactBanner.style.display = 'block';
  // Cambiar color fondo general para tornasolado
  document.body.style.background = `linear-gradient(90deg, ${textColorStops.join(',')})`;
  document.body.style.color = '#f9f7f3'; // Texto blanco perlado
}

// --- Control menú hamburguesa ---
menuIcon.addEventListener('click', () => {
  if (menu.classList.contains('visible')) {
    menu.classList.remove('visible');
    menuIcon.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  } else {
    menu.classList.add('visible');
    menuIcon.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  }
});

// --- Carrusel ---
let currentIndex = 0;
let carouselInterval = null;

function showImage(index) {
  carouselImages.forEach((img, i) => {
    img.classList.toggle('active', i === index);
  });
}

function nextImage() {
  currentIndex = (currentIndex + 1) % carouselImages.length;
  showImage(currentIndex);
}

function prevImage() {
  currentIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
  showImage(currentIndex);
}

// Flechas controles
leftArrow.addEventListener('click', () => {
  prevImage();
  resetInterval();
});
rightArrow.addEventListener('click', () => {
  nextImage();
  resetInterval();
});

// Soporte teclado para accesibilidad flechas
leftArrow.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    prevImage();
    resetInterval();
  }
});
rightArrow.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    nextImage();
    resetInterval();
  }
});

// Cambiar imagen cada 4 segundos
function startCarousel() {
  carouselInterval = setInterval(nextImage, 4000);
}

// Resetear intervalo cuando usuario usa flechas
function resetInterval() {
  clearInterval(carouselInterval);
  startCarousel();
}

// --- Función principal que coordina toda la animación ---
async function main() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 1) Escritura texto
  await writeText();

  // 2) Pausa 2 segundos para leer
  await new Promise(r => setTimeout(r, 2000));

  // 3) Crear partículas con color gradient (tomamos color medio)
  const midColor = textColorStops[1];
  createParticles(400, midColor); // muchas partículas para cubrir fondo

  // 4) Explosión de partículas con rebotes y expansión
  await animateExplosion();

  // 5) Fondo lleno color tornasolado por 3s
  await fillBackgroundGradient();

  // 6) Flash cámara
  await flashEffect();

  // 7) Mostrar UI principal
  showMainUI();

  // 8) Iniciar carrusel
  startCarousel();
}

main();

