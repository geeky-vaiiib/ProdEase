const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Update user theme preference
// @route   PUT /api/theme
// @access  Private
router.put('/', protect, async (req, res, next) => {
  try {
    const { theme } = req.body;
    console.log(`🎨 Theme update request: ${req.user.email} -> ${theme}`);

    // Validate theme value
    if (!['light', 'dark', 'system'].includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theme. Must be light, dark, or system'
      });
    }

    // Update user theme preference
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { theme },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ Theme updated successfully: ${user.email} -> ${theme}`);

    res.status(200).json({
      success: true,
      message: 'Theme preference updated successfully',
      data: {
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('❌ Theme update error:', error);
    next(error);
  }
});

// @desc    Get user theme preference
// @route   GET /api/theme
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('theme');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        theme: user.theme || 'system'
      }
    });
  } catch (error) {
    console.error('❌ Theme fetch error:', error);
    next(error);
  }
});

module.exports = router;
