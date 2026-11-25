const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sinh cặp Access Token (hạn ngắn) và Refresh Token (hạn dài)
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpire,
  });

  const refreshToken = jwt.sign({ id: user._id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpire,
  });

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);

const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
  });
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
