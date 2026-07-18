import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

// Security
app.use(helmet());

// Logging
app.use(morgan("dev"));

// CORS
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 Atlas Bank API is Running...",
    });
});

export default app;