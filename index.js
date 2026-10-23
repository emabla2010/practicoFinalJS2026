
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

let gameSpeed = 5;
let gravity = 0.5;
let gameOver = false;
let score = 0;
let speedLevel = 0;
let lastSoundScore = 0;

let bestScore = Number(localStorage.getItem("bestScore")) || 0;

let audioContext;

let dino = {
    x: 50,
    y: canvas.height - 47,
    width: 44,
    height: 47,
    vy: 0,
    isJumping: false
};

let obstacle = {
    x: canvas.width,
    y: canvas.height - 40,
    width: 25,
    height: 40
};

let dinoImg = new Image();
dinoImg.src = "dino.png";

let cactusImg = new Image();
cactusImg.src = "cactus.png";

// Efectos de sonido
function playSound(frequency, duration) {
    try {
        if (!audioContext) {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) return;

            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const volume = audioContext.createGain();

        oscillator.frequency.value = frequency;
        oscillator.connect(volume);
        volume.connect(audioContext.destination);

        volume.gain.setValueAtTime(0.15, audioContext.currentTime);
        volume.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + duration
        );

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.log("No se pudo reproducir el sonido");
    }
}

// Ciclo principal del juego
function gameLoop() {
    if (!gameOver) {
        update();
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Actualiza el juego
function update() {
    score++;

    // Guarda el récord
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }

    // Aumenta la velocidad cada 100 puntos
    let newLevel = Math.floor(score / 100);

    if (newLevel > speedLevel) {
        gameSpeed += 0.5;
        speedLevel = newLevel;
    }

    // Sonido cada 100 puntos
    if (score % 100 === 0 && score !== lastSoundScore) {
        playSound(800, 0.2);
        lastSoundScore = score;
    }

    // Movimiento del dinosaurio
    if (dino.isJumping) {
        dino.vy += gravity;
        dino.y += dino.vy;

        if (dino.y >= canvas.height - dino.height) {
            dino.y = canvas.height - dino.height;
            dino.isJumping = false;
            dino.vy = 0;
        }
    }

    // Movimiento del cactus
    obstacle.x -= gameSpeed;

    if (obstacle.x + obstacle.width < 0) {
        obstacle.x = canvas.width + Math.random() * 200;
    }

    // Detecta colisiones
    if (collision(dino, obstacle)) {
        gameOver = true;
    }
}

// Detecta si el dinosaurio toca el cactus
function collision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Dibuja los elementos
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, 10, 22);
    ctx.fillText("Récord: " + bestScore, 10, 42);

    // Cambia el color del dinosaurio cuando salta
    if (dinoImg.complete && dinoImg.naturalWidth > 0) {
        if (dino.isJumping) {
            ctx.filter = "invert(39%) sepia(98%) saturate(600%) hue-rotate(65deg)";
        }

        ctx.drawImage(
            dinoImg,
            dino.x,
            dino.y,
            dino.width,
            dino.height
        );

        ctx.filter = "none";
    } else {
        ctx.fillStyle = dino.isJumping ? "green" : "#333";
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    }

    // Dibuja el cactus
    if (cactusImg.complete && cactusImg.naturalWidth > 0) {
        ctx.drawImage(
            cactusImg,
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );
    } else {
        ctx.fillStyle = "brown";
        ctx.fillRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );
    }

    if (gameOver) {
        ctx.fillStyle = "#000";
        ctx.font = "24px Arial";
        ctx.fillText("Game Over", 230, 80);
    }
}

// Salto con la barra espaciadora
document.addEventListener("keydown", function(e) {
    if (
        e.code === "Space" &&
        !dino.isJumping &&
        !gameOver
    ) {
        dino.isJumping = true;
        dino.vy = -10;

        playSound(400, 0.1);

        e.preventDefault();
    }
});

// Reinicia el juego manualmente
restartBtn.addEventListener("click", function() {
    gameOver = false;
    score = 0;
    gameSpeed = 5;
    speedLevel = 0;
    lastSoundScore = 0;

    dino.y = canvas.height - dino.height;
    dino.vy = 0;
    dino.isJumping = false;

    obstacle.x = canvas.width;

    draw();
});

// Inicia el juego
gameLoop();
