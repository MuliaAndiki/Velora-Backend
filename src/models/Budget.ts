import mongoose, { Document, Types, Schema } from "mongoose";

export interface IBudget extends Document {
  categoryId: Schema.Types.ObjectId;
  amount: number;
  month: number;
  year: number;
  used: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    used: { type: Number, default: 0 },
    userId: { type: Types.ObjectId, ref: "Auth", required: true },
  },
  { timestamps: true }
);

export const Budget = mongoose.model<IBudget>("Budget", budgetSchema);
