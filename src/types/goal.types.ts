export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date;
  UserID: string;
  createdAt: Date;
  updatedAt: Date;
}
export type JwtGoal = Pick<
  Goal,
  "id" | "name" | "deadline" | "savedAmount" | "targetAmount"
>;

export type PickCreateGoal = Pick<
  Goal,
  "name" | "deadline" | "savedAmount" | "targetAmount"
>;
export type PickGetID = Pick<Goal, "id">;
