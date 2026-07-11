import mongoose from 'mongoose';
import { app, connectAndSeed } from '../server/index.js';

let isConnected = false;

export default async function handler(req, res) {
  try {
    if (!isConnected) {
      const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
      if (!MONGO_URI) {
        return res.status(500).json({ error: 'MONGODB_URI environment variable is not set' });
      }
      await connectAndSeed(MONGO_URI);
      isConnected = true;
    }
    return app(req, res);
  } catch (err) {
    console.error('Serverless function error:', err);
    isConnected = false;
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
