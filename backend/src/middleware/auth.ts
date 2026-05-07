import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/User";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Missing Authorization header", 401);
  }

  const token = header.slice("Bearer ".length).trim();
  const payload = verifyAccessToken(token);

  const user = await User.findById(payload.userId).lean();
  if (!user) throw new AppError("Unauthorized", 401);

  req.user = { userId: user._id.toString(), email: user.email };
  next();
});
