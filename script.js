const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
}
window.addEventListener('resize', resize);
resize();

// Config color tornasolado (simplificado: gradiente rosa-lila-naranja)
function createGradient() {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#FF8FA3'); // rosa
  grad.addColorStop(0.5, '#E09EFF'); // lila
  grad.addColorStop(1, '#F7C873'); // naranja
  return grad;
}

// Variables para animación escritura
const text = "Valeria Bazán Molero";
let currentIndex = 0;
let writingDone = false;
let showSignature = false;

const fontBaseSize = 70; // Tamaño inicial +5 pt
let fontSize = fontBaseSize;
const centerX = W / 2;
const centerY = H / 2;

// Partículas para explosión
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = 3 + Math.random() * 3;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.growth = 0.1 + Math.random() * 0.15;
    this.alpha = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Rebote en bordes
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;

    // Crecen hasta llenar canvas (máx 30 px)
    if (this.radius < 30) {
      this.radius += this.growth;
    }

    // Para derretimiento empezaremos luego
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

let particles = [];
let particlesActive = false;
let explosionStartTime = 0;
let meltStartTime = 0;
let meltDuration = 4000;
let flashActive = false;
let flashAlpha = 0;

const tornasoleadoGradient = createGradient();

// Función para dibujar texto con efecto escritura
function drawTextWriting() {
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${fontSize}px Tangiela`;

  // Usar gradiente tornasolado
  ctx.fillStyle = tornasoleadoGradient;

  // Texto que ya se ha "escrito"
  const visibleText = text.substring(0, currentIndex);
  ctx.fillText(visibleText, centerX, centerY);

  // Firma - raya bajo el texto al final
  if (showSignature) {
    const textWidth = ctx.measureText(text).width;
    const lineY = centerY + fontSize / 2 + 10;
    ctx.lineWidth = 3;
    ctx.strokeStyle = tornasoleadoGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - textWidth / 2, lineY);
    ctx.lineTo(centerX + textWidth / 2, lineY);
    ctx.stroke();
  }
}

// Animación escritura progresiva
function animateWriting(timestamp) {
  if (currentIndex < text.length) {
    if (!lastWriteTime) lastWriteTime = timestamp;
    if (timestamp - lastWriteTime > 100) { // velocidad de escritura (100ms por letra)
      currentIndex++;
      lastWriteTime = timestamp;
    }
  } else if (!writingDone) {
    writingDone = true;
    setTimeout(() => {
      showSignature = true;
    }, 300); // mostrar firma poco después
    setTimeout(() => {
      startExplosion();
    }, 2000); // espera 2s y comienza explosión
  }

  drawTextWriting();
  if (!writingDone) {
    requestAnimationFrame(animateWriting);
  }
}

let lastWriteTime = null;

// Inicializar partículas para explosión
function initParticles() {
  particles = [];
  const numParticles = 300; // mucho para llenar el fondo
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(centerX, centerY, '#ff8fa3')); // color rosa base, luego usamos gradiente para efecto
  }
}

// Dibuja todas las partículas
function drawParticles() {
  ctx.clearRect(0, 0, W, H);

  // Dibuja fondo tornasolado difuminado mientras explota
  const bgGradient = ctx.createLinearGradient(0, 0, W, H);
  bgGradient.addColorStop(0, '#FF8FA3');
  bgGradient.addColorStop(0.5, '#E09EFF');
  bgGradient.addColorStop(1, '#F7C873');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw(ctx));
}

// Actualiza la explosión y el rebote, crecimiento y derretimiento
function updateExplosion(timestamp) {
  if (!explosionStartTime) explosionStartTime = timestamp;

  const elapsed = timestamp - explosionStartTime;

  particles.forEach(p => p.update());

  // Después de 3s empieza el derretimiento
  if (elapsed > 3000) {
    if (!meltStartTime) meltStartTime = timestamp;
    const meltElapsed = timestamp - meltStartTime;

    // Derretimiento tipo helado desde arriba hacia abajo
    const meltProgress = Math.min(meltElapsed / meltDuration, 1);

    // Dibujo con máscara derretimiento
    ctx.clearRect(0, 0, W, H);
    ctx.save();

    // Clip para mostrar la parte "no derretida"
    ctx.beginPath();
    ctx.rect(0, 0, W, H * (1 - meltProgress));
    ctx.clip();

    drawParticles();

    ctx.restore();

    // Dibuja la parte "derretida" con un degradado vertical que se desvanece
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, H * (1 - meltProgress), W, H * meltProgress);
    ctx.clip();

    // Degradado de derretimiento (blanco perlado que se mezcla)
    const meltGradient = ctx.createLinearGradient(0, H * (1 - meltProgress), 0, H);
    meltGradient.addColorStop(0, 'rgba(254, 249, 244, 0.9)');
    meltGradient.addColorStop(1, 'rgba(254, 249, 244, 1)');
    ctx.fillStyle = meltGradient;
    ctx.fillRect(0, H * (1 - meltProgress), W, H * meltProgress);
    ctx.restore();

    if (meltProgress >= 1) {
      flashActive = true;
    }
  } else {
    drawParticles();
  }

  if (!flashActive) {
    requestAnimationFrame(updateExplosion);
  } else {
    requestAnimationFrame(animateFlash);
  }
}

// Flash tipo cámara
function animateFlash(timestamp) {
  if (!flashStart) flashStart = timestamp;
  const elapsed = timestamp - flashStart;

  flashAlpha = elapsed < 500 ? elapsed / 500 : 1 - (elapsed - 500) / 500;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
  ctx.fillRect(0, 0, W, H);

  if (elapsed < 1000) {
    requestAnimationFrame(animateFlash);
  } else {
    endAnimation();
  }
}

let flashStart = null;

// Fin de animación inicial, mostrar elementos y ocultar canvas
function endAnimation() {
  canvas.style.display = 'none';

  // Mostrar título, menú y carrusel
  document.getElementById('title-text').style.display = 'block';
  document.getElementById('menu-icon').style.display = 'block';
  document.getElementById('carousel-container').style.display = 'block';
}

// Función para iniciar la explosión
function startExplosion() {
  writingDone = true;
  particlesActive = true;
  initParticles();
  explosionStartTime = null;
  meltStartTime = null;
  flashActive = false;
  flashStart = null;
  requestAnimationFrame(updateExplosion);
}

// Inicio animación escritura
requestAnimationFrame(animateWriting);

// Código para carrusel y menú hamburguesa (simplificado)

// Carrusel básico (asume estructura HTML con flechas y contenedor imágenes)
const carouselImages = document.querySelectorAll('.carousel-image');
const totalImages = carouselImages.length;
let currentImageIndex = 0;
const intervalTime = 4000;
let carouselInterval;

const leftArrow = document.getElementById('left-arrow');
const rightArrow = document.getElementById('right-arrow');

function showImage(index) {
  carouselImages.forEach((img, i) => {
    img.style.display = i === index ? 'block' : 'none';
  });
}

function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % totalImages;
  showImage(currentImageIndex);
}

function prevImage() {
  currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
  showImage(currentImageIndex);
}

function startCarousel() {
  carouselInterval = setInterval(nextImage, intervalTime);
  showImage(currentImageIndex);
}
function resetCarousel() {
  clearInterval(carouselInterval);
  startCarousel();
}

// Flechas con transparencia
[leftArrow, rightArrow].forEach(arrow => {
  arrow.style.opacity = '0.3';
  arrow.style.transition = 'opacity 0.3s';
  arrow.addEventListener('mouseenter', () => {
    arrow.style.opacity = '1';
  });
  arrow.addEventListener('mouseleave', () => {
    arrow.style.opacity = '0.3';
  });
});

leftArrow.addEventListener('click', () => {
  prevImage();
  resetCarousel();
});
rightArrow.addEventListener('click', () => {
  nextImage();
  resetCarousel();
});

// Arranca carrusel oculto hasta que termine animación
document.getElementById('carousel-container').style.display = 'none';
document.getElementById('title-text').style.display = 'none';
document.getElementById('menu-icon').style.display = 'none';

window.addEventListener('load', () => {
  // Nada aquí, animación controla la visibilidad
});



