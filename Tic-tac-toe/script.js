const gameBoard = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');
const playerXWinsDisplay = document.getElementById('playerXWins');
const playerOWinsDisplay = document.getElementById('playerOWins');
const drawsDisplay = document.getElementById('draws'); // Renamed to avoid conflict

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let playerXWins = 0;
let playerOWins = 0;
let totalDraws = 0; // Renamed from draws

// Winning combinations
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Handle a click event on the board
gameBoard.forEach(cell => {
    cell.addEventListener('click', handlePlayerClick);
});

function handlePlayerClick(event) {
    const clickedCell = event.target;
    const cellIndex = clickedCell.getAttribute('data-index');

    if (board[cellIndex] !== '' || !gameActive) return;

    board[cellIndex] = currentPlayer;
    clickedCell.innerText = currentPlayer;

    checkResult();

    if (gameActive) {
        currentPlayer = 'O';
        setTimeout(() => computerPlay(), 500);
    }
}

function computerPlay() {
    const difficulty = document.getElementById('difficulty').value;
    if (difficulty === 'easy') {
        computerMoveEasy();
    } else if (difficulty === 'medium') {
        computerMoveMedium();
    } else if (difficulty === 'hard') {
        computerMoveHard();
    }
}

function computerMoveEasy() {
    const availableCells = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    if (availableCells.length === 0) return;
    const randomMove = availableCells[Math.floor(Math.random() * availableCells.length)];
    board[randomMove] = 'O';
    document.querySelector(`.cell[data-index="${randomMove}"]`).innerText = 'O';
    checkResult();
    if (gameActive) currentPlayer = 'X';
}

function computerMoveMedium() {
    const winMove = findWinningMove('O');
    const blockMove = findWinningMove('X');
    const availableCells = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    const chance = Math.random() * 100;
    let selectedMove;

    if (winMove !== null) {
        selectedMove = winMove;
    } else if (blockMove !== null) {
        selectedMove = blockMove;
    } else if (chance <= 40) { // Easy to Medium moves
        selectedMove = availableCells[Math.floor(Math.random() * availableCells.length)];
    } else { // Harder moves
        selectedMove = findStrategicMove() || availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    board[selectedMove] = 'O';
    document.querySelector(`.cell[data-index="${selectedMove}"]`).innerText = 'O';
    checkResult();
    if (gameActive) currentPlayer = 'X';
}

function computerMoveHard() {
    const bestMove = minimax(board, 0, true);
    board[bestMove.index] = 'O';
    document.querySelector(`.cell[data-index="${bestMove.index}"]`).innerText = 'O';
    checkResult();
    if (gameActive) currentPlayer = 'X';
}

function findWinningMove(player) {
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] === player && board[b] === player && board[c] === '') return c;
        if (board[a] === player && board[c] === player && board[b] === '') return b;
        if (board[b] === player && board[c] === player && board[a] === '') return a;
    }
    return null;
}

function findStrategicMove() {
    const availableCells = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    for (let cell of availableCells) {
        board[cell] = 'O';
        if (findWinningMove('O') === cell) {
            board[cell] = '';
            return cell;
        }
        board[cell] = 'X';
        if (findWinningMove('X') === cell) {
            board[cell] = '';
            return cell;
        }
        board[cell] = '';
    }
    return null;
}

function minimax(board, depth, isMaximizing) {
    const scores = { 'X': -10, 'O': 10, 'draw': 0 };
    const winner = checkWinner();
    if (winner) return { score: scores[winner] };
    if (board.every(cell => cell !== '')) return { score: scores['draw'] };

    let bestMove;
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                const moveScore = minimax(board, depth + 1, false).score;
                board[i] = '';
                if (moveScore > bestScore) {
                    bestScore = moveScore;
                    bestMove = { index: i, score: bestScore };
                }
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                const moveScore = minimax(board, depth + 1, true).score;
                board[i] = '';
                if (moveScore < bestScore) {
                    bestScore = moveScore;
                    bestMove = { index: i, score: bestScore };
                }
            }
        }
    }
    return bestMove;
}

function checkWinner() {
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function checkResult() {
    let roundWon = false;

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            updateScore(currentPlayer);
            break;
        }
    }

    if (roundWon) {
        message.innerText = `Player ${currentPlayer} wins!`;
        gameActive = false;
        setTimeout(resetGame, 3000); // Automatically reset after 3 seconds
        return;
    }

    if (!board.includes('')) {
        message.innerText = 'It\'s a draw!';
        updateScore('draw'); // Update score for draw
        gameActive = false;
        setTimeout(resetGame, 3000); // Automatically reset after 3 seconds
        return;
    }
}

function updateScore(winner) {
    if (winner === 'X') {
        playerXWins++;
        playerXWinsDisplay.innerText = playerXWins;
    } else if (winner === 'O') {
        playerOWins++;
        playerOWinsDisplay.innerText = playerOWins;
    } else if (winner === 'draw') { // Handling draws
        totalDraws++;
        drawsDisplay.innerText = totalDraws;
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameBoard.forEach(cell => (cell.innerText = ''));
    currentPlayer = 'X';
    gameActive = true;
    message.innerText = '';
}

resetBtn.addEventListener('click', () => {
    resetGame();
});
