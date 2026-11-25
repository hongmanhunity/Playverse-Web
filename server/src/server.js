const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

let server;

const startServer = async () => {
  await connectDB();
  server = app.listen(env.port, () => {
    console.log(`[PlayVerse API] Server listening on port ${env.port} (${env.nodeEnv})`);
  });
};

// Graceful Shutdown (đóng kết nối sạch sẽ khi restart/deploy)
const shutdown = async (signal) => {
  console.log(`\n[PlayVerse API] Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err.message);
  shutdown('unhandledRejection');
});

startServer();
