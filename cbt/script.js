let currentQuestionIndex = 0;
let userAnswers = new Array(questions.length).fill(null);
let questionStatuses = new Array(questions.length).fill(0);
let timeSpentPerQuestion = new Array(questions.length).fill(0);
let questionTimer = 0;
let timerInterval;
let currentFilter = 'All';

function init() {
    initDarkMode();
    initFilter();
    initLightbox();
    renderPalette();
    loadQuestion(0);
    startTimers();
}

function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        html.classList.add('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }

    toggle.onclick = () => {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        sunIcon.classList.toggle('hidden', !isDark);
        moonIcon.classList.toggle('hidden', isDark);
    };
}

function initFilter() {
    const sel = document.getElementById('topic-filter');
    const topics = [...new Set(questions.map(q => q.topic))].sort();
    topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t; opt.textContent = t;
        sel.appendChild(opt);
    });
    sel.onchange = e => { currentFilter = e.target.value; renderPalette(); };
}

function initLightbox() {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbClose = document.getElementById('lightbox-close');

    document.getElementById('question-image').onclick = () => {
        const src = document.getElementById('question-image').src;
        if (!src) return;
        lbImg.src = src;
        lb.classList.add('open');
    };

    const closeLb = () => lb.classList.remove('open');
    lb.onclick = closeLb;
    lbClose.onclick = closeLb;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}

function startTimers() {
    timerInterval = setInterval(() => {
        questionTimer++;
        const m = String(Math.floor(questionTimer / 60)).padStart(2, '0');
        const s = String(questionTimer % 60).padStart(2, '0');
        document.getElementById('question-timer').textContent = `${m}:${s}`;
    }, 1000);
}

function saveTimeSpent() {
    timeSpentPerQuestion[currentQuestionIndex] += questionTimer;
}

function renderPalette() {
    const grid = document.getElementById('palette-grid');
    grid.innerHTML = '';
    questions.forEach((q, i) => {
        if (currentFilter !== 'All' && q.topic !== currentFilter) return;
        const btn = document.createElement('div');
        btn.className = `palette-btn status-${questionStatuses[i]}${i === currentQuestionIndex ? ' active' : ''}`;
        btn.textContent = i + 1;
        btn.onclick = () => { saveTimeSpent(); loadQuestion(i); };
        grid.appendChild(btn);
    });
}

function loadQuestion(index) {
    currentQuestionIndex = index;
    const q = questions[index];

    if (questionStatuses[index] === 0) questionStatuses[index] = 1;

    document.getElementById('question-number-title').textContent = `Question ${index + 1} · ${q.topic}`;

    const textEl = document.getElementById('question-text');
    const imgContainer = document.getElementById('question-image-container');
    const imgEl = document.getElementById('question-image');
    const imageFile = imageMapping[q.id.toString()];

    if (imageFile) {
        imgEl.src = `assets/diagrams/${imageFile}`;
        imgContainer.classList.remove('hidden');
        textEl.style.display = 'none';
        textEl.textContent = '';
    } else {
        imgEl.src = '';
        imgContainer.classList.add('hidden');
        textEl.textContent = q.text;
        textEl.style.display = '';
    }

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    if (q.type === 'mcq') {
        q.options.forEach((opt, optIdx) => {
            const isSelected = userAnswers[index] == (optIdx + 1);
            const card = document.createElement('div');
            card.className = `option-card${isSelected ? ' selected' : ''}`;
            card.innerHTML = `
                <div class="radio-dot"><div class="radio-inner"></div></div>
                <span style="font-size:15px;font-weight:500">${opt}</span>
            `;
            card.onclick = () => { userAnswers[index] = optIdx + 1; loadQuestion(index); };
            container.appendChild(card);
        });
    } else if (q.type === 'integer') {
        const wrap = document.createElement('div');
        wrap.innerHTML = `
            <p style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px">Enter integer answer:</p>
            <input type="number" id="integer-input" class="integer-input"
                   value="${userAnswers[index] !== null ? userAnswers[index] : ''}" placeholder="0">
        `;
        container.appendChild(wrap);
        const input = document.getElementById('integer-input');
        input.oninput = e => { userAnswers[index] = e.target.value; };
        setTimeout(() => input.focus(), 50);
    }

    questionTimer = 0;
    document.getElementById('question-timer').textContent = '00:00';
    renderPalette();
}

document.getElementById('save-next-btn').onclick = () => {
    saveTimeSpent();
    const ans = userAnswers[currentQuestionIndex];
    questionStatuses[currentQuestionIndex] = (ans !== null && ans !== '') ? 2 : 1;
    if (currentQuestionIndex < questions.length - 1) loadQuestion(currentQuestionIndex + 1);
    else renderPalette();
};

document.getElementById('clear-response-btn').onclick = () => {
    userAnswers[currentQuestionIndex] = null;
    questionStatuses[currentQuestionIndex] = 1;
    loadQuestion(currentQuestionIndex);
};

document.getElementById('mark-review-btn').onclick = () => {
    saveTimeSpent();
    const ans = userAnswers[currentQuestionIndex];
    questionStatuses[currentQuestionIndex] = (ans !== null && ans !== '') ? 4 : 3;
    if (currentQuestionIndex < questions.length - 1) loadQuestion(currentQuestionIndex + 1);
    else renderPalette();
};

document.getElementById('submit-test-btn').onclick = () => {
    if (confirm('Submit the test? This cannot be undone.')) {
        saveTimeSpent();
        clearInterval(timerInterval);
        calculateResults();
    }
};

function calculateResults() {
    let score = 0, correct = 0, incorrect = 0;
    const tbody = document.getElementById('analysis-tbody');
    tbody.innerHTML = '';

    questions.forEach((q, i) => {
        const userAns = userAnswers[i];
        const correctAns = q.answer;
        let marks = 0, statusText = 'Unattempted', color = 'var(--text-muted)';

        if (userAns !== null && userAns !== '') {
            if (userAns == correctAns) {
                score += 4; correct++; marks = 4;
                statusText = 'Correct'; color = '#22c55e';
            } else {
                score -= 1; incorrect++; marks = -1;
                statusText = 'Incorrect'; color = '#ef4444';
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:700;color:var(--text-muted)">${i + 1}</td>
            <td style="font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${color}">${statusText}</td>
            <td style="font-weight:600;color:var(--text)">${userAns || '—'}</td>
            <td style="font-weight:700;color:#22c55e">${correctAns}</td>
            <td style="font-family:'DM Mono',monospace;font-weight:700;color:${marks > 0 ? '#22c55e' : marks < 0 ? '#ef4444' : 'var(--text-muted)'}">${marks > 0 ? '+' : ''}${marks}</td>
            <td style="color:var(--text-muted);font-size:13px">${formatTime(timeSpentPerQuestion[i])}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('result-score').textContent = score;
    document.getElementById('result-correct').textContent = correct;
    document.getElementById('result-incorrect').textContent = incorrect;
    const attempted = correct + incorrect;
    document.getElementById('result-accuracy').textContent = attempted > 0 ? `${Math.round((correct / attempted) * 100)}%` : '0%';
    document.getElementById('results-overlay').classList.add('open');
}

function formatTime(seconds) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

init();