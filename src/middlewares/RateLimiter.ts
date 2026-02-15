/**
 * Rate Limiter Middleware
 * Protects authentication endpoints from brute force attacks
 */

import rateLimit from 'express-rate-limit';
import config from '../config/config';
import { i18n } from '../i18n/i18n';

/**
 * General rate limiter for all API requests
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: i18n.__('errors.too_many_requests'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: i18n.__('errors.too_many_requests_ip'),
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: i18n.__('errors.too_many_auth_attempts'),
  skipSuccessfulRequests: false, // Count all requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: i18n.__('errors.too_many_auth_attempts_detailed'),
    });
  },
});

/**
 * Strict limiter for password reset/sensitive operations
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: i18n.__('errors.too_many_attempts_sensitive'),
    });
  },
});
