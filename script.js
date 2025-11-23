document.addEventListener('DOMContentLoaded', () => {
    let grid = [];
    let score = 0;
    let previousState = null;
    let gameOver = false;
    
    const gridElement = document.getElementById('grid');
    const scoreElement = document.getElementById('score');
    const newGameButton = document.getElementById('new-game');
    const undoButton = document.getElementById('undo');
    const leaderboardButton = document.getElementById('leaderboard');
    const gameOverModal = document.getElementById('game-over-modal');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const finalScoreElement = document.getElementById('final-score');
    const playerNameInput = document.getElementById('player-name');
    const saveScoreButton = document.getElementById('save-score');
    const restartButton = document.getElementById('restart');
    const scoreSavedMessage = document.getElementById('score-saved-message');
    const closeModalButton = document.getElementById('close-modal');
    const closeLeaderboardButton = document.getElementById('close-leaderboard');
    const leaderboardBody = document.getElementById('leaderboard-body');
    
    const upButton = document.getElementById('up');
    const downButton = document.getElementById('down');
    const leftButton = document.getElementById('left');
    const rightButton = document.getElementById('right');
    
    function initGame() {
        createGrid();
        loadGameState();
        if (grid.flat().every(cell => cell === 0)) {
            addRandomTile();
            addRandomTile();
        }
        updateGrid();
        setupEventListeners();
    }
    
    function createGrid() {
        gridElement.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            gridElement.appendChild(cell);
        }
    }
    
    function updateGrid() {
        document.querySelectorAll('.tile').forEach(tile => tile.remove());
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = grid[row][col];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.classList.add('tile', `tile-${value}`);
                    tile.textContent = value;
                    
                    const x = col * (100 + 15) + 15;
                    const y = row * (100 + 15) + 15;
                    
                    tile.style.left = `${x}px`;
                    tile.style.top = `${y}px`;
                    
                    gridElement.appendChild(tile);
                }
            }
        }
        
        scoreElement.textContent = score;
    }
    
    function addRandomTile() {
        const emptyCells = [];
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            
            grid[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    function saveGameState() {
        const gameState = {
            grid: grid,
            score: score,
            previousState: previousState
        };
        localStorage.setItem('2048-game-state', JSON.stringify(gameState));
    }
    
    function loadGameState() {
        const savedState = localStorage.getItem('2048-game-state');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            grid = gameState.grid;
            score = gameState.score;
            previousState = gameState.previousState;
        } else {
            grid = Array(4).fill().map(() => Array(4).fill(0));
            score = 0;
            previousState = null;
        }
    }
    
    function move(direction) {
        if (gameOver) return false;
        
        previousState = {
            grid: JSON.parse(JSON.stringify(grid)),
            score: score
        };
        
        let moved = false;
        
        if (direction === 'up' || direction === 'down') {
            grid = transpose(grid);
        }
        
        if (direction === 'right' || direction === 'down') {
            grid = grid.map(row => row.reverse());
        }
        
        for (let row = 0; row < 4; row++) {
            const newRow = [];
            let previousValue = null;
            
            for (let col = 0; col < 4; col++) {
                const value = grid[row][col];
                
                if (value !== 0) {
                    if (previousValue === value) {
                        newRow[newRow.length - 1] = value * 2;
                        score += value * 2;
                        previousValue = null;
                        moved = true;
                    } else {
                        newRow.push(value);
                        previousValue = value;
                        if (col !== newRow.length - 1) {
                            moved = true;
                        }
                    }
                }
            }
            
            while (newRow.length < 4) {
                newRow.push(0);
            }
            
            grid[row] = newRow;
        }
        
        if (direction === 'right' || direction === 'down') {
            grid = grid.map(row => row.reverse());
        }
        
        if (direction === 'up' || direction === 'down') {
            grid = transpose(grid);
        }
        
        if (moved) {
            addRandomTile();
            updateGrid();
            saveGameState();
            
            if (isGameOver()) {
                gameOver = true;
                showGameOverModal();
            }
        }
        
        return moved;
    }
    
    function transpose(matrix) {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    }
    
    function isGameOver() {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] === 0) {
                    return false;
                }
            }
        }
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                if (grid[row][col] === grid[row][col + 1]) {
                    return false;
                }
            }
        }
        
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 3; row++) {
                if (grid[row][col] === grid[row + 1][col]) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    function showGameOverModal() {
        finalScoreElement.textContent = score;
        gameOverModal.classList.add('active');
        playerNameInput.value = '';
        scoreSavedMessage.style.display = 'none';
        document.getElementById('name-input-section').style.display = 'block';
    }
    
    function saveScoreToLeaderboard(name) {
        const leaderboard = JSON.parse(localStorage.getItem('2048-leaderboard') || '[]');
        
        leaderboard.push({
            name: name,
            score: score,
            date: new Date().toLocaleDateString('ru-RU')
        });
        
        leaderboard.sort((a, b) => b.score - a.score);
        if (leaderboard.length > 10) {
            leaderboard.length = 10;
        }
        
        localStorage.setItem('2048-leaderboard', JSON.stringify(leaderboard));
    }
    
    function showLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('2048-leaderboard') || '[]');
        
        leaderboardBody.innerHTML = '';
        
        if (leaderboard.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 3;
            cell.textContent = 'Пока нет рекордов';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            leaderboardBody.appendChild(row);
        } else {
            leaderboard.forEach(entry => {
                const row = document.createElement('tr');
                
                const nameCell = document.createElement('td');
                nameCell.textContent = entry.name;
                
                const scoreCell = document.createElement('td');
                scoreCell.textContent = entry.score;
                
                const dateCell = document.createElement('td');
                dateCell.textContent = entry.date;
                
                row.appendChild(nameCell);
                row.appendChild(scoreCell);
                row.appendChild(dateCell);
                
                leaderboardBody.appendChild(row);
            });
        }
        
        leaderboardModal.classList.add('active');
    }
    
    function undoMove() {
        if (previousState && !gameOver) {
            grid = previousState.grid;
            score = previousState.score;
            previousState = null;
            updateGrid();
            saveGameState();
        }
    }
    
    function newGame() {
        grid = Array(4).fill().map(() => Array(4).fill(0));
        score = 0;
        previousState = null;
        gameOver = false;
        
        addRandomTile();
        addRandomTile();
        
        updateGrid();
        saveGameState();
        
        gameOverModal.classList.remove('active');
        leaderboardModal.classList.remove('active');
    }
    
    function setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (gameOver && !gameOverModal.classList.contains('active')) return;
            
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    move('right');
                    break;
            }
        });
        
        upButton.addEventListener('click', () => move('up'));
        downButton.addEventListener('click', () => move('down'));
        leftButton.addEventListener('click', () => move('left'));
        rightButton.addEventListener('click', () => move('right'));
        
        let touchStartX, touchStartY;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            const minSwipeDistance = 50;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > minSwipeDistance) {
                    if (dx > 0) {
                        move('right');
                    } else {
                        move('left');
                    }
                }
            } else {
                if (Math.abs(dy) > minSwipeDistance) {
                    if (dy > 0) {
                        move('down');
                    } else {
                        move('up');
                    }
                }
            }
            
            touchStartX = null;
            touchStartY = null;
        });
        
        newGameButton.addEventListener('click', newGame);
        undoButton.addEventListener('click', undoMove);
        leaderboardButton.addEventListener('click', showLeaderboard);
        
        saveScoreButton.addEventListener('click', () => {
            const name = playerNameInput.value.trim();
            if (name) {
                saveScoreToLeaderboard(name);
                document.getElementById('name-input-section').style.display = 'none';
                scoreSavedMessage.style.display = 'block';
            }
        });
        
        restartButton.addEventListener('click', newGame);
        closeModalButton.addEventListener('click', () => {
            gameOverModal.classList.remove('active');
        });
        
        closeLeaderboardButton.addEventListener('click', () => {
            leaderboardModal.classList.remove('active');
        });
    }
    
    initGame();
});