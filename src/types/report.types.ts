import { ReportType } from "@prisma/client";

export interface FinancialReport {
  id: string;
  title: string;
  type: ReportType;
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  fileUrl: string | null;
  format: string;
  userID: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PickCreateReport = Pick<
  FinancialReport,
  "title" | "type" | "startDate" | "endDate" | "format"
>;
export type PickGetID = Pick<FinancialReport, "id">;
