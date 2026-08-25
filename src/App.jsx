import { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");

  const handleGenerate = async () => {
    if (!url.trim()) {
        alert("Please enter a YouTube lecture link.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                youtubeUrl: url
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            console.log("Backend response:", data);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Could not connect to Lectra backend.");
    }
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

            <button onClick={handleGenerate}>
              Generate Study Kit
            </button>
          </div>

          <p className="input-note">
            📺 Enter a YouTube educational lecture to get started
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <h2>Everything You Need for Better Revision</h2>

        <div className="feature-container">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Smart Summary</h3>
            <p>
              Get concise summaries highlighting the important concepts
              from your lecture.
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
              Test your understanding with AI-generated quiz questions
              based on the lecture.
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