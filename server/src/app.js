import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";

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

// ==============================
// API Routes
// ==============================

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/ai", aiRoutes);

// Unknown route -> clean JSON 404 instead of Express's default HTML page
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Must be the last middleware — catches every next(error) from every route above
app.use(errorHandler);

export default app;