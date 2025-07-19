const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');

let W, H;
function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
}
resize();
window.addEventListener('resize', resize);

// Texto y fuente
const fullText = 'Valeria Bazán Molero.';
const fontName = 'Tangiela';
const baseFontSize = 70; // tamaño inicial grande para la escritura
const textColorStops = ['#FF8FA3', '#E09EFF', '#F7C873']; // tornasolado rosas-lilas-naranjas

// Estado animación
let currentIndex = 0;   // para animación escritura
let writeCompleted = false;
let pointWritten = false;
let waitAfterWrite = 2000; // ms para esperar tras escribir punto
let waitAfterFill = 3000;  // ms para esperar antes de derretimiento
let lastTimestamp = 0;

// Variables partículas
const particles = [];
const maxParticles = 250;  // gran cantidad para fondo
const particleRadius = 5;
let exploding = false;
let particlesFilled = false;
let melting = false;

// Variables control derretimiento
let meltY = 0;

// Función para crear color tornasolado usando gradiente vertical
function getTornasolColor(y) {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, textColorStops[0]);
  gradient.addColorStop(0.5, textColorStops[1]);
  gradient.addColorStop(1, textColorStops[2]);
  return gradient;
}

// Función para dibujar texto con efecto tornasolado
function drawText(text, x, y, fontSize) {
  ctx.font = `${fontSize}px ${fontName}`;
  ctx.textBaseline = 'middle';
  const gradient = getTornasolColor(y);
  ctx.fillStyle = gradient;
  ctx.fillText(text, x, y);
}

// Variables para escritura progresiva
function measureTextWidth(text, fontSize) {
  ctx.font = `${fontSize}px ${fontName}`;
  return ctx.measureText(text).width;
}

// Partícula
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = particleRadius;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Rebote en bordes
    if (this.x + this.radius > W) {
      this.x = W - this.radius;
      this.vx *= -1;
    }
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -1;
    }
    if (this.y + this.radius > H) {
      this.y = H - this.radius;
      this.vy *= -1;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -1;
    }
  }

  draw() {
    const gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.2, this.x, this.y, this.radius);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  grow() {
    if (this.radius < 30) this.radius += 0.3;
  }
}

// Variables para texto animado y su posición
let displayedText = '';
let textX, textY;
function updateTextPosition(fontSize, text) {
  const textWidth = measureTextWidth(text, fontSize);
  textX = (W - textWidth) / 2;
  textY = H / 2;
}

// Estado home final
let homeVisible = false;

// Función para limpiar canvas con fondo blanco perla o tornasolado según fase
function clearCanvas(bg = 'white') {
  if (bg === 'white') {
    ctx.fillStyle = '#fdfaf6'; // blanco perla
    ctx.fillRect(0, 0, W, H);
  } else if (bg === 'tornasolado') {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, textColorStops[0]);
    gradient.addColorStop(0.5, textColorStops[1]);
    gradient.addColorStop(1, textColorStops[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }
}

// Función principal animación
function animate(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  clearCanvas('white');

  if (!writeCompleted) {
    // Animación escritura progresiva
    const fontSize = baseFontSize + 5; // un poco más grande que antes
    const interval = 100; // ms entre letra y letra

    if (delta >= interval) {
      currentIndex++;
      if (currentIndex > fullText.length) {
        currentIndex = fullText.length;
        writeCompleted = true;
      }
    }

    displayedText = fullText.substring(0, currentIndex);
    updateTextPosition(fontSize, displayedText);
    drawText(displayedText, textX, textY, fontSize);

    if (writeCompleted && !pointWritten && displayedText.endsWith('.')) {
      pointWritten = true;
      setTimeout(() => {
        exploding = true;
        // Crear partículas al centro con color tornasolado
        for (let i = 0; i < maxParticles; i++) {
          particles.push(new Particle(W / 2, H / 2, textColorStops[i % textColorStops.length]));
        }
      }, waitAfterWrite);
    }
  } else if (exploding && !particlesFilled) {
    // Dibuja partículas que rebotan y crecen
    clearCanvas('white');
    const fontSize = baseFontSize + 5;

    // Letra desaparece progresivamente
    ctx.globalAlpha = Math.max(1 - particles.length / maxParticles, 0);
    drawText(fullText, textX, textY, fontSize);
    ctx.globalAlpha = 1;

    particles.forEach(p => {
      p.update();
      p.draw();
      p.grow();
    });

    // Cuando las partículas sean suficientemente grandes, consideramos fondo lleno
    if (particles.length > 0 && particles[0].radius >= 30) {
      particlesFilled = true;
      setTimeout(() => {
        melting = true;
      }, 1000); // espera 1 segundo antes de derretimiento
    }
  } else if (melting) {
    // Derretimiento tipo helado de arriba a abajo
    // Primero llena el fondo con tornasolado
    clearCanvas('tornasolado');

    // Dibujar partículas con derretimiento (bajada en Y)
    meltY += 3; // velocidad derretimiento

    // Crea un clip para derretimiento
    ctx.save();
    ctx.beginPath();

    // Añadimos líneas onduladas para simular derretimiento (efecto helado)
    const waveAmplitude = 30;
    const waveLength = 100;
    ctx.moveTo(0, meltY);
    for (let x = 0; x <= W; x += 10) {
      const y = meltY + Math.sin((x / waveLength) * 2 * Math.PI) * waveAmplitude;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();

    ctx.clip();

    // Relleno tornasolado para la parte derretida
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, textColorStops[0]);
    gradient.addColorStop(0.5, textColorStops[1]);
    gradient.addColorStop(1, textColorStops[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();

    if (meltY > H) {
      // Terminó derretimiento
      melting = false;
      homeVisible = true;
      document.getElementById('title-text').style.display = 'block';
      document.getElementById('menu-icon').style.display = 'flex';
      document.getElementById('carousel-container').style.display = 'flex';
      document.getElementById('contact-banner').style.display = 'block';
    }
  }

  if (homeVisible) {
    // Dibuja fondo tornasolado fijo
    clearCanvas('tornasolado');
  }

  requestAnimationFrame(animate);
}

// Inicia animación
requestAnimationFrame(animate);

// --- CARRUSEL ---

const carouselImages = document.querySelectorAll('.carousel-image');
const leftArrow = document.getElementById('left-arrow');
const rightArrow = document.getElementById('right-arrow');
let currentImage = 0;
const totalImages = carouselImages.length;

function showImage(index) {
  carouselImages.forEach((img, i) => {
    img.classList.toggle('active', i === index);
  });
}

function nextImage() {
  currentImage = (currentImage + 1) % totalImages;
  showImage(currentImage);
}

function prevImage() {
  currentImage = (currentImage - 1 + totalImages) % totalImages;
  showImage(currentImage);
}

rightArrow.addEventListener('click', () => {
  nextImage();
  resetInterval();
});
leftArrow.addEventListener('click', () => {
  prevImage();
  resetInterval();
});

let intervalId = setInterval(nextImage, 4000);
function resetInterval() {
  clearInterval(intervalId);
  intervalId = setInterval(nextImage, 4000);
}

// --- MENÚ HAMBURGUESA ---

const menuIcon = document.getElementById('menu-icon');
const menuContent = document.getElementById('menu-content');

menuIcon.addEventListener('click', () => {
  if (menuContent.style.display === 'block') {
    menuContent.style.display = 'none';
  } else {
    menuContent.style.display = 'block';
  }
});


