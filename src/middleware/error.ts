import { NextFunction, Request, Response } from 'express';
import { error as errorResponse } from '../utils/response';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err);
  const status = err?.status || 500;
  const message = err?.message || 'Internal server error';
  const errors = Array.isArray(err?.errors) ? err.errors : null;
  errorResponse(res, errors, message, status);
}
