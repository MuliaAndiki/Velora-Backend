import { CategoryType } from "@prisma/client";

export interface Category {
  id: string;
  name: string;
  avaUrl: string;
  type: CategoryType;
  userID: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PayloadCategory = Pick<Category, "id" | "name" | "userID">;
export type PickCreateCategory = Pick<Category, "name" | "avaUrl" | "type">;
export type PickGetID = Pick<Category, "id">;
