"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
// Protected routes
router.post('/send', auth_1.authenticateToken, notificationController_1.sendNotification);
router.post('/topic/send', auth_1.authenticateToken, notificationController_1.sendTopicNotification);
router.post('/topic/subscribe', auth_1.authenticateToken, notificationController_1.subscribeTopic);
router.post('/topic/unsubscribe', auth_1.authenticateToken, notificationController_1.unsubscribeTopic);
exports.default = router;
