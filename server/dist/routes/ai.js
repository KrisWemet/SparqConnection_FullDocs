"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const aiController_1 = require("../controllers/aiController");
const router = express_1.default.Router();
// Protected route for personalized content
router.post('/personalize', auth_1.authenticateToken, aiController_1.getPersonalizedContent);
exports.default = router;
