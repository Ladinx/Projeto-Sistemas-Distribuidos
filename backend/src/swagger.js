const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Marketplace Delivery API',
      version: '1.0.0',
      description: 'API REST do marketplace de delivery — Projeto acadêmico de Programação Distribuída.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Desenvolvimento local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
