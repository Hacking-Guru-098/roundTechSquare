import { AppError } from "./AppError";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function requireString(field: string, value: unknown, opts?: { min?: number; max?: number; trim?: boolean }) {
  if (typeof value !== "string") throw new AppError("Validation error", 400, { [field]: `${field} is required` });
  const v = opts?.trim === false ? value : value.trim();
  if (v.length === 0) throw new AppError("Validation error", 400, { [field]: `${field} is required` });
  if (opts?.min !== undefined && v.length < opts.min) {
    throw new AppError("Validation error", 400, { [field]: `${field} must be at least ${opts.min} characters` });
  }
  if (opts?.max !== undefined && v.length > opts.max) {
    throw new AppError("Validation error", 400, { [field]: `${field} must be at most ${opts.max} characters` });
  }
  return v;
}

export function optionalString(field: string, value: unknown, opts?: { max?: number; trim?: boolean }) {
  if (value === undefined) return undefined;
  if (value === null) return undefined;
  if (typeof value !== "string") throw new AppError("Validation error", 400, { [field]: `${field} must be a string` });
  const v = opts?.trim === false ? value : value.trim();
  if (v.length === 0) return undefined;
  if (opts?.max !== undefined && v.length > opts.max) {
    throw new AppError("Validation error", 400, { [field]: `${field} must be at most ${opts.max} characters` });
  }
  return v;
}

export function requireEmail(field: string, value: unknown) {
  const email = requireString(field, value, { max: 254 }).toLowerCase();
  if (!EMAIL_RE.test(email)) throw new AppError("Validation error", 400, { [field]: "Enter a valid email" });
  return email;
}

export function requireBoolean(field: string, value: unknown) {
  if (typeof value !== "boolean") throw new AppError("Validation error", 400, { [field]: `${field} must be a boolean` });
  return value;
}

