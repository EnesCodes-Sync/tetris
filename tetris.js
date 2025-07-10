// Tetris ana oyun dosyası
// Temel yapı ve başlatıcı fonksiyonlar burada olacak

// Oyun alanı boyutları
const COLS = 10;
const ROWS = 22; // 20 + 2 gizli satır
const VISIBLE_ROWS = 20;
const BLOCK_SIZE = 32;
const SPAWN_ROW = 2; // üstteki gizli satır

// Tetromino şekilleri ve renkleri
const TETROMINOS = {
    I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00f0f0' },
    O: { shape: [[1,1],[1,1]], color: '#f0f000' },
    T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: '#a000f0' },
    S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: '#00f000' },
    Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: '#f00000' },
    J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: '#0000f0' },
    L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: '#f0a000' }
};

// Oyun başlatıcı
function startGame() {
    board = createMatrix(ROWS, COLS);
    nextQueue = randomBag();
    current = spawnTetromino();
    hold = null;
    canHold = true;
    score = 0;
    level = 1;
    lines = 0;
    render();
}

const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

let board, current, nextQueue, hold, canHold, score, level, lines;

function createMatrix(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function randomBag() {
    const bag = Object.keys(TETROMINOS);
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
}

function spawnTetromino() {
    if (nextQueue.length < 7) nextQueue.push(...randomBag());
    const type = nextQueue.shift();
    const tet = TETROMINOS[type];
    return {
        type,
        shape: tet.shape.map(row => [...row]),
        color: tet.color,
        x: Math.floor((COLS - tet.shape[0].length) / 2),
        y: 0,
        rotation: 0
    };
}

function collide(matrix, piece) {
    const { shape, x, y } = piece;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                let nx = x + col;
                let ny = y + row;
                if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                if (ny >= 0 && matrix[ny][nx]) return true;
            }
        }
    }
    return false;
}

function rotate(shape) {
    return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
}

function hardDropPos(matrix, piece) {
    let ghost = { ...piece, y: piece.y };
    while (!collide(matrix, ghost)) ghost.y++;
    ghost.y--;
    return ghost;
}

function drawBlock(x, y, color, ghost = false) {
    ctx.save();
    ctx.globalAlpha = ghost ? 0.3 : 1;
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = ghost ? '#fff8' : '#222';
    ctx.lineWidth = ghost ? 2 : 1.5;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.restore();
}

function drawMatrix(matrix, offsetY = 0) {
    for (let y = SPAWN_ROW; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (matrix[y][x]) drawBlock(x, y - SPAWN_ROW + offsetY, matrix[y][x]);
        }
    }
}

function drawTetromino(piece, ghost = false) {
    const { shape, x, y, color } = piece;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) drawBlock(x + col, y + row - SPAWN_ROW, color, ghost);
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMatrix(board);
    // Ghost piece
    const ghost = hardDropPos(board, current);
    drawTetromino(ghost, true);
    // Current piece
    drawTetromino(current);
}

document.addEventListener('DOMContentLoaded', startGame);
