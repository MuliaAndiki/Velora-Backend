import { TransactionType } from "@prisma/client";

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  receiptUrl: string;
  type: TransactionType;
  categoryID: string;
  userID: string;
  walletID: string;
}

export type PickCreateTransaction = Pick<
  Transaction,
  "amount" | "description" | "receiptUrl" | "type" | "walletID"
>;

export type PickIdCategory = Pick<Transaction, "categoryID">;
export type PickID = Pick<Transaction, "id">;
