
export type UserRole = "admin" | "volunteer";

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface Team {
  id: string;
  name: string;
  leader: string;
  members: TeamMember[];
  status: "active" | "inactive";
  foodStatus: {
    lunch: "valid" | "invalid";
    dinner: "valid" | "invalid";
    snacks: "valid" | "invalid";
  };
  createdAt: Date;
}

export interface TeamMember {
  name: string;
  collegeName: string;
}
