const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Tela cheia
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// Jogador
const kart = new Image();
kart.src = "img/kart5.png";

let player = {
  x: canvas.width / 2 - 100, // Posição inicial à esquerda
  y: canvas.height - 150,
  w: 50,
  h: 90,
  baseSpeed: 4 // Velocidade base do jogador
};

// Inimigos
const enemyImgs = ["kart1.png", "kart2.png", "kart3.png", "kart4.png"].map(src => {
  const img = new Image();
  img.src = "img/" + src;
  return img;
});

// Distância horizontal entre os karts
let spacing = 70;
let startY = canvas.height - 150;

// Posiciona os inimigos ao lado do jogador
let enemies = [
  { img: enemyImgs[0], x: player.x + spacing, y: startY, w: 50, h: 90, initialSpeed: 3.5, maxSpeed: 5, speed: 3.5 },
  { img: enemyImgs[1], x: player.x + spacing * 2, y: startY, w: 50, h: 90, initialSpeed: 3.7, maxSpeed: 5.2, speed: 3.7 },
  { img: enemyImgs[2], x: player.x + spacing * 3, y: startY, w: 50, h: 90, initialSpeed: 3.6, maxSpeed: 5.1, speed: 3.6 },
  { img: enemyImgs[3], x: player.x + spacing * 4, y: startY, w: 50, h: 90, initialSpeed: 3.8, maxSpeed: 5.3, speed: 3.8 }
];

// Teclado
let keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// Pista
let roadOffset = 0;
const baseRoadSpeed = 6; // Velocidade base da pista

// Tempo de partida e contagem regressiva
let startTime = null;
let raceStarted = false;
let preRaceCountdown = 3;
let lastCountdownTime = Date.now();
const delayLinhaChegada = 1 * 60 * 1000; // 1 minuto
let linhaChegadaY = -1000;

// Desenha pista
function drawRoad() {
  const roadW = canvas.width * 0.8;
  const roadX = (canvas.width - roadW) / 2;

  // Céu
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grama lateral
  ctx.fillStyle = "#0b6623";
  ctx.fillRect(0, 0, roadX, canvas.height);
  ctx.fillRect(roadX + roadW, 0, roadX, canvas.height);

  // Pista
  ctx.fillStyle = "#555";
  ctx.fillRect(roadX, 0, roadW, canvas.height);

  // Faixa central
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 6;
  ctx.setLineDash([30, 20]);
  ctx.lineDashOffset = -roadOffset;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Linha de chegada após 1 minuto da corrida começar
  if (raceStarted && Date.now() - startTime >= delayLinhaChegada) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(roadX, linhaChegadaY, roadW, 10);
  }

  return { roadX, roadW };
}

// Desenha jogador
function drawPlayer() {
  ctx.drawImage(kart, player.x, player.y, player.w, player.h);
}

// Desenha inimigos
function drawEnemies() {
  for (let e of enemies) {
    ctx.drawImage(e.img, e.x, e.y, e.w, e.h);
  }
}

// Desenha a contagem regressiva
function drawCountdown() {
  ctx.fillStyle = "red";
  ctx.font = "80px Arial";
  ctx.textAlign = "center";
  ctx.fillText(preRaceCountdown > 0 ? preRaceCountdown : "GO!", canvas.width / 2, canvas.height / 2);
}

// Atualiza posições
function update(roadX, roadW) {
  // Horizontal do jogador
  if (keys["ArrowLeft"]) player.x -= 6;
  if (keys["ArrowRight"]) player.x += 6;
  if (player.x < roadX + 10) player.x = roadX + 10;
  if (player.x > roadX + roadW - player.w - 10) player.x = roadX + roadW - player.w - 10;

  // Velocidade do jogador (aceleração)
  let playerSpeedMultiplier = keys["ArrowUp"] ? 2 : 1;
  let currentPlayerActualSpeed = player.baseSpeed * playerSpeedMultiplier;

  // Move pista e linha de chegada
  roadOffset += baseRoadSpeed * playerSpeedMultiplier;
  if (raceStarted && Date.now() - startTime >= delayLinhaChegada) {
    linhaChegadaY += baseRoadSpeed * playerSpeedMultiplier;
  }

  // Atualiza velocidade e posição dos inimigos
  for (let e of enemies) {
    // Aumenta a velocidade do inimigo gradualmente até a velocidade máxima
    if (e.speed < e.maxSpeed) {
      e.speed += 2; // Pequeno incremento para simular aceleração
    }
    // A posição do inimigo é afetada pela velocidade da pista e pela sua própria velocidade
    e.y += baseRoadSpeed - e.speed; 
  }
}

// Checa vencedor
function checkWinner() {
  if (raceStarted && Date.now() - startTime >= delayLinhaChegada) {
    // Verifica se o jogador cruzou a linha de chegada
    if (player.y <= linhaChegadaY + 10) return "Você venceu!";
    
    // Verifica se algum inimigo cruzou a linha de chegada
    for (let e of enemies) {
      if (e.y + e.h >= linhaChegadaY) return "Game Over";
    }
  }
  return null;
}

// Loop principal
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const road = drawRoad();

  if (!raceStarted) {
    drawCountdown();
    // Atualiza a contagem regressiva a cada segundo
    if (Date.now() - lastCountdownTime >= 1000) {
      preRaceCountdown--;
      lastCountdownTime = Date.now();
      if (preRaceCountdown < 0) {
        raceStarted = true;
        startTime = Date.now(); // Inicia o cronômetro da corrida
      }
    }
  } else {
    drawPlayer();
    drawEnemies();
    update(road.roadX, road.roadW);
  }

  const winner = checkWinner();
  if (winner) {
    ctx.fillStyle = "red";
    ctx.font = "50px Arial";
    ctx.fillText(winner, canvas.width / 2 - 150, canvas.height / 2);
    return; // Para o jogo
  }

  requestAnimationFrame(gameLoop);
}

// Start
kart.onload = () => gameLoop();