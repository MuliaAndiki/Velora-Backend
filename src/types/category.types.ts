export interface CreateCategoryDto {
  name: string;
  color: string;
  icon: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
  icon?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}
