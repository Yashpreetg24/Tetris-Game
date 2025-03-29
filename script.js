const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const tetrominoes = [
    [[1, 1, 1, 1]],  // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]]  // J
];

let currentTetromino;
let tetrominoX = 3;
let tetrominoY = 0;
let dropInterval = 500;
let lastDropTime = 0;
let gameRunning = false;

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                drawBlock(col, row, "cyan");
            }
        }
    }
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = "black";
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawTetromino() {
    currentTetromino.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell) {
                drawBlock(tetrominoX + c, tetrominoY + r, "red");
            }
        });
    });
}

function collide() {
    return currentTetromino.some((row, r) =>
        row.some((cell, c) => 
            cell && (board[tetrominoY + r]?.[tetrominoX + c] !== 0 || tetrominoY + r >= ROWS)
        )
    );
}

function mergeTetromino() {
    currentTetromino.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell) {
                board[tetrominoY + r][tetrominoX + c] = 1;
            }
        });
    });
}

function removeFullRows() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
        }
    }
}

function dropTetromino() {
    tetrominoY++;
    if (collide()) {
        tetrominoY--;
        mergeTetromino();
        removeFullRows();
        newTetromino();
    }
}

function newTetromino() {
    currentTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    tetrominoX = 3;
    tetrominoY = 0;
    if (collide()) {
        alert("Game Over!");
        resetGame();
    }
}

function resetGame() {
    for (let row = 0; row < ROWS; row++) {
        board[row].fill(0);
    }
    gameRunning = false;
}

function update(time = 0) {
    if (!gameRunning) return;
    if (time - lastDropTime > dropInterval) {
        dropTetromino();
        lastDropTime = time;
    }
    drawBoard();
    drawTetromino();
    requestAnimationFrame(update);
}

document.addEventListener("keydown", (event) => {
    if (!gameRunning) return;
    if (event.key === "ArrowLeft") {
        tetrominoX--;
        if (collide()) tetrominoX++;
    } else if (event.key === "ArrowRight") {
        tetrominoX++;
        if (collide()) tetrominoX--;
    } else if (event.key === "ArrowDown") {
        dropTetromino();
    } else if (event.key === "ArrowUp") {
        rotateTetromino();
    }
});

function rotateTetromino() {
    const rotated = currentTetromino[0].map((_, index) => 
        currentTetromino.map(row => row[index]).reverse()
    );
    const prevTetromino = currentTetromino;
    currentTetromino = rotated;
    if (collide()) {
        currentTetromino = prevTetromino;
    }
}

document.getElementById("startBtn").addEventListener("click", () => {
    if (!gameRunning) {
        gameRunning = true;
        newTetromino();
        update();
    }
});
