window.onload = function () {

  // ===== CANVAS =====
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // ===== ELEMENTOS HTML =====
  const menu = document.getElementById("menu");
  const gameContainer = document.getElementById("gameContainer");
  const scoreText = document.getElementById("score");

  const startBtn = document.getElementById("startBtn");
  const endBtn = document.getElementById("endBtn");
  const menuBtn = document.getElementById("menuBtn");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  // ===== VARIÁVEIS DO JOGO =====
  let player;
  let enemies = [];
  let obstacles = [];
  let score = 0;
  let speed = 2;
  let gameLoop;

  // ===== EVENTOS =====
  startBtn.onclick = startGame;
  endBtn.onclick = endGame;
  menuBtn.onclick = backToMenu;
  leftBtn.onclick = () => movePlayer(-1);
  rightBtn.onclick = () => movePlayer(1);

  // ===== FUNÇÕES PRINCIPAIS =====
  function startGame() {
    menu.classList.add("hidden");
    gameContainer.classList.remove("hidden");

    player = {
      x: 130,
      y: 400,
      width: 40,
      height: 70
    };

    enemies = [];
    obstacles = [];
    score = 0;
    speed = 2;
    scoreText.innerText = "Pontuação: 0";

    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, 20);
  }

  function endGame() {
    clearInterval(gameLoop);
    alert("Game Over! Pontuação: " + score);
  }

  function backToMenu() {
    clearInterval(gameLoop);
    gameContainer.classList.add("hidden");
    menu.classList.remove("hidden");
  }

  // ===== MOVIMENTO =====
  function movePlayer(direction) {
    player.x += direction * 40;

    // limites da pista
    if (player.x < 50) player.x = 50;
    if (player.x > 210) player.x = 210;
  }

  // ===== DESENHO =====
  function drawRoad() {
    ctx.fillStyle = "#6b7d6b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#000";
    ctx.setLineDash([20, 20]);
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  function drawPlayer() {
    // corpo
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(player.x, player.y, 40, 70);

    // vidro
    ctx.fillStyle = "#111";
    ctx.fillRect(player.x + 8, player.y + 10, 24, 20);

    // rodas
    ctx.fillStyle = "#000";
    ctx.fillRect(player.x - 5, player.y + 10, 5, 15);
    ctx.fillRect(player.x - 5, player.y + 45, 5, 15);
    ctx.fillRect(player.x + 40, player.y + 10, 5, 15);
    ctx.fillRect(player.x + 40, player.y + 45, 5, 15);
  }

  // ===== INIMIGOS =====
  function createEnemy() {
    const laneX = Math.random() < 0.5 ? 70 : 190;
    enemies.push({
      x: laneX,
      y: -80,
      width: 40,
      height: 70
    });
  }

  // ===== OBSTÁCULOS =====
  function createObstacle() {
    const laneX = Math.random() < 0.5 ? 80 : 200;
    obstacles.push({
      x: laneX,
      y: -40,
      width: 30,
      height: 30
    });
  }

  // ===== COLISÃO =====
  function checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // ===== LOOP DO JOGO =====
  function updateGame() {
    drawRoad();
    drawPlayer();

    speed += 0.002; // aceleração (dificuldade)

    if (Math.random() < 0.03) createEnemy();
    if (Math.random() < 0.02) createObstacle();

    // inimigos
    enemies.forEach((enemy, index) => {
      enemy.y += speed;

      ctx.fillStyle = "#34495e";
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      if (checkCollision(player, enemy)) endGame();

      if (enemy.y > canvas.height) {
        enemies.splice(index, 1);
        score++;
        scoreText.innerText = "Pontuação: " + score;
      }
    });

    // obstáculos
    obstacles.forEach((obs, index) => {
      obs.y += speed;

      ctx.fillStyle = "#000";
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      if (checkCollision(player, obs)) endGame();

      if (obs.y > canvas.height) obstacles.splice(index, 1);
    });
  }

};
