const express = require('express');
const router = express.Router();
const { processAllBatches, getProcessingStats } = require('../utils/batchProcessor');

// Keep track of automation state
let isAutomationRunning = false;
let automationStartTime = null;
let automationError = null;
let lastProcessedPage = -1; // Track the last processed page

/**
 * Start the batch processing automation
 */
router.post('/start', async (req, res) => {
    try {
        // Check if automation is already running
        if (isAutomationRunning) {
            return res.status(409).json({
                success: false,
                message: 'Automation is already running',
                startedAt: automationStartTime
            });
        }

        // Get starting page from request, lastProcessedPage+1, or 0
        const startPage = req.body.startPage !== undefined ?
            parseInt(req.body.startPage) :
            (lastProcessedPage >= 0 ? lastProcessedPage + 1 : 0);

        // Set automation flags
        isAutomationRunning = true;
        automationStartTime = new Date();
        automationError = null;

        // Return response immediately to avoid timeout
        res.status(202).json({
            success: true,
            message: 'Batch processing automation started',
            startedAt: automationStartTime,
            startingFromPage: startPage
        });

        // Define a function to update lastProcessedPage after each batch
        const updatePageTracker = (page) => {
            lastProcessedPage = page;
            console.log(`Updated lastProcessedPage to ${lastProcessedPage}`);
        };

        // Run the automation in the background, starting from the specified page
        processAllBatches(startPage, updatePageTracker)
            .then(() => {
                isAutomationRunning = false;
                console.log('Automation completed successfully');
            })
            .catch(error => {
                isAutomationRunning = false;
                automationError = error.message;
                console.error('Automation failed:', error);
            });

    } catch (error) {
        isAutomationRunning = false;
        automationError = error.message;
        console.error('Error starting automation:', error);

        // If we haven't sent a response yet
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Failed to start automation',
                error: error.message
            });
        }
    }
});

/**
 * Get the status of the current/last automation run
 */
router.get('/status', async (req, res) => {
    try {
        // Get latest processing stats
        const stats = await getProcessingStats();

        res.status(200).json({
            success: true,
            isRunning: isAutomationRunning,
            startedAt: automationStartTime,
            lastProcessedPage: lastProcessedPage,
            error: automationError,
            stats: stats || {}
        });
    } catch (error) {
        console.error('Error getting automation status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get automation status',
            error: error.message
        });
    }
});

/**
 * Stop the current automation (if possible)
 * Note: This is a simple implementation and may not stop immediately
 */
router.post('/stop', (req, res) => {
    if (!isAutomationRunning) {
        return res.status(400).json({
            success: false,
            message: 'No automation is currently running'
        });
    }

    // Set flag to stop - the automation will check this flag
    isAutomationRunning = false;

    res.status(200).json({
        success: true,
        message: 'Stop signal sent to automation process',
        startedAt: automationStartTime
    });
});

module.exports = router;