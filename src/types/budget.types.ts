export interface CreateBudgetDto {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetDto {
  categoryId?: string;
  amount?: number;
  month?: number;
  year?: number;
  used?: number;
}
