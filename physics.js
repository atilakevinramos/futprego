/**
 * MOTOR DE FÍSICA E VETORES (2D)
 */
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) { return new Vector2D(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector2D(this.x - v.x, this.y - v.y); }
    mult(n) { return new Vector2D(this.x * n, this.y * n); }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    heading() { return Math.atan2(this.y, this.x); }
    
    normalize() {
        const m = this.mag();
        return m !== 0 ? new Vector2D(this.x / m, this.y / m) : new Vector2D(0, 0);
    }

    dot(v) { return this.x * v.x + this.y * v.y; }
}

class PhysicsEngine {
    constructor() {
        this.friction = 0.985;   // Atrito no gramado
        this.maxSpeed = 18;      // Limite de velocidade máxima da moeda
        this.minSpeed = 0.05;    // Limiar para considerar parada
        this.restitution = 0.75; // Elasticidade das colisões
    }

    // Atualiza a posição e velocidade da moeda
    updateCoin(coin) {
        if (!coin.isMoving) return;

        // Limita a velocidade máxima
        const speed = coin.velocity.mag();
        if (speed > this.maxSpeed) {
            coin.velocity = coin.velocity.normalize().mult(this.maxSpeed);
        }

        // Aplica movimento
        coin.position = coin.position.add(coin.velocity);

        // Aplica desaceleração por atrito
        coin.velocity = coin.velocity.mult(this.friction);

        // Para a moeda se a velocidade for muito baixa
        if (coin.velocity.mag() < this.minSpeed) {
            coin.velocity = new Vector2D(0, 0);
            coin.isMoving = false;
        }
    }

    // Trata colisão da moeda com os pregos (círculos fixos)
    checkCoinPegCollisions(coin, pegs) {
        for (const peg of pegs) {
            const dir = coin.position.sub(peg.position);
            const dist = dir.mag();
            const minDist = coin.radius + peg.radius;

            if (dist < minDist) {
                const normal = dir.normalize();
                const overlap = minDist - dist;
                coin.position = coin.position.add(normal.mult(overlap));

                const dot = coin.velocity.dot(normal);
                const reflection = coin.velocity.sub(normal.mult(2 * dot));
                coin.velocity = reflection.mult(this.restitution);
            }
        }
    }

    // Trata colisão com limites do campo e traves dos gols
    checkBoundaryCollisions(coin, bounds, goals) {
        const r = coin.radius;
        const e = this.restitution;

        const inLeftGoalY = coin.position.y - r >= goals.left.top && coin.position.y + r <= goals.left.bottom;
        const inRightGoalY = coin.position.y - r >= goals.right.top && coin.position.y + r <= goals.right.bottom;

        // Limites Verticais Globais (Fora das aberturas de gol)
        if (coin.position.y - r < bounds.top) {
            coin.position.y = bounds.top + r;
            coin.velocity.y *= -e;
        } else if (coin.position.y + r > bounds.bottom) {
            coin.position.y = bounds.bottom - r;
            coin.velocity.y *= -e;
        }

        // Baliza Esquerda
        const leftGoalBack = bounds.left - goals.left.depth;
        if (coin.position.x < bounds.left) {
            if (inLeftGoalY) {
                if (coin.position.x - r < leftGoalBack) {
                    coin.position.x = leftGoalBack + r;
                    coin.velocity.x *= -e;
                }
            } else {
                coin.position.x = bounds.left + r;
                coin.velocity.x *= -e;
            }
        }

        // Baliza Direita
        const rightGoalBack = bounds.right + goals.right.depth;
        if (coin.position.x > bounds.right) {
            if (inRightGoalY) {
                if (coin.position.x + r > rightGoalBack) {
                    coin.position.x = rightGoalBack - r;
                    coin.velocity.x *= -e;
                }
            } else {
                coin.position.x = bounds.right - r;
                coin.velocity.x *= -e;
            }
        }
    }
}