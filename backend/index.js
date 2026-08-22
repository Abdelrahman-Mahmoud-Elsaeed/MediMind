const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { logger } = require('./src/shared/utils/logger');
const { PORT } = require('./src/config/env');

const port = PORT || 8080;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    logger.info(`Platform server with Socket.IO successfully bound and listening on port: ${port}`);
  });

  process.on('unhandledRejection', (err) => {
    logger.error(err, 'CRITICAL UNHANDLED REJECTION DETECTED! Closing node server loops...');
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();