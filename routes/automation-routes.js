// routes/automation-routes.js - Modified version
const express = require('express');
const router = express.Router();
const { processAllBatches, getProcessingStats } = require('../utils/batchProcessor');
const ProcessingLog = require('../models/processingLogSchema');

// Keep track of automation state
let isAutomationRunning = false;
let automationStartTime = null;
let automationError = null;

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

        // Get starting page from request or from last log
        let startPage = 0;

        if (req.body.startPage !== undefined) {
            startPage = parseInt(req.body.startPage);
        } else {
            // Check for last processed page in the logs
            const lastLog = await ProcessingLog.findOne(
                { processName: 'deed-processing' }
            ).sort({ createdAt: -1 });

            if (lastLog && lastLog.lastProcessedPage >= 0) {
                startPage = lastLog.lastProcessedPage + 1;
            }
        }

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
        const updatePageTracker = async (page) => {
            // Update in the memory variable for API status check
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
        // Get latest processing log
        const lastLog = await ProcessingLog.findOne(
            { processName: 'deed-processing' }
        ).sort({ createdAt: -1 });

        // Get latest processing stats
        const stats = await getProcessingStats();

        // Determine status from both in-memory state and log
        let currentStatus = {
            isRunning: isAutomationRunning,
            startedAt: automationStartTime,
            lastProcessedPage: lastLog ? lastLog.lastProcessedPage : -1,
            error: automationError,
            stats: stats || {}
        };

        // If we have log data, enhance the status info
        if (lastLog) {
            currentStatus.logInfo = {
                status: lastLog.status,
                startTime: lastLog.startTime,
                endTime: lastLog.endTime,
                totalPages: lastLog.totalPages,
                lastError: lastLog.error
            };
        }

        res.status(200).json({
            success: true,
            ...currentStatus
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
 * Stop the current automation
 */
router.post('/stop', async (req, res) => {
    if (!isAutomationRunning) {
        return res.status(400).json({
            success: false,
            message: 'No automation is currently running'
        });
    }

    try {
        // Set flag to stop - the automation will check this flag
        isAutomationRunning = false;

        // Update the processing log to show stopped status
        await ProcessingLog.findOneAndUpdate(
            { processName: 'deed-processing', status: 'running' },
            {
                status: 'stopped',
                endTime: new Date()
            }
        );

        res.status(200).json({
            success: true,
            message: 'Stop signal sent to automation process',
            startedAt: automationStartTime
        });
    } catch (error) {
        console.error('Error stopping automation:', error);
        res.status(500).json({
            success: false,
            message: 'Error occurred while stopping automation',
            error: error.message
        });
    }
});

/**
 * Get processing log history
 */
router.get('/logs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const logs = await ProcessingLog.find()
            .sort({ startTime: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await ProcessingLog.countDocuments();

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch processing logs',
            error: error.message
        });
    }
});

module.exports = router;