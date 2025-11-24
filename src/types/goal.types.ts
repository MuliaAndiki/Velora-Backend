import { GoalType } from "@/partial";

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  status: GoalType;
  startAt: Date;
  endAt: Date;
  UserID: string;
  WalletID: string;
}
export type JwtGoal = Pick<
  Goal,
  "id" | "name" | "endAt" | "savedAmount" | "targetAmount" | "startAt"
>;

export type PickCreateGoal = Pick<
  Goal,
  | "name"
  | "endAt"
  | "savedAmount"
  | "targetAmount"
  | "startAt"
  | "status"
  | "WalletID"
>;
export type PickGetID = Pick<Goal, "id">;

export type PickInsertGoal = Pick<Goal, "savedAmount" | "WalletID" | "id">;
export type PickWalletIDGoal = Pick<Goal, "WalletID">;
