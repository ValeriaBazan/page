// script.js

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

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const fullText = "Valeria Bazan Molero";
const fontFamily = "'Tangiela', cursive";
const baseFontSize = 96; // Mucho más grande para destacar
const textColorStops = ['#d36fa3', '#a471bc', '#f78b4f']; // Tornasolado rosa, lila, naranja

// Crear gradiente tornasolado para texto y partículas
function createGradient(ctx, width) {
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, textColorStops[0]);
  gradient.addColorStop(0.5, textColorStops[1]);
  gradient.addColorStop(1, textColorStops[2]);
  return gradient;
}

// Escritura progresiva del texto con animación fluida y legible
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
    await new Promise(r => setTimeout(r, 100)); // Animación más fluida
  }
}

// Dibuja la "firma" (línea debajo del texto)
function drawSignatureLine() {
  const textWidth = ctx.measureText(fullText).width;
  const xStart = (canvas.width / 2) - (textWidth / 2);
  const yStart = canvas.height / 2 + baseFontSize / 2 + 10; // Debajo del texto

  // Animar la línea que se dibuja de izquierda a derecha
  return new Promise((resolve) => {
    let progress = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Redibujar texto para que no desaparezca
      const gradient = createGradient(ctx, canvas.width / 2);
      ctx.fillStyle = gradient;
      ctx.font = `${baseFontSize}px ${fontFamily}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(fullText, canvas.width / 2, canvas.height / 2);

      // Dibujar línea progresiva (firma)
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(xStart, yStart);
      ctx.lineTo(xStart + (textWidth * progress), yStart);
      ctx.stroke();

      progress += 0.02;
      if (progress <= 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }
    animate();
  });
}

// Partículas para la explosión con rebote
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = 5 + Math.random() * 3;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 12;
    this.vy = (Math.random() - 0.5) * 12;
    this.alpha = 1;
    this.life = 180; // duración en frames
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Rebote en bordes
    if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
    if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;

    // Aumentar tamaño al final para llenar pantalla
    if (this.life < 40) {
      this.size += 0.3;
    }

    this.life--;
    this.alpha = Math.max(this.life / 180, 0);
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

function createParticles(num, color) {
  particles = [];
  for (let i = 0; i < num; i++) {
    particles.push(new Particle(canvas.width / 2, canvas.height / 2, color));
  }
}

// Animación explosión con rebote natural y expansión
function animateExplosion() {
  return new Promise((resolve) => {
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      if (particles.length && particles[0].life > 0) {
        requestAnimationFrame(loop);
      } else {
        resolve();
      }
    }
    loop();
  });
}

// Efecto derretimiento (transición orgánica) - partículas se expanden y desaparecen
function meltParticles() {
  return new Promise((resolve) => {
    let meltFrames = 60;
    function melt() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.size += 0.5; // se agrandan
        p.alpha -= 0.02; // desaparecen poco a poco
        if (p.alpha < 0) p.alpha = 0;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });
      meltFrames--;
      if (meltFrames > 0) {
        requestAnimationFrame(melt);
      } else {
        resolve();
      }
    }
    melt();
  });
}

// Mostrar texto fijo arriba, centrado y en blanco
function showFixedTitle() {
  titleText.style.display = 'block';
  titleText.style.color = 'white';
  titleText.style.fontSize = '48px';
  titleText.textContent = fullText;
}

// Mostrar UI principal (título, menú, carrusel y banner)
function showMainUI() {
  showFixedTitle();
  menuIcon.style.display = 'block';
  carouselContainer.style.display = 'block';
  contactBanner.style.display = 'block';
  document.body.style.background = `linear-gradient(90deg, ${textColorStops.join(',')})`;
  document.body.style.color = '#fff'; // Texto blanco
}

// Control menú hamburguesa
menuIcon.addEventListener('click', () => {
  menu.classList.toggle('visible');
  const expanded = menu.classList.contains('visible');
  menuIcon.setAttribute('aria-expanded', expanded);
  menu.setAttribute('aria-hidden', !expanded);
});

// Carrusel
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

leftArrow.addEventListener('click', () => {
  prevImage();
  resetInterval();
});
rightArrow.addEventListener('click', () => {
  nextImage();
  resetInterval();
});

// Teclado para accesibilidad
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

function startCarousel() {
  carouselInterval = setInterval(nextImage, 4000);
}

function resetInterval() {
  clearInterval(carouselInterval);
  startCarousel();
}

// Función principal que ejecuta toda la animación paso a paso
async function main() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  await writeText(); // Escribir texto
  await drawSignatureLine(); // Dibujar firma debajo
  await new Promise(r => setTimeout(r, 2000)); // Pausa 2s

  const gradient = createGradient(ctx, canvas.width / 2);
  createParticles(300, gradient); // Crear partículas con gradiente para explosión
  await animateExplosion(); // Explosión con rebote
  await meltParticles(); // Derretimiento orgánico partículas

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  showMainUI(); // Mostrar título fijo, menú, carrusel, contacto
  startCarousel(); // Iniciar carrusel
}

main();


