/**
 * Authentication Routes
 * RESTful endpoints for user authentication
 */

import { Router } from 'express';
import authController from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { authLimiter } from '../middlewares/RateLimiter';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Rate limited to prevent abuse
 */
router.post('/register', authLimiter, async (req, res, next) => {
  await authController.register(req, res, next);
});

/**
 * POST /api/auth/login
 * Login user with email and password
 * Rate limited to prevent brute force attacks
 */
router.post('/login', authLimiter, async (req, res, next) => {
  await authController.login(req, res, next);
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Rate limited to prevent token abuse
 */
router.post('/refresh', authLimiter, async (req, res, next) => {
  await authController.refreshToken(req, res, next);
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal in JWT systems)
 * Requires authentication
 * Rate limited to prevent abuse
 */
router.post('/logout', authLimiter, authMiddleware, async (req, res, next) => {
  await authController.logout(req, res, next);
});

/**
 * GET /api/auth/profile
 * Get current user profile
 * Requires authentication
 * Rate limited to prevent abuse
 */
router.get('/profile', authLimiter, authMiddleware, async (req, res, next) => {
  await authController.getProfile(req, res, next);
});

/**
 * GET /api/auth/me
 * Alias for /profile - get current user
 * Requires authentication
 * Rate limited to prevent abuse
 */
router.get('/me', authLimiter, authMiddleware, async (req, res, next) => {
  await authController.getProfile(req, res, next);
});

export { router as AuthRoutes };
