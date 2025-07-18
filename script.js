const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Ocultar menú al principio
document.getElementById("menu-icon").style.display = "none";

let text = "Valeria Bazan Molero";
let letters = text.split("");
let currentLetter = 0;
let fontSize = 60;
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
ctx.font = `${fontSize}px cursive`;
ctx.fillStyle = "#ffffff";
ctx.textAlign = "center";

// Paso 1: Escribir letra por letra
function writeName() {
  if (currentLetter < letters.length) {
    let partialText = letters.slice(0, currentLetter + 1).join("");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(partialText, centerX, centerY);
    currentLetter++;
    setTimeout(writeName, 200);
  } else {
    // Esperar 2 segundos para leer
    setTimeout(() => {
      // Aumentar tamaño
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `80px cursive`;
      ctx.fillText(text, centerX, centerY);

      // Esperar 1 segundo más y lanzar explosión
      setTimeout(() => {
        ctx.fillText(text + ".", centerX, centerY);
        explode(centerX, centerY);
      }, 1000);
    }, 2000);
  }
}

// Paso 2: Explosión de partículas mejorada
let particles = [];

function explode(x, y) {
  for (let i = 0; i < 1000; i++) {
    particles.push({
      x,
      y,
      radius: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 10,
      dy: (Math.random() - 0.5) * 10,
      color: "rgba(255, 255, 255, 1)",
      alpha: 1
    });
  }
  animateParticles();
}

function animateParticles() {
  let explosionDuration = 0;
  let animation = setInterval(() => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      p.alpha -= 0.005;
    });

    explosionDuration += 1;
    if (explosionDuration > 180) {
      clearInterval(animation);
      meltCanvas();
    }
  }, 16);
}

// Paso 3: "Derretir" la pantalla
function meltCanvas() {
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let pixels = imageData.data;

  let melt = setInterval(() => {
    for (let y = canvas.height - 1; y > 0; y--) {
      for (let x = 0; x < canvas.width; x++) {
        let i = (y * canvas.width + x) * 4;
        let iAbove = ((y - 1) * canvas.width + x) * 4;
        pixels[i] = pixels[iAbove];
        pixels[i + 1] = pixels[iAbove + 1];
        pixels[i + 2] = pixels[iAbove + 2];
        pixels[i + 3] = pixels[iAbove + 3];
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, 30);

  // Final después del "derretido"
  setTimeout(() => {
    clearInterval(melt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `50px cursive`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Valeria Bazan Molero", centerX, 80);

    // Mostrar menú hamburguesa
    document.getElementById("menu-icon").style.display = "block";
  }, 3000);
}

// Iniciar animación
writeName();

// Menú hamburguesa
document.getElementById("menu-icon").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("hidden");
});
