import jwt from 'jsonwebtoken';
import User from '../models/User';
import passport from 'passport';
import { validateEmail, validatePassword } from '../utils/validation';
import logger from '../utils/logger';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = '7d';
export const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        // Input validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
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
        // Create new user
        const user = new User({
            email: email.toLowerCase(),
            password, // Password will be hashed by the User model pre-save middleware
            firstName,
            lastName,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await user.save();
        logger.info(`New user registered: ${user._id}`);
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        // Return success response
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    }
    catch (error) {
        logger.error('Error in user registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
export const login = async (req, res) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Error during login', error: err });
        }
        if (!user) {
            return res.status(401).json({ message: info?.message || 'Login failed' });
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    })(req, res);
};
export const getProfile = async (req, res) => {
    try {
        // @ts-ignore
        const user = await User.findById(req.user?._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};
