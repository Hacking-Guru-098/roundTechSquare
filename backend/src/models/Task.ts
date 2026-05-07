import { Schema, model, Types } from "mongoose";

export interface TaskDoc {
  title: string;
  description?: string;
  completed: boolean;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    completed: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

export const Task = model<TaskDoc>("Task", taskSchema);

