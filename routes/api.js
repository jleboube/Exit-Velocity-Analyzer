const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (!req.isOAuthEnabled) {
    return res.status(503).json({
      error: 'Authentication not available',
      message: 'OAuth is not configured on this server'
    });
  }

  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized - Please log in' });
  }

  next();
}

// Save a new analysis
router.post('/analyses', requireAuth, (req, res) => {
  try {
    const {
      videoFilename,
      fps,
      exitVelocity,
      calibrationDistancePixels,
      ballDistancePixels,
      calPoint1,
      calPoint2,
      ballPoint1,
      ballPoint2,
      notes
    } = req.body;

    // Validate required fields
    if (!videoFilename || !fps || !exitVelocity) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['videoFilename', 'fps', 'exitVelocity']
      });
    }

    const analysisId = db.createAnalysis({
      userId: req.user.id,
      videoFilename,
      fps,
      exitVelocity,
      calibrationDistancePixels: calibrationDistancePixels || 0,
      ballDistancePixels: ballDistancePixels || 0,
      calPoint1X: calPoint1?.x || 0,
      calPoint1Y: calPoint1?.y || 0,
      calPoint2X: calPoint2?.x || 0,
      calPoint2Y: calPoint2?.y || 0,
      ballPoint1X: ballPoint1?.x || 0,
      ballPoint1Y: ballPoint1?.y || 0,
      ballPoint2X: ballPoint2?.x || 0,
      ballPoint2Y: ballPoint2?.y || 0,
      notes: notes || null
    });

    res.status(201).json({
      success: true,
      analysisId,
      message: 'Analysis saved successfully'
    });
  } catch (error) {
    console.error('Error saving analysis:', error);
    res.status(500).json({ error: 'Failed to save analysis' });
  }
});

// Get all analyses for the authenticated user
router.get('/analyses', requireAuth, (req, res) => {
  try {
    const analyses = db.getAnalysesByUserId(req.user.id);
    const stats = db.getAnalysisStats(req.user.id);

    res.json({
      success: true,
      analyses,
      stats
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// Get a specific analysis by ID
router.get('/analyses/:id', requireAuth, (req, res) => {
  try {
    const analysis = db.getAnalysisById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Ensure user owns this analysis
    if (analysis.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// Delete an analysis
router.delete('/analyses/:id', requireAuth, (req, res) => {
  try {
    const result = db.deleteAnalysis(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Analysis not found or access denied' });
    }

    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

module.exports = router;
