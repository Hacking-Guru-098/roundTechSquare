import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { User } from "../models/User";
import { signAccessToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";
import { ok } from "../utils/apiResponse";
import { requireEmail, requireString } from "../utils/validate";

export const signup = asyncHandler(async (req, res) => {
  const name = requireString("name", (req.body as { name?: unknown }).name, { min: 2, max: 60 });
  const email = requireEmail("email", (req.body as { email?: unknown }).email);
  const password = requireString("password", (req.body as { password?: unknown }).password, { min: 6, max: 72, trim: false });

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new AppError("Validation error", 409, { email: "Email already in use" });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, password: passwordHash });

  const token = signAccessToken({ userId: user._id.toString(), email: user.email });

  res.status(201).json(
    ok({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email }
    })
  );
});

export const login = asyncHandler(async (req, res) => {
  const email = requireEmail("email", (req.body as { email?: unknown }).email);
  const password = requireString("password", (req.body as { password?: unknown }).password, { min: 1, max: 72, trim: false });

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordOk = await comparePassword(password, user.password);
  if (!passwordOk) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signAccessToken({ userId: user._id.toString(), email: user.email });
  res.status(200).json(
    ok({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email }
    })
  );
});
