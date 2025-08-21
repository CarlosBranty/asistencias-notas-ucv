const fs = require("fs");
const { createCanvas } = require("canvas");

// Función para crear un icono simple
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Fondo azul
  ctx.fillStyle = "#667eea";
  ctx.fillRect(0, 0, size, size);

  // Círculo blanco
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.3, 0, 2 * Math.PI);
  ctx.fill();

  // Texto "UCV"
  ctx.fillStyle = "#4CAF50";
  ctx.font = `bold ${size * 0.2}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("UCV", size / 2, size / 2);

  return canvas.toBuffer("image/png");
}

// Generar iconos
const sizes = [16, 48, 128];

sizes.forEach((size) => {
  const iconBuffer = createIcon(size);
  fs.writeFileSync(`icon${size}.png`, iconBuffer);
  console.log(`✅ Icono ${size}x${size} creado: icon${size}.png`);
});

console.log("\n🎉 Todos los iconos han sido generados exitosamente!");
