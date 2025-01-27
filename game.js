class ArcheryGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.score = 0;
        this.isDrawing = false;
        this.drawStartX = 0;
        this.drawStartY = 0;
        
        // Bow position
        this.bowX = 150;
        this.bowY = 300;
        
        // Target properties
        this.targetX = 650;
        this.targetY = 300;
        this.targetRadius = 60;
        this.targetMovementSpeed = 2;
        this.targetDirection = 1;
        
        // Arrow properties
        this.arrow = null;
        
        // Background
        this.backgroundGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        this.backgroundGradient.addColorStop(0, '#87CEEB');
        this.backgroundGradient.addColorStop(1, '#4682B4');
        
        this.init();
    }
    
    init() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.gameLoop();
    }
    
    drawBackground() {
        this.ctx.fillStyle = this.backgroundGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawTarget() {
        // Move target up and down
        this.targetY += this.targetDirection * this.targetMovementSpeed;
        if (this.targetY > 500 || this.targetY < 100) {
            this.targetDirection *= -1;
        }
        
        const rings = [
            { radius: this.targetRadius, color: '#FF6B6B', points: 10 },
            { radius: this.targetRadius * 0.8, color: '#4ECDC4', points: 8 },
            { radius: this.targetRadius * 0.6, color: '#45B7AF', points: 6 },
            { radius: this.targetRadius * 0.4, color: '#96CEB4', points: 4 },
            { radius: this.targetRadius * 0.2, color: '#FFEEAD', points: 2 }
        ].reverse();
        
        // Add glow effect
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 20;
        
        rings.forEach(ring => {
            this.ctx.beginPath();
            this.ctx.arc(this.targetX, this.targetY, ring.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = ring.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
        
        this.ctx.shadowBlur = 0;
    }
    
    drawBow(drawX, drawY) {
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 5;
        
        // Draw bow curve with gradient
        const bowGradient = this.ctx.createLinearGradient(
            this.bowX - 30, this.bowY, this.bowX + 30, this.bowY
        );
        bowGradient.addColorStop(0, '#8B4513');
        bowGradient.addColorStop(1, '#D2691E');
        
        this.ctx.strokeStyle = bowGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.bowX, this.bowY, 40, -Math.PI/2, Math.PI/2);
        this.ctx.stroke();
        
        // Draw bowstring
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        
        if (this.isDrawing) {
            this.ctx.moveTo(this.bowX, this.bowY - 40);
            this.ctx.lineTo(drawX, drawY);
            this.ctx.lineTo(this.bowX, this.bowY + 40);
        } else {
            this.ctx.moveTo(this.bowX, this.bowY - 40);
            this.ctx.lineTo(this.bowX, this.bowY + 40);
        }
        this.ctx.stroke();
    }
    
    drawArrow() {
        if (this.arrow) {
            const angle = Math.atan2(this.arrow.velocityY, this.arrow.velocityX);
            
            this.ctx.save();
            this.ctx.translate(this.arrow.x, this.arrow.y);
            this.ctx.rotate(angle);
            
            // Arrow shaft
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(-25, 0);
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Arrowhead
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(-8, 4);
            this.ctx.lineTo(-3, 0);
            this.ctx.lineTo(-8, -4);
            this.ctx.closePath();
            this.ctx.fillStyle = '#C0C0C0';
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    updateArrow() {
        if (this.arrow) {
            this.arrow.x += this.arrow.velocityX;
            this.arrow.y += this.arrow.velocityY;
            this.arrow.velocityY += 0.3; // Gravity
            
            // Check collision with target
            const dx = this.arrow.x - this.targetX;
            const dy = this.arrow.y - this.targetY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.targetRadius) {
                // Calculate score based on distance from center
                const scoreRadius = this.targetRadius - distance;
                const points = Math.floor(scoreRadius / 12) + 1;
                this.score += points;
                document.getElementById('score').textContent = this.score;
                this.arrow = null;
            }
            
            // Remove arrow if it goes off screen
            if (this.arrow && (
                this.arrow.x > this.canvas.width || 
                this.arrow.x < 0 || 
                this.arrow.y > this.canvas.height
            )) {
                this.arrow = null;
            }
        }
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.drawStartX = e.clientX - rect.left;
        this.drawStartY = e.clientY - rect.top;
        this.isDrawing = true;
    }
    
    onMouseMove(e) {
        if (this.isDrawing) {
            const rect = this.canvas.getBoundingClientRect();
            this.drawStartX = e.clientX - rect.left;
            this.drawStartY = e.clientY - rect.top;
        }
    }
    
    onMouseUp(e) {
        if (this.isDrawing) {
            const rect = this.canvas.getBoundingClientRect();
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;
            
            const dx = this.bowX - endX;
            const dy = this.bowY - endY;
            const power = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.1, 20);
            
            this.arrow = {
                x: this.bowX,
                y: this.bowY,
                velocityX: power * (endX - this.bowX) / Math.sqrt(dx * dx + dy * dy),
                velocityY: power * (endY - this.bowY) / Math.sqrt(dx * dx + dy * dy)
            };
        }
        this.isDrawing = false;
    }
    
    gameLoop() {
        // Clear canvas
        this.drawBackground();
        
        // Draw game elements
        this.drawTarget();
        this.drawBow(this.drawStartX, this.drawStartY);
        this.updateArrow();
        this.drawArrow();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new ArcheryGame();
}; 