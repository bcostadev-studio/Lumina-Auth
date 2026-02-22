export interface Config {
  port: number;
  nodeEnv: string;
  appHost: string;
  appBaseUrl: string;
  jwt: {
    secret: string;
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
  };
  bcrypt: {
    saltRounds: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };
}
