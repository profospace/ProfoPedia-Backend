const express = require('express');
const router = express.Router();
const Builder = require('../models/builder'); // Update path as per your project

/**
 * @route   GET /api/builders
 * @desc    Get all builders
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        // Fetch all builders sorted alphabetically
        const builders = await Builder.find({}).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: builders.length,
            data: builders
        });
    } catch (err) {
        console.error('❌ Error fetching builders:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;
