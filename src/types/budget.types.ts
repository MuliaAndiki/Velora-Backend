import { BudgetPeriod, BudgetStatus } from "@prisma/client";

export interface Budget {
  id: string;
  name: string;
  categoryID: string;
  limit: number;
  spent: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date | null;
  status: BudgetStatus;
  userID: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PickCreateBudget = Pick<
  Budget,
  "name" | "categoryID" | "limit" | "period" | "startDate" | "endDate"
>;
export type PickUpdateBudget = Pick<
  Budget,
  "name" | "limit" | "spent" | "status"
>;
export type PickGetID = Pick<Budget, "id">;
