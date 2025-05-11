
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

// Create and export models
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const TeamModel = mongoose.models.Team || mongoose.model('Team', teamSchema);
