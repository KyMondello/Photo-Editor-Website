// server.js
// Starts the Express server: JSON body parsing, cookies, the auth API,
// and the static front-end files.
import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./src/auth/authRoutes.js";
import imageRoutes from "./src/db/imageRoutes.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("Set JWT_SECRET (at least 32 characters) in .env before starting.");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(cookieParser());

// Slow down guessing on the routes that accept credentials.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." }
});
app.use(
  ["/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", "/api/auth/reset-password"],
  authLimiter
);

app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);

// Pages use paths like ../src/UI/..., change to /src/UI/... from /login.html.
// Only the browser-side folders are served; src/auth stays private.
app.use("/src/UI", express.static(path.join(__dirname, "src/UI")));
app.use("/src/db", express.static(path.join(__dirname, "src/db")));
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
