import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getPosts,
  createPost,
  getPostComments,
  createComment,
  flagPost,
  moderatePost
} from '../controllers/forumController';

const router = express.Router();

// Public routes (still require authentication)
router.get('/posts', authenticateToken, getPosts);
router.get('/posts/:postId/comments', authenticateToken, getPostComments);

// Protected routes
router.post('/posts', authenticateToken, createPost);
router.post('/posts/:postId/comments', authenticateToken, createComment);
router.post('/posts/:postId/flag', authenticateToken, flagPost);

// Moderation routes
router.post('/posts/:postId/moderate', authenticateToken, moderatePost);

export default router; 