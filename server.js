const express = require("express");
const mongoose = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/routes");
const errorMiddleware = require("./middleware/errorMiddleware");
const connectDB = require("./config/dbConnect");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["*"], // Allow front-end origin (update for production, e.g., 'https://your-domain.com')
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Serve static front-end
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html at root
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

// API Routes
app.use("/api", routes);

// Error Handling
app.use(errorMiddleware);

// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

// Connect to MongoDB
connectDB();
