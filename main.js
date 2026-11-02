/**
 * INICIALIZAÇÃO, NAVEGAÇÃO DE MENUS E INTEGRAÇÃO DE INTERFACE
 * Suporte a Seleção de Clubes do Brasileirão, IA Aleatória,
 * Cronômetro de 3 minutos, Gol de Ouro e Prévia Tática.
 */

document.addEventListener('DOMContentLoaded', () => {
    const menuScreen = document.getElementById('menu-screen');
    const optionsScreen = document.getElementById('options-screen');
    const formationScreen = document.getElementById('formation-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultModal = document.getElementById('result-modal');

    const btnPlay = document.getElementById('btn-play');
    const btnOptions = document.getElementById('btn-options');
    const btnOptionsClose = document.getElementById('btn-options-close');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const fullscreenStatus = document.getElementById('fullscreen-status');

    const btnFormationBack = document.getElementById('btn-formation-back');
    const btnConfirmFormation = document.getElementById('btn-confirm-formation');

    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    // Elementos do Placar
    const scoreP1El = document.getElementById('score-p1');
    const scoreAiEl = document.getElementById('score-ai');
    const nameP1El = document.getElementById('name-p1');
    const nameAiEl = document.getElementById('name-ai');
    const currentTurnEl = document.getElementById('current-turn');
    const panelP1 = document.getElementById('panel-p1');
    const panelAi = document.getElementById('panel-ai');
    const timerEl = document.getElementById('timer');
    const matchStatusBadge = document.getElementById('match-status-badge');
    const btnRestart = document.getElementById('btn-restart');
    const btnNewGame = document.getElementById('btn-new-game');

    // Elementos da Legenda Tática
    const legendP1Dot = document.getElementById('legend-p1-dot');
    const legendP1Text = document.getElementById('legend-p1-text');
    const legendAiDot = document.getElementById('legend-ai-dot');
    const legendAiText = document.getElementById('legend-ai-text');

    // Elementos do Modal de Resultado
    const resultTitle = document.getElementById('result-title');
    const resultSubtitle = document.getElementById('result-subtitle');
    const btnPlayAgain = document.getElementById('btn-play-again');
    const btnBackMenu = document.getElementById('btn-back-menu');

    // Elementos da Tela Tática e de Seleção
    const tacticalPegs = document.getElementById('tactical-pegs');
    const formationStatus = document.getElementById('formation-status');
    const formationButtons = document.querySelectorAll('.formation-choice');
    const teamButtons = document.querySelectorAll('.team-choice');

    const formations = {
        '433': {
            name: '4-3-3',
            positions: [
                { x: 8.2, y: 50 },
                { x: 18, y: 24 }, { x: 18, y: 41 }, { x: 18, y: 59 }, { x: 18, y: 76 },
                { x: 29, y: 30 }, { x: 29, y: 50 }, { x: 29, y: 70 },
                { x: 41, y: 27 }, { x: 41, y: 50 }, { x: 41, y: 73 }
            ]
        },
        '442': {
            name: '4-4-2',
            positions: [
                { x: 8.2, y: 50 },
                { x: 18, y: 22 }, { x: 18, y: 40 }, { x: 18, y: 60 }, { x: 18, y: 78 },
                { x: 29, y: 22 }, { x: 29, y: 41 }, { x: 29, y: 59 }, { x: 29, y: 78 },
                { x: 41, y: 36 }, { x: 41, y: 64 }
            ]
        },
        '352': {
            name: '3-5-2',
            positions: [
                { x: 8.2, y: 50 },
                { x: 18, y: 28 }, { x: 18, y: 50 }, { x: 18, y: 72 },
                { x: 29, y: 18 }, { x: 29, y: 34 }, { x: 29, y: 50 }, { x: 29, y: 66 }, { x: 29, y: 82 },
                { x: 41, y: 36 }, { x: 41, y: 64 }
            ]
        },
        '532': {
            name: '5-3-2',
            positions: [
                { x: 8.2, y: 50 },
                { x: 18, y: 18 }, { x: 18, y: 34 }, { x: 18, y: 50 }, { x: 18, y: 66 }, { x: 18, y: 82 },
                { x: 29, y: 27 }, { x: 29, y: 50 }, { x: 29, y: 73 },
                { x: 41, y: 36 }, { x: 41, y: 64 }
            ]
        },
        '4231': {
            name: '4-2-3-1',
            positions: [
                { x: 8.2, y: 50 },
                { x: 18, y: 22 }, { x: 18, y: 40 }, { x: 18, y: 60 }, { x: 18, y: 78 },
                { x: 27, y: 37 }, { x: 27, y: 63 },
                { x: 36, y: 27 }, { x: 36, y: 50 }, { x: 36, y: 73 },
                { x: 43, y: 50 }
            ]
        },
        '4141': {
            name: '4-1-4-1',
            positions: [
                { x: 8.2, y: 50 },
                { x: 18, y: 22 }, { x: 18, y: 40 }, { x: 18, y: 60 }, { x: 18, y: 78 },
                { x: 27, y: 50 },
                { x: 36, y: 22 }, { x: 36, y: 40 }, { x: 36, y: 60 }, { x: 36, y: 78 },
                { x: 43, y: 50 }
            ]
        },
        '343': {
            name: '3-4-3',
            positions: [
                { x: 8.2, y: 50 },
                { x: 18, y: 28 }, { x: 18, y: 50 }, { x: 18, y: 72 },
                { x: 29, y: 22 }, { x: 29, y: 40 }, { x: 29, y: 60 }, { x: 29, y: 78 },
                { x: 41, y: 27 }, { x: 41, y: 50 }, { x: 41, y: 73 }
            ]
        },
        '541': {
            name: '5-4-1',
            positions: [
                { x: 8.2, y: 50 },
                { x: 18, y: 18 }, { x: 18, y: 34 }, { x: 18, y: 50 }, { x: 18, y: 66 }, { x: 18, y: 82 },
                { x: 29, y: 22 }, { x: 29, y: 40 }, { x: 29, y: 60 }, { x: 29, y: 78 },
                { x: 43, y: 50 }
            ]
        },
        '3421': {
            name: '3-4-2-1',
            positions: [
                { x: 8.2, y: 50 },
                { x: 18, y: 28 }, { x: 18, y: 50 }, { x: 18, y: 72 },
                { x: 28, y: 22 }, { x: 28, y: 40 }, { x: 28, y: 60 }, { x: 28, y: 78 },
                { x: 37, y: 36 }, { x: 37, y: 64 },
                { x: 43, y: 50 }
            ]
        }
    };

    let selectedP1Team = 'flamengo';
    let selectedAiTeam = 'vasco';
    let selectedFormation = '433';
    let selectedAiFormation = '442';

    let timeLeft = 180; // 3 minutos em segundos
    let timerInterval = null;
    let isTimerRunning = false;
    let isGoldGoalMode = false;
    let matchEnded = false;

    // =====================================================
    // SELEÇÃO DE TIMES E IA ALEATÓRIA
    // =====================================================

    function selectAiTeamRandomly() {
        const availableTeams = Object.keys(TEAMS).filter(t => t !== selectedP1Team);
        const randomIndex = Math.floor(Math.random() * availableTeams.length);
        selectedAiTeam = availableTeams[randomIndex];
    }

    function updateTeamSelectionUI() {
        teamButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.team === selectedP1Team);
        });

        const p1Config = TEAMS[selectedP1Team];
        const aiConfig = TEAMS[selectedAiTeam];

        // Atualiza a legenda da prévia tática
        legendP1Dot.style.background = p1Config.primaryColor;
        legendP1Dot.style.border = `2px solid ${p1Config.secondaryColor}`;
        legendP1Text.textContent = `${p1Config.name}`;

        legendAiDot.style.background = aiConfig.primaryColor;
        legendAiDot.style.border = `2px solid ${aiConfig.secondaryColor}`;
        legendAiText.textContent = `${aiConfig.name} (IA)`;

        // Atualiza o placar
        nameP1El.textContent = p1Config.name;
        nameAiEl.textContent = aiConfig.name;

        panelP1.style.borderLeftColor = p1Config.primaryColor;
        panelAi.style.borderRightColor = aiConfig.primaryColor;
    }

    teamButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedP1Team = btn.dataset.team;
            selectAiTeamRandomly();
            updateTeamSelectionUI();
            game.setTeams(selectedP1Team, selectedAiTeam);
            renderTacticalPreview();
        });
    });

    // =====================================================
    // TELA CHEIA
    // =====================================================

    function updateFullscreenInterface() {
        const isFullscreen = Boolean(document.fullscreenElement);
        fullscreenStatus.textContent = isFullscreen ? 'Modo tela cheia ativado' : 'Modo janela';
        btnFullscreen.textContent = isFullscreen ? 'SAIR DA TELA CHEIA' : 'ATIVAR';
        btnFullscreen.classList.toggle('fullscreen-active', isFullscreen);
    }

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                }
            }
        } catch (error) {
            console.error('Erro ao alternar tela cheia:', error);
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
    // CRONÔMETRO E GOL DE OURO
    // =====================================================

    function initTimer() {
        clearInterval(timerInterval);
        timeLeft = 180;
        isTimerRunning = false;
        isGoldGoalMode = false;
        matchEnded = false;
        matchStatusBadge.classList.add('hidden');
        updateTimerDisplay();
    }

    function startTimerIfNeeded() {
        if (isTimerRunning || matchEnded || isGoldGoalMode) return;
        isTimerRunning = true;

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (matchEnded || !isTimerRunning) return;

            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();

                if (timeLeft === 0) {
                    handleTimeZero();
                }
            }
        }, 1000);
    }

    function pauseTimer() {
        isTimerRunning = false;
        clearInterval(timerInterval);
    }

    function updateTimerDisplay() {
        const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const secs = String(timeLeft % 60).padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
    }

    function handleTimeZero() {
        const p1Score = game.score.p1;
        const aiScore = game.score.ai;
        const p1Name = TEAMS[selectedP1Team].name;
        const aiName = TEAMS[selectedAiTeam].name;

        if (p1Score > aiScore) {
            endMatch(p1Name, 'Tempo Regulamentar', p1Score, aiScore);
        } else if (aiScore > p1Score) {
            endMatch(aiName, 'Tempo Regulamentar', p1Score, aiScore);
        } else {
            isGoldGoalMode = true;
            isTimerRunning = false;
            clearInterval(timerInterval);
            timerEl.textContent = '00:00';
            matchStatusBadge.textContent = 'GOL DE OURO';
            matchStatusBadge.classList.remove('hidden');
        }
    }

    // Callbacks do Jogo
    game.onFirstShotCallback = () => {
        if (!matchEnded && !isGoldGoalMode) {
            startTimerIfNeeded();
        }
    };

    game.onGoalScoredCallback = (scoringTeam) => {
        if (matchEnded) return;
        pauseTimer();

        const p1Score = game.score.p1;
        const aiScore = game.score.ai;
        const p1Name = TEAMS[selectedP1Team].name;
        const aiName = TEAMS[selectedAiTeam].name;

        if (isGoldGoalMode) {
            const winner = p1Score > aiScore ? p1Name : aiName;
            setTimeout(() => {
                endMatch(winner, 'Gol de Ouro', p1Score, aiScore);
            }, 2000);
        } else if (timeLeft === 0) {
            const winner = p1Score > aiScore ? p1Name : (aiScore > p1Score ? aiName : null);
            if (winner) {
                setTimeout(() => {
                    endMatch(winner, 'Tempo Regulamentar', p1Score, aiScore);
                }, 2000);
            }
        }
    };

    game.onGoalAnimationEndCallback = () => {
        // Cronômetro permanece congelado até o próximo chute
    };

    function endMatch(winnerName, victoryType, p1Score, aiScore) {
        if (matchEnded) return;
        matchEnded = true;
        pauseTimer();

        resultTitle.textContent = `${winnerName} VENCEU`;
        if (victoryType === 'Gol de Ouro') {
            resultSubtitle.textContent = `${winnerName} VENCEU — GOL DE OURO — ${p1Score} x ${aiScore}`;
        } else {
            resultSubtitle.textContent = `Placar Final — ${p1Score} x ${aiScore}`;
        }

        setTimeout(() => {
            resultModal.classList.remove('hidden');
        }, 1000);
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

    function chooseAiFormation() {
        const possibleFormations = Object.keys(formations).filter(key => key !== selectedFormation);
        const randomIndex = Math.floor(Math.random() * possibleFormations.length);
        selectedAiFormation = possibleFormations[randomIndex];
    }

    function updateFormationButtons() {
        formationButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.formation === selectedFormation);
        });

        const p1Name = TEAMS[selectedP1Team].name;
        const aiName = TEAMS[selectedAiTeam].name;
        formationStatus.textContent = `${p1Name}: ${formations[selectedFormation].name} | ${aiName}: ${formations[selectedAiFormation].name}`;
    }

    function createTacticalPeg(teamKey, index, position) {
        const peg = document.createElement('div');
        peg.className = 'tactical-peg';
        
        const teamConfig = TEAMS[teamKey];
        peg.style.left = `${position.x}%`;
        peg.style.top = `${position.y}%`;
        peg.style.background = teamConfig.primaryColor;
        peg.style.border = `2px solid ${teamConfig.secondaryColor}`;
        peg.style.color = teamConfig.secondaryColor === '#ffffff' ? '#ffffff' : '#ffffff';
        peg.textContent = index === 0 ? 'G' : String(index);
        tacticalPegs.appendChild(peg);
    }

    function renderTacticalPreview() {
        tacticalPegs.innerHTML = '';

        formations[selectedFormation].positions.forEach((position, index) => {
            createTacticalPeg(selectedP1Team, index, position);
        });

        formations[selectedAiFormation].positions.forEach((position, index) => {
            const mirroredPosition = { x: 100 - position.x, y: position.y };
            createTacticalPeg(selectedAiTeam, index, mirroredPosition);
        });

        updateFormationButtons();
    }

    function applyTacticalPositionsToGame() {
        formations[selectedFormation].positions.forEach((position, index) => {
            const peg = game.pegs[index];
            if (!peg) return;
            peg.position.x = (position.x / 100) * canvas.width;
            peg.position.y = (position.y / 100) * canvas.height;
        });

        formations[selectedAiFormation].positions.forEach((position, index) => {
            const peg = game.pegs[index + 11];
            if (!peg) return;
            peg.position.x = ((100 - position.x) / 100) * canvas.width;
            peg.position.y = (position.y / 100) * canvas.height;
        });
    }

    // =====================================================
    // NAVEGAÇÃO
    // =====================================================

    btnPlay.addEventListener('click', () => {
        menuScreen.classList.add('hidden');
        optionsScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        formationScreen.classList.remove('hidden');

        selectAiTeamRandomly();
        chooseAiFormation();
        updateTeamSelectionUI();
        game.setTeams(selectedP1Team, selectedAiTeam);
        renderTacticalPreview();
    });

    btnFormationBack.addEventListener('click', () => {
        formationScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    });

    btnConfirmFormation.addEventListener('click', () => {
        applyTacticalPositionsToGame();
        game.resetFullGame();

        formationScreen.classList.add('hidden');
        menuScreen.classList.add('hidden');
        optionsScreen.classList.add('hidden');
        resultModal.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        initTimer();
    });

    formationButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedFormation = button.dataset.formation;
            chooseAiFormation();
            renderTacticalPreview();
        });
    });

    btnNewGame.addEventListener('click', () => {
        pauseTimer();
        gameScreen.classList.add('hidden');
        resultModal.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    });

    btnPlayAgain.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        selectAiTeamRandomly();
        updateTeamSelectionUI();
        game.setTeams(selectedP1Team, selectedAiTeam);
        applyTacticalPositionsToGame();
        game.resetFullGame();
        initTimer();
    });

    btnBackMenu.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        gameScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    });

    canvas.addEventListener('mousedown', e => {
        if (!matchEnded && !game.isCelebrating) game.handleMouseDown(getCanvasMousePos(e));
    });

    window.addEventListener('mousemove', e => {
        if (!matchEnded && !game.isCelebrating) game.handleMouseMove(getCanvasMousePos(e));
    });

    window.addEventListener('mouseup', () => {
        if (!matchEnded && !game.isCelebrating) game.handleMouseUp();
    });

    btnRestart.addEventListener('click', () => {
        if (!matchEnded && !game.isCelebrating) {
            game.resetCoin('p1');
            pauseTimer();
        }
    });

    function updateUI() {
        scoreP1El.textContent = game.score.p1;
        scoreAiEl.textContent = game.score.ai;

        const p1Name = TEAMS[selectedP1Team].name;
        const aiName = TEAMS[selectedAiTeam].name;

        if (game.currentTurn === 'p1') {
            currentTurnEl.textContent = game.aiThinking ? `${p1Name} (Aguardando...)` : p1Name;
            currentTurnEl.style.color = TEAMS[selectedP1Team].primaryColor === '#111111' ? '#ffffff' : TEAMS[selectedP1Team].primaryColor;
            panelP1.classList.add('active-turn');
            panelAi.classList.remove('active-turn');
        } else {
            currentTurnEl.textContent = game.aiThinking ? `${aiName} (Pensando...)` : aiName;
            currentTurnEl.style.color = TEAMS[selectedAiTeam].primaryColor === '#111111' ? '#ffffff' : TEAMS[selectedAiTeam].primaryColor;
            panelAi.classList.add('active-turn');
            panelP1.classList.remove('active-turn');
        }
    }

    function gameLoop() {
        if (!gameScreen.classList.contains('hidden')) {
            game.update();
            game.draw();
            updateUI();
        }
        requestAnimationFrame(gameLoop);
    }

    selectAiTeamRandomly();
    chooseAiFormation();
    updateTeamSelectionUI();
    game.setTeams(selectedP1Team, selectedAiTeam);
    updateFullscreenInterface();
    gameLoop();
});