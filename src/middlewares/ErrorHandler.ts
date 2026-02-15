import { Request, Response, NextFunction } from 'express';
import { i18n } from '../i18n/i18n';

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Global error handler middleware
 * Processes all errors and returns consistent error responses
 * Should be the last middleware registered in the app
 */
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  // Log error for debugging (in production, use proper logging service)
  console.error({
    timestamp: new Date().toISOString(),
    status: err.status || err.statusCode || 500,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const statusCode = err.status || err.statusCode || 500;

  // Ensure we don't expose sensitive error details in production
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? i18n.__('errors.internal_server_error')
      : err.message || i18n.__('errors.internal_server_error');

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
