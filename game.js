class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        // Load bird image
        this.birdImage = new Image();
        this.birdImage.src = './assets/flappy-bird.png';  // Make sure this image is in your assets folder
        
        // Bird properties
        this.birdWidth = 40;   // Width of the bird sprite
        this.birdHeight = 30;  // Height of the bird sprite
        
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.reset();
        this.setupEventListeners();
    }

    reset() {
        this.bird = {
            x: 50,
            y: this.canvas.height / 2,
            velocity: 0,
            rotation: 0
        };
        
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        this.started = false;
        this.gravity = 0.5;
        this.jumpForce = -8;
        this.pipeWidth = 52;
        this.pipeGap = 150;
        this.pipeInterval = 1500;
        this.lastPipeTime = 0;
        this.hideGameOver();
    }

    setupEventListeners() {
        document.getElementById('restartButton').addEventListener('click', () => {
            this.hideGameOver();
            this.reset();
            this.start();
        });

        document.getElementById('menuButton').addEventListener('click', () => {
            this.hideGameOver();
            document.getElementById('gameContainer').style.display = 'none';
            document.getElementById('homepage').style.display = 'block';
        });
    }

    showGameOver() {
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }

        // Update popup content
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;

        // Show popup
        const popup = document.getElementById('gameOverPopup');
        popup.style.display = 'flex';
    }

    hideGameOver() {
        const popup = document.getElementById('gameOverPopup');
        popup.style.display = 'none';
    }

    update() {
        if (!this.gameOver && this.started) {
            // Update bird
            this.bird.velocity += this.gravity;
            this.bird.y += this.bird.velocity;
            
            // Generate pipes
            const now = Date.now();
            if (now - this.lastPipeTime > this.pipeInterval) {
                this.pipes.push({
                    x: this.canvas.width,
                    height: Math.random() * (this.canvas.height - this.pipeGap - 100) + 50
                });
                this.lastPipeTime = now;
            }
            
            // Move pipes
            this.pipes.forEach(pipe => {
                pipe.x -= 2;
            });
            
            // Remove off-screen pipes
            this.pipes = this.pipes.filter(pipe => pipe.x > -this.pipeWidth);
            
            // Check collisions
            this.checkCollisions();
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#4FC3F7';  // Sky blue background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pipes
        this.ctx.fillStyle = '#4CAF50';  // Green pipes
        this.pipes.forEach(pipe => {
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.height);
            this.ctx.fillRect(
                pipe.x,
                pipe.height + this.pipeGap,
                this.pipeWidth,
                this.canvas.height - (pipe.height + this.pipeGap)
            );
        });
        
        // Draw bird with rotation
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.birdWidth/2, this.bird.y + this.birdHeight/2);
        this.ctx.rotate(this.bird.velocity * 0.1);  // Rotate based on velocity
        this.ctx.drawImage(
            this.birdImage,
            -this.birdWidth/2,
            -this.birdHeight/2,
            this.birdWidth,
            this.birdHeight
        );
        this.ctx.restore();
        
        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px "Press Start 2P"';
        this.ctx.fillText(this.score.toString(), this.canvas.width/2 - 12, 50);
    }

    start() {
        if (!this.started) {
            this.started = true;
            this.gameLoop();
        }
    }

    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.render();
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    jump() {
        if (!this.gameOver && this.started) {
            this.bird.velocity = this.jumpForce;
        }
    }

    checkCollisions() {
        // Ground/ceiling collision
        if (this.bird.y < 0 || this.bird.y > this.canvas.height) {
            this.gameOver = true;
            this.showGameOver();
            return;
        }
        
        // Pipe collision
        this.pipes.forEach(pipe => {
            if (
                this.bird.x + this.birdWidth/2 > pipe.x &&
                this.bird.x - this.birdWidth/2 < pipe.x + this.pipeWidth &&
                (this.bird.y - this.birdHeight/2 < pipe.height ||
                 this.bird.y + this.birdHeight/2 > pipe.height + this.pipeGap)
            ) {
                this.gameOver = true;
                this.showGameOver();
            }
        });
    }
}

window.onload = () => {
    const game = new FlappyBird();
    console.log('Game initialized');

    // Debug check for canvas
    const canvas = document.getElementById('gameCanvas');
    console.log('Canvas element:', canvas);
    console.log('Canvas context:', canvas.getContext('2d'));

    // Get DOM elements
    const splashScreen = document.getElementById('splashScreen');
    const homepage = document.getElementById('homepage');
    const gameContainer = document.getElementById('gameContainer');

    // Initial states
    homepage.style.display = 'none';
    gameContainer.style.display = 'none';

    // Loading sequence
    function startGame() {
        // Hide splash screen and show homepage
        splashScreen.style.display = 'none';
        homepage.style.display = 'block';
    }

    // Start loading sequence
    setTimeout(startGame, 3000);

    // Game button handlers
    document.getElementById('playButton').addEventListener('click', () => {
        homepage.style.display = 'none';
        gameContainer.style.display = 'block';
        document.getElementById('menu').style.display = 'block';
        game.reset();
    });

    document.getElementById('startButton').addEventListener('click', () => {
        document.getElementById('menu').style.display = 'none';
        game.start();
    });

    // Game controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            game.jump();
        }
    });

    document.getElementById('gameCanvas').addEventListener('click', () => {
        game.jump();
    });

    // Back button handler
    document.getElementById('backButton').addEventListener('click', () => {
        game.gameOver = true;
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('homepage').style.display = 'block';
        document.getElementById('menu').style.display = 'block';
    });

    // Settings button handlers
    document.getElementById('settingsButton').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'flex';
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'none';
    });

    // How to play handlers
    document.getElementById('howToButton').addEventListener('click', () => {
        document.getElementById('howToModal').style.display = 'flex';
    });

    document.getElementById('closeHowTo').addEventListener('click', () => {
        document.getElementById('howToModal').style.display = 'none';
    });

    // Theme switcher
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';

    // Theme switch handler
    themeToggle.addEventListener('change', (e) => {
        const newTheme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}; 