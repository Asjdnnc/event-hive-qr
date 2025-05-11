import { Team, User, TeamMember, UserRole } from "./types";
import { v4 as uuidv4 } from "uuid";
import { UserModel, TeamModel } from "@/integrations/mongodb/models";
import { connectToMongoDB } from "@/integrations/mongodb/connection";

// In-memory cache for performance
let cachedUsers: User[] | null = null;
let cachedTeams: Team[] | null = null;

// Keep track of the last team ID number - Starting from 2500 so the first team will be 2501
let lastTeamIdNumber = 2500;

// Get next team ID
const getNextTeamId = async (): Promise<string> => {
  try {
    // Find the highest team ID number in the database
    const highestTeam = await TeamModel.findOne().sort({ id: -1 }).limit(1);
    if (highestTeam && parseInt(highestTeam.id) > lastTeamIdNumber) {
      lastTeamIdNumber = parseInt(highestTeam.id);
    }
  } catch (error) {
    console.error("Error getting highest team ID:", error);
  }

  lastTeamIdNumber += 1;
  return lastTeamIdNumber.toString();
};

// User Service
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Find user by username and password
    const user = await UserModel.findOne({ username, password });
    
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      username: user.username,
      password: user.password,
      role: user.role as UserRole
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
};

export const addUser = async (username: string, password: string, role: "admin" | "volunteer"): Promise<User | null> => {
  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return null;
    }

    // Create new user
    const newUser = await UserModel.create({
      username,
      password,
      role,
      email: `${username}@hackzilla.app`
    });

    // Invalidate cache
    cachedUsers = null;
    
    return {
      id: newUser._id.toString(),
      username: newUser.username,
      password: newUser.password,
      role: newUser.role as UserRole
    };
  } catch (error) {
    console.error("User creation error:", error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  if (cachedUsers) return [...cachedUsers];

  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Get all users
    const users = await UserModel.find();
    
    cachedUsers = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      password: user.password,
      role: user.role as UserRole
    }));
    
    return [...cachedUsers];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Team Service
export const getTeam = async (id: string): Promise<Team | undefined> => {
  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Get team
    const team = await TeamModel.findOne({ id });
    
    if (!team) {
      return undefined;
    }

    return {
      id: team.id,
      name: team.name,
      leader: team.leader,
      status: team.status as "active" | "inactive",
      members: team.members.map(member => ({
        name: member.name,
        collegeName: member.collegeName
      })),
      foodStatus: {
        lunch: team.foodStatus.lunch as "valid" | "invalid",
        dinner: team.foodStatus.dinner as "valid" | "invalid",
        snacks: team.foodStatus.snacks as "valid" | "invalid",
      },
      createdAt: team.createdAt,
    };
  } catch (error) {
    console.error("Error fetching team:", error);
    return undefined;
  }
};

export const getAllTeams = async (): Promise<Team[]> => {
  if (cachedTeams) return [...cachedTeams];

  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Get all teams
    const teams = await TeamModel.find().sort({ createdAt: -1 });
    
    cachedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      leader: team.leader,
      status: team.status as "active" | "inactive",
      members: team.members.map(member => ({
        name: member.name,
        collegeName: member.collegeName
      })),
      foodStatus: {
        lunch: team.foodStatus.lunch as "valid" | "invalid",
        dinner: team.foodStatus.dinner as "valid" | "invalid",
        snacks: team.foodStatus.snacks as "valid" | "invalid",
      },
      createdAt: team.createdAt,
    }));
    
    return [...cachedTeams];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};

export const addTeam = async (team: Omit<Team, "id" | "createdAt">): Promise<Team | null> => {
  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Get next team ID
    const newId = await getNextTeamId();
    
    // Create new team
    const newTeam = await TeamModel.create({
      id: newId,
      name: team.name,
      leader: team.leader,
      status: team.status,
      members: team.members,
      foodStatus: team.foodStatus,
    });

    // Invalidate cache
    cachedTeams = null;

    return {
      id: newTeam.id,
      name: newTeam.name,
      leader: newTeam.leader,
      members: newTeam.members.map(member => ({
        name: member.name,
        collegeName: member.collegeName
      })),
      status: newTeam.status as "active" | "inactive",
      foodStatus: {
        lunch: newTeam.foodStatus.lunch as "valid" | "invalid",
        dinner: newTeam.foodStatus.dinner as "valid" | "invalid",
        snacks: newTeam.foodStatus.snacks as "valid" | "invalid",
      },
      createdAt: newTeam.createdAt,
    };
  } catch (error) {
    console.error("Team creation error:", error);
    return null;
  }
};

export const addBulkTeams = async (teamsData: Omit<Team, "id" | "createdAt">[]): Promise<Team[]> => {
  const newTeams: Team[] = [];

  try {
    for (const teamData of teamsData) {
      const team = await addTeam(teamData);
      if (team) {
        newTeams.push(team);
      }
    }
    
    return newTeams;
  } catch (error) {
    console.error("Bulk team creation error:", error);
    return newTeams;
  }
};

export const updateTeam = async (id: string, data: Partial<Team>): Promise<Team | undefined> => {
  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Update team
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.leader) updateData.leader = data.leader;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.members) updateData.members = data.members;
    if (data.foodStatus) updateData.foodStatus = data.foodStatus;

    await TeamModel.updateOne({ id }, { $set: updateData });

    // Invalidate cache
    cachedTeams = null;

    // Get updated team
    return await getTeam(id);
  } catch (error) {
    console.error("Team update error:", error);
    return undefined;
  }
};

export const deleteTeam = async (id: string): Promise<boolean> => {
  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Delete team
    await TeamModel.deleteOne({ id });

    // Invalidate cache
    cachedTeams = null;

    return true;
  } catch (error) {
    console.error("Team deletion error:", error);
    return false;
  }
};

export const updateTeamFoodStatus = async (
  teamId: string,
  meal: "lunch" | "dinner" | "snacks",
  status: "valid" | "invalid"
): Promise<Team | undefined> => {
  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Update food status
    const updateData: any = {};
    updateData[`foodStatus.${meal}`] = status;

    await TeamModel.updateOne({ id: teamId }, { $set: updateData });

    // Invalidate cache
    cachedTeams = null;

    // Get updated team
    return await getTeam(teamId);
  } catch (error) {
    console.error("Food status update error:", error);
    return undefined;
  }
};

// We won't need this function anymore as we're not migrating from Supabase
export const migrateDataToSupabase = async (): Promise<boolean> => {
  // Just return true as we're not using Supabase anymore
  console.log("MongoDB is now being used, no migration needed.");
  return true;
};
