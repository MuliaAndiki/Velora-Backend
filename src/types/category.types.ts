export interface Category {
  id: string;
  name: string;
  avaUrl: string;
  userID: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PayloadCategory = Pick<Category, "id" | "name" | "userID">;
export type PickCreateCategory = Pick<Category, "name" | "avaUrl">;
export type PickGetID = Pick<Category, "id">;
