import React, { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '../types/auth';
import { 
  auth, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser, 
  resetUserPassword,
  updateUserProfile,
  observeAuthState, 
  validateFirebaseConfig 
} from '../firebase';
import { logger } from '../utils/debugUtils';
import AuthContext from './useAuth';

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Mock user for development
const MOCK_USER: User = {
  id: '123456',
  uid: 'user123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  token: 'mock-jwt-token',
  privateKey: 'mock-private-key',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  getIdToken: async () => 'mock-jwt-token',
  profile: {
    displayName: 'John Doe',
    bio: 'App user',
    avatar: '/images/avatar.png'
  }
};

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for proper Firebase config on mount
  useEffect(() => {
    const isConfigValid = validateFirebaseConfig();
    if (!isConfigValid) {
      setError('Firebase configuration is incomplete. Please check your environment variables.');
      setLoading(false);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    let unsubscribe: () => void;

    const checkAuthState = async () => {
      try {
        if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_USER === 'true') {
          // For development with mock data
          setUser(MOCK_USER);
          setToken(MOCK_USER.token);
          setLoading(false);
          return;
        }

        // Use Firebase auth state listener
        unsubscribe = observeAuthState(async (firebaseUser: any) => {
          setLoading(true);
          
          if (firebaseUser) {
            try {
              // Get the user's ID token
              const idToken = await firebaseUser.getIdToken();
              
              // Create a user object from Firebase user
              const userData: User = {
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                firstName: firebaseUser.displayName?.split(' ')[0] || '',
                lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                token: idToken,
                getIdToken: () => firebaseUser.getIdToken(),
                profile: {
                  displayName: firebaseUser.displayName || '',
                  bio: '',
                  avatar: firebaseUser.photoURL || ''
                }
              };
              
              setUser(userData);
              setToken(idToken);
            } catch (err: any) {
              logger.error('Error getting user token:', err);
              setError('Failed to authenticate: ' + (err.message || 'Unknown error'));
              setUser(null);
              setToken(null);
            }
          } else {
            // No user is signed in
            setUser(null);
            setToken(null);
          }
          
          setLoading(false);
        });
      } catch (err: any) {
        logger.error('Authentication error:', err);
        setError('Failed to authenticate: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };

    checkAuthState();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_USER === 'true') {
        // For development, just return the mock user
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
        setUser(MOCK_USER);
        setToken(MOCK_USER.token);
      } else {
        // Use Firebase authentication
        const userCredential = await loginWithEmail(email, password);
        const idToken = await userCredential.user.getIdToken();
        
        // Here you would typically fetch additional user data from your database
        // For now, we'll create a basic user object
        const userData: User = {
          id: userCredential.user.uid,
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          firstName: userCredential.user.displayName?.split(' ')[0] || '',
          lastName: userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
          token: idToken,
          getIdToken: () => userCredential.user.getIdToken(),
          profile: {
            displayName: userCredential.user.displayName || '',
            bio: '',
            avatar: userCredential.user.photoURL || ''
          }
        };
        
        setUser(userData);
        setToken(idToken);
      }
    } catch (err: any) {
      logger.error('Login error:', err);
      const errorCode = err.code || '';
      let errorMessage = err.message || 'Login failed. Please check your credentials.';
      
      // Provide more user-friendly error messages for common Firebase errors
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (errorCode === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_USER === 'true') {
        // For development
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
        
        const newUser: User = {
          ...MOCK_USER,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          profile: {
            ...MOCK_USER.profile,
            displayName: `${data.firstName} ${data.lastName}`
          }
        };
        
        setUser(newUser);
        setToken(newUser.token);
      } else {
        // Use Firebase authentication
        const userCredential = await registerWithEmail(data.email, data.password);
        
        // Update the user's profile with name
        const displayName = `${data.firstName} ${data.lastName}`;
        
        if (auth.currentUser) {
          await updateUserProfile(displayName);
        }
        
        const idToken = await userCredential.user.getIdToken(true); // Force token refresh
        
        const userData: User = {
          id: userCredential.user.uid,
          uid: userCredential.user.uid,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          token: idToken,
          getIdToken: () => userCredential.user.getIdToken(),
          profile: {
            displayName: displayName,
            bio: '',
            avatar: ''
          }
        };
        
        setUser(userData);
        setToken(idToken);
        
        // Here you would typically also save additional user data to your database
      }
    } catch (err: any) {
      logger.error('Registration error:', err);
      let errorMessage = err.message || 'Registration failed. Please try again.';
      
      // Provide more user-friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use. Please use a different email or try logging in.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_USER === 'true') {
        // For development
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network request
      } else {
        // Use Firebase signOut
        await logoutUser();
      }
      // Always clear the local state
      setUser(null);
      setToken(null);
    } catch (err: any) {
      logger.error('Logout error:', err);
      setError('Failed to log out: ' + (err.message || 'Unknown error'));
      throw err;
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_USER === 'true') {
        // For development
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      } else {
        await resetUserPassword(email);
      }
    } catch (err: any) {
      logger.error('Password reset error:', err);
      let errorMessage = err.message || 'Password reset failed. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_USER === 'true') {
        // For development
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
        
        if (user) {
          const updatedUser = { ...user, ...data, updatedAt: new Date().toISOString() };
          setUser(updatedUser);
        }
      } else {
        // Update Firebase auth profile if name changed
        if (auth.currentUser && (data.firstName || data.lastName)) {
          const firstName = data.firstName || user?.firstName || '';
          const lastName = data.lastName || user?.lastName || '';
          const displayName = `${firstName} ${lastName}`;
          
          await updateUserProfile(displayName);
        }
        
        if (user) {
          // Update local user state
          const updatedUser = { 
            ...user, 
            ...data, 
            updatedAt: new Date().toISOString(),
            profile: {
              ...user.profile,
              displayName: data.profile?.displayName || user.profile.displayName,
              bio: data.profile?.bio || user.profile.bio,
              avatar: data.profile?.avatar || user.profile.avatar
            }
          };
          setUser(updatedUser);
          
          // Here you would typically also update user data in your database
        }
      }
    } catch (err: any) {
      logger.error('Profile update error:', err);
      const errorMessage = err.message || 'Profile update failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth; 