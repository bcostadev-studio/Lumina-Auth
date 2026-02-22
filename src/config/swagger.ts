/**
 * Swagger UI Configuration
 * Serves interactive API documentation from the OpenAPI spec.
 * Accessible at /api/docs when the server is running.
 */

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import config from './config';

const specPath = path.resolve(__dirname, '../../docs/openapi.yaml');
const swaggerSpec = YAML.load(specPath);

// Override the static servers URL with the runtime value from .env
swaggerSpec.servers = [
  {
    url: config.appBaseUrl,
    description: config.nodeEnv === 'production' ? 'Production' : 'Local development',
  },
];

const swaggerOptions: swaggerUi.SwaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Lumina Auth — API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

export { swaggerUi, swaggerSpec, swaggerOptions };
