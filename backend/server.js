const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.join(__dirname, ".env"),
});
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const { GoogleGenAI } = require("@google/genai");
const { fetchTranscript } = require("youtube-transcript");

console.log("MongoDB URI loaded:", !!process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });



const app = express();

app.use(cors());
app.use(express.json());

//signup route
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "Account created successfully!",
      name: user.name,
    });
  } catch (error) {
    console.error("Signup error:", error.message);

    res.status(500).json({
      message: "Server error during signup.",
    });
  }
});



app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    res.status(200).json({
      message: "Login successful!",
      name: user.name,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error during login.",
    });
  }
});





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
            model: "gemini-3.6-flash",
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