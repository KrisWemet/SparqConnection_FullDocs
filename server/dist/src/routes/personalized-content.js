import { Router } from 'express';
import { personalizationService } from '../services/personalizationService';
import { authenticateUser } from '../middleware/auth';
const router = Router();
/**
 * @route GET /api/personalized-content
 * @desc Get personalized prompts and quizzes based on user preferences
 * @access Private
 */
router.get('/', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const type = req.query.type || 'both';
        const content = await personalizationService.getPersonalizedContent(userId, type);
        res.json({
            success: true,
            data: content
        });
    }
    catch (error) {
        console.error('Error fetching personalized content:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch personalized content'
        });
    }
});
export default router;
