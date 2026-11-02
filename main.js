/**
 * INICIALIZAÇÃO, NAVEGAÇÃO DE MENUS E INTEGRAÇÃO DE INTERFACE
 */

document.addEventListener('DOMContentLoaded', () => {
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const btnPlay = document.getElementById('btn-play');
    const btnOptions = document.getElementById('btn-options');

    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    // Elementos da DOM da Partida
    const scoreBrazilEl = document.getElementById('score-brazil');
    const scoreArgentinaEl = document.getElementById('score-argentina');
    const currentTurnEl = document.getElementById('current-turn');
    const panelBrazil = document.getElementById('panel-brazil');
    const panelArgentina = document.getElementById('panel-argentina');
    const timerEl = document.getElementById('timer');
    const btnRestart = document.getElementById('btn-restart');
    const btnNewGame = document.getElementById('btn-new-game');

    let secondsElapsed = 0;
    let timerInterval = null;

    function startTimer() {
        clearInterval(timerInterval);
        secondsElapsed = 0;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            secondsElapsed++;
            updateTimerDisplay();
        }, 1000);
    }

    function updateTimerDisplay() {
        const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const secs = String(secondsElapsed % 60).padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
    }

    function getCanvasMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return new Vector2D(
            (e.clientX - rect.left) * scaleX,
            (e.clientY - rect.top) * scaleY
        );
    }

    // NAVEGAÇÃO DE TELAS
    btnPlay.addEventListener('click', () => {
        menuScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        game.resetFullGame();
        startTimer();
    });

    btnOptions.addEventListener('click', () => {
        alert('Opções: Modo contra a máquina ativo (Brasil x Argentina). Mais configurações em breve!');
    });

    btnNewGame.addEventListener('click', () => {
        clearInterval(timerInterval);
        gameScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    });

    // LISTENERS DE EVENTOS DE MOUSE
    canvas.addEventListener('mousedown', (e) => {
        game.handleMouseDown(getCanvasMousePos(e));
    });

    window.addEventListener('mousemove', (e) => {
        game.handleMouseMove(getCanvasMousePos(e));
    });

    window.addEventListener('mouseup', () => {
        game.handleMouseUp();
    });

    // BOTÃO REINICIAR POSIÇÕES
    btnRestart.addEventListener('click', () => {
        game.resetCoin('brazil');
    });

    // ATUALIZAÇÃO DA INTERFACE VISUAL
    function updateUI() {
        scoreBrazilEl.textContent = game.score.brazil;
        scoreArgentinaEl.textContent = game.score.argentina;

        if (game.currentTurn === 'brazil') {
            currentTurnEl.textContent = game.aiThinking ? 'BRASIL (Aguardando...)' : 'BRASIL';
            currentTurnEl.style.color = '#ffeb3b';
            panelBrazil.classList.add('active-turn');
            panelArgentina.classList.remove('active-turn');
        } else {
            currentTurnEl.textContent = game.aiThinking ? 'ARGENTINA (Pensando...)' : 'ARGENTINA';
            currentTurnEl.style.color = '#4fc3f7';
            panelArgentina.classList.add('active-turn');
            panelBrazil.classList.remove('active-turn');
        }
    }

    // GAME LOOP PRINCIPAL (60 FPS)
    function gameLoop() {
        game.update();
        game.draw();
        updateUI();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});