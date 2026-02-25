/**
 * Authentication Service Tests
 * Unit tests for authentication business logic
 */

import authService from '../src/services/AuthService';
import userStore from '../src/models/User';
import { validateRegister, validateLogin, validateRefreshToken } from '../src/utils/validation';

describe('AuthService', () => {
  beforeEach(async () => {
    // Clear user store before each test
    await userStore.clear();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const result = await authService.register('test@example.com', 'SecurePass123!', 'testuser');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.username).toBe('testuser');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      await authService.register('test@example.com', 'SecurePass123!', 'testuser');

      try {
        await authService.register('test@example.com', 'AnotherPass123!', 'testuser2');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.statusCode).toBe(409);
        expect(error.message).toContain('Email already registered');
      }
    });

    it('should normalize email to lowercase', async () => {
      const result = await authService.register('Test@EXAMPLE.COM', 'SecurePass123!', 'testuser');

      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register('test@example.com', 'SecurePass123!', 'testuser');
    });

    it('should successfully login with correct credentials', async () => {
      const result = await authService.login('test@example.com', 'SecurePass123!');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with wrong password', async () => {
      try {
        await authService.login('test@example.com', 'WrongPassword123!');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('Invalid email or password');
      }
    });

    it('should throw error with non-existent email', async () => {
      try {
        await authService.login('nonexistent@example.com', 'SecurePass123!');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('Invalid email or password');
      }
    });

    it('should normalize email to lowercase on login', async () => {
      const result = await authService.login('Test@EXAMPLE.COM', 'SecurePass123!');

      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('refreshToken', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const result = await authService.register('test@example.com', 'SecurePass123!', 'testuser');
      refreshToken = result.refreshToken;
    });

    it('should generate new tokens with valid refresh token', async () => {
      const result = await authService.refreshToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.accessToken).not.toBe(refreshToken);
    });

    it('should throw error with invalid refresh token', async () => {
      try {
        await authService.refreshToken('invalid-token');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('Invalid or expired');
      }
    });
  });

  describe('getUserProfile', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await authService.register('test@example.com', 'SecurePass123!', 'testuser');
      userId = result.user.id;
    });

    it('should retrieve user profile without password', async () => {
      const profile = await authService.getUserProfile(userId);

      expect(profile).toBeDefined();
      expect(profile?.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', async () => {
      const profile = await authService.getUserProfile('non-existent-id');

      expect(profile).toBeNull();
    });
  });
});

/**
 * Input Validation Tests
 */
describe('Input Validation', () => {
  describe('validateRegister', () => {
    it('should accept valid registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'testuser',
      };

      const result = validateRegister(data);

      expect(result.error).toBeUndefined();
      expect(result.value).toBeDefined();
      expect(result.value?.email).toBe('test@example.com');
    });

    it('should reject mismatched passwords', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        username: 'testuser',
      };

      const result = validateRegister(data);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Passwords do not match');
    });

    it('should reject weak passwords', () => {
      const data = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        username: 'testuser',
      };

      const result = validateRegister(data);

      expect(result.error).toBeDefined();
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'testuser',
      };

      const result = validateRegister(data);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Email');
    });

    it('should reject short username', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'ab',
      };

      const result = validateRegister(data);

      expect(result.error).toBeDefined();
    });
  });

  describe('validateLogin', () => {
    it('should accept valid login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const result = validateLogin(data);

      expect(result.error).toBeUndefined();
      expect(result.value).toBeDefined();
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'SecurePass123!',
      };

      const result = validateLogin(data);

      expect(result.error).toBeDefined();
    });

    it('should reject missing password', () => {
      const data = {
        email: 'test@example.com',
      };

      const result = validateLogin(data);

      expect(result.error).toBeDefined();
    });
  });

  describe('validateRefreshToken', () => {
    it('should accept valid refresh token request', () => {
      const data = {
        refreshToken: 'valid-token-string',
      };

      const result = validateRefreshToken(data);

      expect(result.error).toBeUndefined();
      expect(result.value).toBeDefined();
    });

    it('should reject missing refresh token', () => {
      const data = {};

      const result = validateRefreshToken(data);

      expect(result.error).toBeDefined();
    });
  });
});
