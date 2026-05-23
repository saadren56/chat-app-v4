import { Request, Response, NextFunction } from 'express';
import { ApiError, NotFoundError } from '../utils';
import { sendErrorResponse } from '../utils';
import { env } from '../config';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', error);
  }

  if (error instanceof ApiError) {
    return sendErrorResponse(res, error.message, error.statusCode, error.code);
  }

  if (env.NODE_ENV === 'production') {
    return sendErrorResponse(res, 'Internal Server Error', 500, 'INTERNAL_ERROR');
  }

  return sendErrorResponse(res, error.message, 500, 'INTERNAL_ERROR');
}

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  throw new NotFoundError(`Route ${req.method} ${req.path} not found`);
}
