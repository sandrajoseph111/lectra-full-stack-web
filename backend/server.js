const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const { fetchTranscript } = require("youtube-transcript");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});


// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Lectra backend is running!"
    });
});


// Get YouTube transcript
app.post("/api/generate", async (req, res) => {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
        return res.status(400).json({
            success: false,
            message: "YouTube URL is required"
        });
    }

    try {
        console.log("Fetching transcript...");

        const transcript = await fetchTranscript(youtubeUrl);

        const text = transcript
            .map(item => item.text)
            .join(" ");

        console.log("Transcript received successfully.");

        res.json({
            success: true,
            message: "Transcript extracted successfully!",
            transcript: text
        });

    } catch (error) {
        console.error("Transcript error:", error);

        res.status(500).json({
            success: false,
            message: "Could not extract transcript from this video."
        });
    }
});


// Generate AI Study Kit
app.post("/api/generate-study-kit", async (req, res) => {
    try {
        const { transcript } = req.body;

        if (!transcript) {
            return res.status(400).json({
                error: "Transcript is required"
            });
        }

        const prompt = `
You are an educational AI assistant.

Analyze the following lecture transcript and create a study kit.

Return ONLY valid JSON in this exact structure:

{
  "summary": "A concise summary of the lecture",
  "flashcards": [
    {
      "question": "Question",
      "answer": "Answer"
    }
  ],
  "quiz": [
    {
      "question": "Multiple choice question",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct answer"
    }
  ]
}

Create:
- A clear summary
- 5 useful flashcards
- 5 multiple-choice quiz questions

Lecture transcript:
${transcript}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text;

        res.json({
            success: true,
            studyKit: text
        });

    } catch (error) {
        console.error("Gemini error:", error);

        res.status(500).json({
            error: "Failed to generate study kit"
        });
    }
});


const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Lectra backend running on http://localhost:${PORT}`);
});