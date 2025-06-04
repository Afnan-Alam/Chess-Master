import { clear } from "console";

export interface UserData {
  username: string;
  password: string;
  gamesPlayed: number;
  gamesWon: number;
  winStreak: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

const USERS_KEY = 'chess-users';
const CURRENT_USER_KEY = 'current-user';


export const userService = {
  // Get all users from localStorage
  getAllUsers(): UserData[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  // Save users to localStorage
  saveUsers(users: UserData[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Register a new user
  register(credentials: LoginCredentials): boolean {
    const users = this.getAllUsers();
    
    // Check if username already exists
    if (users.some(user => user.username === credentials.username)) {
      return false;
    }

    const newUser: UserData = {
      username: credentials.username,
      password: credentials.password,
      gamesPlayed: 0,
      gamesWon: 0,
      winStreak: 0
    };

    users.push(newUser);
    this.saveUsers(users);
    return true;
  },

  // Login user
  login(credentials: LoginCredentials): UserData | null {
  const users = this.getAllUsers();
  const user = users.find(
    u => u.username === credentials.username && u.password === credentials.password
  );

  if (user) {
    this.setCurrentUser(user.username);
    return user;
  }

  return null;
  },

  // Update user stats
  updateUserStats(username: string, stats: Partial<Pick<UserData, 'gamesPlayed' | 'gamesWon' | 'winStreak'>>): void {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...stats };
      this.saveUsers(users);
    }
  },

  // Get user stats
  getUserStats(username: string): Pick<UserData, 'gamesPlayed' | 'gamesWon' | 'winStreak'> | null {
    const users = this.getAllUsers();
    const user = users.find(u => u.username === username);
    
    if (user) {
      return {
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        winStreak: user.winStreak
      };
    }
    
    return null;
  },

  setCurrentUser(username: string): void {
    localStorage.setItem(CURRENT_USER_KEY, username);
  },

  getCurrentUser(): string | null {
    return localStorage.getItem(CURRENT_USER_KEY);
  },
  clearCurrentUser(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};