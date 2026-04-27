import mongoose from 'mongoose';

/**
 * Robust database connection logic tailored for production environments.
 * Handles connection pooling, retries, and explicit error events.
 */
export const connectDB = async (): Promise<void> => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmap';

  try {
    // Attach connection event listeners before making the connection
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    // Explicitly configure production-grade options for the Mongoose connection
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,           // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000,    // Close sockets after 45 seconds of inactivity
    });

  } catch (error) {
    console.error('🔥 Failed to connect to MongoDB. Exiting application...', error);
    process.exit(1); // Hard exit if the DB connection fails on startup
  }
};
