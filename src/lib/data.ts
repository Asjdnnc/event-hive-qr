import { Team, User } from "./types";
import { v4 as uuidv4 } from "uuid";

// Mock data for initial users
let users: User[] = [
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

// Mock data for teams
let teams: Team[] = [];

// Keep track of the last team ID number - Starting from 2500 so the first team will be 2501
let lastTeamIdNumber = 2500;

// Get next team ID
const getNextTeamId = (): string => {
  lastTeamIdNumber += 1;
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
  return newTeams;
};

export const updateTeam = (id: string, data: Partial<Team>): Team | undefined => {
  const index = teams.findIndex((team) => team.id === id);
  if (index !== -1) {
    teams[index] = { ...teams[index], ...data };
    return teams[index];
  }
  return undefined;
};

export const deleteTeam = (id: string): boolean => {
  const initialLength = teams.length;
  teams = teams.filter((team) => team.id !== id);
  return teams.length < initialLength;
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

  return teams[teamIndex];
};
