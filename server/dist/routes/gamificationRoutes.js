"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const gamificationController_1 = require("../controllers/gamificationController");
const router = express_1.default.Router();
// Get user's gamification status
router.get('/status', auth_1.authenticateToken, gamificationController_1.getGamificationStatus);
// Get all badge requirements
router.get('/badges', auth_1.authenticateToken, gamificationController_1.getBadgeRequirements);
// Update gamification stats
router.post('/update', auth_1.authenticateToken, gamificationController_1.updateGamificationStats);
// Reset streak (used by cron job when user misses a day)
router.post('/reset-streak', auth_1.authenticateToken, gamificationController_1.resetStreak);
exports.default = router;
