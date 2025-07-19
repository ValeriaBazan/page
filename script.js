const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let text = "Valeria Bazán Molero.";
let index = 0;
let showText = "";
let writing = true;
let particles = [];
let explosionActive = false;
let particlesFull = false;
let meltActive = false;
let meltY = 0;

// Cargar fuente Tangiela
const tangiela = new FontFace('Tangiela', 'url(fonts/Tangiela.woff2)');
tangiela.load().then(function(loadedFace) {
  document.fonts.add(loadedFace);
  requestAnimationFrame(animate);
});

// Efecto tornasolado
function getTornasolColor() {
  const colors = ['#FF8FA3', '#E09EFF', '#F7C873'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Animación de escritura
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (writing) {
    ctx.font = "77px Tangiela";
    ctx.fillStyle = getTornasolColor();
    ctx.textAlign = "center";
    ctx.fillText(showText, canvas.width / 2, canvas.height / 2);

    if (index < text.length) {
      showText += text[index];
      index++;
    } else {
      writing = false;
      setTimeout(() => {
        startExplosion();
      }, 800);
    }
  } else if (explosionActive) {
    drawParticles();

    if (particles.length > 500 && !particlesFull) {
      particlesFull = true;
      setTimeout(() => {
        startMelt();
      }, 1000); // 1 segundo antes de derretir
    }
  }

  if (meltActive) {
    meltEffect();
  }

  requestAnimationFrame(animate);
}

// Explosión de partículas
function startExplosion() {
  explosionActive = true;
  for (let i = 0; i < 600; i++) {
    particles.push(createParticle(canvas.width / 2, canvas.height / 2));
  }
}

function createParticle(x, y) {
  const angle = Math.random() * 2 * Math.PI;
  const speed = Math.random() * 5 + 2;
  return {
    x: x,
    y: y,
    radius: Math.random() * 4 + 3,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    color: getTornasolColor(),
  };
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;

    // rebote
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
}

// Derretimiento hacia abajo tipo helado
function startMelt() {
  explosionActive = false;
  meltActive = true;
  meltY = 0;
}

function meltEffect() {
  const gradient = ctx.createLinearGradient(0, meltY, 0, meltY + 200);
  gradient.addColorStop(0, '#FF8FA3');
  gradient.addColorStop(0.5, '#E09EFF');
  gradient.addColorStop(1, '#F7C873');

  ctx.fillStyle = gradient;

  for (let i = 0; i < canvas.width; i += 50) {
    let randomHeight = Math.sin(i * 0.1 + Date.now() * 0.002) * 30 + 100;
    ctx.beginPath();
    ctx.moveTo(i, meltY);
    ctx.quadraticCurveTo(i + 25, meltY + randomHeight, i + 50, meltY);
    ctx.lineTo(i + 50, canvas.height);
    ctx.lineTo(i, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  meltY += 4;

  if (meltY > canvas.height) {
    meltActive = false;
    showFinalScreen();
  }
}

// Mostrar página final con título, menú, carrusel
function showFinalScreen() {
  document.getElementById("title-text").style.display = "block";
  document.getElementById("menu-icon").style.display = "flex";
  document.getElementById("carousel-container").style.display = "flex";
  document.getElementById("contact-banner").style.display = "block";
}

// Carrusel automático + manual
const images = document.querySelectorAll(".carousel-image");
let currentIndex = 0;

function showImage(index) {
  images.forEach((img, i) => {
    img.classList.toggle("active", i === index);
  });
}

document.getElementById("left-arrow").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  showImage(currentIndex);
});

document.getElementById("right-arrow").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % images.length;
  showImage(currentIndex);
});

setInterval(() => {
  currentIndex = (currentIndex + 1) % images.length;
  showImage(currentIndex);
}, 4000);





