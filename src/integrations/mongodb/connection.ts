
import mongoose from 'mongoose';
import { registerModels } from './models';

// Get MongoDB connection string from environment variables, fallback to local for development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackzilla';

// Connection options for better reliability in production
const mongooseOptions = {
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Track connection status
let isConnected = false;

// Create a function to handle MongoDB connection
export const connectToMongoDB = async () => {
  try {
    // Return existing connection if already connected
    if (isConnected) {
      console.log('Using existing MongoDB connection');
      return mongoose.connection;
    }

    // Connect to MongoDB with enhanced options for production reliability
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    
    isConnected = true;
    console.log('Connected to MongoDB successfully');
    
    // Register models
    const { UserModel } = registerModels();
    
    // Create default admin user if it doesn't exist
    await createDefaultAdmin(UserModel);
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // In production, you might want to implement retry logic here
    isConnected = false;
    return null;
  }
};

// Create default admin user if it doesn't exist
const createDefaultAdmin = async (UserModel) => {
  try {
    // Check if admin user exists
    const adminExists = await UserModel.findOne({ username: 'admin' });
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      await UserModel.create({
        username: 'admin',
        password: process.env.ADMIN_DEFAULT_PASSWORD || 'admin', // Use environment variable if available
        role: 'admin',
        email: 'admin@hackzilla.app'
      });
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Handle connection events for better monitoring
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
  isConnected = false;
});

// Handle application termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

// Export the mongoose instance
export default mongoose;
