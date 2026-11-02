/**
 * REGRAS, ELEMENTOS DO JOGO, IA E RENDERIZAÇÃO CANVAS
 * Edição de Clubes do Brasileirão com Moeda de 5 Centavos
 */

// REGISTRO CENTRALIZADO DE CLUBES (Com os 8 clubes integrados)
const TEAMS = {
    flamengo: {
        id: 'flamengo',
        name: 'FLAMENGO',
        primaryColor: '#c62828',   // Vermelho
        secondaryColor: '#111111', // Preto
        accentColor: '#ffffff',
        pattern: 'horizontal',
        gkBody: '#111111',
        gkDetail: '#c62828'
    },
    vasco: {
        id: 'vasco',
        name: 'VASCO',
        primaryColor: '#111111',   // Preto
        secondaryColor: '#ffffff', // Faixa diagonal branca
        accentColor: '#d32f2f',    // Detalhe discreto em vermelho
        pattern: 'diagonal',
        gkBody: '#212121',
        gkDetail: '#ffffff'
    },
    gremio: {
        id: 'gremio',
        name: 'GRÊMIO',
        primaryColor: '#1e88e5',   // Azul
        secondaryColor: '#111111', // Preto
        accentColor: '#ffffff',    // Branco
        pattern: 'vertical',
        gkBody: '#0d47a1',
        gkDetail: '#ffffff'
    },
    inter: {
        id: 'inter',
        name: 'INTERNACIONAL',
        primaryColor: '#d32f2f',   // Vermelho
        secondaryColor: '#ffffff', // Branco
        accentColor: '#ffffff',
        pattern: 'solid',
        gkBody: '#b71c1c',
        gkDetail: '#ffffff'
    },
    cruzeiro: {
        id: 'cruzeiro',
        name: 'CRUZEIRO',
        primaryColor: '#1565c0',   // Azul predominante
        secondaryColor: '#ffffff', // Branco
        accentColor: '#ffffff',
        pattern: 'solid',
        gkBody: '#0d47a1',
        gkDetail: '#ffffff'
    },
    botafogo: {
        id: 'botafogo',
        name: 'BOTAFOGO',
        primaryColor: '#111111',   // Preto
        secondaryColor: '#ffffff', // Branco
        accentColor: '#ffffff',
        pattern: 'vertical',
        gkBody: '#333333',
        gkDetail: '#ffffff'
    },
    palmeiras: {
        id: 'palmeiras',
        name: 'PALMEIRAS',
        primaryColor: '#2e7d32',   // Verde predominante
        secondaryColor: '#ffffff', // Branco
        accentColor: '#ffffff',
        pattern: 'solid',
        gkBody: '#1b5e20',
        gkDetail: '#ffffff'
    },
    saopaulo: {
        id: 'saopaulo',
        name: 'SÃO PAULO',
        primaryColor: '#ffffff',   // Branco predominante
        secondaryColor: '#c62828', // Vermelho e preto
        accentColor: '#111111',
        pattern: 'horizontal',
        gkBody: '#424242',
        gkDetail: '#ffffff'
    }
};

class Coin {
    constructor(x, y, radius = 10) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.radius = radius; // Preserva o raio físico original (12.6px)
        this.isMoving = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // 1. Sombra projetada no gramado
        ctx.beginPath();
        ctx.arc(3, 3, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        // 2. Base metálica acobreada (Moeda de 5 Centavos)
        const baseGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, this.radius);
        baseGrad.addColorStop(0, '#f3a97b');
        baseGrad.addColorStop(0.5, '#b86638');
        baseGrad.addColorStop(0.85, '#8c431d');
        baseGrad.addColorStop(1, '#5c2b10');

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = baseGrad;
        ctx.fill();

        // 3. Borda metálica externa com relevo
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#fce4d6';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 1.8, 0, Math.PI * 2);
        ctx.strokeStyle = '#421a08';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 4. Detalhes internos em relevo (Estilo 5 Centavos)
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(252, 228, 214, 0.4)';
        ctx.stroke();

        // Inscrição visual do valor "5"
        ctx.fillStyle = 'rgba(255, 235, 215, 0.85)';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('5', 0, -1);

        // Micro detalhes em linhas diagonais no fundo (relevo da moeda)
        ctx.strokeStyle = 'rgba(66, 26, 8, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-5, 4);
        ctx.lineTo(5, 4);
        ctx.stroke();

        ctx.restore();
    }
}

class Peg {
    constructor(x, y, teamId, radius = 9.6, isGoalKeeper = false) { 
        this.position = new Vector2D(x, y);
        this.teamId = teamId;
        this.radius = radius;
        this.isGoalKeeper = isGoalKeeper;
        this.gkDirection = 1; // 1 para baixo, -1 para cima
    }

    draw(ctx) {
        if (this.teamId === 'none') return;

        const teamConfig = TEAMS[this.teamId];
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Sombra da peça
        ctx.beginPath();
        ctx.arc(2, 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();

        // Anel metálico externo 3D (Prego/Botão)
        const metalGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, this.radius);
        metalGrad.addColorStop(0, '#ffffff');
        metalGrad.addColorStop(0.7, '#888888');
        metalGrad.addColorStop(1, '#222222');

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = metalGrad;
        ctx.fill();
        ctx.strokeStyle = this.isGoalKeeper ? '#ffea00' : '#111';
        ctx.lineWidth = this.isGoalKeeper ? 2 : 1;
        ctx.stroke();

        // Miolo da peça com a Identidade Visual do Clube
        const innerRadius = Math.max(1, this.radius - 3.8);
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        ctx.clip(); // Restringe os padrões visuais ao centro da peça

        if (teamConfig) {
            if (this.isGoalKeeper) {
                ctx.fillStyle = teamConfig.gkBody;
                ctx.fillRect(-innerRadius, -innerRadius, innerRadius * 2, innerRadius * 2);

                ctx.beginPath();
                ctx.arc(0, 0, innerRadius * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = teamConfig.gkDetail;
                ctx.fill();
            } else {
                ctx.fillStyle = teamConfig.primaryColor;
                ctx.fillRect(-innerRadius, -innerRadius, innerRadius * 2, innerRadius * 2);

                // Aplicação dos Padrões por Clube
                if (teamConfig.pattern === 'horizontal') {
                    ctx.fillStyle = teamConfig.secondaryColor;
                    ctx.fillRect(-innerRadius, -innerRadius * 0.35, innerRadius * 2, innerRadius * 0.7);
                    if (teamConfig.id === 'saopaulo') {
                        // Detalhe tricolor adicional para o São Paulo
                        ctx.fillStyle = '#c62828';
                        ctx.fillRect(-innerRadius, -innerRadius * 0.1, innerRadius * 2, innerRadius * 0.2);
                    }
                } else if (teamConfig.pattern === 'diagonal') {
                    ctx.fillStyle = teamConfig.secondaryColor;
                    ctx.beginPath();
                    ctx.moveTo(-innerRadius, innerRadius * 0.6);
                    ctx.lineTo(innerRadius * 0.6, -innerRadius);
                    ctx.lineTo(innerRadius, -innerRadius);
                    ctx.lineTo(-innerRadius, innerRadius);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = teamConfig.accentColor;
                    ctx.beginPath();
                    ctx.arc(0, 0, innerRadius * 0.25, 0, Math.PI * 2);
                    ctx.fill();
                } else if (teamConfig.pattern === 'vertical') {
                    ctx.fillStyle = teamConfig.secondaryColor;
                    ctx.fillRect(-innerRadius * 0.4, -innerRadius, innerRadius * 0.8, innerRadius * 2);

                    ctx.fillStyle = teamConfig.accentColor;
                    ctx.fillRect(-innerRadius * 0.15, -innerRadius, innerRadius * 0.3, innerRadius * 2);
                } else if (teamConfig.pattern === 'solid') {
                    ctx.beginPath();
                    ctx.arc(0, 0, innerRadius * 0.45, 0, Math.PI * 2);
                    ctx.fillStyle = teamConfig.secondaryColor;
                    ctx.fill();
                }
            }
        }

        ctx.restore();
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.physics = new PhysicsEngine();

        this.marginHorizontal = 85;
        this.marginVertical = 45;
        this.bounds = {
            left: this.marginHorizontal,
            right: this.canvas.width - this.marginHorizontal,
            top: this.marginVertical,
            bottom: this.canvas.height - this.marginVertical
        };

        const goalSize = 82.0;
        const centerY = this.canvas.height / 2;

        this.goals = {
            left: {
                top: centerY - goalSize / 2,
                bottom: centerY + goalSize / 2,
                depth: 38
            },
            right: {
                top: centerY - goalSize / 2,
                bottom: centerY + goalSize / 2,
                depth: 38
            }
        };

        this.p1TeamKey = 'flamengo';
        this.aiTeamKey = 'vasco';

        this.score = { p1: 0, ai: 0 };
        this.currentTurn = 'p1';
        this.isAiming = false;
        this.dragStart = new Vector2D(0, 0);
        this.dragCurrent = new Vector2D(0, 0);
        this.goalScoredLocked = false;
        this.aiThinking = false;
        
        // Controle da Regra de Saída de Bola
        this.isKickoffState = true;
        
        // Comemoração de Gol
        this.isCelebrating = false;
        this.celebrationTimer = 0;
        this.celebrationDuration = 120;
        this.celebratingTeam = null;
        this.celebrationParticles = [];
        this.flashAlpha = 0;

        // Callbacks
        this.onGoalScoredCallback = null;
        this.onFirstShotCallback = null;
        this.onGoalAnimationEndCallback = null;

        this.coin = new Coin(this.canvas.width / 2, this.canvas.height / 2);
        this.pegs = [];
        this.posts = [];

        this.initPegs();
        this.initPosts();
    }

    setTeams(p1TeamKey, aiTeamKey) {
        this.p1TeamKey = p1TeamKey;
        this.aiTeamKey = aiTeamKey;
        this.initPegs();
    }

    initPegs() {
        this.pegs = [];

        const w = this.canvas.width;
        const h = this.canvas.height;

        const p1Positions = [
            { x: w * 0.082, y: h * 0.50 }, 
            { x: w * 0.18, y: h * 0.24 }, { x: w * 0.18, y: h * 0.41 },
            { x: w * 0.18, y: h * 0.59 }, { x: w * 0.18, y: h * 0.76 },
            { x: w * 0.29, y: h * 0.30 }, { x: w * 0.29, y: h * 0.50 },
            { x: w * 0.29, y: h * 0.70 },
            { x: w * 0.41, y: h * 0.27 }, { x: w * 0.41, y: h * 0.50 },
            { x: w * 0.41, y: h * 0.73 }
        ];

        const aiPositions = [
            { x: w * 0.918, y: h * 0.50 }, 
            { x: w * 0.82, y: h * 0.24 }, { x: w * 0.82, y: h * 0.41 },
            { x: w * 0.82, y: h * 0.59 }, { x: w * 0.82, y: h * 0.76 },
            { x: w * 0.71, y: h * 0.30 }, { x: w * 0.71, y: h * 0.50 },
            { x: w * 0.71, y: h * 0.70 },
            { x: w * 0.59, y: h * 0.27 }, { x: w * 0.59, y: h * 0.50 },
            { x: w * 0.59, y: h * 0.73 }
        ];

        p1Positions.forEach((p, idx) => {
            const isGK = (idx === 0);
            const radius = isGK ? 10.4 : 9.6;
            this.pegs.push(new Peg(p.x, p.y, this.p1TeamKey, radius, isGK));
        });

        aiPositions.forEach((p, idx) => {
            const isGK = (idx === 0);
            const radius = isGK ? 10.4 : 9.6;
            this.pegs.push(new Peg(p.x, p.y, this.aiTeamKey, radius, isGK));
        });
    }

    initPosts() {
        this.posts = [
            new Peg(this.bounds.left, this.goals.left.top, 'none', 5.5),
            new Peg(this.bounds.left, this.goals.left.bottom, 'none', 5.5),
            new Peg(this.bounds.right, this.goals.right.top, 'none', 5.5),
            new Peg(this.bounds.right, this.goals.right.bottom, 'none', 5.5)
        ];
    }

    resetCoin(startingTeam = null) {
        this.coin.position = new Vector2D(
            this.canvas.width / 2,
            this.canvas.height / 2
        );

        this.coin.velocity = new Vector2D(0, 0);
        this.coin.isMoving = false;
        this.goalScoredLocked = false;
        this.aiThinking = false;
        this.isCelebrating = false;
        this.isKickoffState = true; // Ativa a restrição da saída de bola

        if (startingTeam) {
            this.currentTurn = startingTeam;
        }
    }

    resetFullGame() {
        this.score = { p1: 0, ai: 0 };
        this.isCelebrating = false;
        this.resetCoin('p1');
    }

    update() {
        if (this.isCelebrating) {
            this.updateCelebration();
            return;
        }

        const wasMoving = this.coin.isMoving;

        this.updateGoalKeepers();

        this.physics.updateCoin(this.coin);

        this.physics.checkCoinPegCollisions(
            this.coin,
            [...this.pegs, ...this.posts]
        );

        this.physics.checkBoundaryCollisions(
            this.coin,
            this.bounds,
            this.goals
        );

        if (!this.goalScoredLocked) {
            this.checkGoal();
        }

        if (
            wasMoving &&
            !this.coin.isMoving &&
            !this.goalScoredLocked
        ) {
            // A jogada terminou e a moeda parou. A saída de bola oficial se encerra aqui.
            this.isKickoffState = false;
            this.switchTurn();
        }

        if (
            this.currentTurn === 'ai' &&
            !this.coin.isMoving &&
            !this.aiThinking &&
            !this.goalScoredLocked
        ) {
            this.triggerAiTurn();
        }
    }

    updateGoalKeepers() {
        const gkSpeed = 1.2;
        const p1Gk = this.pegs.find((p, idx) => idx === 0);
        const aiGk = this.pegs.find((p, idx) => idx === 11);

        if (p1Gk && aiGk) {
            const minAllowedY = this.goals.left.top + p1Gk.radius + 2;
            const maxAllowedY = this.goals.left.bottom - p1Gk.radius - 2;

            p1Gk.position.y += gkSpeed * p1Gk.gkDirection;
            if (p1Gk.position.y >= maxAllowedY) {
                p1Gk.position.y = maxAllowedY;
                p1Gk.gkDirection = -1;
            } else if (p1Gk.position.y <= minAllowedY) {
                p1Gk.position.y = minAllowedY;
                p1Gk.gkDirection = 1;
            }

            aiGk.gkDirection = -p1Gk.gkDirection;
            aiGk.position.y += gkSpeed * aiGk.gkDirection;
            
            if (aiGk.position.y > maxAllowedY) {
                aiGk.position.y = maxAllowedY;
            } else if (aiGk.position.y < minAllowedY) {
                aiGk.position.y = minAllowedY;
            }
        }
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === 'p1' ? 'ai' : 'p1';
    }

    checkGoal() {
        const cx = this.coin.position.x;
        const cy = this.coin.position.y;
        const r = this.coin.radius;

        const leftGoalPassedCompletely = (cx + r < this.bounds.left);
        const leftVerticalValid = (cy - r >= this.goals.left.top && cy + r <= this.goals.left.bottom);

        const rightGoalPassedCompletely = (cx - r > this.bounds.right);
        const rightVerticalValid = (cy - r >= this.goals.right.top && cy + r <= this.goals.right.bottom);

        if (leftGoalPassedCompletely && leftVerticalValid) {
            this.handleGoalScored('ai', this.goals.left);
        }
        else if (rightGoalPassedCompletely && rightVerticalValid) {
            this.handleGoalScored('p1', this.goals.right);
        }
    }

    handleGoalScored(scoringSide, goalObj) {
        // Regra contra gol na saída de bola
        if (this.isKickoffState) {
            // Anula o gol e aplica a reversão da posse para a área defensiva do adversário
            this.goalScoredLocked = true;
            this.coin.velocity = new Vector2D(0, 0);
            this.coin.isMoving = false;
            this.aiThinking = false;
            this.isCelebrating = false;

            // Reversão da posse e posicionamento seguro na área defensiva adversária (tiro de meta)
            const defendingSide = scoringSide === 'p1' ? 'ai' : 'p1';
            this.currentTurn = defendingSide;

            if (defendingSide === 'ai') {
                // Posiciona próximo ao gol da IA (lado direito)
                this.coin.position = new Vector2D(this.bounds.right - 60, this.canvas.height / 2);
            } else {
                // Posiciona próximo ao gol do P1 (lado esquerdo)
                this.coin.position = new Vector2D(this.bounds.left + 60, this.canvas.height / 2);
            }

            // Libera o travamento para o próximo lance já sem a restrição de saída
            setTimeout(() => {
                this.goalScoredLocked = false;
                this.isKickoffState = false;
            }, 500);
            return;
        }

        // Fluxo normal de gol válido
        this.goalScoredLocked = true;
        if (scoringSide === 'ai') {
            this.score.ai++;
            this.startGoalCelebration(TEAMS[this.aiTeamKey].name, goalObj);
        } else {
            this.score.p1++;
            this.startGoalCelebration(TEAMS[this.p1TeamKey].name, goalObj);
        }
        if (this.onGoalScoredCallback) this.onGoalScoredCallback(scoringSide);
    }

    startGoalCelebration(teamName, goalObj) {
        this.isCelebrating = true;
        this.celebrationTimer = 0;
        this.celebratingTeam = teamName;
        this.coin.velocity = new Vector2D(0, 0);
        this.coin.isMoving = false;
        this.aiThinking = false;
        this.flashAlpha = 0.8;

        this.celebrationParticles = [];
        const goalCenterX = goalObj === this.goals.left ? this.bounds.left : this.bounds.right;
        const goalCenterY = (goalObj.top + goalObj.bottom) / 2;

        const particleCount = 40;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            const color = (Math.random() > 0.5 ? '#ffdc45' : '#ffffff');

            this.celebrationParticles.push({
                x: goalCenterX,
                y: goalCenterY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 3 + Math.random() * 5,
                alpha: 1.0,
                color: color,
                decay: 0.015 + Math.random() * 0.015
            });
        }
    }

    updateCelebration() {
        this.celebrationTimer++;
        if (this.flashAlpha > 0) {
            this.flashAlpha -= 0.02;
        }

        for (const p of this.celebrationParticles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.alpha -= p.decay;
        }

        if (this.celebrationTimer >= this.celebrationDuration) {
            this.isCelebrating = false;
            const restartingTeam = this.celebratingTeam === TEAMS[this.p1TeamKey].name ? 'ai' : 'p1';
            this.resetCoin(restartingTeam);
            if (this.onGoalAnimationEndCallback) {
                this.onGoalAnimationEndCallback();
            }
        }
    }

    triggerAiTurn() {
        this.aiThinking = true;

        setTimeout(() => {
            if (this.coin.isMoving || this.goalScoredLocked || this.isCelebrating) {
                this.aiThinking = false;
                return;
            }

            const bestShot = this.findBestAiShot();

            if (bestShot) {
                this.coin.velocity = new Vector2D(
                    Math.cos(bestShot.angle) * bestShot.power,
                    Math.sin(bestShot.angle) * bestShot.power
                );

                this.coin.isMoving = true;
                if (this.onFirstShotCallback) this.onFirstShotCallback();
            }

            this.aiThinking = false;
        }, 800);
    }

    simulateAiShot(angle, power) {
        const simulatedCoin = {
            position: new Vector2D(
                this.coin.position.x,
                this.coin.position.y
            ),
            velocity: new Vector2D(
                Math.cos(angle) * power,
                Math.sin(angle) * power
            ),
            radius: this.coin.radius,
            isMoving: true
        };

        const simulatedPegs = [...this.pegs, ...this.posts].map(peg => ({
            position: new Vector2D(
                peg.position.x,
                peg.position.y
            ),
            radius: peg.radius
        }));

        let minimumX = simulatedCoin.position.x;
        let closestGoalDistance = Infinity;
        let scoredGoal = false;
        let ownGoal = false;

        const goalCenterY =
            (this.goals.left.top + this.goals.left.bottom) / 2;

        for (let frame = 0; frame < 500; frame++) {
            this.physics.updateCoin(simulatedCoin);

            this.physics.checkCoinPegCollisions(
                simulatedCoin,
                simulatedPegs
            );

            this.physics.checkBoundaryCollisions(
                simulatedCoin,
                this.bounds,
                this.goals
            );

            minimumX = Math.min(
                minimumX,
                simulatedCoin.position.x
            );

            const distanceToGoal = Math.sqrt(
                Math.pow(simulatedCoin.position.x - this.bounds.left, 2) +
                Math.pow(simulatedCoin.position.y - goalCenterY, 2)
            );

            closestGoalDistance = Math.min(
                closestGoalDistance,
                distanceToGoal
            );

            const simCx = simulatedCoin.position.x;
            const simCy = simulatedCoin.position.y;
            const simR = simulatedCoin.radius;

            if (
                simCx + simR < this.bounds.left &&
                simCy - simR >= this.goals.left.top &&
                simCy + simR <= this.goals.left.bottom
            ) {
                scoredGoal = true;
                break;
            }

            if (
                simCx - simR > this.bounds.right &&
                simCy - simR >= this.goals.right.top &&
                simCy + simR <= this.goals.right.bottom
            ) {
                ownGoal = true;
                break;
            }

            if (!simulatedCoin.isMoving) {
                break;
            }
        }

        const progress = this.coin.position.x - minimumX;

        return {
            angle,
            power,
            progress,
            closestGoalDistance,
            scoredGoal,
            ownGoal
        };
    }

    evaluateAiShot(result) {
        if (result.ownGoal) {
            return -100000;
        }

        if (result.scoredGoal) {
            // Se estiver em estado de saída de bola, a IA evita chutar direto para o gol para não sofrer reversão
            if (this.isKickoffState) {
                return -50000;
            }
            return 100000;
        }

        let score = 0;
        score += result.progress * 0.75;
        score -= result.closestGoalDistance * 0.16;
        score += (Math.random() - 0.5) * 8;

        return score;
    }

    findBestAiShot() {
        const candidates = [];

        const goalTop = this.goals.left.top + 12;
        const goalBottom = this.goals.left.bottom - 12;

        const targetPoints = [];

        for (let y = goalTop; y <= goalBottom; y += 14) {
            targetPoints.push({
                x: this.bounds.left - 15,
                y
            });
        }

        targetPoints.push(
            {
                x: this.bounds.left - 15,
                y: (goalTop + goalBottom) / 2
            },
            {
                x: this.bounds.left - 15,
                y: this.goals.left.top + 25
            },
            {
                x: this.bounds.left - 15,
                y: this.goals.left.bottom - 25
            }
        );

        const powers = [8, 11, 13, 16, 18, 21];

        for (const target of targetPoints) {
            const direction = new Vector2D(
                target.x - this.coin.position.x,
                target.y - this.coin.position.y
            );

            const baseAngle = direction.heading();

            const angleOffsets = [
                -0.24,
                -0.16,
                -0.08,
                0,
                0.08,
                0.16,
                0.24
            ];

            for (const offset of angleOffsets) {
                const angle = baseAngle + offset;

                if (Math.cos(angle) >= -0.05) {
                    continue;
                }

                for (const power of powers) {
                    const result = this.simulateAiShot(angle, power);
                    const score = this.evaluateAiShot(result);

                    candidates.push({
                        angle,
                        power,
                        score,
                        scoredGoal: result.scoredGoal
                    });
                }
            }
        }

        if (candidates.length === 0) {
            return {
                angle: Math.PI,
                power: 8
            };
        }

        candidates.sort((a, b) => b.score - a.score);

        const bestCandidates = candidates.slice(0, 5);

        const scoringShot = bestCandidates.find(
            candidate => candidate.scoredGoal
        );

        if (scoringShot) {
            return scoringShot;
        }

        const chosenIndex = Math.floor(
            Math.random() * bestCandidates.length
        );

        return bestCandidates[chosenIndex];
    }

    draw() {
        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.drawWoodBorderAndGreenField();
        this.drawFieldLines();
        this.drawGoals();

        this.pegs.forEach(peg => peg.draw(this.ctx));

        if (
            this.isAiming &&
            this.currentTurn === 'p1' &&
            !this.aiThinking &&
            !this.isCelebrating
        ) {
            this.drawAimLine();
        }

        this.coin.draw(this.ctx);

        if (this.isCelebrating) {
            this.drawCelebrationEffects();
        }
    }

    drawCelebrationEffects() {
        const ctx = this.ctx;
        ctx.save();

        if (this.flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 220, 69, ${this.flashAlpha * 0.35})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        for (const p of this.celebrationParticles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        const scaleAnim = 1 + Math.sin(this.celebrationTimer * 0.15) * 0.1;
        ctx.save();
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2 - 40);
        ctx.scale(scaleAnim, scaleAnim);

        ctx.font = '900 64px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#0b1411';
        ctx.strokeText('GOOOOL!', 0, 0);

        ctx.fillStyle = '#ffdc45';
        ctx.fillText('GOOOOL!', 0, 0);
        ctx.restore();

        ctx.font = '800 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        const teamText = `GOL DO ${this.celebratingTeam}!`;
        ctx.fillText(teamText, this.canvas.width / 2, this.canvas.height / 2 + 25);

        ctx.restore();
    }

    drawWoodBorderAndGreenField() {
        const ctx = this.ctx;

        ctx.fillStyle = '#3e2723';
        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 2;

        for (let i = 0; i < this.canvas.height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(this.canvas.width, i);
            ctx.stroke();
        }

        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(
            this.bounds.left,
            this.bounds.top,
            this.bounds.right - this.bounds.left,
            this.bounds.bottom - this.bounds.top
        );

        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        const stripWidth = (this.bounds.right - this.bounds.left) / 10;

        for (
            let x = this.bounds.left;
            x < this.bounds.right;
            x += stripWidth * 2
        ) {
            ctx.fillRect(
                x,
                this.bounds.top,
                stripWidth,
                this.bounds.bottom - this.bounds.top
            );
        }
    }

    drawFieldLines() {
        const ctx = this.ctx;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 3;

        ctx.strokeRect(
            this.bounds.left,
            this.bounds.top,
            this.bounds.right - this.bounds.left,
            this.bounds.bottom - this.bounds.top
        );

        const centerX = this.canvas.width / 2;

        ctx.beginPath();
        ctx.moveTo(centerX, this.bounds.top);
        ctx.lineTo(centerX, this.bounds.bottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
            centerX,
            this.canvas.height / 2,
            55,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
            centerX,
            this.canvas.height / 2,
            4,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = '#fff';
        ctx.fill();

        const areaWidth = (this.bounds.right - this.bounds.left) * 0.15;
        const areaHeight = (this.bounds.bottom - this.bounds.top) * 0.45;
        const centerY = this.canvas.height / 2;

        ctx.strokeRect(
            this.bounds.left,
            centerY - areaHeight / 2,
            areaWidth,
            areaHeight
        );

        ctx.strokeRect(
            this.bounds.right - areaWidth,
            centerY - areaHeight / 2,
            areaWidth,
            areaHeight
        );

        ctx.restore();
    }

    drawGoals() {
        const ctx = this.ctx;

        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';

        ctx.strokeRect(
            this.bounds.left - this.goals.left.depth,
            this.goals.left.top,
            this.goals.left.depth,
            this.goals.left.bottom - this.goals.left.top
        );

        ctx.strokeRect(
            this.bounds.right,
            this.goals.right.top,
            this.goals.right.depth,
            this.goals.right.bottom - this.goals.right.top
        );

        ctx.restore();
    }

    drawAimLine() {
        const ctx = this.ctx;

        const dragVec = this.dragStart.sub(this.dragCurrent);
        const distance = Math.min(dragVec.mag(), 150);

        if (distance < 5) return;

        const launchDir = dragVec.normalize();
        const endPos = this.coin.position.add(
            launchDir.mult(distance * 1.2)
        );

        const powerRatio = distance / 150;
        const red = Math.floor(255 * powerRatio);
        const green = Math.floor(255 * (1 - powerRatio));
        const color = `rgb(${red}, ${green}, 0)`;

        ctx.save();

        ctx.beginPath();
        ctx.setLineDash([8, 6]);
        ctx.moveTo(
            this.coin.position.x,
            this.coin.position.y
        );
        ctx.lineTo(endPos.x, endPos.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.arc(
            endPos.x,
            endPos.y,
            6 + powerRatio * 6,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();
    }

    handleMouseDown(pos) {
        if (
            this.coin.isMoving ||
            this.currentTurn !== 'p1' ||
            this.aiThinking ||
            this.goalScoredLocked ||
            this.isCelebrating
        ) {
            return;
        }

        const dist = pos.sub(this.coin.position).mag();

        if (dist <= this.coin.radius + 10) {
            this.isAiming = true;
            this.dragStart = pos;
            this.dragCurrent = pos;
        }
    }

    handleMouseMove(pos) {
        if (this.isAiming) {
            this.dragCurrent = pos;
        }
    }

    handleMouseUp() {
        if (!this.isAiming) return;

        this.isAiming = false;

        const dragVec = this.dragStart.sub(this.dragCurrent);
        const distance = Math.min(dragVec.mag(), 150);

        if (distance > 10) {
            const powerFactor = 0.22;
            const impulse = dragVec.normalize().mult(
                distance * powerFactor
            );

            this.coin.velocity = impulse;
            this.coin.isMoving = true;
            if (this.onFirstShotCallback) this.onFirstShotCallback();
        }
    }
}