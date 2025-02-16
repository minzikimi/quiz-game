const startButton = document.getElementById("start-btn");
const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtonsContainer = document.getElementById("answer-buttons");
// const answerButtons = document.querySelectorAll(".answer-btn");
const resultContainer = document.getElementById("result-container");
const scoreElement = document.getElementById("score");
const endingMessage = document.getElementById("ending-message");
const restartButton = document.getElementById("restart-btn");
const errorMessage = document.getElementById("error-message");
const correctAnswer = document.getElementById("correct-answer");
const startMessage = document.getElementById("start-message");
const questionNumber = document.getElementById("question-number");

// best practice is to always declare variables with let or const
let currentQuestionIndex = 0;
let score = 0;
let fetchedQuiz = [];

// Event listeners
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

async function fetchQuizAPI() {
  // when no variables in the api url you can use it directly in the fetch, otherwise you can use a variable, best practice for a variable is to use capital letters
  const API_URL =
    "https://opentdb.com/api.php?amount=10&category=21&difficulty=medium&type=multiple";

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch quiz");

    const quizData = await res.json();
    // remember to remove console.log from production code
    return quizData;
  } catch (error) {
    console.error("Error fetching quiz:", error);
    errorMessage.textContent = "Failed to start quiz, try again!";
  }
}

async function startQuiz() {
  startButton.style.display = "none";
  startMessage.style.display = "none";
  errorMessage.textContent = "";
  try {
    fetchedQuiz = await fetchQuizAPI();
    if (fetchedQuiz && fetchedQuiz.results && fetchedQuiz.results.length > 0) {
      questionContainer.style.display = "block";
      displayQuiz(fetchedQuiz.results[currentQuestionIndex]);
    } else {
      throw new Error("No quiz data available");
    }
  } catch (error) {
    console.error("Error starting quiz:", error);
    errorMessage.textContent = "Failed to start quiz. Please try again.";
    startButton.style.display = "block";
  }
}

function displayQuiz(data) {
  // Display the current question number

  questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${
    fetchedQuiz.results.length
  }`;

  // Set the question text
  questionElement.textContent = data.question;
  document.getElementById("correct-answer").textContent = "";
  const answers = [...data.incorrect_answers, data.correct_answer];
  // remember to remove console.log from production code
  console.log("answer's array:", answers);

  shuffleArray(answers);

  // textContent is better than innerHTML for security reasons
  answerButtonsContainer.textContent = "";
  answers.forEach((answer) => {
    const answerButton = document.createElement("button");
    answerButton.textContent = answer;
    answerButton.classList.add("answer-btn");
    answerButton.addEventListener("click", (e) =>
      checkAnswer(e, data.correct_answer)
    );
    answerButtonsContainer.appendChild(answerButton);
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function checkAnswer(e, correctAnswerText) {
  const magicTime = 1300;
  const selectedButton = e.target;
  const selectedAnswer = selectedButton.textContent;

  // user ternary operator for readability
  selectedButton.classList.add(
    selectedAnswer === correctAnswerText ? "correct" : "incorrect"
  );

  if (selectedAnswer === correctAnswerText) {
    score++;
  } else {
    correctAnswer.textContent = `Correct answer: ${correctAnswerText}`;

    Array.from(answerButtonsContainer.children).forEach((button) => {
      if (button.textContent === correctAnswerText) {
        button.classList.add("correct");
      }
    });
  }

  Array.from(answerButtonsContainer.children).forEach((button) => {
    button.disabled = true;
  });

  setTimeout(() => {
    currentQuestionIndex++;
    // ternary operator for readability
    currentQuestionIndex < fetchedQuiz.results.length
      ? displayQuiz(fetchedQuiz.results[currentQuestionIndex])
      : endQuiz();
  }, magicTime);
}

function endQuiz() {
  questionContainer.style.display = "none";
  resultContainer.style.display = "block";
  scoreElement.textContent = `Your score: ${score} out of ${fetchedQuiz.results.length}`;
  displayMessage();
}

function displayMessage() {
  // can be simplified with a ternary operator
  endingMessage.textContent =
    score >= 8
      ? "Well done! You know a lot about sports!"
      : score >= 5
      ? "Good job! You have a pretty decent knowledge of sports."
      : "Keep learning! There's room for improvement in your sports knowledge.";
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;

  questionNumber.textContent = "";
  questionContainer.style.display = "none";
  resultContainer.style.display = "none";
  startButton.style.display = "block";
  startMessage.style.display = "block";
  errorMessage.textContent = "";
  correctAnswer.textContent = "";
}
