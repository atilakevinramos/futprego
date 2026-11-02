/**
 * INICIALIZAÇÃO, NAVEGAÇÃO DE MENUS E INTEGRAÇÃO DE INTERFACE
 * Inclui seleção de formação, posicionamento manual e opções do jogo.
 */

document.addEventListener('DOMContentLoaded', () => {
    const menuScreen = document.getElementById('menu-screen');
    const optionsScreen = document.getElementById('options-screen');
    const formationScreen = document.getElementById('formation-screen');
    const gameScreen = document.getElementById('game-screen');

    const btnPlay = document.getElementById('btn-play');
    const btnOptions = document.getElementById('btn-options');
    const btnOptionsClose = document.getElementById('btn-options-close');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const fullscreenStatus = document.getElementById('fullscreen-status');

    const btnFormationBack = document.getElementById('btn-formation-back');
    const btnConfirmFormation = document.getElementById('btn-confirm-formation');

    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    // Elementos da partida
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
     * Cada formação possui 11 posições:
     * 1 goleiro + 10 jogadores de linha.
     *
     * As coordenadas são porcentagens do campo tático.
     *
     * O limite mínimo de X é 12%, mantendo os jogadores
     * afastados da região imediata do próprio gol.
     */

    const formations = {
        '433': {
            name: '4-3-3',
            positions: [
                // Goleiro
                { x: 12, y: 50 },

                // Defesa - 4 jogadores
                { x: 20, y: 18 },
                { x: 20, y: 39 },
                { x: 20, y: 61 },
                { x: 20, y: 82 },

                // Meio-campo - 3 jogadores
                { x: 32, y: 25 },
                { x: 32, y: 50 },
                { x: 32, y: 75 },

                // Ataque - 3 jogadores
                { x: 44, y: 25 },
                { x: 44, y: 50 },
                { x: 44, y: 75 }
            ]
        },

        '442': {
            name: '4-4-2',
            positions: [
                // Goleiro
                { x: 12, y: 50 },

                // Defesa - 4 jogadores
                { x: 20, y: 18 },
                { x: 20, y: 39 },
                { x: 20, y: 61 },
                { x: 20, y: 82 },

                // Meio-campo - 4 jogadores
                { x: 32, y: 18 },
                { x: 32, y: 39 },
                { x: 32, y: 61 },
                { x: 32, y: 82 },

                // Ataque - 2 jogadores
                { x: 44, y: 35 },
                { x: 44, y: 65 }
            ]
        },

        '352': {
            name: '3-5-2',
            positions: [
                // Goleiro
                { x: 12, y: 50 },

                // Defesa - 3 jogadores
                { x: 20, y: 25 },
                { x: 20, y: 50 },
                { x: 20, y: 75 },

                // Meio-campo - 5 jogadores
                { x: 32, y: 12 },
                { x: 32, y: 31 },
                { x: 32, y: 50 },
                { x: 32, y: 69 },
                { x: 32, y: 88 },

                // Ataque - 2 jogadores
                { x: 44, y: 35 },
                { x: 44, y: 65 }
            ]
        },

        '532': {
            name: '5-3-2',
            positions: [
                // Goleiro
                { x: 12, y: 50 },

                // Defesa - 5 jogadores
                { x: 20, y: 12 },
                { x: 20, y: 31 },
                { x: 20, y: 50 },
                { x: 20, y: 69 },
                { x: 20, y: 88 },

                // Meio-campo - 3 jogadores
                { x: 32, y: 25 },
                { x: 32, y: 50 },
                { x: 32, y: 75 },

                // Ataque - 2 jogadores
                { x: 44, y: 35 },
                { x: 44, y: 65 }
            ]
        }
    };

    let selectedFormation = '433';
    let selectedAiFormation = '442';
    let customBrazilPositions = [];
    let draggingPeg = null;

    let secondsElapsed = 0;
    let timerInterval = null;

    // =====================================================
    // OPÇÕES E TELA CHEIA
    // =====================================================

    function updateFullscreenInterface() {
        const isFullscreen = Boolean(document.fullscreenElement);

        fullscreenStatus.textContent = isFullscreen
            ? 'Modo tela cheia ativado'
            : 'Modo janela';

        btnFullscreen.textContent = isFullscreen
            ? 'SAIR DA TELA CHEIA'
            : 'ATIVAR';

        btnFullscreen.classList.toggle('fullscreen-active', isFullscreen);
    }

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                if (!document.documentElement.requestFullscreen) {
                    fullscreenStatus.textContent =
                        'Seu navegador não oferece suporte à tela cheia.';
                    return;
                }

                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Não foi possível alterar a tela cheia:', error);

            fullscreenStatus.textContent =
                'Não foi possível alterar o modo de tela.';
        }

        updateFullscreenInterface();
    }

    btnOptions.addEventListener('click', () => {
        menuScreen.classList.add('hidden');
        optionsScreen.classList.remove('hidden');
        updateFullscreenInterface();
    });

    btnOptionsClose.addEventListener('click', () => {
        optionsScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    });

    btnFullscreen.addEventListener('click', toggleFullscreen);

    document.addEventListener('fullscreenchange', updateFullscreenInterface);

    // =====================================================
    // CRONÔMETRO
    // =====================================================

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
        const mins = String(
            Math.floor(secondsElapsed / 60)
        ).padStart(2, '0');

        const secs = String(
            secondsElapsed % 60
        ).padStart(2, '0');

        timerEl.textContent = `${mins}:${secs}`;
    }

    // =====================================================
    // POSIÇÃO DO MOUSE NO CANVAS
    // =====================================================

    function getCanvasMousePos(e) {
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return new Vector2D(
            (e.clientX - rect.left) * scaleX,
            (e.clientY - rect.top) * scaleY
        );
    }

    // =====================================================
    // SISTEMA DE FORMAÇÕES
    // =====================================================

    function copyFormationPositions(formationKey) {
        return formations[formationKey].positions.map(position => ({
            x: position.x,
            y: position.y
        }));
    }

    function chooseAiFormation() {
        const possibleFormations = Object.keys(formations)
            .filter(key => key !== selectedFormation);

        const randomIndex = Math.floor(
            Math.random() * possibleFormations.length
        );

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

        peg.className = `tactical-peg ${
            team === 'brazil' ? 'brazil-peg' : 'argentina-peg'
        }`;

        peg.style.left = `${position.x}%`;
        peg.style.top = `${position.y}%`;

        peg.textContent = index === 0 ? 'G' : String(index);

        peg.title = team === 'brazil'
            ? (
                index === 0
                    ? 'Goleiro do Brasil - arraste para posicionar'
                    : `Jogador ${index} do Brasil - arraste para posicionar`
            )
            : (
                index === 0
                    ? 'Goleiro da Argentina'
                    : `Jogador ${index} da Argentina`
            );

        peg.setAttribute('aria-label', peg.title);

        if (team === 'brazil') {
            peg.dataset.index = String(index);

            peg.addEventListener('pointerdown', event => {
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

        // Desenha os 11 pregos brasileiros
        customBrazilPositions.forEach((position, index) => {
            createTacticalPeg('brazil', index, position);
        });

        // Desenha os 11 pregos argentinos espelhados
        const aiPositions = formations[selectedAiFormation].positions;

        aiPositions.forEach((position, index) => {
            const mirroredPosition = {
                x: 100 - position.x,
                y: position.y
            };

            createTacticalPeg(
                'argentina',
                index,
                mirroredPosition
            );
        });

        updateFormationButtons();
    }

    function selectFormation(formationKey) {
        if (!formations[formationKey]) return;

        selectedFormation = formationKey;

        customBrazilPositions = copyFormationPositions(
            selectedFormation
        );

        // A IA sempre recebe uma formação diferente da escolhida.
        chooseAiFormation();

        renderTacticalPreview();
    }

    function openFormationScreen() {
        menuScreen.classList.add('hidden');
        optionsScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        formationScreen.classList.remove('hidden');

        customBrazilPositions = copyFormationPositions(
            selectedFormation
        );

        chooseAiFormation();
        renderTacticalPreview();
    }

    // =====================================================
    // ARRASTE DOS PREGOS
    // =====================================================

    function updateDraggedPeg(event) {
        if (!draggingPeg) return;

        const rect = tacticalField.getBoundingClientRect();
        const index = Number(draggingPeg.dataset.index);

        let x = ((event.clientX - rect.left) / rect.width) * 100;
        let y = ((event.clientY - rect.top) / rect.height) * 100;

        /*
         * ZONA DE SEGURANÇA:
         *
         * O Brasil só pode posicionar seus pregos entre 12% e 47%
         * da largura do campo.
         *
         * A Argentina ocupa o lado espelhado, entre 53% e 88%.
         *
         * Isso impede que os jogadores fiquem colados à boca dos gols.
         */

        x = Math.max(12, Math.min(47, x));
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

    // =====================================================
    // APLICAÇÃO DAS FORMAÇÕES NA PARTIDA
    // =====================================================

    function applyTacticalPositionsToGame() {
        // Aplica os 11 pregos brasileiros
        customBrazilPositions.forEach((position, index) => {
            const peg = game.pegs[index];

            if (!peg) return;

            peg.position.x =
                (position.x / 100) * canvas.width;

            peg.position.y =
                (position.y / 100) * canvas.height;
        });

        // Aplica os 11 pregos argentinos
        const aiPositions = formations[selectedAiFormation].positions;

        aiPositions.forEach((position, index) => {
            // A Argentina começa depois dos 11 pregos brasileiros.
            const peg = game.pegs[index + 11];

            if (!peg) return;

            peg.position.x =
                ((100 - position.x) / 100) * canvas.width;

            peg.position.y =
                (position.y / 100) * canvas.height;
        });
    }

    // =====================================================
    // NAVEGAÇÃO DE TELAS
    // =====================================================

    btnPlay.addEventListener('click', () => {
        openFormationScreen();
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
        optionsScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        startTimer();
    });

    formationButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectFormation(button.dataset.formation);
        });
    });

    tacticalField.addEventListener('pointermove', updateDraggedPeg);
    tacticalField.addEventListener('pointerup', finishPegDrag);
    tacticalField.addEventListener('pointercancel', finishPegDrag);
    tacticalField.addEventListener('lostpointercapture', finishPegDrag);

    btnNewGame.addEventListener('click', () => {
        clearInterval(timerInterval);

        gameScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    });

    // =====================================================
    // CONTROLES DE MOUSE DO JOGO
    // =====================================================

    canvas.addEventListener('mousedown', e => {
        game.handleMouseDown(getCanvasMousePos(e));
    });

    window.addEventListener('mousemove', e => {
        game.handleMouseMove(getCanvasMousePos(e));
    });

    window.addEventListener('mouseup', () => {
        game.handleMouseUp();
    });

    // =====================================================
    // BOTÃO REINICIAR POSIÇÕES
    // Mantém o comportamento original: reposiciona a moeda.
    // =====================================================

    btnRestart.addEventListener('click', () => {
        game.resetCoin('brazil');
    });

    // =====================================================
    // ATUALIZAÇÃO DA INTERFACE VISUAL
    // =====================================================

    function updateUI() {
        scoreBrazilEl.textContent = game.score.brazil;
        scoreArgentinaEl.textContent = game.score.argentina;

        if (game.currentTurn === 'brazil') {
            currentTurnEl.textContent = game.aiThinking
                ? 'BRASIL (Aguardando...)'
                : 'BRASIL';

            currentTurnEl.style.color = '#ffeb3b';

            panelBrazil.classList.add('active-turn');
            panelArgentina.classList.remove('active-turn');
        } else {
            currentTurnEl.textContent = game.aiThinking
                ? 'ARGENTINA (Pensando...)'
                : 'ARGENTINA';

            currentTurnEl.style.color = '#4fc3f7';

            panelArgentina.classList.add('active-turn');
            panelBrazil.classList.remove('active-turn');
        }
    }

    // =====================================================
    // GAME LOOP PRINCIPAL
    // =====================================================

    function gameLoop() {
        // Só atualiza a partida quando a tela do jogo está aberta.
        if (!gameScreen.classList.contains('hidden')) {
            game.update();
            game.draw();
            updateUI();
        }

        requestAnimationFrame(gameLoop);
    }

    // Prepara a formação inicial.
    customBrazilPositions = copyFormationPositions(selectedFormation);
    chooseAiFormation();

    updateFullscreenInterface();
    gameLoop();
});