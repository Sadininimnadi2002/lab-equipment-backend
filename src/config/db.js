const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose with in-memory fallback for local development
 */
let memoryServer = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ Local MongoDB connection failed (${error.message}). Starting in-memory MongoDB server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

      // Seed initial data if empty
      const User = require('../models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('🌱 Seeding initial database records into In-Memory MongoDB...');
        const { importData } = require('../utils/seeder');
        await importData();
      }
    } catch (memError) {
      console.error(`❌ In-Memory MongoDB Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
