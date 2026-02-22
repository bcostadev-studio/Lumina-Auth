/**
 * Passport Configuration
 * Registers Local and JWT authentication strategies
 */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt';
import userStore from '../models/User';
import config from './config';
import { i18n } from '../i18n/i18n';

/**
 * ─── LOCAL STRATEGY ───────────────────────────────────────────────
 * Used during the login flow (POST /api/auth/login).
 * Passport will extract `email` and `password` from req.body,
 * then invoke this verify callback.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email: string, password: string, done) => {
      try {
        const user = await userStore.findByEmail(email.toLowerCase());

        if (!user) {
          return done(null, false, {
            message: i18n.__('errors.invalid_credentials'),
          });
        }

        const isValid = await userStore.verifyPassword(password, user.password);

        if (!isValid) {
          return done(null, false, {
            message: i18n.__('errors.invalid_credentials'),
          });
        }

        const resolvedUser: Express.User = {
          userId: user.id,
          email: user.email,
          roles: user.roles,
        };

        return done(null, resolvedUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * ─── JWT STRATEGY ─────────────────────────────────────────────────
 * Used to protect routes (replaces your manual AuthMiddleware).
 * Passport extracts the token from the Authorization header,
 * verifies it with the secret, then invokes this callback
 * with the decoded payload.
 */
const jwtOptions: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret,
  algorithms: ['HS256'],
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await userStore.findById(jwtPayload.userId);

      if (!user) {
        return done(null, false, {
          message: i18n.__('errors.user_not_found'),
        });
      }

      const safeUser = {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      };

      return done(null, safeUser);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
