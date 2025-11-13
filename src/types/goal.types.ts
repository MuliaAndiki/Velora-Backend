export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  startAt: Date;
  endAt: Date;
  UserID: string;
  createdAt: Date;
  updatedAt: Date;
}
export type JwtGoal = Pick<
  Goal,
  "id" | "name" | "endAt" | "savedAmount" | "targetAmount" | "startAt"
>;

export type PickCreateGoal = Pick<
  Goal,
  "name" | "endAt" | "savedAmount" | "targetAmount" | "startAt"
>;
export type PickGetID = Pick<Goal, "id">;

export type PickInsertGoal = Pick<Goal, "savedAmount">;
