const dotenv = require('dotenv');

// Load environment variables before importing app and db
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 UniLab Backend Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`
  );
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Rejection Error: ${err.message}`);
  // In production, close server & exit process
  // server.close(() => process.exit(1));
});
