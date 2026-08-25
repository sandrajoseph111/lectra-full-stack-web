const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Lectra backend is running!"
    });
});

// Test API for lecture URL
app.post("/api/generate", (req, res) => {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
        return res.status(400).json({
            success: false,
            message: "YouTube URL is required"
        });
    }

    console.log("Received YouTube URL:", youtubeUrl);

    res.json({
        success: true,
        message: "Lecture URL received successfully!",
        youtubeUrl: youtubeUrl
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Lectra backend running on http://localhost:${PORT}`);
});