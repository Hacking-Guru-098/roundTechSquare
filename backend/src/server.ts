import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";

import { env } from "./config/env";
import { connectDB } from "./config/db";
import { authRoutes } from "./routes/authRoutes";
import { taskRoutes } from "./routes/taskRoutes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${env.PORT}`);
  });
}

void start();
