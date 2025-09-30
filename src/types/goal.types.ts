export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  savedAmount?: number;
  deadline?: string;
}

export interface UpdateGoalDto {
  name?: string;
  targetAmount?: number;
  savedAmount?: number;
  deadline?: string;
}
