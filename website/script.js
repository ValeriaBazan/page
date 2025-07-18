const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
    // Espera un poco y lanza punto + explosión
    setTimeout(() => {
      ctx.fillText(text + ".", centerX, centerY);
      explode(centerX, centerY);
    }, 500);
  }
}

// Paso 2: Explosión de partículas
let particles = [];

function explode(x, y) {
  for (let i = 0; i < 300; i++) {
    particles.push({
      x,
      y,
      radius: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 5,
      dy: (Math.random() - 0.5) * 5,
      alpha: 1
    });
  }
  animateParticles();
}

function animateParticles() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    p.alpha -= 0.01;
  });
  particles = particles.filter(p => p.alpha > 0);
  if (particles.length > 0) {
    requestAnimationFrame(animateParticles);
  } else {
    meltCanvas();
  }
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

  // Detener y mostrar texto final
  setTimeout(() => {
    clearInterval(melt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `50px cursive`;
    ctx.fillText("Valeria Bazan Molero", centerX, 80);
  }, 3000);
}

// Iniciar
writeName();

// Menú hamburguesa
document.getElementById("menu-icon").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("hidden");
});
