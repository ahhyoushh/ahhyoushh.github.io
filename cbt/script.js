let currentQuestionIndex = 0;
let userAnswers = new Array(questions.length).fill(null);
let questionStatuses = new Array(questions.length).fill(0); // 0: Not Visited, 1: Not Answered, 2: Answered, 3: Marked, 4: Marked & Answered
let timeSpentPerQuestion = new Array(questions.length).fill(0);
let questionTimer = 0;
let timerInterval;
let currentFilter = 'All';

// Initialize the test
function init() {
    initDarkMode();
    initFilter();
    renderPalette();
    loadQuestion(0);
    startTimers();
}

function initFilter() {
    const filterSelect = document.getElementById('topic-filter');
    const topics = [...new Set(questions.map(q => q.topic))].sort();
    
    topics.forEach(topic => {
        const opt = document.createElement('option');
        opt.value = topic;
        opt.textContent = topic;
        filterSelect.appendChild(opt);
    });

    filterSelect.onchange = (e) => {
        currentFilter = e.target.value;
        renderPalette();
    };
}

function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }

    toggle.onclick = () => {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        if (isDark) {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    };
}

function startTimers() {
    timerInterval = setInterval(() => {
        questionTimer++;
        updateQuestionTimerDisplay();
    }, 1000);
}

function updateQuestionTimerDisplay() {
    const m = Math.floor(questionTimer / 60);
    const s = questionTimer % 60;
    document.getElementById('question-timer').textContent = 
        `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function renderPalette() {
    const grid = document.getElementById('palette-grid');
    grid.innerHTML = '';
    questions.forEach((q, index) => {
        // Apply filter
        if (currentFilter !== 'All' && q.topic !== currentFilter) {
            return;
        }

        const btn = document.createElement('div');
        btn.className = `palette-btn ${getStatusClass(questionStatuses[index])} ${index === currentQuestionIndex ? 'active' : ''}`;
        btn.textContent = index + 1;
        btn.onclick = () => {
            saveTimeSpent();
            loadQuestion(index);
        };
        grid.appendChild(btn);
    });
}

function getStatusClass(status) {
    switch (status) {
        case 0: return 'status-not-visited';
        case 1: return 'status-not-answered';
        case 2: return 'status-answered';
        case 3: return 'status-marked';
        case 4: return 'status-marked-answered';
        default: return 'status-not-visited';
    }
}

function loadQuestion(index) {
    currentQuestionIndex = index;
    const q = questions[index];

    // Mark as Not Answered if it was Not Visited
    if (questionStatuses[index] === 0) {
        questionStatuses[index] = 1;
    }

    document.getElementById('question-number-title').textContent = `Question No. ${index + 1} (${q.topic})`;
    
    // Set question text and diagram
    const textEl = document.getElementById('question-text');
    const imgContainer = document.getElementById('question-image-container');
    const imgEl = document.getElementById('question-image');
    const imageFile = imageMapping[q.id.toString()];
    
    textEl.textContent = q.text;
    textEl.classList.remove('hidden');

    if (imageFile) {
        imgEl.src = `assets/diagrams/${imageFile}`;
        imgContainer.classList.remove('hidden');
    } else {
        imgEl.src = '';
        imgContainer.classList.add('hidden');
    }

    // Render options or input field
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    if (q.type === 'mcq') {
        q.options.forEach((opt, optIndex) => {
            const div = document.createElement('label');
            div.className = 'flex items-center p-5 border-2 rounded-xl cursor-pointer hover:bg-blue-50 transition-all shadow-sm group';
            const isChecked = userAnswers[index] == (optIndex + 1);
            div.innerHTML = `
                <div class="flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-blue-500 transition-colors ${isChecked ? 'border-blue-500 bg-blue-500' : ''}">
                    <div class="w-2 h-2 bg-white rounded-full ${isChecked ? 'block' : 'hidden'}"></div>
                </div>
                <input type="radio" name="option" value="${optIndex + 1}" class="hidden" ${isChecked ? 'checked' : ''}>
                <span class="ml-4 text-gray-700 font-semibold">${opt}</span>
            `;
            div.onclick = () => {
                userAnswers[index] = optIndex + 1;
                loadQuestion(index); // Re-render to show selection
            };
            optionsContainer.appendChild(div);
        });
    } else if (q.type === 'integer') {
        const div = document.createElement('div');
        div.className = 'p-6 border-2 rounded-xl bg-gray-50 col-span-full';
        div.innerHTML = `
            <p class="mb-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Type your answer below (Integer):</p>
            <input type="number" id="integer-input" class="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-2xl font-black text-blue-700 bg-white shadow-inner transition-all" 
                   value="${userAnswers[index] !== null ? userAnswers[index] : ''}" placeholder="0">
        `;
        optionsContainer.appendChild(div);
        const input = document.getElementById('integer-input');
        input.oninput = (e) => {
            userAnswers[index] = e.target.value;
        };
        input.focus();
    }

    // Reset question timer for the new question
    questionTimer = 0;
    updateQuestionTimerDisplay();
    renderPalette();
}

function saveTimeSpent() {
    timeSpentPerQuestion[currentQuestionIndex] += questionTimer;
}

// Button actions
document.getElementById('save-next-btn').onclick = () => {
    saveTimeSpent();
    if (userAnswers[currentQuestionIndex] !== null && userAnswers[currentQuestionIndex] !== "") {
        questionStatuses[currentQuestionIndex] = 2; // Answered
    } else {
        questionStatuses[currentQuestionIndex] = 1; // Not Answered
    }
    
    if (currentQuestionIndex < questions.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        renderPalette();
    }
};

document.getElementById('clear-response-btn').onclick = () => {
    userAnswers[currentQuestionIndex] = null;
    questionStatuses[currentQuestionIndex] = 1; // Not Answered
    loadQuestion(currentQuestionIndex);
};

document.getElementById('mark-review-btn').onclick = () => {
    saveTimeSpent();
    if (userAnswers[currentQuestionIndex] !== null && userAnswers[currentQuestionIndex] !== "") {
        questionStatuses[currentQuestionIndex] = 4; // Marked & Answered
    } else {
        questionStatuses[currentQuestionIndex] = 3; // Marked
    }
    
    if (currentQuestionIndex < questions.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        renderPalette();
    }
};

document.getElementById('submit-test-btn').onclick = () => {
    if (confirm("Are you sure you want to submit the test?")) {
        saveTimeSpent();
        submitTest();
    }
};

function submitTest() {
    clearInterval(timerInterval);
    calculateResults();
}

function calculateResults() {
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    const tbody = document.getElementById('analysis-tbody');
    tbody.innerHTML = '';

    questions.forEach((q, index) => {
        const userAns = userAnswers[index];
        const correctAns = q.answer;
        let marks = 0;
        let statusText = 'Unattempted';
        let statusColor = 'text-gray-400';

        if (userAns !== null && userAns !== "") {
            if (userAns == correctAns) {
                score += 4;
                correctCount++;
                marks = 4;
                statusText = 'Correct';
                statusColor = 'text-green-600';
            } else {
                score -= 1;
                incorrectCount++;
                marks = -1;
                statusText = 'Incorrect';
                statusColor = 'text-red-600';
            }
        }

        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        row.innerHTML = `
            <td class="p-5 font-bold text-gray-400">${index + 1}</td>
            <td class="p-5 font-black uppercase text-[10px] tracking-widest ${statusColor}">${statusText}</td>
            <td class="p-5 font-bold">${userAns || '-'}</td>
            <td class="p-5 font-bold text-green-700">${correctAns}</td>
            <td class="p-5 font-mono font-bold text-lg">${marks > 0 ? '+' : ''}${marks}</td>
            <td class="p-5 text-gray-500 font-medium">${formatTime(timeSpentPerQuestion[index])}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('result-score').textContent = score;
    document.getElementById('result-correct').textContent = correctCount;
    document.getElementById('result-incorrect').textContent = incorrectCount;
    const totalAttempted = correctCount + incorrectCount;
    const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
    document.getElementById('result-accuracy').textContent = `${accuracy}%`;

    document.getElementById('results-overlay').classList.remove('hidden');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

init();
