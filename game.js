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

        // Corpo da moeda (Prateado/Metálico)
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
        this.team = team; // 'brazil', 'argentina', ou 'none'
        this.radius = radius;
    }

    draw(ctx) {
        if (this.team === 'none') return; // Traves puras não precisam desenhar prego decorativo

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Sombra do prego
        ctx.beginPath();
        ctx.arc(2, 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();

        // Cabeça metálica do prego
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

        // Anel de identificação do time (Brasil = Amarelo/Verde, Argentina = Azul-claro/Branco)
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 3, 0, Math.PI * 2);
        if (this.team === 'brazil') {
            ctx.fillStyle = '#ffeb3b'; // Amarelo Brasil
            ctx.fill();
            // Detalhe verde interno
            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#2e7d32';
            ctx.fill();
        } else {
            ctx.fillStyle = '#4fc3f7'; // Azul Argentina
            ctx.fill();
            // Detalhe branco interno
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
            left: { top: centerY - goalSize / 2, bottom: centerY + goalSize / 2, depth: 30 },
            right: { top: centerY - goalSize / 2, bottom: centerY + goalSize / 2, depth: 30 }
        };

        // Estado do Jogo
        this.score = { brazil: 0, argentina: 0 };
        this.currentTurn = 'brazil'; // 'brazil' ou 'argentina'
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

    // Inicializa posições dos 8 pregos de cada seleção (Formação Tática Equilibrada)
    initPegs() {
        this.pegs = [];
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Brasil (Esquerda) - 8 Jogadores
        const brazilPositions = [
            { x: this.bounds.left + 25, y: h / 2 },          // 1 Goleiro
            { x: w * 0.18, y: h * 0.32 },                      // Defensor Sup.
            { x: w * 0.18, y: h * 0.68 },                      // Defensor Inf.
            { x: w * 0.28, y: h * 0.5 },                       // Defensor Central
            { x: w * 0.38, y: h * 0.25 },                      // Meio-campista Sup.
            { x: w * 0.38, y: h * 0.75 },                      // Meio-campista Inf.
            { x: w * 0.38, y: h * 0.5 },                       // Meio-campista Central
            { x: w * 0.45, y: h * 0.5 }                        // Atacante
        ];

        // Argentina (Direita) - 8 Jogadores
        const argentinaPositions = [
            { x: this.bounds.right - 25, y: h / 2 },         // 1 Goleiro
            { x: w * 0.82, y: h * 0.32 },                      // Defensor Sup.
            { x: w * 0.82, y: h * 0.68 },                      // Defensor Inf.
            { x: w * 0.72, y: h * 0.5 },                       // Defensor Central
            { x: w * 0.62, y: h * 0.25 },                      // Meio-campista Sup.
            { x: w * 0.62, y: h * 0.75 },                      // Meio-campista Inf.
            { x: w * 0.62, y: h * 0.5 },                       // Meio-campista Central
            { x: w * 0.55, y: h * 0.5 }                        // Atacante
        ];

        brazilPositions.forEach(p => this.pegs.push(new Peg(p.x, p.y, 'brazil')));
        argentinaPositions.forEach(p => this.pegs.push(new Peg(p.x, p.y, 'argentina')));
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
        this.coin.position = new Vector2D(this.canvas.width / 2, this.canvas.height / 2);
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

        // Processa Física
        this.physics.updateCoin(this.coin);
        this.physics.checkCoinPegCollisions(this.coin, [...this.pegs, ...this.posts]);
        this.physics.checkBoundaryCollisions(this.coin, this.bounds, this.goals);

        // Verificação imediata de gol durante o movimento
        if (!this.goalScoredLocked) {
            this.checkGoal();
        }

        // Quando a moeda para de se mover
        if (wasMoving && !this.coin.isMoving && !this.goalScoredLocked) {
            this.switchTurn();
        }

        // Executa a IA da Argentina se for o turno dela e a moeda estiver parada
        if (this.currentTurn === 'argentina' && !this.coin.isMoving && !this.aiThinking && !this.goalScoredLocked) {
            this.triggerAiTurn();
        }
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === 'brazil' ? 'argentina' : 'brazil';
    }

    checkGoal() {
        const cx = this.coin.position.x;
        const cy = this.coin.position.y;

        // Gol da Argentina (Moeda entrou completamente no gol esquerdo dentro das traves)
        if (cx < this.bounds.left && cy > this.goals.left.top && cy < this.goals.left.bottom) {
            this.goalScoredLocked = true;
            this.score.argentina++;
            this.handleGoalScored('brazil'); // Time que sofreu o gol (Brasil) recomeça
        }
        // Gol do Brasil (Moeda entrou completamente no gol direito dentro das traves)
        else if (cx > this.bounds.right && cy > this.goals.right.top && cy < this.goals.right.bottom) {
            this.goalScoredLocked = true;
            this.score.brazil++;
            this.handleGoalScored('argentina'); // Time que sofreu o gol (Argentina) recomeça
        }
    }

    handleGoalScored(restartingTeam) {
        this.coin.velocity = new Vector2D(0, 0);
        this.coin.isMoving = false;

        // Aguarda 1.2 segundos para o jogador perceber o gol antes de resetar a moeda e trocar a posse
        setTimeout(() => {
            this.resetCoin(restartingTeam);
        }, 1200);
    }

    // --- INTELIGÊNCIA ARTIFICIAL (ARGENTINA) ---
    triggerAiTurn() {
        this.aiThinking = true;

        setTimeout(() => {
            if (this.coin.isMoving) {
                this.aiThinking = false;
                return;
            }

            // Alvo da IA: Gol esquerdo (x: bounds.left, y: centro do gol)
            const targetX = this.bounds.left;
            const targetY = (this.goals.left.top + this.goals.left.bottom) / 2;
            const targetPos = new Vector2D(targetX, targetY);

            // Vetor da moeda até o gol adversário
            const toGoal = targetPos.sub(this.coin.position);
            const dist = toGoal.mag();

            // Adiciona um pequeno desvio tático/humano aleatório para não ser robótico perfeito
            const angleOffset = (Math.random() - 0.5) * 0.3;
            const heading = toGoal.heading() + angleOffset;
            const clampedHeading = new Vector2D(Math.cos(heading), Math.sin(heading));

            // Calcula força proporcional à distância, respeitando os limites do jogo
            const power = Math.min(Math.max(dist * 0.12, 6), 15);
            
            this.coin.velocity = clampedHeading.mult(power);
            this.coin.isMoving = true;
            this.aiThinking = false;
        }, 800); // Pausa realista de raciocínio da máquina
    }

    // --- RENDERIZAÇÃO ---
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawWoodBorderAndGreenField();
        this.drawFieldLines();
        this.drawGoals();
        
        // Desenha Pregos
        this.pegs.forEach(peg => peg.draw(this.ctx));
        
        // Desenha Linha de Mira (Apenas na vez do Brasil)
        if (this.isAiming && this.currentTurn === 'brazil' && !this.aiThinking) {
            this.drawAimLine();
        }

        // Desenha Moeda
        this.coin.draw(this.ctx);
    }

    drawWoodBorderAndGreenField() {
        const ctx = this.ctx;
        
        // Fundo de Madeira (Moldura Externa)
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Textura sutil de madeira na moldura
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 2;
        for (let i = 0; i < this.canvas.height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(this.canvas.width, i);
            ctx.stroke();
        }

        // Superfície Interna: Gramado Verde do Campo
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(this.bounds.left, this.bounds.top, this.bounds.right - this.bounds.left, this.bounds.bottom - this.bounds.top);

        // Textura de listras do gramado
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        const stripWidth = 80;
        for (let x = this.bounds.left; x < this.bounds.right; x += stripWidth * 2) {
            ctx.fillRect(x, this.bounds.top, stripWidth, this.bounds.bottom - this.bounds.top);
        }
    }

    drawFieldLines() {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 3;

        // Linhas de Limite do Campo
        ctx.strokeRect(this.bounds.left, this.bounds.top, this.bounds.right - this.bounds.left, this.bounds.bottom - this.bounds.top);

        // Linha Central
        const centerX = this.canvas.width / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, this.bounds.top);
        ctx.lineTo(centerX, this.bounds.bottom);
        ctx.stroke();

        // Círculo Central
        ctx.beginPath();
        ctx.arc(centerX, this.canvas.height / 2, 60, 0, Math.PI * 2);
        ctx.stroke();

        // Ponto Central
        ctx.beginPath();
        ctx.arc(centerX, this.canvas.height / 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Grandes Áreas
        const areaWidth = 100;
        const areaHeight = 220;
        const centerY = this.canvas.height / 2;

        ctx.strokeRect(this.bounds.left, centerY - areaHeight / 2, areaWidth, areaHeight);
        ctx.strokeRect(this.bounds.right - areaWidth, centerY - areaHeight / 2, areaWidth, areaHeight);

        ctx.restore();
    }

    drawGoals() {
        const ctx = this.ctx;
        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';

        // Gol Esquerdo (Argentina defende)
        ctx.strokeRect(
            this.bounds.left - this.goals.left.depth,
            this.goals.left.top,
            this.goals.left.depth,
            this.goals.left.bottom - this.goals.left.top
        );

        // Gol Direito (Brasil defende)
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
        const endPos = this.coin.position.add(launchDir.mult(distance * 1.2));

        const powerRatio = distance / 150;
        const red = Math.floor(255 * powerRatio);
        const green = Math.floor(255 * (1 - powerRatio));
        const color = `rgb(${red}, ${green}, 0)`;

        ctx.save();
        
        ctx.beginPath();
        ctx.setLineDash([8, 6]);
        ctx.moveTo(this.coin.position.x, this.coin.position.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.arc(endPos.x, endPos.y, 6 + powerRatio * 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();
    }

    // --- CONTROLES DE MOUSE (APENAS BRASIL) ---
    handleMouseDown(pos) {
        if (this.coin.isMoving || this.currentTurn !== 'brazil' || this.aiThinking || this.goalScoredLocked) return;

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
            const impulse = dragVec.normalize().mult(distance * powerFactor);
            
            this.coin.velocity = impulse;
            this.coin.isMoving = true;
        }
    }
}