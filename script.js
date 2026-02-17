const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let cars = [];
let score = 0;
let gameRunning = false;

let lightState = "vertical"; // vertical or horizontal
let lightTimer = 0;

function startGame() {
    cars = [];
    score = 0;
    gameRunning = true;
    document.getElementById("score").innerText = score;
    requestAnimationFrame(gameLoop);
}

function spawnCar() {
    const directions = ["top", "bottom", "left", "right"];
    const dir = directions[Math.floor(Math.random() * 4)];
    let car = { x: 0, y: 0, width: 20, height: 20, dir: dir, speed: 2 };

    if (dir === "top") { car.x = 290; car.y = 0; }
    if (dir === "bottom") { car.x = 290; car.y = 580; }
    if (dir === "left") { car.x = 0; car.y = 290; }
    if (dir === "right") { car.x = 580; car.y = 290; }

    cars.push(car);
}

function updateCars() {
    cars.forEach(car => {
        if (car.dir === "top" && lightState === "vertical") car.y += car.speed;
        if (car.dir === "bottom" && lightState === "vertical") car.y -= car.speed;
        if (car.dir === "left" && lightState === "horizontal") car.x += car.speed;
        if (car.dir === "right" && lightState === "horizontal") car.x -= car.speed;
    });

    // Remove cars that pass intersection
    cars = cars.filter(car => {
        if (car.x < -20 || car.x > 620 || car.y < -20 || car.y > 620) {
            score++;
            document.getElementById("score").innerText = score;
            return false;
        }
        return true;
    });
}

function detectCollisions() {
    for (let i = 0; i < cars.length; i++) {
        for (let j = i + 1; j < cars.length; j++) {
            if (
                cars[i].x < cars[j].x + 20 &&
                cars[i].x + 20 > cars[j].x &&
                cars[i].y < cars[j].y + 20 &&
                cars[i].y + 20 > cars[j].y
            ) {
                gameRunning = false;
                alert("Crash! Game Over!");
            }
        }
    }
}

function updateLights() {
    lightTimer++;
    if (lightTimer > 180) {
        lightState = lightState === "vertical" ? "horizontal" : "vertical";
        lightTimer = 0;
    }
}

function drawIntersection() {
    ctx.fillStyle = "#333";
    ctx.fillRect(250, 0, 100, 600);
    ctx.fillRect(0, 250, 600, 100);
}

function drawCars() {
    ctx.fillStyle = "yellow";
    cars.forEach(car => {
        ctx.fillRect(car.x, car.y, car.width, car.height);
    });
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawIntersection();
    updateLights();
    updateCars();
    detectCollisions();
    drawCars();

    if (Math.random() < 0.02) spawnCar();

    requestAnimationFrame(gameLoop);
}
