import { Schema } from 'mongoose';

export interface CreateTransactionDto {
  amount: number;
  categoryId: string; // as string in DTO
  description: string;
  date: string; // ISO
  type: 'income' | 'expense';
}

export interface UpdateTransactionDto {
  amount?: number;
  categoryId?: string;
  description?: string;
  date?: string;
  type?: 'income' | 'expense';
  receiptUrl?: string;
}

export interface FilterTransactionDto {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  keyword?: string;
  type?: 'income' | 'expense';
}
