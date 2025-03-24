let currentQuestion = 1;
const totalQuestions = 10;

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const progressBar = document.getElementById("progress-bar");

function showQuestion(questionNumber) {
    for (let i = 1; i <= totalQuestions; i++) {
        const question = document.getElementById(`question-${i}`);
        question.classList.add("hidden");
    }

    const currentQuestionElement = document.getElementById(`question-${questionNumber}`);
    currentQuestionElement.classList.remove("hidden");

    updateProgressBar();
    toggleNavigationButtons();
}

function updateProgressBar() {
    const progress = (currentQuestion / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;
}

function toggleNavigationButtons() {
    if (currentQuestion === 1) {
        prevBtn.classList.add("hidden");
    } else {
        prevBtn.classList.remove("hidden");
    }

    if (currentQuestion === totalQuestions) {
        nextBtn.classList.add("hidden");
        submitBtn.classList.remove("hidden");
    } else {
        nextBtn.classList.remove("hidden");
        submitBtn.classList.add("hidden");
    }
}

function calculateScore() {
    let score = 0;
    for (let i = 1; i <= totalQuestions; i++) {
        const question = document.getElementById(`question-${i}`);
        const selectedAnswer = question.querySelector('input[type="radio"]:checked');
        if (selectedAnswer) {
            if (selectedAnswer.value === correctAnswers[i - 1]) {
                score++;
            }
        }
    }
    return score;
}

nextBtn.addEventListener("click", () => {
    if (currentQuestion < totalQuestions) {
        currentQuestion++;
        showQuestion(currentQuestion);
    }
});

prevBtn.addEventListener("click", () => {
    if (currentQuestion > 1) {
        currentQuestion--;
        showQuestion(currentQuestion);
    }
});

submitBtn.addEventListener("click", () => {
    const score = calculateScore();
    const result = document.getElementById("result");
    result.textContent = `Your score is: ${score} out of ${totalQuestions}`;
    result.style.color = score === totalQuestions ? "green" : "red";
});

const correctAnswers = [
    "Paris", "Mars", "4", "Pacific", "Au", "Albert Einstein", "Australia", 
    "George Washington", "Carbon Dioxide", "Jupiter"
];

showQuestion(currentQuestion);
