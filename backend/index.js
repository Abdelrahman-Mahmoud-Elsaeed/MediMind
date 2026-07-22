const app = require('./src/app');
const connectDB = require('./src/config/db');
const { logger } = require('./src/shared/utils/logger');
const { PORT } = require('./src/config/env');
const port = PORT || 8080;
const startServer = async () => {
  await connectDB();
  const server = app.listen(port, () => logger.info(`Server listening on port: ${port}`));
  process.on('unhandledRejection', (err) => { logger.error(err, 'UNHANDLED REJECTION (non-fatal)'); });
  process.on('uncaughtException', (err) => { logger.error(err, 'UNCAUGHT EXCEPTION (non-fatal)'); });
};
startServer();
