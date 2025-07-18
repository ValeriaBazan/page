const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
let W, H;

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
}
resize();
window.addEventListener("resize", resize);

const text = "Valeria Bazan Molero";
const fontSizeStart = 70;  // Tamaño texto al inicio (grande)
const fontSizeFinal = 40;  // Tamaño texto final arriba

// Colores tornasolados (rosas, lilas, naranjas)
const colorGradientStops = [
  { offset: 0, color: "#d36fa3" },   // rosa
  { offset: 0.5, color: "#a471bc" }, // lila
  { offset: 1, color: "#f78b4f" }    // naranja amanecer
];

// Crear gradiente para texto y partículas
function getGradient(ctx, width) {
  let gradient = ctx.createLinearGradient(0, 0, width, 0);
  colorGradientStops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
  return gradient;
}

// Variables para animación
let particles = [];
let animationState = "writing";  // writing, pauseAfterWriting, explosion, filling, fogonazo, finished
let writeIndex = 0;
const writeInterval = 70;
let writtenText = "";

// Partícula para explosión
class Particle {
  constructor(x, y, dx, dy, radius, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
    this.alpha = 1;
    this.decay = Math.random() * 0.004 + 0.001;  // decaimiento alpha
  }
  update() {
    this.x += this.dx;
    this.y += this.dy;

    // Rebote en bordes
    if (this.x + this.radius > W) {
      this.x = W - this.radius;
      this.dx = -this.dx;
    }
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.dx = -this.dx;
    }
    if (this.y + this.radius > H) {
      this.y = H - this.radius;
      this.dy = -this.dy;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.dy = -this.dy;
    }

    // Reducir alpha para desvanecerse lentamente
    this.alpha -= this.decay;
    if (this.alpha < 0) this.alpha = 0;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Dibuja texto centrado
function drawText(textToDraw, size, yPos) {
  ctx.clearRect(0, 0, W, H);
  ctx.font = `${size}px Tangiela, cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let gradient = getGradient(ctx, W);
  ctx.fillStyle = gradient;
  ctx.fillText(textToDraw, W / 2, yPos);
}

// Animación escritura
function animateWriting() {
  ctx.clearRect(0, 0, W, H);
  ctx.font = `${fontSizeStart}px Tangiela, cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let gradient = getGradient(ctx, W);
  ctx.fillStyle = gradient;

  writtenText = text.slice(0, writeIndex);
  ctx.fillText(writtenText, W / 2, H / 2);

  if (writeIndex < text.length) {
    writeIndex++;
    setTimeout(animateWriting, writeInterval);
  } else {
    // Después de escribir, añadir punto
    setTimeout(() => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillText(text + ".", W / 2, H / 2);
    }, 100);

    // Pausa 2 segundos antes de iniciar explosión
    setTimeout(() => {
      animationState = "explosion";
      createParticles();
      requestAnimationFrame(animateExplosion);
    }, 2100);
  }
}

// Crear partículas para explosión
function createParticles() {
  particles = [];
  const centerX = W / 2;
  const centerY = H / 2;
  const gradient = getGradient(ctx, W);

  // Creamos un canvas temporal para extraer color de gradiente (approx)
  let tempCanvas = document.createElement('canvas');
  tempCanvas.width = W;
  tempCanvas.height = H;
  let tempCtx = tempCanvas.getContext('2d');
  let grad = tempCtx.createLinearGradient(0, 0, W, 0);
  colorGradientStops.forEach(stop => grad.addColorStop(stop.offset, stop.color));
  tempCtx.fillStyle = grad;
  tempCtx.fillRect(0, 0, W, H);
  let imgData = tempCtx.getImageData(centerX, centerY, 1, 1).data;
  const color = `rgba(${imgData[0]},${imgData[1]},${imgData[2]},1)`;

  // Generar muchas partículas para llenar el fondo
  const numParticles = 400; // cantidad grande para llenar fondo
  for (let i = 0; i < numParticles; i++) {
    let angle = Math.random() * 2 * Math.PI;
    let speed = Math.random() * 6 + 2; // velocidades variadas para naturalidad
    let dx = Math.cos(angle) * speed;
    let dy = Math.sin(angle) * speed;
    let radius = Math.random() * 3 + 1.5;

    particles.push(new Particle(centerX, centerY, dx, dy, radius, color));
  }
}

// Animar explosión
function animateExplosion() {
  ctx.clearRect(0, 0, W, H);

  // Dibuja y actualiza partículas
  particles.forEach(p => {
    p.update();
    p.draw(ctx);
  });

  // Cuando las partículas casi desaparezcan (alpha promedio < 0.1), pasamos a llenar el fondo
  const avgAlpha = particles.reduce((sum, p) => sum + p.alpha, 0) / particles.length;

  if (avgAlpha > 0.1) {
    requestAnimationFrame(animateExplosion);
  } else {
    animationState = "filling";
    requestAnimationFrame(animateFilling);
  }
}

// Animación llenado con partículas rebotando para cubrir todo el fondo
function animateFilling() {
  ctx.clearRect(0, 0, W, H);

  particles.forEach(p => {
    p.update();
    p.draw(ctx);
  });

  // Seguimos mientras al menos 70% tengan alpha > 0.1
  const visibleCount = particles.filter(p => p.alpha > 0.1).length;

  if (visibleCount > particles.length * 0.3) {
    requestAnimationFrame(animateFilling);
  } else {
    animationState = "fogonazo";
    fogonazoStartTime = null;
    requestAnimationFrame(animateFogonazo);
  }
}

// Animación fogonazo (destello que limpia pantalla)
let fogonazoStartTime = null;
const fogonazoDuration = 1000;
function animateFogonazo(timestamp) {
  if (!fogonazoStartTime) fogonazoStartTime = timestamp;

  let elapsed = timestamp - fogonazoStartTime;
  let progress = elapsed / fogonazoDuration;

  ctx.fillStyle = `rgba(249, 247, 243, ${progress})`; // blanco perlado que aparece
  ctx.fillRect(0, 0, W, H);

  if (progress < 1) {
    requestAnimationFrame(animateFogonazo);
  } else {
    animationState = "finished";
    drawFinalState();
  }
}

// Dibuja el estado final: texto arriba, menú, carrusel y banner
function drawFinalState() {
  ctx.clearRect(0, 0, W, H);

  // Texto arriba centrado
  ctx.font = `${fontSizeFinal}px Tangiela, cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let gradient = getGradient(ctx, W);
  ctx.fillStyle = gradient;
  ctx.fillText(text, W / 2, 20);

  // Mostrar menú, carrusel y banner
  document.getElementById("menu-icon").classList.remove("hidden");
  document.getElementById("carousel-container").classList.remove("hidden");
  document.getElementById("contact-banner").classList.remove("hidden");
}

// Inicia la animación
function startAnimation() {
  document.getElementById("menu-icon").classList.add("hidden");
  document.getElementById("carousel-container").classList.add("hidden");
  document.getElementById("contact-banner").classList.add("hidden");

  animateWriting();
}

// Carrusel

const images = [
  "images/imagenes001.png",
  "images/imagenes002.png",
  "images/imagenes003.png",
  "images/imagenes004.png"
];

let currentIndex = 0;
let intervalID = null;

function createCarousel() {
  const carousel = document.getElementById("carousel");
  carousel.innerHTML = ""; // Limpiar

  // Flechas
  const leftArrow = document.createElement("button");
  leftArrow.className = "arrow left";
  leftArrow.innerHTML = "&#9664;"; // ←
  carousel.appendChild(leftArrow);

  const rightArrow = document.createElement("button");
  rightArrow.className = "arrow right";
  rightArrow.innerHTML = "&#9654;"; // →
  carousel.appendChild(rightArrow);

  // Imágenes
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    if (i === 0) img.classList.add("active");
    carousel.appendChild(img);
  });

  leftArrow.addEventListener("click", () => {
    changeImage(-1);
    resetInterval();
  });
  rightArrow.addEventListener("click", () => {
    changeImage(1);
    resetInterval();
  });

  intervalID = setInterval(() => {
    changeImage(1);
  }, 4000);
}

function changeImage(direction) {
  const imgs = document.querySelectorAll("#carousel img");
  imgs[currentIndex].classList.remove("active");
  currentIndex += direction;

  if (currentIndex < 0) currentIndex = imgs.length - 1;
  if (currentIndex >= imgs.length) currentIndex = 0;

  imgs[currentIndex].classList.add("active");
}

function resetInterval() {
  clearInterval(intervalID);
  intervalID = setInterval(() => {
    changeImage(1);
  }, 4000);
}

// Menú hamburguesa toggle
const menuIcon = document.getElementById("menu-icon");
const menu = document.getElementById("menu");
menuIcon.addEventListener("click", () => {
  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden");
  } else {
    menu.classList.add("hidden");
  }
});

// Lanzar animación principal y crear carrusel cuando termine
startAnimation();
createCarousel();
