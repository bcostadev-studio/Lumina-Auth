/**
 * Token Utilities
 * Handles JWT token generation, verification, and management
 */

import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { JWTPayload, TokenPair } from '../@types/auth/Auth';
import config from '../config/config';

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
  };

  const options: SignOptions = {
    expiresIn: config.jwt.accessTokenExpiry,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, config.jwt.secret, options);
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
  };

  const options: SignOptions = {
    expiresIn: config.jwt.refreshTokenExpiry,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, config.jwt.secret, options);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(userId: string, email: string): TokenPair {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email),
  };
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const options: VerifyOptions = {
      algorithms: ['HS256'],
    };
    const decoded = jwt.verify(token, config.jwt.secret, options) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decode token without verification (useful for getting exp claim)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload | null;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  return decoded.exp * 1000 < Date.now();
}
