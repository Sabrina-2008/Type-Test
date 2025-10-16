// TypingTest class to encapsulate all functionality
class TypingTest {
    constructor() {
        this.sentences = {
            easy: [
                "The quick brown fox jumps over the lazy dog.",
                "Programming is fun and challenging at the same time.",
                "I enjoy reading books and learning new things every day.",
                "The sun shines brightly in the clear blue sky.",
                "Coding requires patience, practice, and persistence."
            ],
            medium: [
                "JavaScript is a versatile programming language used for web development.",
                "The complexity of the universe arises from simple fundamental laws.",
                "Artificial intelligence is transforming various industries worldwide.",
                "Effective communication skills are essential in professional environments.",
                "Climate change poses significant challenges for future generations."
            ],
            hard: [
                "Quantum computing leverages quantum mechanical phenomena to perform computations.",
                "The epistemological foundations of scientific methodology warrant careful examination.",
                "Neuroplasticity refers to the brain's ability to reorganize itself by forming new neural connections.",
                "Postmodernist literature often challenges conventional narrative structures and linear temporality.",
                "Cryptocurrencies utilize decentralized control as opposed to centralized digital currency systems."
            ]
        };

        this.initializeElements();
        this.attachEventListeners();
        this.resetTest();
    }

    initializeElements() {
        // Mode buttons
        this.standardBtn = document.getElementById('standard-btn');
        this.timedBtn = document.getElementById('timed-btn');
        
        // Settings
        this.timeLimitSelect = document.getElementById('time-limit');
        this.difficultySelect = document.getElementById('difficulty');
        
        // Test area
        this.textDisplay = document.getElementById('text-display');
        this.typingInput = document.getElementById('typing-input');
        
        // Stats
        this.wpmElement = document.getElementById('wpm');
        this.accuracyElement = document.getElementById('accuracy');
        this.timerElement = document.getElementById('timer');
        
        // Controls
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        // Results
        this.results = document.getElementById('results');
        this.finalWpm = document.getElementById('final-wpm');
        this.finalAccuracy = document.getElementById('final-accuracy');
        this.finalTime = document.getElementById('final-time');
        this.retryBtn = document.getElementById('retry-btn');

        // Test state
        this.currentMode = 'standard';
        this.currentSentence = '';
        this.currentWordIndex = 0;
        this.words = [];
        this.startTime = null;
        this.timerInterval = null;
        this.timeLeft = 60;
        this.totalTime = 60;
        this.correctChars = 0;
        this.totalChars = 0;
        this.testActive = false;
        this.sentencesCompleted = 0;
    }

    attachEventListeners() {
        this.standardBtn.addEventListener('click', () => this.switchMode('standard'));
        this.timedBtn.addEventListener('click', () => this.switchMode('timed'));
        this.startBtn.addEventListener('click', () => this.startTest());
        this.resetBtn.addEventListener('click', () => this.resetTest());
        this.retryBtn.addEventListener('click', () => this.resetTest());
        this.typingInput.addEventListener('input', () => this.handleTyping());
        this.typingInput.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
            }
        });
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        if (mode === 'standard') {
            this.standardBtn.classList.add('active');
            this.timedBtn.classList.remove('active');
            this.timeLimitSelect.style.display = 'none';
            document.querySelector('.setting label[for="time-limit"]').style.display = 'none';
        } else {
            this.standardBtn.classList.remove('active');
            this.timedBtn.classList.add('active');
            this.timeLimitSelect.style.display = 'block';
            document.querySelector('.setting label[for="time-limit"]').style.display = 'block';
        }
        
        this.resetTest();
    }

    startTest() {
        if (this.testActive) return;
        
        this.testActive = true;
        this.startBtn.disabled = true;
        this.resetBtn.disabled = false;
        this.typingInput.disabled = false;
        this.typingInput.focus();
        
        // Set time limit
        this.totalTime = parseInt(this.timeLimitSelect.value);
        this.timeLeft = this.totalTime;
        
        // Reset stats
        this.correctChars = 0;
        this.totalChars = 0;
        this.sentencesCompleted = 0;
        
        // Generate first sentence
        this.generateNewSentence();
        
        // Start timer
        this.startTime = new Date();
        if (this.currentMode === 'timed') {
            this.startTimer();
        }
        
        this.updateStats();
    }

    resetTest() {
        this.testActive = false;
        clearInterval(this.timerInterval);
        
        this.startBtn.disabled = false;
        this.resetBtn.disabled = true;
        this.typingInput.disabled = true;
        this.typingInput.value = '';
        
        this.textDisplay.innerHTML = 'Click "Start Test" to begin the typing test.';
        this.wpmElement.textContent = '0';
        this.accuracyElement.textContent = '100%';
        this.timerElement.textContent = this.formatTime(this.totalTime);
        
        this.results.style.display = 'none';
    }

    generateNewSentence() {
        const difficulty = this.difficultySelect.value;
        const sentenceList = this.sentences[difficulty];
        this.currentSentence = sentenceList[Math.floor(Math.random() * sentenceList.length)];
        this.words = this.currentSentence.split(' ');
        this.currentWordIndex = 0;
        
        this.renderText();
    }

    renderText() {
        let html = '';
        
        for (let i = 0; i < this.words.length; i++) {
            if (i === this.currentWordIndex) {
                html += `<span class="current-word">${this.words[i]}</span> `;
            } else {
                html += `${this.words[i]} `;
            }
        }
        
        this.textDisplay.innerHTML = html;
    }

    handleTyping() {
        if (!this.testActive) return;
        
        const typedText = this.typingInput.value;
        const currentWord = this.words[this.currentWordIndex];
        
        // Check if the current word is completed
        if (typedText.trim() === currentWord) {
            // Move to next word
            this.currentWordIndex++;
            this.typingInput.value = '';
            
            // Update character counts
            this.correctChars += currentWord.length;
            this.totalChars += currentWord.length;
            
            // Check if sentence is completed
            if (this.currentWordIndex >= this.words.length) {
                this.sentencesCompleted++;
                
                if (this.currentMode === 'standard') {
                    // In standard mode, generate new sentence
                    this.generateNewSentence();
                } else {
                    // In timed mode, check if time is up
                    if (this.timeLeft > 0) {
                        this.generateNewSentence();
                    } else {
                        this.endTest();
                    }
                }
            } else {
                this.renderText();
            }
        } else {
            // Update character counts for partial typing
            const minLength = Math.min(typedText.length, currentWord.length);
            let correctInWord = 0;
            
            for (let i = 0; i < minLength; i++) {
                if (typedText[i] === currentWord[i]) {
                    correctInWord++;
                }
            }
            
            // Update total correct characters
            this.correctChars = this.correctChars - (this.currentWordIndex > 0 ? this.words[this.currentWordIndex - 1].length : 0) + correctInWord;
            this.totalChars = this.totalChars - (this.currentWordIndex > 0 ? this.words[this.currentWordIndex - 1].length : 0) + typedText.length;
        }
        
        this.updateStats();
    }

    updateStats() {
        // Calculate WPM
        const currentTime = new Date();
        const timeElapsed = (currentTime - this.startTime) / 1000 / 60; // in minutes
        const wpm = timeElapsed > 0 ? Math.round((this.correctChars / 5) / timeElapsed) : 0;
        this.wpmElement.textContent = wpm;
        
        // Calculate accuracy
        const accuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        this.accuracyElement.textContent = `${accuracy}%`;
        
        // Update timer for timed mode
        if (this.currentMode === 'timed') {
            this.timerElement.textContent = this.formatTime(this.timeLeft);
        } else {
            // For standard mode, show elapsed time
            const elapsedSeconds = Math.floor((currentTime - this.startTime) / 1000);
            this.timerElement.textContent = this.formatTime(elapsedSeconds);
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.formatTime(this.timeLeft);
            
            if (this.timeLeft <= 0) {
                this.endTest();
            }
        }, 1000);
    }

    endTest() {
        this.testActive = false;
        clearInterval(this.timerInterval);
        this.typingInput.disabled = true;
        
        // Calculate final stats
        const endTime = new Date();
        const timeElapsed = (endTime - this.startTime) / 1000 / 60; // in minutes
        const finalWpmValue = timeElapsed > 0 ? Math.round((this.correctChars / 5) / timeElapsed) : 0;
        const finalAccuracyValue = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        
        // Display results
        this.finalWpm.textContent = finalWpmValue;
        this.finalAccuracy.textContent = `${finalAccuracyValue}%`;
        this.finalTime.textContent = this.formatTime(this.totalTime - this.timeLeft);
        
        this.results.style.display = 'block';
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypingTest();
});