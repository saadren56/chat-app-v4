import express from 'express';
import http from 'http';
import { env, validateEnvironment } from './config';
import { initDatabase } from './db';
import {
  corsMiddleware,
  requestLogger,
  notFoundHandler,
  errorHandler,
} from './middleware';
import routes from './routes';
import setupSocketIO from './socket';

async function bootstrap(): Promise<void> {
  try {
    validateEnvironment();
    console.log('✅ Environment configuration validated');

    await initDatabase();
    console.log('✅ Database initialized');

    const app = express();
    const server = http.createServer(app);

    app.use(corsMiddleware);
    app.use(requestLogger);
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use(routes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    const socketServer = setupSocketIO(server);
    console.log('✅ Socket.IO initialized');

    server.listen(env.PORT, () => {
      console.log('\n🚀 Server started successfully!');
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 HTTP Server: http://localhost:${env.PORT}`);
      console.log(`🔌 Socket.IO: http://localhost:${env.PORT}`);
      console.log(`📡 API Prefix: ${env.API_PREFIX}`);
      console.log(`\n📋 API Endpoints:`);
      console.log(`   GET  ${env.API_PREFIX}/health`);
      console.log(`   POST ${env.API_PREFIX}/auth/register`);
      console.log(`   POST ${env.API_PREFIX}/auth/login`);
      console.log(`   GET  ${env.API_PREFIX}/auth/me`);
      console.log(`   GET  ${env.API_PREFIX}/users`);
      console.log(`   GET  ${env.API_PREFIX}/conversations`);
      console.log(`   GET  ${env.API_PREFIX}/friends`);
      console.log('\n');
    });

    process.on('SIGINT', async () => {
      console.log('\n👋 Gracefully shutting down...');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', async () => {
      console.log('\n👋 SIGTERM received. Shutting down...');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
