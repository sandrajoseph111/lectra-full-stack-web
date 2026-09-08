import { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [studyKit, setStudyKit] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleGenerate = async () => {
    if (!url.trim()) {
      alert("Please enter a YouTube lecture link.");
      return;
    }

    try {
      setLoading(true);
      setStudyKit(null);

      setCurrentCard(0);
      setShowAnswer(false);

      setCurrentQuiz(0);
      setSelectedOption(null);
      setQuizSubmitted(false);
      setQuizScore(0);
      setQuizFinished(false);

      // Step 1: Get YouTube transcript
      const transcriptResponse = await fetch(
        "http://localhost:5000/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            youtubeUrl: url,
          }),
        }
      );

      const transcriptData = await transcriptResponse.json();

      if (!transcriptData.success) {
        alert(transcriptData.message);
        setLoading(false);
        return;
      }

      console.log("Transcript received.");

      // Step 2: Send transcript to Gemini
      const aiResponse = await fetch(
        "http://localhost:5000/api/generate-study-kit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: transcriptData.transcript,
          }),
        }
      );

      const aiData = await aiResponse.json();

      if (!aiData.success) {
        alert(aiData.error || "Failed to generate study kit.");
        setLoading(false);
        return;
      }

      console.log("Gemini response:", aiData);

      let result;

      try {
        let cleanText = aiData.studyKit.trim();

        // Remove markdown code fences if Gemini adds them
        cleanText = cleanText.replace(/^```json\s*/i, "");
        cleanText = cleanText.replace(/^```\s*/i, "");
        cleanText = cleanText.replace(/\s*```$/i, "");

        result = JSON.parse(cleanText);
      } catch (error) {
        console.error("JSON parsing error:", error);

        result = {
          summary: aiData.studyKit,
          flashcards: [],
          quiz: [],
        };
      }

      setStudyKit(result);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Could not connect to Lectra backend.");
      setLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null) {
      alert("Please select an answer.");
      return;
    }

    const correctAnswer = studyKit.quiz[currentQuiz].answer;

    if (selectedOption === correctAnswer) {
      setQuizScore((prev) => prev + 1);
    }

    setQuizSubmitted(true);
  };

  const handleNextQuiz = () => {
    if (currentQuiz === studyKit.quiz.length - 1) {
      setQuizFinished(true);
      return;
    }

    setCurrentQuiz((prev) => prev + 1);
    setSelectedOption(null);
    setQuizSubmitted(false);
  };

  const restartQuiz = () => {
    setCurrentQuiz(0);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">L</span>
          Lectra
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="badge">✨ AI-Powered Learning</div>

          <h1>
            Turn Your <span>Lectures</span>
            <br />
            Into Smart Revision
          </h1>

          <p>
            Transform educational YouTube lectures into concise summaries,
            interactive flashcards, and quizzes using AI.
          </p>

          {/* URL Input */}
          <div className="input-container">
            <input
              type="text"
              placeholder="Paste your YouTube lecture URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : "Generate Study Kit"}
            </button>
          </div>

          <p className="input-note">
            📺 Enter a YouTube educational lecture to get started
          </p>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <section className="results">
          <h2>🤖 Lectra is preparing your study kit...</h2>
          <p>
            Fetching the lecture transcript and generating revision materials
            using AI.
          </p>
        </section>
      )}

      {/* Study Kit Results */}
      {studyKit && !loading && (
        <section className="results">
          {/* Summary */}
          <div className="result-card">
            <h2>📝 Lecture Summary</h2>
            <p>{studyKit.summary}</p>
          </div>

          {/* Interactive Flashcards */}
<div className="result-card flashcard-section">
  <div className="flashcard-header">
    <div className="section-title">
      <span className="title-icon">🃏</span>
      <h2>AI Flashcards</h2>
    </div>
    <span className="badge-counter">
      {currentCard + 1} / {studyKit.flashcards?.length || 0}
    </span>
  </div>

  {studyKit.flashcards?.length > 0 && (
    <div className="flashcard-wrapper">
      {/* 3D Flip Card Container */}
      <div 
        className={`flip-card ${showAnswer ? "flipped" : ""}`}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <div className="flip-card-inner">
          {/* Front Side */}
          <div className="flip-card-front">
            <span className="card-label question-label">Question</span>
            <h3>{studyKit.flashcards[currentCard].question}</h3>
            <p className="hint-text">Click card or button to reveal answer</p>
          </div>

          {/* Back Side */}
          <div className="flip-card-back">
            <span className="card-label answer-label">Answer</span>
            <p className="answer-text">{studyKit.flashcards[currentCard].answer}</p>
            <p className="hint-text">Click card to view question</p>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flashcard-controls">
        <button
          className="nav-btn"
          disabled={currentCard === 0}
          onClick={() => {
            setCurrentCard((prev) => prev - 1);
            setShowAnswer(false);
          }}
        >
          ← Previous
        </button>

        <button
          className="flip-toggle-btn"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? "Show Question" : "Reveal Answer"}
        </button>

        <button
          className="nav-btn"
          disabled={currentCard === studyKit.flashcards.length - 1}
          onClick={() => {
            setCurrentCard((prev) => prev + 1);
            setShowAnswer(false);
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )}
</div>

          {/* Interactive Quiz */}
          <div className="result-card quiz-section">
            <h2>❓ AI Quiz</h2>

            {!quizFinished && studyKit.quiz?.length > 0 && (
              <div className="interactive-quiz">
                <p className="quiz-progress">
                  Question {currentQuiz + 1} of {studyKit.quiz.length}
                </p>

                <h3>{studyKit.quiz[currentQuiz].question}</h3>

                <div className="quiz-options">
                  {studyKit.quiz[currentQuiz].options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isCorrect =
                      option === studyKit.quiz[currentQuiz].answer;

                    let optionClass = "";
                    if (quizSubmitted && isCorrect) {
                      optionClass = "correct-option";
                    } else if (quizSubmitted && isSelected && !isCorrect) {
                      optionClass = "wrong-option";
                    } else if (isSelected) {
                      optionClass = "selected-option";
                    }

                    return (
                      <button
                        key={index}
                        className={`quiz-option ${optionClass}`}
                        onClick={() => {
                          if (!quizSubmitted) {
                            setSelectedOption(option);
                          }
                        }}
                        disabled={quizSubmitted}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted && (
                  <button
                    className="submit-quiz-btn"
                    onClick={handleQuizSubmit}
                  >
                    Submit Answer
                  </button>
                )}

                {quizSubmitted && (
                  <div className="quiz-feedback">
                    {selectedOption === studyKit.quiz[currentQuiz].answer ? (
                      <p className="correct-feedback">✅ Correct!</p>
                    ) : (
                      <p className="wrong-feedback">
                        ❌ Incorrect!
                        <br />
                        Correct answer: {studyKit.quiz[currentQuiz].answer}
                      </p>
                    )}

                    <button className="next-quiz-btn" onClick={handleNextQuiz}>
                      {currentQuiz === studyKit.quiz.length - 1
                        ? "Finish Quiz"
                        : "Next Question →"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quiz Result */}
            {quizFinished && (
              <div className="quiz-result">
                <div className="score-circle">
                  {quizScore}/{studyKit.quiz.length}
                </div>

                <h3>🎉 Quiz Completed!</h3>

                <p>
                  You scored <strong>{quizScore}</strong> out of{" "}
                  <strong>{studyKit.quiz.length}</strong>.
                </p>

                <button className="restart-quiz-btn" onClick={restartQuiz}>
                  🔄 Restart Quiz
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="features" id="features">
        <h2>Everything You Need for Better Revision</h2>

        <div className="feature-container">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Smart Summary</h3>
            <p>
              Get concise summaries highlighting the important concepts from
              your lecture.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🃏</div>
            <h3>AI Flashcards</h3>
            <p>
              Revise important concepts using automatically generated
              question-and-answer flashcards.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">❓</div>
            <h3>Interactive Quizzes</h3>
            <p>
              Test your understanding with AI-generated quiz questions based on
              the lecture.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>Lectra — AI-Powered Lecture-to-Revision Platform</p>
      </footer>
    </div>
  );
}

export default App;