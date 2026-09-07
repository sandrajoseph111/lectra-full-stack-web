import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

// Generate floating particle coordinates
const floatingParticles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 20 + 8,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 6 + 6,
  delay: Math.random() * 3,
  xOffset: Math.random() * 40 - 20,
}));

function App() {
  const [url, setUrl] = useState("");
  const [studyKit, setStudyKit] = useState(null);
  const [loading, setLoading] = useState(false);

  // Flashcard states
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerate = async () => {
    if (!url.trim()) {
      alert("Please enter a YouTube lecture link.");
      return;
    }

    try {
      setLoading(true);
      setStudyKit(null);

      // Reset previous results
      setCurrentCard(0);
      setShowAnswer(false);
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setScore(0);

      const transcriptResponse = await fetch(
        "http://localhost:5000/api/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeUrl: url }),
        }
      );

      const transcriptData = await transcriptResponse.json();

      if (!transcriptData.success) {
        alert(transcriptData.message);
        setLoading(false);
        return;
      }

      const aiResponse = await fetch(
        "http://localhost:5000/api/generate-study-kit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: transcriptData.transcript }),
        }
      );

      const aiData = await aiResponse.json();

      if (!aiData.success) {
        alert(aiData.error || "Failed to generate study kit.");
        setLoading(false);
        return;
      }

      let result;
      try {
        let cleanText = aiData.studyKit.trim();
        cleanText = cleanText.replace(/^```json\s*/i, "");
        cleanText = cleanText.replace(/^```\s*/i, "");
        cleanText = cleanText.replace(/\s*```$/i, "");
        result = JSON.parse(cleanText);
      } catch (error) {
        result = {
          summary: aiData.studyKit,
          flashcards: [],
          quiz: [],
        };
      }

      setStudyKit(result);
      setLoading(false);
    } catch (error) {
      alert("Could not connect to Lectra backend.");
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (studyKit?.flashcards && currentCard < studyKit.flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const previousCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const selectAnswer = (questionIndex, option) => {
    if (quizSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
  };

  const submitQuiz = () => {
    let finalScore = 0;
    studyKit?.quiz?.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) finalScore++;
    });
    setScore(finalScore);
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(0);
  };

  return (
    <div className="app antialiased relative overflow-hidden">
      {/* Background Floating Antigravity Particles */}
      <div className="antigravity-layer" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {floatingParticles.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(168,85,247,0.05) 100%)',
              filter: 'blur(4px)',
            }}
            animate={{
              y: ['0px', '-80px', '0px'],
              x: [`0px`, `${p.xOffset}px`, '0px'],
              scale: [1, 1.25, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className="navbar" style={{ position: 'relative', zIndex: 10 }}>
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
      <section className="hero" id="home" style={{ position: 'relative', zIndex: 10 }}>
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="badge"
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            ✨ AI-Powered Learning
          </motion.div>

          <h1>
            Turn Your <span>Lectures</span>
            <br />
            Into Smart Revision
          </h1>

          <p>
            Transform educational YouTube lectures into concise summaries,
            interactive flashcards, and quizzes using AI.
          </p>

          {/* Antigravity Hover Input Container */}
          <motion.div
            className="input-container"
            whileHover={{ y: -4, boxShadow: "0px 12px 30px rgba(99, 102, 241, 0.2)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <input
              type="text"
              placeholder="Paste your YouTube lecture URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <motion.button
              onClick={handleGenerate}
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Generating..." : "Generate Study Kit"}
            </motion.button>
          </motion.div>

          <p className="input-note">
            📺 Enter a YouTube educational lecture to get started
          </p>
        </motion.div>
      </section>

      {/* Loading */}
      {loading && (
        <motion.section
          className="results loading-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ position: 'relative', zIndex: 10 }}
        >
          <h2>🤖 Lectra is preparing your study kit...</h2>
          <p>Fetching the lecture transcript and generating revision materials using AI.</p>
        </motion.section>
      )}

      {/* Study Kit Results */}
      <AnimatePresence>
        {studyKit && !loading && (
          <motion.section
            className="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            style={{ position: 'relative', zIndex: 10 }}
          >
            {/* Summary */}
            <div className="result-card">
              <h2>📝 Lecture Summary</h2>
              <p>{studyKit.summary}</p>
            </div>

            {/* Flashcards */}
            <div className="result-card">
              <h2>🃏 AI Flashcards</h2>
              {studyKit.flashcards?.length > 0 ? (
                <div className="flashcard-section">
                  <div className="flashcard-counter">
                    Card {currentCard + 1} of {studyKit.flashcards.length}
                  </div>

                  <motion.div
                    key={currentCard}
                    className="interactive-flashcard"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3>{studyKit.flashcards[currentCard].question}</h3>

                    {showAnswer && (
                      <div className="flashcard-answer">
                        <strong>Answer:</strong>
                        <p>{studyKit.flashcards[currentCard].answer}</p>
                      </div>
                    )}

                    <motion.button
                      className="answer-button"
                      onClick={() => setShowAnswer(!showAnswer)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showAnswer ? "Hide Answer" : "Show Answer"}
                    </motion.button>
                  </motion.div>

                  <div className="flashcard-navigation">
                    <button onClick={previousCard} disabled={currentCard === 0}>
                      ⬅ Previous
                    </button>
                    <button
                      onClick={nextCard}
                      disabled={currentCard === studyKit.flashcards.length - 1}
                    >
                      Next ➡
                    </button>
                  </div>
                </div>
              ) : (
                <p>No flashcards were generated.</p>
              )}
            </div>

            {/* Quiz */}
            <div className="result-card">
              <h2>❓ AI Quiz</h2>
              {studyKit.quiz?.map((question, index) => (
                <div className="quiz-card" key={index}>
                  <h3>
                    {index + 1}. {question.question}
                  </h3>
                  <div className="quiz-options">
                    {question.options?.map((option, optionIndex) => {
                      const isSelected = selectedAnswers[index] === option;
                      const isCorrect = quizSubmitted && option === question.answer;
                      const isWrong = quizSubmitted && isSelected && option !== question.answer;

                      return (
                        <motion.button
                          key={optionIndex}
                          whileHover={!quizSubmitted ? { scale: 1.01 } : {}}
                          whileTap={!quizSubmitted ? { scale: 0.99 } : {}}
                          className={`quiz-option
                            ${isSelected ? "selected" : ""}
                            ${isCorrect ? "correct" : ""}
                            ${isWrong ? "wrong" : ""}
                          `}
                          onClick={() => selectAnswer(index, option)}
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </motion.button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <p className="correct-answer">
                      <strong>Correct Answer:</strong> {question.answer}
                    </p>
                  )}
                </div>
              ))}

              {studyKit.quiz?.length > 0 && (
                <div className="quiz-controls">
                  {!quizSubmitted ? (
                    <button className="submit-quiz" onClick={submitQuiz}>
                      Submit Quiz
                    </button>
                  ) : (
                    <div className="quiz-result">
                      <h3>🏆 Your Score</h3>
                      <div className="score">
                        {score} / {studyKit.quiz.length}
                      </div>
                      <p>
                        {score === studyKit.quiz.length
                          ? "🎉 Perfect score! Excellent work!"
                          : score >= studyKit.quiz.length / 2
                          ? "👏 Good job! Keep revising!"
                          : "📚 Keep practicing and try again!"}
                      </p>
                      <button className="try-again" onClick={resetQuiz}>
                        🔄 Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Features */}
      <section className="features" id="features" style={{ position: 'relative', zIndex: 10 }}>
        <h2>Everything You Need for Better Revision</h2>
        <div className="feature-container">
          <motion.div className="feature-card" whileHover={{ y: -6 }}>
            <div className="feature-icon">📝</div>
            <h3>Smart Summary</h3>
            <p>Get concise summaries highlighting the important concepts from your lecture.</p>
          </motion.div>

          <motion.div className="feature-card" whileHover={{ y: -6 }}>
            <div className="feature-icon">🃏</div>
            <h3>AI Flashcards</h3>
            <p>Revise important concepts using automatically generated question-and-answer flashcards.</p>
          </motion.div>

          <motion.div className="feature-card" whileHover={{ y: -6 }}>
            <div className="feature-icon">❓</div>
            <h3>Interactive Quizzes</h3>
            <p>Test your understanding with AI-generated quiz questions based on the lecture.</p>
          </motion.div>
        </div>
      </section>

      {/* Background Floating Antigravity Particles */}
<div className="antigravity-layer">
  {floatingParticles.map((p) => (
    <motion.div
      key={p.id}
      style={{
        position: 'absolute',
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: `${p.size}px`,
        height: `${p.size}px`,
        borderRadius: '50%',
        /* High visibility vibrant gradient */
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(168, 85, 247, 0.2) 100%)',
        boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)',
        filter: 'blur(1px)',
      }}
      animate={{
        y: [0, -100, 0],
        x: [0, p.xOffset, 0],
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        duration: p.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: p.delay,
      }}
    />
  ))}
</div>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10 }}>
        <p>Lectra — AI-Powered Lecture-to-Revision Platform</p>
      </footer>
    </div>
  );
}

export default App;