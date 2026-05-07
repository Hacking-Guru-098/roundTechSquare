import { Types } from "mongoose";
import { Task } from "../models/Task";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { ok } from "../utils/apiResponse";
import { optionalString, requireBoolean, requireString } from "../utils/validate";

export const createTask = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const title = requireString("title", (req.body as { title?: unknown }).title, { min: 1, max: 120 });
  const description = optionalString("description", (req.body as { description?: unknown }).description, { max: 1000 });

  const task = await Task.create({
    title,
    description,
    user: new Types.ObjectId(userId)
  });

  res.status(201).json(ok({ task }));
});

export const getMyTasks = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
  res.status(200).json(ok({ tasks }));
});

export const updateTask = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const idParam = (req.params as { id?: string }).id;
  if (!idParam) throw new AppError("Validation error", 400, { id: "Task id is required" });
  const id = idParam;
  if (!Types.ObjectId.isValid(id)) throw new AppError("Validation error", 400, { id: "Invalid task id" });

  const body = req.body as { title?: unknown; description?: unknown; completed?: unknown };
  const hasTitle = body.title !== undefined;
  const hasDescription = body.description !== undefined;
  const hasCompleted = body.completed !== undefined;

  if (!hasTitle && !hasDescription && !hasCompleted) throw new AppError("Validation error", 400, { body: "Provide at least one field to update" });

  const title = hasTitle ? requireString("title", body.title, { min: 1, max: 120 }) : undefined;
  const description = hasDescription ? optionalString("description", body.description, { max: 1000 }) : undefined;
  const completed = hasCompleted ? requireBoolean("completed", body.completed) : undefined;

  const task = await Task.findOne({ _id: id, user: userId });
  if (!task) throw new AppError("Task not found", 404);

  if (title !== undefined) task.title = title;
  if (hasDescription) task.description = description;
  if (completed !== undefined) task.completed = completed;

  await task.save();
  res.status(200).json(ok({ task }));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const idParam = (req.params as { id?: string }).id;
  if (!idParam) throw new AppError("Validation error", 400, { id: "Task id is required" });
  const id = idParam;
  if (!Types.ObjectId.isValid(id)) throw new AppError("Validation error", 400, { id: "Invalid task id" });
  const task = await Task.findOneAndDelete({ _id: id, user: userId });
  if (!task) throw new AppError("Task not found", 404);

  res.status(204).send();
});
