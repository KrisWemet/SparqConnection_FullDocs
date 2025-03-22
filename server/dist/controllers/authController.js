"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const passport_1 = __importDefault(require("passport"));
const validation_1 = require("../utils/validation");
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = '7d';
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, validation_1.validateEmail)(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        // Validate password strength
        const passwordValidation = (0, validation_1.validatePassword)(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message
            });
        }
        // Check if user already exists
        const existingUser = yield User_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            logger_1.default.warn(`Registration attempt with existing email: ${email}`);
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        // Create new user
        const user = new User_1.default({
            email: email.toLowerCase(),
            password, // Password will be hashed by the User model pre-save middleware
            firstName,
            lastName,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        yield user.save();
        logger_1.default.info(`New user registered: ${user._id}`);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, {
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
        logger_1.default.error('Error in user registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    passport_1.default.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Error during login', error: err });
        }
        if (!user) {
            return res.status(401).json({ message: (info === null || info === void 0 ? void 0 : info.message) || 'Login failed' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, {
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
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // @ts-ignore
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
});
exports.getProfile = getProfile;
