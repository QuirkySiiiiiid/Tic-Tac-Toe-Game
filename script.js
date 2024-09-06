const cells = document.querySelectorAll('[data-cell]');
const messageElement = document.getElementById('message');
const resetButton = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficulty');
const fadeOverlay = document.querySelector('.fade-overlay');
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;
let difficulty = 'Easy';

// Handle cell click
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// Handle cell click event
function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);
    
    if (board[cellIndex] === '' && isGameActive) {
        board[cellIndex] = currentPlayer;
        cell.textContent = currentPlayer;
        checkWinner();
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        // Simulate computer move if it's 'O'
        if (isGameActive && currentPlayer === 'O') {
            setTimeout(computerMove, 500); // Delay for effect
        }
    }
}

// Computer move based on difficulty
function computerMove() {
    let availableMoves = board.map((mark, index) => mark === '' ? index : null).filter(index => index !== null);

    if (availableMoves.length === 0) return;

    let move;
    switch (difficulty) {
        case 'Easy':
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            break;
        case 'Medium':
            move = findWinningMove() || availableMoves[Math.floor(Math.random() * availableMoves.length)];
            break;
        case 'Hard':
            move = findWinningMove() || findBlockingMove() || availableMoves[Math.floor(Math.random() * availableMoves.length)];
            break;
    }

    board[move] = 'O';
    cells[move].textContent = 'O';
    checkWinner();
    currentPlayer = 'X';
}

// Find a winning move for the computer
function findWinningMove() {
    return findBestMove('O');
}

// Find a blocking move to prevent player's win
function findBlockingMove() {
    return findBestMove('X');
}

// Find the best move (winning or blocking)
function findBestMove(player) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of winningCombinations) {
        const cells = [board[a], board[b], board[c]];
        const emptyIndex = cells.indexOf('');
        if (cells.filter(cell => cell === player).length === 2 && emptyIndex !== -1) {
            return [a, b, c][emptyIndex];
        }
    }
    return null;
}

// Check for a winner or draw
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of winningCombinations) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            isGameActive = false;
            messageElement.textContent = `Player ${currentPlayer} wins!`;
            fadeOverlay.style.opacity = 1;
            setTimeout(() => fadeOverlay.style.opacity = 0, 1000);
            return;
        }
    }

    if (board.every(cell => cell !== '')) {
        isGameActive = false;
        messageElement.textContent = 'It\'s a draw!';
        fadeOverlay.style.opacity = 1;
        setTimeout(() => fadeOverlay.style.opacity = 0, 1000);
    }
}

// Reset the game
resetButton.addEventListener('click', () => {
    board = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => cell.textContent = '');
    isGameActive = true;
    currentPlayer = 'X';
    messageElement.textContent = '';
    fadeOverlay.style.opacity = 0;
});

// Update difficulty level
difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value;
});