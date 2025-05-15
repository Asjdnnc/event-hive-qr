
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

// Create indexes for better performance in production
userSchema.index({ username: 1 });
teamSchema.index({ id: 1 });
teamSchema.index({ createdAt: -1 });

// Add timestamps to schemas
userSchema.set('timestamps', true);
teamSchema.set('timestamps', true);

// Models registry to prevent duplicate model errors
let UserModel: mongoose.Model<any>;
let TeamModel: mongoose.Model<any>;

// Create and register models
export const registerModels = () => {
  // Only register models if they don't already exist to prevent errors on hot reloading
  try {
    UserModel = mongoose.models.User || mongoose.model('User', userSchema);
  } catch (error) {
    UserModel = mongoose.model('User', userSchema);
  }
  
  try {
    TeamModel = mongoose.models.Team || mongoose.model('Team', teamSchema);
  } catch (error) {
    TeamModel = mongoose.model('Team', teamSchema);
  }
  
  return { UserModel, TeamModel };
};

// Export a function to get the models safely
export const getModels = () => {
  // Make sure to register models before getting them
  const models = registerModels();
  return models;
};
