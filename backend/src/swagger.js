const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MediMind API',
      version: '1.0.0',
      description: 'MediMind Backend API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:8080/api/v1',
        description: 'Local development server',
      },
    ],
  },

  apis: [
    './src/index.route.js',
    './src/modules/**/*.route.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;