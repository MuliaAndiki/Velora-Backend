import mongoose, { Document, Schema } from "mongoose";

export interface IGoal extends Document {
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: Date;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema(
  {
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
  },
  { timestamps: true }
);

export const Goal = mongoose.model<IGoal>("Goal", goalSchema);
