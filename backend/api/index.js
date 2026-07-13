/**
 * Vercel Serverless Entry Point — وفاء (Wafa) Backend
 *
 * Adapts the Express app to work as a Vercel serverless function.
 * NOTE: Socket.IO (WebSockets) is NOT supported on Vercel serverless.
 * For full features (real-time notifications), deploy backend to Railway.
 */

const { app } = require('../src/app');

export default function handler(req, res) {
  app(req, res);
}

export const config = {
  maxDuration: 30,
};
