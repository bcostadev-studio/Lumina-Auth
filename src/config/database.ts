import { DataSource } from 'typeorm';
import config from './config';
import { i18n } from '../i18n/i18n';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  entities: [`${__dirname}/../models/*.{js,ts}`],
  subscribers: [],
  migrations: [],
});

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log(i18n.__('logs.database_connected'));
  } catch (error) {
    const errorMessage = (error as Error).toString();
    console.error(i18n.__('errors.database_connection_failed', { error: errorMessage }));
    throw error;
  }
}
