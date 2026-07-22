const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require('../../config/env');

const JWT_ACCESS_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d';

const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
};

const generateRefreshToken = (payload) => {
  const tokenId = uuidv4();
  const token = jwt.sign({ ...payload, jti: tokenId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
  return { token, tokenId };
};

const verifyToken = (token) => {
  try { return jwt.verify(token, JWT_ACCESS_SECRET); }
  catch (error) { throw new Error('Invalid or expired access token'); }
};

const verifyRefreshToken = (token) => {
  try { return jwt.verify(token, JWT_REFRESH_SECRET); }
  catch (error) { throw new Error('Invalid or expired refresh token'); }
};

const decodeToken = (token) => jwt.decode(token);

module.exports = { generateAccessToken, generateRefreshToken, verifyToken, verifyRefreshToken, decodeToken };
