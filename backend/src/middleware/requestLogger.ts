import { Request, Response, NextFunction } from 'express';
import { env } from '../config';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
  }
  next();
}
