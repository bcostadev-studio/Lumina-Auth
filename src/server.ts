import app from './app';
import config from './config/config';
import { i18n } from './i18n/i18n';
import { initializeDatabase } from './config/database';

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(config.port, () => {
      console.log(i18n.__('logs.server_running', { port: config.port.toString() }));
    });
  } catch (error) {
    console.error(i18n.__('errors.server_failed_to_start', { error: (error as Error).toString() }));
    process.exit(1);
  }
}

startServer();
