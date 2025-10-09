const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
let snake = [{x: 200, y: 200}];
let direction = "RIGHT";
let food;
const fruits = ["🍓","🍒","🍏","🍊","🍇"];
let score = 0;
let gameInterval;
let blink = true;
const colors = ["#ffb6c1","#ffc0cb","#ff69b4","#ff9ebf","#ff7f9f"];
let effects = [];
let topPoints = [];

// Sons fofinhos
const eatSound = new Audio("pop.mp3"); // coloque o arquivo pop.mp3 na pasta do projeto

// Fundo animado fora do canvas
const backgroundDiv = document.getElementById("background");
const backgroundItems = [];

for(let i=0;i<30;i++){
  const span = document.createElement("span");
  span.textContent = Math.random() < 0.5 ? "💖" : "✨";
  span.style.position = "absolute";
  span.style.fontSize = (10 + Math.random()*15) + "px";
  span.style.left = Math.random()*window.innerWidth + "px";
  span.style.top = Math.random()*window.innerHeight + "px";
  span.style.opacity = 0.3 + Math.random()*0.4;
  backgroundDiv.appendChild(span);
  backgroundItems.push({el: span, speed: 0.2 + Math.random()*0.5});
}

function animateBackground(){
  backgroundItems.forEach(item => {
    let top = parseFloat(item.el.style.top);
    item.el.style.top = (top + item.speed) % window.innerHeight + "px";
  });
  requestAnimationFrame(animateBackground);
}
animateBackground();

// Funções do jogo
function randomFood() {
  const x = Math.floor(Math.random() * (canvas.width/box)) * box;
  const y = Math.floor(Math.random() * (canvas.height/box)) * box;
  food = {x, y, type: fruits[Math.floor(Math.random()*fruits.length)], offset: 0};
}

function drawSnakePart(x, y, index, isHead=false) {
  ctx.fillStyle = isHead ? "#ff69b4" : colors[index % colors.length];
  ctx.beginPath();
  ctx.roundRect(x, y, box, box, 8);
  ctx.fill();

  if(isHead){
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x + 5, y + 5, 3, 0, Math.PI*2);
    ctx.arc(x + 15, y + 5, 3, 0, Math.PI*2);
    ctx.fill();
    if(blink){
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x + 5, y + 5, 1.5, 0, Math.PI*2);
      ctx.arc(x + 15, y + 5, 1.5, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

function drawFood() {
  ctx.font = "20px Comic Sans MS";
  ctx.fillText(food.type, food.x, food.y + 18 + food.offset);
}

function drawEffects() {
  for(let i = effects.length-1; i >= 0; i--){
    const e = effects[i];
    ctx.fillStyle = e.color;
    ctx.font = e.size + "px Comic Sans MS";
    ctx.fillText(e.symbol, e.x, e.y);
    e.y -= 1;
    e.alpha -= 0.05;
    e.size *= 0.95;
    if(e.alpha <= 0) effects.splice(i, 1);
  }

  for(let i = topPoints.length-1; i >= 0; i--){
    const p = topPoints[i];
    ctx.fillStyle = p.color;
    ctx.font = p.size + "px Comic Sans MS";
    ctx.fillText("+" + p.value, p.x, p.y);
    p.y -= 1.5;
    p.alpha -= 0.05;
    p.size *= 0.95;
    if(p.alpha <= 0) topPoints.splice(i, 1);
  }
}

function spawnEffects(x, y) {
  const symbols = ["💖","✨","🌸"];
  for(let i=0;i<5;i++){
    effects.push({
      x: x,
      y: y,
      symbol: symbols[Math.floor(Math.random()*symbols.length)],
      color: colors[Math.floor(Math.random()*colors.length)],
      size: 15 + Math.random()*10,
      alpha: 1
    });
  }
}

function spawnTopPoints(value) {
  topPoints.push({
    x: canvas.width/2 - 10,
    y: 30,
    value: value,
    color: "#ff69b4",
    size: 20,
    alpha: 1
  });
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  blink = !blink;
  food.offset = Math.sin(Date.now() / 200) * 5;

  snake.forEach((part, index) => drawSnakePart(part.x, part.y, index, index === 0));
  drawFood();
  drawEffects();

  let head = {...snake[0]};

  if(direction === "LEFT") head.x -= box;
  if(direction === "RIGHT") head.x += box;
  if(direction === "UP") head.y -= box;
  if(direction === "DOWN") head.y += box;

  // CORREÇÃO: morrer ao encostar na borda
  if(head.x < 0 || head.x + box > canvas.width || head.y < 0 || head.y + box > canvas.height || collision(head, snake)){
    clearInterval(gameInterval);
    alert("Game Over! 🐍💖 Score: " + score);
    return;
  }

  if(head.x === food.x && head.y === food.y){
    score++;
    spawnEffects(food.x, food.y);
    spawnTopPoints(1);
    eatSound.currentTime = 0;
    eatSound.play();
    randomFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);

  ctx.fillStyle = "#333";
  ctx.font = "18px Comic Sans MS";
  ctx.fillText("Score: " + score, 10, 20);
}

function collision(head, array){
  return array.some(part => part.x === head.x && part.y === head.y);
}

document.addEventListener("keydown", e => {
  if(e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if(e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if(e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if(e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

function startGame(speed=150){
  snake = [{x: 200, y: 200}];
  direction = "RIGHT";
  score = 0;
  effects = [];
  topPoints = [];
  randomFood();
  clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);
}