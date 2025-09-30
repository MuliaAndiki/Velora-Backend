import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  color: string;
  icon: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model<ICategory>("Category", categorySchema);
