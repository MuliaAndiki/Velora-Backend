import { TransactionType } from "@/partial";

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  receiptUrl: string;
  type: TransactionType;
  categoryID: string;
  userID: string;
}

export type PickCreateTransaction = Pick<
  Transaction,
  "amount" | "date" | "description" | "receiptUrl" | "type"
>;

export type PickIdCategory = Pick<Transaction, "categoryID">;
export type PickID = Pick<Transaction, "id">;
