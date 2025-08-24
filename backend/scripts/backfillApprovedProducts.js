/*
  Backfill script: Set approvalStatus = 'approved' for existing products
  Usage:
    node backend/scripts/backfillApprovedProducts.js
    node backend/scripts/backfillApprovedProducts.js "mongodb+srv://..."
  Env loading order (first found wins):
    - Already-set env vars (e.g., from shell)
    - .env in CWD
    - backend/.env (relative to this script)
    - repo root .env (two levels up)
*/

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load envs from likely locations if not already present
const ensureEnvLoaded = () => {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      if (process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL) {
        break;
      }
    }
  }
};

ensureEnvLoaded();

(async () => {
  try {
    const mongoUri = process.argv[2] || process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      console.error('MongoDB connection string not found. Set MONGODB_URI (or MONGO_URI/DATABASE_URL) in your .env or pass it as an argument.');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    const Product = require('../src/models/product.model');

    // Match products that don't have approvalStatus or are null/empty
    const filter = { $or: [ { approvalStatus: { $exists: false } }, { approvalStatus: null }, { approvalStatus: '' } ] };
    const update = { $set: { approvalStatus: 'approved' } };

    const res = await Product.updateMany(filter, update);
    console.log(`Backfill complete. Matched: ${res.matchedCount ?? res.n}, Modified: ${res.modifiedCount ?? res.nModified}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  }
})();


