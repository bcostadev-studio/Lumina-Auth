import dotenv from 'dotenv';
import { Config } from '../@types/config/Configuration';

dotenv.config();

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || '',
    accessTokenExpiry: Number(process.env.JWT_ACCESS_EXPIRY) || 0,
    refreshTokenExpiry: Number(process.env.JWT_REFRESH_EXPIRY) || 0,
  },
  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  },
};

export default config;
