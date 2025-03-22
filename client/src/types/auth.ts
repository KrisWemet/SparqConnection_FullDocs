export interface User {
  id: string;
  uid: string;  // Firebase user ID
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;  // Optional property
  token: string;  // JWT token
  privateKey?: string;  // Optional encryption key
  partnerEmail?: string;  // Optional partner email
  relationshipStatus?: string;  // Optional relationship status
  createdAt?: string;  // Optional creation date
  updatedAt?: string;  // Optional update date
  getIdToken(): Promise<string>;  // Firebase Auth method
  profile: {
    displayName: string;
    bio: string;
    avatar: string;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  updateProfile?: (data: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
} 