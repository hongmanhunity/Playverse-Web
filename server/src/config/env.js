const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const requiredInProd = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
if (isProduction) {
  const missing = requiredInProd.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`[Config Error] Thiếu biến môi trường bắt buộc ở production: ${missing.join(', ')}`);
  }
}

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const env = {
  nodeEnv,
  isProduction,
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/playverse',
  corsOrigins,
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'playverse_access_jwt_secret_dev',
    accessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'playverse_refresh_jwt_secret_dev',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT, 10) || 465,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'PlayVerse <no-reply@playverse.local>',
  },
};

module.exports = env;
