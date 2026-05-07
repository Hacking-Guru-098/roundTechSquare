import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createTask,
  deleteTask,
  getMyTasks,
  updateTask
} from "../controllers/taskController";

export const taskRoutes = Router();

taskRoutes.use(requireAuth);

taskRoutes.post("/", createTask);
taskRoutes.get("/", getMyTasks);
taskRoutes.patch("/:id", updateTask);
taskRoutes.delete("/:id", deleteTask);
