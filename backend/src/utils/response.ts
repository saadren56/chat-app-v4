import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/api';

export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    meta: {
      timestamp: Date.now(),
    },
  };
}

export function createErrorResponse(
  error: string,
  code?: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error,
    code,
    meta: {
      timestamp: Date.now(),
    },
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): ApiResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    success: true,
    data: {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    },
    meta: {
      timestamp: Date.now(),
    },
  };
}

export function sendSuccessResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json(createSuccessResponse(data, message));
}

export function sendErrorResponse(
  res: Response,
  error: string,
  statusCode: number = 500,
  code?: string
): Response {
  return res.status(statusCode).json(createErrorResponse(error, code));
}

export function sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json(createPaginatedResponse(data, page, limit, total));
}
