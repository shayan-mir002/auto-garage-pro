import mongoose from 'mongoose';
import { app, connectAndSeed } from '../server/index.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/autogarage';
    await connectAndSeed(MONGO_URI);
    isConnected = true;
  }
  return app(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
