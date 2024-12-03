const gameContainer = document.querySelector('.game-container');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const messageElement = document.getElementById('message');
const modal = document.getElementById('game-over-modal');
const finalScoreElement = document.getElementById('final-score');
const playAgainButton = document.getElementById('play-again-btn');

let score = 0;
let lives = 3;
let speed = 3;
let ballsPerDrop = 1;
let gameOver = false;

const leftCatcher = document.getElementById('left-catcher');
const rightCatcher = document.getElementById('right-catcher');
let leftRotation = 0;
let rightRotation = 0;

// Load the highest score from local storage
let highScore = localStorage.getItem('highScore') || 0;

// Define the next range for life bonuses
let nextLifeBonusRange = { min: 20, max: 30 };
let nextLifeBonusPoint = getRandomBonusPoint(nextLifeBonusRange.min, nextLifeBonusRange.max);

function rotateCatcher(catcher, side) {
    if (side === 'left') {
        leftRotation = (leftRotation + 180) % 360;
        catcher.style.transform = `translateX(-50%) rotate(${leftRotation}deg)`;
    } else if (side === 'right') {
        rightRotation = (rightRotation + 180) % 360;
        catcher.style.transform = `translateX(-50%) rotate(${rightRotation}deg)`;
    }
}

leftCatcher.addEventListener('click', () => rotateCatcher(leftCatcher, 'left'));
rightCatcher.addEventListener('click', () => rotateCatcher(rightCatcher, 'right'));

function createBall(side) {
    const ball = document.createElement('div');
    ball.classList.add('ball');

    const ballColor = Math.random() < 0.5 ? 'red' : 'yellow';
    ball.style.backgroundColor = ballColor;
    ball.style.left = side === 'left' ? '25%' : '75%';

    gameContainer.appendChild(ball);
    animateBall(ball, ballColor, side);
}

function createLifeBonus() {
    const bonus = document.createElement('div');
    bonus.classList.add('life-bonus');
    bonus.style.backgroundColor = 'green';
    bonus.style.left = Math.random() < 0.5 ? '25%' : '75%'; // Randomly appear from left or right

    gameContainer.appendChild(bonus);
    animateLifeBonus(bonus);
}

function animateBall(ball, ballColor, side) {
    if (gameOver) return;
    let topPosition = 0;
    const interval = setInterval(() => {
        topPosition += speed;
        ball.style.top = `${topPosition}px`;

        if (topPosition >= gameContainer.clientHeight - 120) {
            const topPart = side === 'left'
                ? (leftRotation % 360 === 0 ? document.getElementById('left-top') : document.getElementById('left-bottom'))
                : (rightRotation % 360 === 0 ? document.getElementById('right-top') : document.getElementById('right-bottom'));

            const catcherTopColor = normalizeColor(window.getComputedStyle(topPart).backgroundColor);
            const ballColorRgb = normalizeColor(window.getComputedStyle(ball).backgroundColor);

            if (catcherTopColor === ballColorRgb && !gameOver) {
                score++;
                scoreElement.textContent = `Score: ${score}`;
                speed = 3 + score * 0.1;
                adjustBallsPerDrop();
                checkLifeBonusMilestone(); // Check if a life bonus should be dropped
                showMessage('Great! You scored a point!', 'lightgreen');
            } else if (!gameOver) {
                if (lives > 0) {
                    lives--;
                    updateLivesDisplay();
                    showMessage('Oops! Wrong catch!', 'red');
                }
                if (lives <= 0) {
                    showGameOver();
                }
            }

            ball.remove();
            clearInterval(interval);
        }

        if (topPosition > gameContainer.clientHeight) {
            ball.remove();
            clearInterval(interval);
        }
    }, 20);
}

function animateLifeBonus(bonus) {
    let topPosition = 0;
    const interval = setInterval(() => {
        topPosition += 5; // Fast speed for the life bonus
        bonus.style.top = `${topPosition}px`;

        if (topPosition >= gameContainer.clientHeight - 120) {
            bonus.remove();
            clearInterval(interval);
        }
    }, 20);

    bonus.addEventListener('click', () => {
        if (lives < 3 && !gameOver) {
            lives++;
            updateLivesDisplay();
            showMessage('Extra Life!', 'green');
        }
        bonus.remove();
        clearInterval(interval);
    });
}

function normalizeColor(color) {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const normalizedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    return normalizedColor.replace(/\s+/g, '');
}

function updateLivesDisplay() {
    livesElement.innerHTML = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
}

function showGameOver() {
    gameOver = true;
    finalScoreElement.textContent = score;
    modal.style.display = 'block';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

function showMessage(text, color) {
    messageElement.textContent = text;
    messageElement.style.color = color;
    setTimeout(() => {
        messageElement.textContent = ''; // Clear the message after 1 second
    }, 1000);
}

playAgainButton.addEventListener('click', () => {
    score = 0;
    lives = 3;
    speed = 3;
    ballsPerDrop = 1;
    gameOver = false;
    scoreElement.textContent = `Score: ${score}`;
    updateLivesDisplay();
    modal.style.display = 'none';
    dropBalls();
    nextLifeBonusRange = { min: 20, max: 30 };
    nextLifeBonusPoint = getRandomBonusPoint(nextLifeBonusRange.min, nextLifeBonusRange.max);
});

function dropBalls() {
    const dropInterval = 1500 - Math.min(score * 50, 1000);
    setTimeout(() => {
        for (let i = 0; i < ballsPerDrop; i++) {
            const side = Math.random() < 0.5 ? 'left' : 'right';
            createBall(side);
        }
        if (lives > 0) {
            dropBalls();
        }
    }, dropInterval);
}

function adjustBallsPerDrop() {
    if (score >= 30) {
        ballsPerDrop = 3;
    } else if (score >= 20) {
        ballsPerDrop = 2;
    } else {
        ballsPerDrop = 1;
    }
}

function getRandomBonusPoint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkLifeBonusMilestone() {
    if (score === nextLifeBonusPoint) {
        createLifeBonus();
        // Define the next range for the next bonus life
        nextLifeBonusRange.min += 30;
        nextLifeBonusRange.max += 30;
        nextLifeBonusPoint = getRandomBonusPoint(nextLifeBonusRange.min, nextLifeBonusRange.max);
    }
}

updateLivesDisplay();
scoreElement.textContent = `Score: ${score}`;
dropBalls();
