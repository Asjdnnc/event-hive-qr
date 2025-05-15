
import mongoose from 'mongoose';
import { registerModels } from './models';
import { env } from '@/lib/env';

// Get MongoDB connection string from environment configuration
const MONGODB_URI = env.mongodbUri;

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
    
    // Fix the connection approach - use mongoose.connect properly
    await mongoose.connect(MONGODB_URI);
    
    isConnected = true;
    console.log('Connected to MongoDB successfully');
    
    // Register models
    const { UserModel } = registerModels();
    
    // Create default admin user if it doesn't exist
    await createDefaultAdmin(UserModel);
    
    // Set up connection event listeners after successful connection
    setupConnectionListeners();
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
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
        password: env.adminDefaultPassword, // Use environment variable from env.ts
        role: 'admin',
        email: 'admin@hackzilla.app'
      });
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Setup connection event listeners
const setupConnectionListeners = () => {
  // Check if connection exists before attaching listeners
  const connection = mongoose.connection;
  if (connection) {
    connection.on('connected', () => {
      console.log('MongoDB connection established');
    });
    
    connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    connection.on('disconnected', () => {
      console.log('MongoDB connection disconnected');
      isConnected = false;
    });
  }
  
  // Handle application termination - only in Node.js environment
  if (typeof window === 'undefined') {
    process.on('SIGINT', async () => {
      if (mongoose.connection) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination');
      }
      process.exit(0);
    });
  }
};

// Export the mongoose instance
export default mongoose;
