/**
 * Authentication Service
 * Business logic for authentication operations
 */

import userStore from '../models/User';
import { generateTokenPair, verifyToken } from '../utils/tokenUtils';
import { User } from '../@types/auth/Auth';
import { i18n } from '../i18n/i18n';

/**
 * Service class for authentication operations
 * Separates business logic from HTTP handling
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    username: string
  ): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> {
    try {
      // Create user (will throw if email exists)
      const user = await userStore.create(email, password, username);

      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair(user.id, user.email);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        message: i18n.__('errors.registration_failed'),
      };
    }
  }

  /**
   * Login user with email and password
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> {
    try {
      // Find user by email
      const user = await userStore.findByEmail(email);
      if (!user) {
        throw {
          statusCode: 401,
          message: i18n.__('errors.invalid_credentials'),
        };
      }

      // Verify password
      const isPasswordValid = await userStore.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw {
          statusCode: 401,
          message: i18n.__('errors.invalid_credentials'),
        };
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair(user.id, user.email);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        message: i18n.__('errors.login_failed'),
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = verifyToken(refreshToken);
      if (!decoded) {
        throw {
          statusCode: 401,
          message: i18n.__('errors.invalid_refresh_token'),
        };
      }

      // Verify user still exists
      const user = await userStore.findById(decoded.userId);
      if (!user) {
        throw {
          statusCode: 401,
          message: i18n.__('errors.user_not_found'),
        };
      }

      // Generate new token pair
      const tokens = generateTokenPair(user.id, user.email);

      return tokens;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 401,
        message: i18n.__('errors.token_refresh_failed'),
      };
    }
  }

  /**
   * Validate access token
   * Returns user data if valid, null if invalid
   */
  async validateAccessToken(token: string): Promise<{ userId: string; email: string } | null> {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Optionally verify user still exists
    const user = await userStore.findById(decoded.userId);
    if (!user) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await userStore.findById(userId);
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// Export singleton instance
export const authService = new AuthService();

export default authService;
