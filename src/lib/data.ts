import { Team, User } from "./types";
import { v4 as uuidv4 } from "uuid";

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
export const authenticateUser = (username: string, password: string): User | null => {
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
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

export const addUser = (username: string, password: string, role: "admin" | "volunteer"): User => {
  const newUser: User = {
    id: uuidv4(),
    username,
    password,
    role,
  };
  users.push(newUser);
  saveUsers();
  return newUser;
};

export const getAllUsers = (): User[] => {
  return [...users];
};

// Team Service
export const getTeam = (id: string): Team | undefined => {
  return teams.find((team) => team.id === id);
};

export const getAllTeams = (): Team[] => {
  return [...teams];
};

export const addTeam = (team: Omit<Team, "id" | "createdAt">): Team => {
  const newTeam: Team = {
    ...team,
    id: getNextTeamId(),
    createdAt: new Date(),
  };
  teams.push(newTeam);
  saveTeams();
  return newTeam;
};

export const addBulkTeams = (teamsData: Omit<Team, "id" | "createdAt">[]): Team[] => {
  const newTeams: Team[] = teamsData.map(team => {
    const newTeam: Team = {
      ...team,
      id: getNextTeamId(),
      createdAt: new Date(),
    };
    teams.push(newTeam);
    return newTeam;
  });
  saveTeams();
  return newTeams;
};

export const updateTeam = (id: string, data: Partial<Team>): Team | undefined => {
  const index = teams.findIndex((team) => team.id === id);
  if (index !== -1) {
    teams[index] = { ...teams[index], ...data };
    saveTeams();
    return teams[index];
  }
  return undefined;
};

export const deleteTeam = (id: string): boolean => {
  const initialLength = teams.length;
  teams = teams.filter((team) => team.id !== id);
  if (teams.length < initialLength) {
    saveTeams();
    return true;
  }
  return false;
};

export const updateTeamFoodStatus = (
  teamId: string,
  meal: "lunch" | "dinner" | "snacks",
  status: "valid" | "invalid"
): Team | undefined => {
  const teamIndex = teams.findIndex((team) => team.id === teamId);
  if (teamIndex === -1) return undefined;

  const team = teams[teamIndex];
  teams[teamIndex] = {
    ...team,
    foodStatus: {
      ...team.foodStatus,
      [meal]: status,
    },
  };
  saveTeams();
  return teams[teamIndex];
};
