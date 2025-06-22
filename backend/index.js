import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import statsRoutes from "./routes/statsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Додаємо cookie-parser для роботи з httpOnly cookie
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Додаємо роздачу статичних файлів для фото проєктів
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Підключення роутів
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/projects", projectRoutes);

// Обробка помилок має бути після роутів
app.use(errorHandler);

app.use("/api/stats", statsRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err.message);
  });
