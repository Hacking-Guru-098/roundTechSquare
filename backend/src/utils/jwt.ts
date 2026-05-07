import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./AppError";

type AccessTokenPayload = {
  userId: string;
  email: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  const secret: Secret = env.JWT_SECRET;
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}
