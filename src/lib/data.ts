
import { Team, User, TeamMember } from "./types";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

// In-memory cache for performance
let cachedUsers: User[] | null = null;
let cachedTeams: Team[] | null = null;

// Initialize data from localStorage or use defaults
const getUsersFromStorage = (): User[] => {
  const storedUsers = localStorage.getItem("hackzilla_users");
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }

  // Default users if no data in storage
  return [
    {
      id: "1",
      username: "admin",
      password: "admin123",
      role: "admin",
    },
    {
      id: "2",
      username: "volunteer",
      password: "volunteer123",
      role: "volunteer",
    }
  ];
};

const getTeamsFromStorage = (): Team[] => {
  const storedTeams = localStorage.getItem("hackzilla_teams");
  return storedTeams ? JSON.parse(storedTeams) : [];
};

// Load initial data
let users: User[] = getUsersFromStorage();
let teams: Team[] = getTeamsFromStorage();

// Store team ID tracking in localStorage
const getLastTeamIdNumber = (): number => {
  const storedId = localStorage.getItem("hackzilla_lastTeamId");
  return storedId ? parseInt(storedId) : 2500;
};

// Keep track of the last team ID number - Starting from 2500 so the first team will be 2501
let lastTeamIdNumber = getLastTeamIdNumber();

// Save data to localStorage
const saveUsers = () => {
  localStorage.setItem("hackzilla_users", JSON.stringify(users));
};

const saveTeams = () => {
  localStorage.setItem("hackzilla_teams", JSON.stringify(teams));
};

const saveLastTeamId = () => {
  localStorage.setItem("hackzilla_lastTeamId", lastTeamIdNumber.toString());
};

// Get next team ID
const getNextTeamId = (): string => {
  lastTeamIdNumber += 1;
  saveLastTeamId();
  return lastTeamIdNumber.toString();
};

// User Service
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // First check if user exists in the auth system
    const { data: authUser, error: authError } = await supabase.auth.signInWithPassword({
      email: `${username}@hackzilla.app`, // Using username as email with domain
      password,
    });

    if (authError || !authUser.user) {
      console.error("Authentication error:", authError);
      return null;
    }

    // Then get the user's role from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    if (userError) {
      console.error("User data fetch error:", userError);
      return null;
    }

    return {
      id: userData.id,
      username: userData.username,
      password: userData.password, // Note: In a real app, we wouldn't expose this
      role: userData.role as "admin" | "volunteer"
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
    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${username}@hackzilla.app`, // Using username as email with domain
      password,
    });

    if (authError || !authData.user) {
      console.error("Auth user creation error:", authError);
      return null;
    }

    // Insert into our users table
    const newUser: User = {
      id: authData.user.id,
      username,
      password, // In a real app, we wouldn't store plaintext passwords
      role,
    };

    const { error: insertError } = await supabase
      .from('users')
      .insert(newUser);

    if (insertError) {
      console.error("User insert error:", insertError);
      return null;
    }

    // Invalidate cache
    cachedUsers = null;
    return newUser;
  } catch (error) {
    console.error("User creation error:", error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  if (cachedUsers) return [...cachedUsers];

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    cachedUsers = data as User[];
    return [...cachedUsers];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Team Service
export const getTeam = async (id: string): Promise<Team | undefined> => {
  try {
    // Get team data
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (teamError) {
      console.error("Error fetching team:", teamError);
      return undefined;
    }

    // Get team members
    const { data: membersData, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', id);

    if (membersError) {
      console.error("Error fetching team members:", membersError);
      return undefined;
    }

    // Get food status
    const { data: foodData, error: foodError } = await supabase
      .from('food_status')
      .select('*')
      .eq('team_id', id)
      .single();

    if (foodError && foodError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error("Error fetching food status:", foodError);
      return undefined;
    }

    // Construct team object with proper type casting
    const team: Team = {
      id: teamData.id,
      name: teamData.name,
      leader: teamData.leader,
      status: teamData.status as "active" | "inactive",
      members: (membersData || []).map(member => ({
        name: member.name,
        collegeName: member.college_name
      })),
      foodStatus: foodData ? {
        lunch: foodData.lunch as "valid" | "invalid",
        dinner: foodData.dinner as "valid" | "invalid",
        snacks: foodData.snacks as "valid" | "invalid",
      } : {
        lunch: "invalid",
        dinner: "invalid",
        snacks: "invalid",
      },
      createdAt: new Date(teamData.created_at),
    };

    return team;
  } catch (error) {
    console.error("Error fetching team:", error);
    return undefined;
  }
};

export const getAllTeams = async (): Promise<Team[]> => {
  if (cachedTeams) return [...cachedTeams];

  try {
    // Get all teams
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
      return [];
    }

    // Fetch all team members and food statuses in parallel
    const [membersResult, foodStatusesResult] = await Promise.all([
      supabase.from('team_members').select('*'),
      supabase.from('food_status').select('*')
    ]);

    if (membersResult.error) {
      console.error("Error fetching team members:", membersResult.error);
    }
    
    if (foodStatusesResult.error) {
      console.error("Error fetching food statuses:", foodStatusesResult.error);
    }

    const membersMap: Record<string, TeamMember[]> = {};
    if (membersResult.data) {
      for (const member of membersResult.data) {
        if (!membersMap[member.team_id]) {
          membersMap[member.team_id] = [];
        }
        membersMap[member.team_id].push({
          name: member.name,
          collegeName: member.college_name
        });
      }
    }

    const foodStatusMap: Record<string, any> = {};
    if (foodStatusesResult.data) {
      for (const status of foodStatusesResult.data) {
        foodStatusMap[status.team_id] = status;
      }
    }

    // Construct team objects with proper type casting
    cachedTeams = teamsData.map(team => {
      return {
        id: team.id,
        name: team.name,
        leader: team.leader,
        status: team.status as "active" | "inactive",
        members: membersMap[team.id] || [],
        foodStatus: foodStatusMap[team.id] ? {
          lunch: foodStatusMap[team.id].lunch as "valid" | "invalid",
          dinner: foodStatusMap[team.id].dinner as "valid" | "invalid",
          snacks: foodStatusMap[team.id].snacks as "valid" | "invalid",
        } : {
          lunch: "invalid" as const,
          dinner: "invalid" as const,
          snacks: "invalid" as const,
        },
        createdAt: new Date(team.created_at),
      };
    });

    return [...cachedTeams];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};

export const addTeam = async (team: Omit<Team, "id" | "createdAt">): Promise<Team | null> => {
  try {
    const newId = getNextTeamId();
    
    // Insert team data
    const { error: teamError } = await supabase
      .from('teams')
      .insert({
        id: newId,
        name: team.name,
        leader: team.leader,
        status: team.status,
      });

    if (teamError) {
      console.error("Team insert error:", teamError);
      return null;
    }

    // Insert team members
    if (team.members.length > 0) {
      const membersToInsert = team.members.map(member => ({
        team_id: newId,
        name: member.name,
        college_name: member.collegeName
      }));

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(membersToInsert);

      if (membersError) {
        console.error("Team members insert error:", membersError);
      }
    }

    // Insert food status
    const { error: foodError } = await supabase
      .from('food_status')
      .insert({
        team_id: newId,
        lunch: team.foodStatus.lunch,
        dinner: team.foodStatus.dinner,
        snacks: team.foodStatus.snacks
      });

    if (foodError) {
      console.error("Food status insert error:", foodError);
    }

    // Invalidate cache
    cachedTeams = null;

    // Construct and return the full team object
    const newTeam: Team = {
      id: newId,
      name: team.name,
      leader: team.leader,
      members: team.members,
      status: team.status,
      foodStatus: team.foodStatus,
      createdAt: new Date(),
    };

    return newTeam;
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
    // Update team base data
    if (data.name || data.leader || data.status !== undefined) {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.leader) updateData.leader = data.leader;
      if (data.status !== undefined) updateData.status = data.status;

      const { error: teamError } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', id);

      if (teamError) {
        console.error("Team update error:", teamError);
        return undefined;
      }
    }

    // Update team members if provided
    if (data.members) {
      // Delete existing members
      await supabase
        .from('team_members')
        .delete()
        .eq('team_id', id);

      // Insert new members
      const membersToInsert = data.members.map(member => ({
        team_id: id,
        name: member.name,
        college_name: member.collegeName
      }));

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(membersToInsert);

      if (membersError) {
        console.error("Team members update error:", membersError);
      }
    }

    // Update food status if provided
    if (data.foodStatus) {
      const { error: foodError } = await supabase
        .from('food_status')
        .update({
          lunch: data.foodStatus.lunch,
          dinner: data.foodStatus.dinner,
          snacks: data.foodStatus.snacks
        })
        .eq('team_id', id);

      if (foodError) {
        console.error("Food status update error:", foodError);
      }
    }

    // Invalidate cache and fetch updated team
    cachedTeams = null;
    return await getTeam(id);
  } catch (error) {
    console.error("Team update error:", error);
    return undefined;
  }
};

export const deleteTeam = async (id: string): Promise<boolean> => {
  try {
    // Delete team (cascade will handle related records)
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Team deletion error:", error);
      return false;
    }

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
    // Check if food status exists for this team
    const { data: existingData, error: checkError } = await supabase
      .from('food_status')
      .select('*')
      .eq('team_id', teamId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error("Error checking food status:", checkError);
      return undefined;
    }

    let updateError;
    
    if (!existingData) {
      // Create new food status record with defaults
      const newFoodStatus = {
        team_id: teamId,
        lunch: meal === 'lunch' ? status : 'invalid',
        dinner: meal === 'dinner' ? status : 'invalid',
        snacks: meal === 'snacks' ? status : 'invalid'
      };
      
      const { error } = await supabase
        .from('food_status')
        .insert(newFoodStatus);
        
      updateError = error;
    } else {
      // Update existing record
      const { error } = await supabase
        .from('food_status')
        .update({ [meal]: status })
        .eq('team_id', teamId);
        
      updateError = error;
    }

    if (updateError) {
      console.error("Food status update error:", updateError);
      return undefined;
    }

    // Invalidate cache and fetch updated team
    cachedTeams = null;
    return await getTeam(teamId);
  } catch (error) {
    console.error("Food status update error:", error);
    return undefined;
  }
};

// Migration helper - One-time function to migrate localStorage data to Supabase
export const migrateDataToSupabase = async (): Promise<boolean> => {
  try {
    console.log("Starting data migration to Supabase...");
    
    // Retrieve local data
    const storedUsers = localStorage.getItem("hackzilla_users");
    const storedTeams = localStorage.getItem("hackzilla_teams");
    
    if (storedUsers) {
      const users: User[] = JSON.parse(storedUsers);
      console.log(`Migrating ${users.length} users...`);
      
      for (const user of users) {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: `${user.username}@hackzilla.app`,
          password: user.password,
        });
        
        if (authError) {
          console.error(`Error creating auth user for ${user.username}:`, authError);
          continue;
        }
        
        // Insert user record
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user?.id || user.id,
            username: user.username,
            password: user.password,
            role: user.role
          });
          
        if (userError) {
          console.error(`Error inserting user ${user.username}:`, userError);
        }
      }
    }
    
    if (storedTeams) {
      const teams: Team[] = JSON.parse(storedTeams);
      console.log(`Migrating ${teams.length} teams...`);
      
      for (const team of teams) {
        // Insert team with proper date format
        const { error: teamError } = await supabase
          .from('teams')
          .insert({
            id: team.id,
            name: team.name,
            leader: team.leader,
            status: team.status,
            created_at: team.createdAt.toString() // Convert Date to string for Postgres
          });
          
        if (teamError) {
          console.error(`Error inserting team ${team.name}:`, teamError);
          continue;
        }
        
        // Insert team members
        if (team.members.length > 0) {
          const membersToInsert = team.members.map(member => ({
            team_id: team.id,
            name: member.name,
            college_name: member.collegeName
          }));
          
          const { error: membersError } = await supabase
            .from('team_members')
            .insert(membersToInsert);
            
          if (membersError) {
            console.error(`Error inserting members for team ${team.name}:`, membersError);
          }
        }
        
        // Insert food status
        const { error: foodError } = await supabase
          .from('food_status')
          .insert({
            team_id: team.id,
            lunch: team.foodStatus.lunch,
            dinner: team.foodStatus.dinner,
            snacks: team.foodStatus.snacks
          });
          
        if (foodError) {
          console.error(`Error inserting food status for team ${team.name}:`, foodError);
        }
      }
    }
    
    console.log("Data migration completed!");
    return true;
  } catch (error) {
    console.error("Migration error:", error);
    return false;
  }
};
