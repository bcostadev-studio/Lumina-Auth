/**
 * Authentication Middleware
 * JWT verification and route protection
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/tokenUtils';
import { i18n } from '../i18n/i18n';
import { JWTPayload } from '../@types/auth/Auth';

function validateAndExtractJWT(authHeader: string | string[] | undefined): JWTPayload | null {
  if (authHeader === undefined) return null;
  if (typeof authHeader !== 'string') return null;
  if (authHeader.length === 0) return null;

  const bearerPrefix = 'Bearer ';
  const hasBearerPrefix = authHeader.substring(0, bearerPrefix.length) === bearerPrefix;
  if (!hasBearerPrefix) return null;

  const tokenPart = authHeader.substring(bearerPrefix.length);
  if (tokenPart.length === 0) return null;

  const decoded = verifyToken(tokenPart);
  if (decoded === null) return null;

  if (typeof decoded !== 'object') return null;
  if (!('userId' in decoded)) return null;
  if (!('email' in decoded)) return null;
  if (typeof decoded.userId !== 'string') return null;
  if (typeof decoded.email !== 'string') return null;

  return decoded;
}

/**
 * Authentication middleware - verifies JWT token
 * Attaches decoded user data to request object
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validatedPayload = validateAndExtractJWT(req.headers.authorization);

    if (validatedPayload === null) {
      res.status(401).json({
        success: false,
        message: i18n.__('errors.no_authorization_token'),
      });
      return;
    }

    req.user = validatedPayload;
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
    const validatedPayload = validateAndExtractJWT(req.headers.authorization);

    if (validatedPayload !== null) {
      req.user = validatedPayload;
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
