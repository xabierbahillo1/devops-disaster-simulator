const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'DevOps Disaster Simulator API',
      description:
        'API del simulador de desastres DevOps. Gestiona sesiones de juego, estado de la simulación, acciones del jugador, diagnósticos SSH, control de la simulación y ranking de partidas.',
      version: '2.0.0',
    },
    servers: [
      { url: 'https://backend-devops-sim.xabierbahillo.dev', description: 'Producción (CubePath)' },
      { url: 'http://localhost:3001', description: 'Desarrollo local' },
    ],
    components: {
      securitySchemes: {
        SessionKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-session-key',
          description:
            'Clave de sesión devuelta por POST /api/session. Requerida en todos los endpoints excepto /api/session y /api/ranking.',
        },
      },
      schemas: {
        Error401: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Falta x-session-key header' },
          },
        },
      },
    },
    security: [{ SessionKey: [] }],
    tags: [
      { name: 'Sesión', description: 'Gestión de sesiones de juego' },
      { name: 'Simulación', description: 'Estado del juego' },
      { name: 'Acciones', description: 'Acciones del jugador sobre la infraestructura' },
      { name: 'Control', description: 'Control de la simulación (reset, pause)' },
      { name: 'Diagnóstico', description: 'Diagnóstico SSH de servidores' },
      { name: 'Ranking', description: 'Ranking de partidas terminadas (persistido en PostgreSQL)' },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
