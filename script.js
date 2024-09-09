document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('myTable');
    const showPathButton = document.getElementById('showPathButton');
    const init7x7Button = document.getElementById('init7x7Button');
    const init10x10Button = document.getElementById('init10x10Button');
    const hintButton = document.getElementById('hintButton');
    let rows, cols;
    let grid, currentStep, path, redCells, attempts, validPath;
    let isPathShown = false;
    let errorCount = 0;

    function initializeGame(size) {
        rows = cols = size;
        grid = Array(rows).fill().map(() => Array(cols).fill(0));
        currentStep = 1;
        path = [];
        redCells = [];
        attempts = 0;
        validPath = [];
        isPathShown = false;
        errorCount = 0;
        //updateShowPathButton();

        generateValidPath();
        createTable();
        updateShowPathButton();

        if (size === 10) {
            setTimeout(scrollToBottom, 100);
        }
    }

    function createTable() {
        table.innerHTML = '';
        for (let i = 0; i < rows; i++) {
            const row = table.insertRow();
            for (let j = 0; j < cols; j++) {
                const cell = row.insertCell();
                cell.textContent = grid[i][j];
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (i === 0 && j === cols - 1) {
                    cell.classList.add('start');
                }
                
                cell.addEventListener('click', handleCellClick);
            }
        }
    }

    function scrollToBottom() {
        const scrollHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        window.scrollTo({
            top: scrollHeight,
            behavior: 'smooth'
        });
    }

    init7x7Button.addEventListener('click', () => initializeGame(7));
    init10x10Button.addEventListener('click', () => initializeGame(10));
    showPathButton.addEventListener('click', toggleCorrectPath);
    hintButton.addEventListener('click', showHint);

    function handleCellClick() {
        const row = parseInt(this.dataset.row);
        const col = parseInt(this.dataset.col);
        
        if (this.style.backgroundColor === 'red') {
            this.style.backgroundColor = '';
            redCells = redCells.filter(cell => cell !== this);
            if (redCells.length === 0) {
                if (path.length > 0) {
                    currentStep = parseInt(path[path.length - 1].textContent) % 4 + 1;
                } else {
                    currentStep = 1;
                }
            }
        } else if (isValidNextStep(row, col)) {
            if (grid[row][col] === currentStep) {
                this.style.backgroundColor = 'green';
                path.push(this);
                currentStep = currentStep % 4 + 1;
                redCells = [];
                
                if (row === rows - 1 && col === 0) {
                    showSuccessPopup();
                }
            } else {
                this.style.backgroundColor = 'red';
                redCells.push(this);
                attempts++;
                errorCount++;
                updateShowPathButton();
                
                if (attempts >= 10) {
                    showCorrectPath();
                }
            }
        } else if (this === path[path.length - 1]) {
            this.style.backgroundColor = '';
            path.pop();
            if (path.length > 0) {
                currentStep = parseInt(path[path.length - 1].textContent) % 4 + 1;
            } else {
                currentStep = 1;
            }
            redCells = [];
        } else if (path.length > 0) {
            const lastCell = path[path.length - 1];
            const lastRow = parseInt(lastCell.dataset.row);
            const lastCol = parseInt(lastCell.dataset.col);
            
            if ((row === lastRow && col === lastCol + 1) || (row === lastRow - 1 && col === lastCol)) {
                showDirectionPopup();
            }
        }
    }

    function isValidNextStep(row, col) {
        if (path.length === 0 && row === 0 && col === cols - 1) {
            return true;
        }
        if (path.length === 0) return false;
        
        const lastCell = path[path.length - 1];
        const lastRow = parseInt(lastCell.dataset.row);
        const lastCol = parseInt(lastCell.dataset.col);
        
        return (row === lastRow && col === lastCol - 1) || 
               (row === lastRow + 1 && col === lastCol);
    }

    function showSuccessPopup() {
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <div class="popup-content success-popup">
                <h2>Bingo! You made it!</h2>
                <button onclick="location.reload()">Play Again</button>
            </div>
        `;
        document.body.appendChild(popup);

        const popupContent = popup.querySelector('.popup-content');
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                createFirework(popupContent);
            }, Math.random() * 3000);
        }
    }

    function createFirework(container) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = Math.random() * 100 + '%';
        firework.style.top = Math.random() * 100 + '%';
        firework.style.backgroundColor = getRandomColor();
        container.appendChild(firework);

        setTimeout(() => {
            firework.remove();
        }, 3000);
    }

    function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function showCorrectPath() {
        validPath.forEach(([row, col]) => {
            const cell = table.rows[row].cells[col];
            cell.dataset.originalColor = cell.style.backgroundColor;
            cell.style.backgroundColor = 'green';
        });
    }

    function hideCorrectPath() {
        validPath.forEach(([row, col]) => {
            const cell = table.rows[row].cells[col];
            cell.style.backgroundColor = cell.dataset.originalColor || '';
        });
    }

    function updateShowPathButton() {
        showPathButton.disabled = errorCount < 5;
        showPathButton.style.opacity = errorCount < 5 ? '0.5' : '1';
        showPathButton.style.cursor = errorCount < 5 ? 'not-allowed' : 'pointer';
        showPathButton.textContent = isPathShown ? '隐藏正确路径' : '显示正确路径';

      /*  if (errorCount < 5) {
            hintElement.textContent = `走错${errorCount}步，再走错${5 - errorCount}步可点击此按钮`;
        } else {
            hintElement.textContent = '已可以点击此按钮显示正确路径';
        }        */
    }

    function generateValidPath() {
        const sequence = [1, 2, 3, 4];
        let currentIndex = 0;
        let x = 0, y = cols - 1;
        validPath = [[x, y]];
        grid[x][y] = sequence[currentIndex];
        currentIndex = (currentIndex + 1) % 4;
        
        while (x < rows - 1 || y > 0) {
            if (x === rows - 1) {
                y--;
            } else if (y === 0) {
                x++;
            } else {
                if (Math.random() < 0.5) {
                    y--;
                } else {
                    x++;
                }
            }
            grid[x][y] = sequence[currentIndex];
            validPath.push([x, y]);
            currentIndex = (currentIndex + 1) % 4;
        }
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (grid[i][j] === 0) {
                    grid[i][j] = Math.floor(Math.random() * 4) + 1;
                }
            }
        }
    }

    function showDirectionPopup() {
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h2>只能朝着出口方向哦（往左或往下）</h2>
                <button onclick="this.closest('.popup').remove()">确定</button>
            </div>
        `;
        document.body.appendChild(popup);
    }

    function toggleCorrectPath() {
        if (isPathShown) {
            hideCorrectPath();
        } else {
            showCorrectPath();
        }
        isPathShown = !isPathShown;
        updateShowPathButton();
    }

    function showHint() {
        if (path.length >= validPath.length) return;

        const currentPosition = path.length > 0 ? path.length - 1 : -1;
        const hintCells = validPath.slice(currentPosition + 1, currentPosition + 3);

        hintCells.forEach(([row, col]) => {
            const cell = table.rows[row].cells[col];
            cell.style.backgroundColor = 'green';
            path.push(cell);
            currentStep = parseInt(cell.textContent) % 4 + 1;
        });

        const lastCell = hintCells[hintCells.length - 1];
        if (lastCell[0] === rows - 1 && lastCell[1] === 0) {
            showSuccessPopup();
        }
    }

    initializeGame(7);
});