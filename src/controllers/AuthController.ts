/**
 * Authentication Controller
 * Handles HTTP requests and responses for authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import authService from '../services/AuthService';
import { validateRegister, validateLogin, validateRefreshToken } from '../utils/validation';
import { AuthResponse } from '../@types/auth/Auth';
import { i18n } from '../i18n/i18n';
import passport from 'passport';
import { generateTokenPair } from '../utils/tokenUtils';

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
    const { error: validationError } = validateLogin(req.body);
    if (validationError) {
      res.status(400).json({ success: false, message: validationError });
      return;
    }

    // 2. Delegate credential verification to Passport's local strategy
    passport.authenticate(
      'local',
      { session: false },
      async (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next({
            status: 500,
            message: err.message || i18n.__('errors.login_failed'),
          });
        }

        // Authentication failed (bad credentials)
        if (!user) {
          return res.status(401).json({
            success: false,
            message: info?.message || i18n.__('errors.invalid_credentials'),
          });
        }

        // 3. Authentication succeeded — issue tokens
        const { accessToken, refreshToken } = generateTokenPair(user.userId, user.email);

        // Fetch full profile for the response body (sans password)
        const profile = await authService.getUserProfile(user.userId);

        const response: AuthResponse = {
          success: true,
          message: i18n.__('success.login_successful'),
          data: {
            user: profile!,
            accessToken,
            refreshToken,
          },
        };

        return res.status(200).json(response);
      }
    )(req, res, next);
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

      res.status(200).json({
        success: true,
        message: i18n.__('success.token_refreshed'),
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
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

      const user = await authService.getUserProfile(req.user.userId);

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
