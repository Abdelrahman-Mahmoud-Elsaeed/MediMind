const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { socketService } = require('./src/modules/socket');
const { logger } = require('./src/shared/utils/logger');
const { PORT } = require('./src/config/env');

const { registerCronJobs } = require('./src/shared/queues/cronScheduler');

const port = PORT || 8080;

const startServer = async () => {
  await connectDB();
  await registerCronJobs();

  const server = http.createServer(app);

  // Initialize Socket.IO server instance
  socketService.initSocket(server);

  server.listen(port, () => {
    logger.info(`Platform server successfully bound and listening on port: ${port}`);
  });

  process.on('unhandledRejection', (err) => {
    logger.error(err, 'CRITICAL UNHANDLED REJECTION DETECTED! Closing node server loops...');
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();