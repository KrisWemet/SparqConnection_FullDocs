"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const subscriptionController_1 = require("../controllers/subscriptionController");
const router = express_1.default.Router();
// Public routes
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), subscriptionController_1.handleWebhook);
// Protected routes
router.post('/create', auth_1.authenticateToken, subscriptionController_1.createSubscription);
router.get('/status', auth_1.authenticateToken, subscriptionController_1.getSubscriptionStatus);
router.get('/plans', auth_1.authenticateToken, subscriptionController_1.getSubscriptionPlans);
router.post('/cancel', auth_1.authenticateToken, subscriptionController_1.cancelSubscription);
router.post('/reactivate', auth_1.authenticateToken, subscriptionController_1.reactivateSubscription);
exports.default = router;
