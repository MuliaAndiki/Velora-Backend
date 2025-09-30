import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  amount: number;
  categoryId: Schema.Types.ObjectId;
  description: string;
  date: Date;
  receiptUrl?: string;
  type: "income" | "expense";
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    receiptUrl: { type: String },
    type: { type: String, enum: ["income", "expense"], required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
