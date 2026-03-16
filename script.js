let gameSeq = [];
let userSeq = [];
let btns = ["yellow", "red", "purple", "green"];

let started = false;
let level = 0;
let highestScore = 0;

const h2 = document.querySelector('#level-title');
const highestScoreEl = document.querySelector('#highest-score');
const startBtn = document.querySelector('#start-btn');
const wrapper = document.querySelector('.game-wrapper');
const allBtns = document.querySelectorAll(".color-btn");

// Audio context for generating tones
let audioCtx = null;

function playTone(frequency, type = 'sine', duration = 0.3) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Resume audio context if suspended (browser policy)
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    // Fade out to avoid clicks
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    oscillator.stop(audioCtx.currentTime + duration);
}

// Frequencies for buttons (C major pentatonic-ish)
const tones = {
    red: 261.63,    // C4
    yellow: 329.63, // E4
    green: 392.00,  // G4
    purple: 523.25  // C5
};

startBtn.addEventListener("click", function() {
    if (!started) {
        startGame();
    }
});

// Allow keyboard start if not started
document.addEventListener("keypress", function(e) {
    if (!started && e.code === "Space") {
        startGame();
    }
});

function startGame() {
    started = true;
    startBtn.classList.add("hidden");
    wrapper.classList.add("game-active");
    levelUp();
}

function gameFlash(btn, color) {
    btn.classList.add(`flash-${color}`);
    playTone(tones[color], 'sine', 0.4);
    setTimeout(function() {
        btn.classList.remove(`flash-${color}`);
    }, 400);
}

function userFlash(btn, color) {
    btn.classList.add("userflash");
    playTone(tones[color], 'triangle', 0.2);
    setTimeout(function() {
        btn.classList.remove("userflash");
    }, 200);
}

function levelUp() {
    userSeq = [];
    level++;
    h2.innerText = `Level ${level}`;
    
    // Update highest score if current level is higher
    if (level > highestScore && level > 1) {
        highestScore = level - 1;
        highestScoreEl.innerText = `Best Score: ${highestScore}`;
    }

    // Disable button clicks during playback
    allBtns.forEach(b => b.classList.add('disabled'));

    // Fix applied here: Math.random() * 4 to get 0, 1, 2, 3
    let randIdx = Math.floor(Math.random() * 4);
    let randColor = btns[randIdx];
    let randBtn = document.querySelector(`#${randColor}`);
    
    gameSeq.push(randColor);
    
    // Play sequence
    playSequence();
}

function playSequence() {
    let delay = 600;
    
    // Decrease delay as levels go up to increase difficulty
    if (level > 5) delay = 500;
    if (level > 10) delay = 400;

    for (let i = 0; i < gameSeq.length; i++) {
        setTimeout(function() {
            let color = gameSeq[i];
            let btn = document.querySelector(`#${color}`);
            gameFlash(btn, color);
            
            // Re-enable clicks after sequence is fully played
            if (i === gameSeq.length - 1) {
                setTimeout(() => {
                    allBtns.forEach(b => b.classList.remove('disabled'));
                }, 400);
            }
        }, i * delay);
    }
}

function checkAns(idx) {
    if (userSeq[idx] === gameSeq[idx]) {
        if (userSeq.length === gameSeq.length) {
            allBtns.forEach(b => b.classList.add('disabled')); // Disable until next sequence starts
            setTimeout(levelUp, 1000);
        }
    } else {
        // Game Over logic
        if (level > highestScore) {
            highestScore = level - 1;
            highestScoreEl.innerText = `Best Score: ${highestScore}`;
        }
        
        h2.innerHTML = `Game Over! Your score: <b>${level - 1}</b>`;
        
        // Error tone
        playTone(150, 'sawtooth', 0.8);
        document.body.classList.add("game-over");
        
        setTimeout(function() {
            document.body.classList.remove("game-over");
        }, 300);
        
        resetGame();
    }
}

function btnPress() {
    // If the game hasn't started or playing sequence, don't register clicks
    if (!started || this.classList.contains('disabled')) return;
    
    let btn = this;
    let userColor = btn.getAttribute('id');
    
    userFlash(btn, userColor);  
    userSeq.push(userColor);
    
    checkAns(userSeq.length - 1);
}

for (let btn of allBtns) {
    btn.addEventListener("click", btnPress);
}

function resetGame() {
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
    
    // Show start button again
    setTimeout(() => {
        startBtn.innerText = "Try Again";
        startBtn.classList.remove("hidden");
        wrapper.classList.remove("game-active");
        
        // Remove disabled state explicitly to be ready for next game
        allBtns.forEach(b => b.classList.remove('disabled'));
    }, 500);
}
