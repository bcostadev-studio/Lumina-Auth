/**
 * Authentication Routes Integration Tests
 * Tests for HTTP endpoints and full authentication flow
 */

import request from 'supertest';
import app from '../src/app';
import userStore from '../src/models/User';

describe('Authentication Routes - Integration Tests', () => {
  beforeEach(async () => {
    // Clear user store before each test
    await userStore.clear();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'newuser',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      // First registration
      await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'user1',
      });

      // Second registration with same email
      const response = await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'user2',
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'testuser',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should reject weak password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        username: 'testuser',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject mismatched passwords', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        username: 'testuser',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'testuser',
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should reject non-existent email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should be case-insensitive for email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'TEST@EXAMPLE.COM',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'invalid-email',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'testuser',
      });

      refreshToken = response.body.data.refreshToken;
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({
        refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('refreshed');
      expect(response.body.data?.accessToken).toBeDefined();
      expect(response.body.data?.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({
        refreshToken: 'invalid-token',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'testuser',
      });

      accessToken = response.body.data.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `InvalidFormat ${accessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'testuser',
      });

      accessToken = response.body.data.accessToken;
    });

    it('should logout with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');
    });

    it('should reject logout without token', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me (alias)', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        username: 'testuser',
      });

      accessToken = response.body.data.accessToken;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on login attempts', async () => {
      // Make multiple requests to hit rate limit
      const requests = [];
      for (let i = 0; i < 6; i++) {
        requests.push(
          request(app).post('/api/auth/login').send({
            email: 'test@example.com',
            password: 'password',
          })
        );
      }

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.success).toBe(false);
    });
  });
});
