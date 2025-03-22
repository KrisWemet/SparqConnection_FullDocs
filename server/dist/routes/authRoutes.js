"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Register new user
router.post('/register', authController_1.register);
// Login user
router.post('/login', authController_1.login);
// Get user profile (protected route)
router.get('/profile', passport_1.default.authenticate('jwt', { session: false }), authController_1.getProfile);
exports.default = router;
