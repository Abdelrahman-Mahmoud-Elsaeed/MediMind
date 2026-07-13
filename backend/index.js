const { app, server } = require('./src/app');
const connectDB = require('./src/config/db');
const { logger } = require('./src/sheared/utils/logger');
const { PORT } = require('./src/config/env');
const { initSocket, getConnectedCount } = require('./src/sheared/services/socket.service');

const port = PORT || 8080;

const startServer = async () => {
  await connectDB();

  // Initialize Socket.IO (must be after DB connection, before server starts)
  initSocket(server);

  server.listen(port, () => {
    logger.info(`🚀 Platform server listening on port: ${port}`);
    logger.info(`🔌 Socket.IO ready for real-time connections`);
  });

  // Log connected sockets every 5 minutes (for monitoring)
  setInterval(() => {
    const count = getConnectedCount();
    if (count > 0) {
      logger.debug(`📊 Connected sockets: ${count}`);
    }
  }, 5 * 60 * 1000);

  process.on('unhandledRejection', (err) => {
    logger.error('CRITICAL UNHANDLED REJECTION! Closing server...', err);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
