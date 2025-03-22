import { Router } from 'express';
import { analyzeAnalytics, generateAnalyticsReport } from '../../scripts/analyzeAnalytics';
import { verifyAdminToken } from '../../middleware/auth';

const router = Router();

// Protect all admin routes with JWT verification
router.use(verifyAdminToken);

/**
 * @route GET /admin/analytics
 * @desc Get analytics report for journeys and activities
 * @access Private (Admin only)
 */
router.get('/', async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const journeyId = req.query.journeyId as string | undefined;

    const results = await analyzeAnalytics(startDate, endDate, journeyId);
    const report = generateAnalyticsReport(results);

    // Return both raw data and formatted report
    res.json({
      success: true,
      data: {
        raw: results,
        report,
      },
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics report',
    });
  }
});

/**
 * @route GET /admin/analytics/raw
 * @desc Get raw analytics data only
 * @access Private (Admin only)
 */
router.get('/raw', async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const journeyId = req.query.journeyId as string | undefined;

    const results = await analyzeAnalytics(startDate, endDate, journeyId);
    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics data',
    });
  }
});

/**
 * @route GET /admin/analytics/report
 * @desc Get formatted analytics report only
 * @access Private (Admin only)
 */
router.get('/report', async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const journeyId = req.query.journeyId as string | undefined;

    const results = await analyzeAnalytics(startDate, endDate, journeyId);
    const report = generateAnalyticsReport(results);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics report',
    });
  }
});

export default router; 