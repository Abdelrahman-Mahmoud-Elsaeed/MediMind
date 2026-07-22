const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

(async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log(`[Setup] In-memory MongoDB started at: ${uri}`);
    process.env.MONGO_URI = uri;
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret';
    process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
    process.env.COOKIE_SECRET = process.env.COOKIE_SECRET || 'dev_cookie_secret';
    
    const app = require('./src/app');
    const connectDB = require('./src/config/db');
    await connectDB();
    
    const port = 8080;
    app.listen(port, () => {
      console.log(`[Setup] MediMind backend running on port ${port}`);
    });
    
    process.on('unhandledRejection', (reason) => { console.error('[Unhandled]', reason); });
    process.on('uncaughtException', (err) => { console.error('[Uncaught]', err); });
    process.on('SIGTERM', async () => { await mongoose.disconnect(); await mongod.stop(); process.exit(0); });
    process.on('SIGINT', async () => { await mongoose.disconnect(); await mongod.stop(); process.exit(0); });
  } catch (err) {
    console.error('[Setup] Failed:', err.message);
    process.exit(1);
  }
})();
