"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const analyticsController_1 = require("../controllers/analyticsController");
const router = express_1.default.Router();
// Protected routes
router.use(passport_1.default.authenticate('jwt', { session: false }));
// Get user analytics
router.get('/', analyticsController_1.getAnalytics);
exports.default = router;
