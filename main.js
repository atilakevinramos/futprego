/**
 * INICIALIZAÇÃO, NAVEGAÇÃO DE MENUS E INTEGRAÇÃO DE INTERFACE
 * Inclui seleção de formação e posicionamento manual dos pregos antes da partida.
 */

document.addEventListener('DOMContentLoaded', () => {
    const menuScreen = document.getElementById('menu-screen');
    const formationScreen = document.getElementById('formation-screen');
    const gameScreen = document.getElementById('game-screen');

    const btnPlay = document.getElementById('btn-play');
    const btnOptions = document.getElementById('btn-options');
    const btnFormationBack = document.getElementById('btn-formation-back');
    const btnConfirmFormation = document.getElementById('btn-confirm-formation');

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

    // Elementos da tela tática
    const tacticalField = document.getElementById('tactical-field');
    const tacticalPegs = document.getElementById('tactical-pegs');
    const formationStatus = document.getElementById('formation-status');
    const formationButtons = document.querySelectorAll('.formation-choice');

    /*
     * Cada formação tem 8 posições:
     * 1 goleiro + 7 jogadores de linha.
     * As coordenadas são porcentagens do campo tático.
     */
    const formations = {
        '331': {
            name: '3-3-1',
            positions: [
                { x: 6, y: 50 },
                { x: 17, y: 25 },
                { x: 17, y: 50 },
                { x: 17, y: 75 },
                { x: 30, y: 25 },
                { x: 30, y: 50 },
                { x: 30, y: 75 },
                { x: 44, y: 50 }
            ]
        },
        '322': {
            name: '3-2-2',
            positions: [
                { x: 6, y: 50 },
                { x: 17, y: 25 },
                { x: 17, y: 50 },
                { x: 17, y: 75 },
                { x: 30, y: 35 },
                { x: 30, y: 65 },
                { x: 44, y: 35 },
                { x: 44, y: 65 }
            ]
        },
        '232': {
            name: '2-3-2',
            positions: [
                { x: 6, y: 50 },
                { x: 17, y: 35 },
                { x: 17, y: 65 },
                { x: 30, y: 25 },
                { x: 30, y: 50 },
                { x: 30, y: 75 },
                { x: 44, y: 35 },
                { x: 44, y: 65 }
            ]
        },
        '241': {
            name: '2-4-1',
            positions: [
                { x: 6, y: 50 },
                { x: 17, y: 35 },
                { x: 17, y: 65 },
                { x: 29, y: 18 },
                { x: 29, y: 39 },
                { x: 29, y: 61 },
                { x: 29, y: 82 },
                { x: 44, y: 50 }
            ]
        }
    };

    let selectedFormation = '331';
    let selectedAiFormation = '322';
    let customBrazilPositions = [];
    let draggingPeg = null;

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

    function copyFormationPositions(formationKey) {
        return formations[formationKey].positions.map(position => ({
            x: position.x,
            y: position.y
        }));
    }

    function chooseAiFormation() {
        const possibleFormations = Object.keys(formations)
            .filter(key => key !== selectedFormation);

        const randomIndex = Math.floor(Math.random() * possibleFormations.length);
        selectedAiFormation = possibleFormations[randomIndex];
    }

    function updateFormationButtons() {
        formationButtons.forEach(button => {
            button.classList.toggle(
                'active',
                button.dataset.formation === selectedFormation
            );
        });

        formationStatus.textContent =
            `Brasil: ${formations[selectedFormation].name} | Argentina: ${formations[selectedAiFormation].name}`;
    }

    function createTacticalPeg(team, index, position) {
        const peg = document.createElement('div');
        peg.className = `tactical-peg ${team === 'brazil' ? 'brazil-peg' : 'argentina-peg'}`;
        peg.style.left = `${position.x}%`;
        peg.style.top = `${position.y}%`;
        peg.textContent = index === 0 ? 'G' : String(index);
        peg.title = team === 'brazil'
            ? (index === 0 ? 'Goleiro do Brasil - arraste para posicionar' : `Jogador ${index} do Brasil - arraste para posicionar`)
            : (index === 0 ? 'Goleiro da Argentina' : `Jogador ${index} da Argentina`);
        peg.setAttribute('aria-label', peg.title);

        if (team === 'brazil') {
            peg.dataset.index = String(index);

            peg.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                draggingPeg = peg;
                peg.classList.add('dragging');
                if (typeof peg.setPointerCapture === 'function') {
                    peg.setPointerCapture(event.pointerId);
                }
            });
        }

        tacticalPegs.appendChild(peg);
    }

    function renderTacticalPreview() {
        tacticalPegs.innerHTML = '';

        customBrazilPositions.forEach((position, index) => {
            createTacticalPeg('brazil', index, position);
        });

        const aiPositions = formations[selectedAiFormation].positions;

        aiPositions.forEach((position, index) => {
            const mirroredPosition = {
                x: 100 - position.x,
                y: position.y
            };
            createTacticalPeg('argentina', index, mirroredPosition);
        });

        updateFormationButtons();
    }

    function selectFormation(formationKey) {
        if (!formations[formationKey]) return;

        selectedFormation = formationKey;
        customBrazilPositions = copyFormationPositions(selectedFormation);

        // A IA sempre recebe uma formação diferente da escolhida pelo jogador.
        chooseAiFormation();
        renderTacticalPreview();
    }

    function openFormationScreen() {
        menuScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        formationScreen.classList.remove('hidden');

        customBrazilPositions = copyFormationPositions(selectedFormation);
        chooseAiFormation();
        renderTacticalPreview();
    }

    function updateDraggedPeg(event) {
        if (!draggingPeg) return;

        const rect = tacticalField.getBoundingClientRect();
        const index = Number(draggingPeg.dataset.index);

        let x = ((event.clientX - rect.left) / rect.width) * 100;
        let y = ((event.clientY - rect.top) / rect.height) * 100;

        // O Brasil ocupa a metade esquerda. Mantemos os pregos dentro do campo.
        x = Math.max(5, Math.min(47, x));
        y = Math.max(8, Math.min(92, y));

        customBrazilPositions[index] = { x, y };

        draggingPeg.style.left = `${x}%`;
        draggingPeg.style.top = `${y}%`;
    }

    function finishPegDrag() {
        if (!draggingPeg) return;
        draggingPeg.classList.remove('dragging');
        draggingPeg = null;
    }

    function applyTacticalPositionsToGame() {
        // Os primeiros 8 pregos pertencem ao Brasil.
        customBrazilPositions.forEach((position, index) => {
            const peg = game.pegs[index];
            if (!peg) return;

            peg.position.x = (position.x / 100) * canvas.width;
            peg.position.y = (position.y / 100) * canvas.height;
        });

        // Os 8 pregos seguintes pertencem à Argentina.
        const aiPositions = formations[selectedAiFormation].positions;

        aiPositions.forEach((position, index) => {
            const peg = game.pegs[index + 8];
            if (!peg) return;

            peg.position.x = ((100 - position.x) / 100) * canvas.width;
            peg.position.y = (position.y / 100) * canvas.height;
        });
    }

    // NAVEGAÇÃO DE TELAS
    btnPlay.addEventListener('click', () => {
        openFormationScreen();
    });

    btnOptions.addEventListener('click', () => {
        alert('Opções: Modo contra a máquina ativo (Brasil x Argentina). Mais configurações em breve!');
    });

    btnFormationBack.addEventListener('click', () => {
        finishPegDrag();
        formationScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    });

    btnConfirmFormation.addEventListener('click', () => {
        finishPegDrag();

        applyTacticalPositionsToGame();
        game.resetFullGame();

        formationScreen.classList.add('hidden');
        menuScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        startTimer();
    });

    formationButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectFormation(button.dataset.formation);
        });
    });

    // Arraste dos pregos na tela de escalação.
    tacticalField.addEventListener('pointermove', updateDraggedPeg);
    tacticalField.addEventListener('pointerup', finishPegDrag);
    tacticalField.addEventListener('pointercancel', finishPegDrag);
    tacticalField.addEventListener('lostpointercapture', finishPegDrag);

    btnNewGame.addEventListener('click', () => {
        clearInterval(timerInterval);
        gameScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    });

    // LISTENERS DE EVENTOS DE MOUSE DO JOGO
    canvas.addEventListener('mousedown', (e) => {
        game.handleMouseDown(getCanvasMousePos(e));
    });

    window.addEventListener('mousemove', (e) => {
        game.handleMouseMove(getCanvasMousePos(e));
    });

    window.addEventListener('mouseup', () => {
        game.handleMouseUp();
    });

    // BOTÃO REINICIAR POSIÇÕES (mantém o comportamento original: reposiciona a moeda).
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
        // Só atualiza a partida quando a tela do jogo está aberta.
        // Isso impede a IA de jogar enquanto o usuário escolhe a formação.
        if (!gameScreen.classList.contains('hidden')) {
            game.update();
            game.draw();
            updateUI();
        }

        requestAnimationFrame(gameLoop);
    }

    // Prepara a formação inicial para a primeira vez que o usuário abrir a tela.
    customBrazilPositions = copyFormationPositions(selectedFormation);
    chooseAiFormation();

    gameLoop();
});
