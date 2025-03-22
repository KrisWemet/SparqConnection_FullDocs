"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const forumController_1 = require("../controllers/forumController");
const router = express_1.default.Router();
// Public routes (still require authentication)
router.get('/posts', auth_1.authenticateToken, forumController_1.getPosts);
router.get('/posts/:postId/comments', auth_1.authenticateToken, forumController_1.getPostComments);
// Protected routes
router.post('/posts', auth_1.authenticateToken, forumController_1.createPost);
router.post('/posts/:postId/comments', auth_1.authenticateToken, forumController_1.createComment);
router.post('/posts/:postId/flag', auth_1.authenticateToken, forumController_1.flagPost);
// Moderation routes
router.post('/posts/:postId/moderate', auth_1.authenticateToken, forumController_1.moderatePost);
exports.default = router;
