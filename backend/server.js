const express = require("express");
const cors = require("cors");
const { fetchTranscript } = require("youtube-transcript");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Lectra backend is running!"
    });
});

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

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Lectra backend running on http://localhost:${PORT}`);
});