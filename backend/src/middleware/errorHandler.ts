import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import type { ApiErrorResponse } from "../utils/apiResponse";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const normalized = normalizeError(err);
  const body: ApiErrorResponse & { stack?: string } = {
    success: false,
    message: normalized.message,
    errors: normalized.errors
  };

  if (process.env.NODE_ENV === "development") {
    body.stack = (err as { stack?: string } | undefined)?.stack;
  }

  res.status(normalized.statusCode).json(body);
};

function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof mongoose.Error.CastError) {
    const field = err.path || "id";
    return new AppError("Validation error", 400, { [field]: "Invalid format" });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string> = {};
    for (const key of Object.keys(err.errors)) {
      const e = err.errors[key];
      errors[key] = typeof e?.message === "string" ? e.message : "Invalid value";
    }
    return new AppError("Validation error", 400, errors);
  }

  // Mongo duplicate key error
  const anyErr = err as { code?: number; keyValue?: Record<string, unknown> };
  if (anyErr?.code === 11000) {
    const field = anyErr.keyValue ? Object.keys(anyErr.keyValue)[0] : "field";
    return new AppError(`${field} already exists`, 409);
  }

  return new AppError("Internal Server Error", 500);
}
