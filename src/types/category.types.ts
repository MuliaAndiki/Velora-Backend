export interface Category {
  id: string;
  name: string;
  userID: string;
}

export type PayloadCategory = Pick<Category, "id" | "name" | "userID">;
export type PickCreateCategory = Pick<Category, "name">;
export type PickGetCategory = Pick<Category, "id">;
