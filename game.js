/**
 * REGRAS, ELEMENTOS DO JOGO, IA E RENDERIZAÇÃO CANVAS
 */

class Coin {
    constructor(x, y, radius = 14) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.radius = radius;
        this.isMoving = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Sombra da moeda
        ctx.beginPath();
        ctx.arc(3, 3, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();

        // Corpo da moeda
        const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, this.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#cccccc');
        grad.addColorStop(1, '#777777');

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#444444';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#aaaaaa';
        ctx.stroke();

        ctx.restore();
    }
}

class Peg {
    constructor(x, y, team, radius = 7) {
        this.position = new Vector2D(x, y);
        this.team = team;
        this.radius = radius;
    }

    draw(ctx) {
        if (this.team === 'none') return;

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Sombra do prego
        ctx.beginPath();
        ctx.arc(2, 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();

        // Cabeça metálica
        const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, this.radius);
        grad.addColorStop(0, '#e0e0e0');
        grad.addColorStop(0.7, '#888888');
        grad.addColorStop(1, '#333333');

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Identificação das equipes
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 3, 0, Math.PI * 2);

        if (this.team === 'brazil') {
            ctx.fillStyle = '#ffeb3b';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#2e7d32';
            ctx.fill();
        } else {
            ctx.fillStyle = '#4fc3f7';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        ctx.restore();
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.physics = new PhysicsEngine();

        // Dimensões do Campo
        this.margin = 40;
        this.bounds = {
            left: this.margin,
            right: this.canvas.width - this.margin,
            top: this.margin,
            bottom: this.canvas.height - this.margin
        };

        // Gols
        const goalSize = 140;
        const centerY = this.canvas.height / 2;

        this.goals = {
            left: {
                top: centerY - goalSize / 2,
                bottom: centerY + goalSize / 2,
                depth: 30
            },
            right: {
                top: centerY - goalSize / 2,
                bottom: centerY + goalSize / 2,
                depth: 30
            }
        };

        // Estado do Jogo
        this.score = { brazil: 0, argentina: 0 };
        this.currentTurn = 'brazil';
        this.isAiming = false;
        this.dragStart = new Vector2D(0, 0);
        this.dragCurrent = new Vector2D(0, 0);
        this.goalScoredLocked = false;
        this.aiThinking = false;

        this.coin = new Coin(this.canvas.width / 2, this.canvas.height / 2);
        this.pegs = [];
        this.posts = [];

        this.initPegs();
        this.initPosts();
    }

    // Inicializa os 11 pregos de cada seleção
    initPegs() {
        this.pegs = [];

        const w = this.canvas.width;
        const h = this.canvas.height;

        // Formação inicial do Brasil: 4-3-3
        const brazilPositions = [
            // Goleiro
            { x: w * 0.12, y: h * 0.50 },

            // Defesa - 4 jogadores
            { x: w * 0.20, y: h * 0.18 },
            { x: w * 0.20, y: h * 0.39 },
            { x: w * 0.20, y: h * 0.61 },
            { x: w * 0.20, y: h * 0.82 },

            // Meio-campo - 3 jogadores
            { x: w * 0.32, y: h * 0.25 },
            { x: w * 0.32, y: h * 0.50 },
            { x: w * 0.32, y: h * 0.75 },

            // Ataque - 3 jogadores
            { x: w * 0.44, y: h * 0.25 },
            { x: w * 0.44, y: h * 0.50 },
            { x: w * 0.44, y: h * 0.75 }
        ];

        // Formação inicial da Argentina: 4-4-2
        const argentinaPositions = [
            // Goleiro
            { x: w * 0.88, y: h * 0.50 },

            // Defesa - 4 jogadores
            { x: w * 0.80, y: h * 0.18 },
            { x: w * 0.80, y: h * 0.39 },
            { x: w * 0.80, y: h * 0.61 },
            { x: w * 0.80, y: h * 0.82 },

            // Meio-campo - 4 jogadores
            { x: w * 0.68, y: h * 0.18 },
            { x: w * 0.68, y: h * 0.39 },
            { x: w * 0.68, y: h * 0.61 },
            { x: w * 0.68, y: h * 0.82 },

            // Ataque - 2 jogadores
            { x: w * 0.56, y: h * 0.35 },
            { x: w * 0.56, y: h * 0.65 }
        ];

        brazilPositions.forEach(p => {
            this.pegs.push(new Peg(p.x, p.y, 'brazil'));
        });

        argentinaPositions.forEach(p => {
            this.pegs.push(new Peg(p.x, p.y, 'argentina'));
        });
    }

    initPosts() {
        this.posts = [
            new Peg(this.bounds.left, this.goals.left.top, 'none', 5),
            new Peg(this.bounds.left, this.goals.left.bottom, 'none', 5),
            new Peg(this.bounds.right, this.goals.right.top, 'none', 5),
            new Peg(this.bounds.right, this.goals.right.bottom, 'none', 5)
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

        if (startingTeam) {
            this.currentTurn = startingTeam;
        }
    }

    resetFullGame() {
        this.score = { brazil: 0, argentina: 0 };
        this.resetCoin('brazil');
    }

    update() {
        const wasMoving = this.coin.isMoving;

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
            this.switchTurn();
        }

        if (
            this.currentTurn === 'argentina' &&
            !this.coin.isMoving &&
            !this.aiThinking &&
            !this.goalScoredLocked
        ) {
            this.triggerAiTurn();
        }
    }

    switchTurn() {
        this.currentTurn =
            this.currentTurn === 'brazil' ? 'argentina' : 'brazil';
    }

    checkGoal() {
        const cx = this.coin.position.x;
        const cy = this.coin.position.y;

        // Gol da Argentina
        if (
            cx < this.bounds.left &&
            cy > this.goals.left.top &&
            cy < this.goals.left.bottom
        ) {
            this.goalScoredLocked = true;
            this.score.argentina++;
            this.handleGoalScored('brazil');
        }

        // Gol do Brasil
        else if (
            cx > this.bounds.right &&
            cy > this.goals.right.top &&
            cy < this.goals.right.bottom
        ) {
            this.goalScoredLocked = true;
            this.score.brazil++;
            this.handleGoalScored('argentina');
        }
    }

    handleGoalScored(restartingTeam) {
        this.coin.velocity = new Vector2D(0, 0);
        this.coin.isMoving = false;

        setTimeout(() => {
            this.resetCoin(restartingTeam);
        }, 1200);
    }

    // =====================================================
    // INTELIGÊNCIA ARTIFICIAL MELHORADA
    // =====================================================

    triggerAiTurn() {
        this.aiThinking = true;

        setTimeout(() => {
            if (this.coin.isMoving || this.goalScoredLocked) {
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
            }

            this.aiThinking = false;
        }, 800);
    }

    // Testa várias trajetórias sem modificar a partida real.
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

        // Simula até 500 quadros da jogada.
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

            // Distância até a região do gol adversário.
            const distanceToGoal = Math.sqrt(
                Math.pow(simulatedCoin.position.x - this.bounds.left, 2) +
                Math.pow(simulatedCoin.position.y - goalCenterY, 2)
            );

            closestGoalDistance = Math.min(
                closestGoalDistance,
                distanceToGoal
            );

            // A Argentina marcou.
            if (
                simulatedCoin.position.x < this.bounds.left &&
                simulatedCoin.position.y > this.goals.left.top &&
                simulatedCoin.position.y < this.goals.left.bottom
            ) {
                scoredGoal = true;
                break;
            }

            // A Argentina não deve marcar contra o próprio gol.
            if (
                simulatedCoin.position.x > this.bounds.right &&
                simulatedCoin.position.y > this.goals.right.top &&
                simulatedCoin.position.y < this.goals.right.bottom
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

    // Compara os resultados das jogadas simuladas.
    evaluateAiShot(result) {
        if (result.ownGoal) {
            return -100000;
        }

        if (result.scoredGoal) {
            return 100000;
        }

        let score = 0;

        // Premia a moeda avançar em direção ao gol brasileiro.
        score += result.progress * 0.75;

        // Premia trajetórias que chegam perto do gol.
        score -= result.closestGoalDistance * 0.16;

        // Pequena variação para a IA não escolher sempre a mesma jogada.
        score += (Math.random() - 0.5) * 8;

        return score;
    }

    // Procura a melhor combinação de ângulo e força.
    findBestAiShot() {
        const candidates = [];

        const goalTop = this.goals.left.top + 12;
        const goalBottom = this.goals.left.bottom - 12;

        // Vários pontos de mira dentro da abertura do gol.
        const targetPoints = [];

        for (let y = goalTop; y <= goalBottom; y += 14) {
            targetPoints.push({
                x: this.bounds.left - 15,
                y
            });
        }

        // Também testa alguns pontos mais próximos do centro.
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

        // Diferentes forças para cada direção.
        const powers = [6, 8, 10, 12, 14, 15];

        for (const target of targetPoints) {
            const direction = new Vector2D(
                target.x - this.coin.position.x,
                target.y - this.coin.position.y
            );

            const baseAngle = direction.heading();

            // Variações angulares para procurar corredores livres.
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

                // A Argentina ataca para a esquerda.
                // Não considera chutes iniciais para a direita.
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

        // Escolhe entre as melhores jogadas para manter variedade.
        const bestCandidates = candidates.slice(0, 5);

        // Se houver uma jogada que marca gol, prioriza essa opção.
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

    // =====================================================
    // RENDERIZAÇÃO
    // =====================================================

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
            this.currentTurn === 'brazil' &&
            !this.aiThinking
        ) {
            this.drawAimLine();
        }

        this.coin.draw(this.ctx);
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
        const stripWidth = 80;

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
            60,
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

        const areaWidth = 100;
        const areaHeight = 220;
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

    // =====================================================
    // CONTROLES DE MOUSE (APENAS BRASIL)
    // =====================================================

    handleMouseDown(pos) {
        if (
            this.coin.isMoving ||
            this.currentTurn !== 'brazil' ||
            this.aiThinking ||
            this.goalScoredLocked
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
            const powerFactor = 0.15;
            const impulse = dragVec.normalize().mult(
                distance * powerFactor
            );

            this.coin.velocity = impulse;
            this.coin.isMoving = true;
        }
    }
}