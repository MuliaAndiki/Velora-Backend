import { Response } from 'express';

export type TResponse<T> = {
  data: T | null;
  message: string;
  code: number;
  status: 'success' | 'error';
  errors:
    | {
        field: string;
        message: string;
      }[]
    | null;
};

export type TPagedList<T> = {
  data: T[];
  totalData: number;
  totalPages: number;
};

export type TPagedListResponse<T> = TResponse<TPagedList<T>>;
export type TListResponse<T> = TResponse<T[]>;

export function success<T>(
  res: Response,
  data: T,
  message = 'OK',
  code = 200
): Response<TResponse<T>> {
  return res.status(code).json({
    data,
    message,
    code,
    status: 'success',
    errors: null,
  });
}

export function error(
  res: Response,
  errors: { field: string; message: string }[] | null,
  message = 'Error',
  code = 500
): Response<TResponse<null>> {
  return res.status(code).json({
    data: null,
    message,
    code,
    status: 'error',
    errors: errors ?? null,
  });
}

export function paged<T>(
  res: Response,
  items: T[],
  totalData: number,
  totalPages: number,
  message = 'OK',
  code = 200
): Response<TPagedListResponse<T>> {
  const inner: TPagedList<T> = {
    data: items,
    totalData,
    totalPages,
  };
  return res.status(code).json({
    data: inner,
    message,
    code,
    status: 'success',
    errors: null,
  });
}
