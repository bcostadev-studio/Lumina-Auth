/**
 * Authentication Types and Interfaces
 * Provides type safety for authentication-related operations
 */

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthError extends Error {
  statusCode: number;
  message: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
