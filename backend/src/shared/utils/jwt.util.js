const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require('../../config/env');

const JWT_ACCESS_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d'; 

/**
 * Generate an access token
 * @param {Object} payload - Token payload
 * @returns {string} JWT access token
 */

const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
};


/**
 * Generate a refresh token with a unique session ID (jti)
 * @param {Object} payload - Token payload (contains accountId, role, etc.)
 * @returns {Object} { token: string, tokenId: string }
 */
const generateRefreshToken = (payload) => {
  const tokenId = crypto.randomUUID(); // Unique identifier for this specific session

  const token = jwt.sign(
    { 
      ...payload, 
      jti: tokenId
    }, 
    JWT_REFRESH_SECRET, 
    { expiresIn: JWT_REFRESH_EXPIRY }
  );

  return { token, tokenId };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify a JWT refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode a JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken
};
