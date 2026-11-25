const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const swaggerDocument = require('./docs/swagger.json');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
const ApiError = require('./utils/ApiError');

const app = express();

// Tin cậy reverse proxy (Nginx/Caddy) để rate-limit và req.ip hoạt động chính xác
app.set('trust proxy', 1);

const isAllowedOrigin = (origin) => {
  if (!origin || env.corsOrigins.includes(origin)) return true;
  if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  return false;
};

// Bảo mật & Tối ưu HTTP
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new ApiError(403, 'Origin không được phép bởi CORS'));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (!env.isProduction) {
  app.use(morgan('dev'));
}

// Health Check & Swagger Docs
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'PlayVerse API Service',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health',
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', apiLimiter, apiRoutes);

// Xử lý lỗi tập trung
app.use(notFound);
app.use(errorHandler);

module.exports = app;
