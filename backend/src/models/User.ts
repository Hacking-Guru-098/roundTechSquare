import { Schema, model } from "mongoose";

export interface UserDoc {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }
  },
  { timestamps: true }
);

export const User = model<UserDoc>("User", userSchema);

