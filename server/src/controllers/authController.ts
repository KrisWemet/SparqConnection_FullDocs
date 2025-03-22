import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { validateEmail, validatePassword } from '../utils/validation';
import logger from '../utils/logger';
import { auth } from '../config/firebase';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = '7d';

export const register = async (req: Request, res: Response) => {
  try {
    console.log('Registration request received:', req.body);
    const { email, password, firstName, lastName, uid } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName || !uid) {
      console.log('Missing required fields:', { email, firstName, lastName, uid, passwordProvided: !!password });
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.log('Password validation failed:', passwordValidation.message);
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    console.log('Verifying Firebase token');
    // Verify Firebase token
    try {
      const token = req.headers.authorization?.split('Bearer ')[1] || '';
      console.log('Token received:', token ? 'Token present' : 'No token');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No authorization token provided'
        });
      }

      const decodedToken = await auth.verifyIdToken(token);
      console.log('Token verified, decoded UID:', decodedToken.uid);
      
      if (decodedToken.uid !== uid) {
        console.log('UID mismatch:', { tokenUid: decodedToken.uid, requestUid: uid });
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Token UID does not match request UID'
        });
      }
    } catch (tokenError: any) {
      console.error('Token verification error:', tokenError);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: process.env.NODE_ENV === 'development' ? tokenError.message : undefined
      });
    }

    console.log('Creating new user document');
    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      firstName,
      lastName,
      uid,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();
    logger.info(`New user registered: ${user._id}`);

    // Generate JWT token
    const token = jwt.sign({ id: user._id, uid }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    console.log('User registration successful, returning response');
    // Return success response
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          uid: user.uid
        }
      }
    });
  } catch (error: any) {
    console.error('Unhandled error in registration:', error);
    logger.error('Error in user registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, uid } = req.body;

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(req.headers.authorization?.split('Bearer ')[1] || '');
    if (decodedToken.uid !== uid) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, uid }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Return success response
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          uid: user.uid
        }
      }
    });
  } catch (error: any) {
    logger.error('Error in user login:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        uid: user.uid
      }
    });
  } catch (error: any) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 