/**
 * Authentication Controller
 * Handles HTTP requests and responses for authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import authService from '../services/AuthService';
import { validateRegister, validateLogin, validateRefreshToken } from '../utils/validation';
import { AuthResponse } from '../@types/auth/Auth';
import { i18n } from '../i18n/i18n';

export class AuthController {
  /**
   * Register endpoint handler
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateRegister(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: error,
        });
        return;
      }

      const { email, password, username } = value!;

      const result = await authService.register(email, password, username);

      const response: AuthResponse = {
        success: true,
        message: i18n.__('success.user_registered'),
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };

      res.status(201).json(response);
    } catch (error: any) {
      next({
        status: error.statusCode || 500,
        message: error.message || i18n.__('errors.registration_failed'),
      });
    }
  }

  /**
   * Login endpoint handler
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateLogin(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: error,
        });
        return;
      }

      const { email, password } = value!;

      const result = await authService.login(email, password);

      const response: AuthResponse = {
        success: true,
        message: i18n.__('success.login_successful'),
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      next({
        status: error.statusCode || 500,
        message: error.message || i18n.__('errors.login_failed'),
      });
    }
  }

  /**
   * Refresh token endpoint handler
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateRefreshToken(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: error,
        });
        return;
      }

      const { refreshToken } = value!;

      const result = await authService.refreshToken(refreshToken);

      const response: AuthResponse = {
        success: true,
        message: i18n.__('success.token_refreshed'),
        data: {
          user: undefined as any, // Token refresh doesn't return user
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };

      res.status(200).json(result);
    } catch (error: any) {
      next({
        status: error.statusCode || 500,
        message: error.message || i18n.__('errors.token_refresh_failed'),
      });
    }
  }

  /**
   * Logout endpoint handler
   * In a token-based system, logout is client-side
   * This endpoint can be used for server-side token invalidation if needed
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a JWT-based system without server-side session storage,
      // logout happens client-side by removing the token.
      // If you need server-side invalidation, implement a token blacklist.

      res.status(200).json({
        success: true,
        message: i18n.__('success.logout_successful'),
      });
    } catch (error: any) {
      next({
        status: error.statusCode || 500,
        message: error.message || i18n.__('errors.logout_failed'),
      });
    }
  }

  /**
   * Get current user profile
   * Requires authentication
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: i18n.__('errors.authentication_required'),
        });
        return;
      }

      const user = authService.getUserProfile(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: i18n.__('errors.user_not_found'),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user },
      });
    } catch (error: any) {
      next({
        status: error.statusCode || 500,
        message: error.message || 'Failed to retrieve profile',
      });
    }
  }
}

export const authController = new AuthController();

export default authController;
