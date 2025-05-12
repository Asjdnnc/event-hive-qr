
import mongoose from 'mongoose';
import { registerModels } from './models';

// MongoDB connection string - in a real app, this would be in an environment variable
const MONGODB_URI = 'mongodb://localhost:27017/hackzilla';
// For local MongoDB: const MONGODB_URI = 'mongodb://localhost:27017/hackzilla';

// Create a function to handle MongoDB connection
export const connectToMongoDB = async () => {
  try {
    // Check if we're already connected
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Register models
    const { UserModel } = registerModels();
    
    // Create default admin user if it doesn't exist
    await createDefaultAdmin(UserModel);
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
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
        password: 'admin', // In a real app, this would be hashed
        role: 'admin',
        email: 'admin@hackzilla.app'
      });
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Export the mongoose instance
export default mongoose;
