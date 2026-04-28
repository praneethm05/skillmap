import dotenv from 'dotenv';
import { connectDB } from './config/database';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3001;

// Bootstrapper
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
