/**
 * Authentication Middleware
 * JWT verification and route protection
 */

import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/tokenUtils';
import { JWTPayload } from '../@types/auth/Auth';
import { i18n } from '../i18n/i18n';

/**
 * Authentication middleware - verifies JWT token
 * Attaches decoded user data to request object
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        message: i18n.__('errors.no_authorization_token'),
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: i18n.__('errors.invalid_token'),
      });
      return;
    }

    // Attach user data to request
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: i18n.__('errors.token_verification_failed'),
    });
  }
};

/**
 * Optional authentication middleware
 * Does not fail if token is missing, but verifies if present
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Role-based access control middleware
 * Extendable for future role implementations
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: i18n.__('errors.authentication_required'),
      });
      return;
    }

    next();
  };
};
