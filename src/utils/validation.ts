/**
 * Validation Utilities
 * Input validation and sanitization using Joi
 */

import Joi from 'joi';
import { RegisterRequest, LoginRequest, RefreshTokenRequest } from '../@types/auth/Auth';
import { i18n } from '../i18n/i18n';

/**
 * Validation schema for user registration
 */
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': i18n.__('errors.invalid_email'),
      'any.required': i18n.__('errors.email_required'),
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/[a-z]/, 'lowercase letter')
    .pattern(/[A-Z]/, 'uppercase letter')
    .pattern(/[0-9]/, 'digit')
    .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'special character')
    .messages({
      'string.min': i18n.__('errors.password_too_short'),
      'string.max': i18n.__('errors.password_too_long'),
      'string.pattern.base': i18n.__('errors.password_requirements'),
      'any.required': i18n.__('errors.password_required'),
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': i18n.__('errors.passwords_mismatch'),
      'any.required': i18n.__('errors.confirm_password_required'),
    }),
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': i18n.__('errors.invalid_username_characters'),
      'string.min': i18n.__('errors.username_too_short'),
      'string.max': i18n.__('errors.username_too_long'),
      'any.required': i18n.__('errors.username_required'),
    }),
});

/**
 * Validation schema for user login
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': i18n.__('errors.invalid_email'),
      'any.required': i18n.__('errors.email_required'),
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': i18n.__('errors.password_required'),
    }),
});

/**
 * Validation schema for refresh token
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': i18n.__('errors.refresh_token_required'),
    }),
});

/**
 * Validate registration data
 */
export function validateRegister(data: any): { error?: string; value?: RegisterRequest } {
  const { error, value } = registerSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message).join('; ');
    return { error: messages };
  }

  return { value: value as RegisterRequest };
}

/**
 * Validate login data
 */
export function validateLogin(data: any): { error?: string; value?: LoginRequest } {
  const { error, value } = loginSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message).join('; ');
    return { error: messages };
  }

  return { value: value as LoginRequest };
}

/**
 * Validate refresh token data
 */
export function validateRefreshToken(data: any): { error?: string; value?: RefreshTokenRequest } {
  const { error, value } = refreshTokenSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message).join('; ');
    return { error: messages };
  }

  return { value: value as RefreshTokenRequest };
}

/**
 * Sanitize user input (basic XSS prevention)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
