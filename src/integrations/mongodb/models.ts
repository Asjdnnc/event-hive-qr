
import mongoose from 'mongoose';
import { User, Team, TeamMember, UserRole } from '@/lib/types';

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['admin', 'volunteer'],
    default: 'volunteer'
  }
});

// Define the TeamMember schema
const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  collegeName: {
    type: String,
    required: true
  }
});

// Define the FoodStatus schema
const foodStatusSchema = new mongoose.Schema({
  lunch: {
    type: String,
    enum: ['valid', 'invalid'],
    default: 'invalid'
  },
  dinner: {
    type: String,
    enum: ['valid', 'invalid'],
    default: 'invalid'
  },
  snacks: {
    type: String,
    enum: ['valid', 'invalid'],
    default: 'invalid'
  }
});

// Define the Team schema
const teamSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  leader: {
    type: String,
    required: true
  },
  members: [teamMemberSchema],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  foodStatus: {
    type: foodStatusSchema,
    default: () => ({
      lunch: 'invalid',
      dinner: 'invalid',
      snacks: 'invalid'
    })
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and register models
export const registerModels = () => {
  // Only register models if they don't already exist
  // This prevents errors when hot-reloading in development
  const models = mongoose.models;
  
  const UserModel = models.User || mongoose.model('User', userSchema);
  const TeamModel = models.Team || mongoose.model('Team', teamSchema);
  
  return { UserModel, TeamModel };
};

// Export a function to get the models safely
export const getModels = () => {
  // Make sure to register models before getting them
  const { UserModel, TeamModel } = registerModels();
  return { UserModel, TeamModel };
};
