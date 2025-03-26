// utils/batchProcessor.js - Modified version of your existing code
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { base_url } = require('./base_url');
const ProcessingLog = require('../models/processingLogSchema');

// Configuration
const API_URL = `${base_url}/api/deeds/processDeeds`;
const STATS_URL = `${base_url}/api/deeds/processingStats`;
const BATCH_SIZE = 10;
const MAX_BATCHES = 100;
const DELAY_MS = 2000;

// Log file setup
const logFile = path.join(__dirname, 'automation-log.txt');

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(logFile, logMessage, 'utf8');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processBatch(page) {
    try {
        log(`Processing batch ${page}...`);
        const response = await axios.get(`${API_URL}?page=${page}&batchSize=${BATCH_SIZE}`);

        if (response.data && response.data.success) {
            const batchResults = response.data.batchResults;
            log(`Batch ${page} processed. Success: ${batchResults.successCount}, Failed: ${batchResults.failedCount}`);
            return {
                success: true,
                nextPage: batchResults.nextPage,
                stats: batchResults
            };
        } else {
            log(`Batch ${page} processing failed: ${response.data.message || 'Unknown error'}`);
            return { success: false, error: response.data.message };
        }
    } catch (error) {
        log(`Error processing batch ${page}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function getProcessingStats() {
    try {
        const response = await axios.get(STATS_URL);
        if (response.data && response.data.success) {
            return response.data.stats;
        }
        return null;
    } catch (error) {
        log(`Error fetching statistics: ${error.message}`);
        return null;
    }
}

async function processAllBatches(startPage = 0, pageCallback = null) {
    // Create or update processing log
    const processName = 'deed-processing';
    let processingLog;

    try {
        // Initialize log file
        fs.writeFileSync(logFile, `=== BATCH PROCESSING STARTED AT ${new Date().toISOString()} ===\n`, 'utf8');

        // Create or get existing log
        processingLog = await ProcessingLog.findOneAndUpdate(
            { processName },
            {
                startTime: new Date(),
                lastProcessedPage: startPage,
                status: 'running',
                error: null
            },
            { upsert: true, new: true }
        );

        let page = startPage;
        let hasMore = true;
        let batchesProcessed = 0;

        log('Starting batch processing of property deeds...');
        log(`Batch size: ${BATCH_SIZE}`);
        log(`Starting from page: ${startPage}`);
        log(`API URL: ${API_URL}`);

        // Process batches until no more or max reached
        while (hasMore && batchesProcessed < MAX_BATCHES) {
            const result = await processBatch(page);

            if (!result.success) {
                // Update log with failure
                await ProcessingLog.findOneAndUpdate(
                    { processName },
                    {
                        status: 'failed',
                        endTime: new Date(),
                        error: result.error || 'Unknown error'
                    }
                );

                log('Stopping batch processing due to error.');
                break;
            }

            batchesProcessed++;

            // Update the processing log with current page
            await ProcessingLog.findOneAndUpdate(
                { processName },
                { lastProcessedPage: page }
            );

            // Call the page callback if provided
            if (pageCallback && typeof pageCallback === 'function') {
                pageCallback(page);
            }

            if (result.nextPage === null) {
                hasMore = false;
                log('No more batches to process.');

                // Mark as completed in log
                await ProcessingLog.findOneAndUpdate(
                    { processName },
                    {
                        status: 'completed',
                        endTime: new Date()
                    }
                );
            } else {
                page = result.nextPage;
                log(`Next batch: ${page}`);
                await delay(DELAY_MS);
            }
        }

        // Get final statistics
        log('Batch processing completed.');
        log(`Total batches processed: ${batchesProcessed}`);

        const stats = await getProcessingStats();
        if (stats) {
            log('Final processing statistics:');
            log(JSON.stringify(stats, null, 2));

            // Update log with final stats
            await ProcessingLog.findOneAndUpdate(
                { processName },
                {
                    metadata: { stats },
                    totalPages: stats.totalPages || batchesProcessed
                }
            );
        }

        log(`=== BATCH PROCESSING FINISHED AT ${new Date().toISOString()} ===`);
        return { success: true };
    } catch (error) {
        log(`Fatal error in batch processing: ${error.message}`);

        // Update log with error
        if (processingLog) {
            await ProcessingLog.findOneAndUpdate(
                { processName },
                {
                    status: 'failed',
                    endTime: new Date(),
                    error: error.message
                }
            );
        }

        throw error;
    }
}

// Run as standalone script
if (require.main === module) {
    (async () => {
        try {
            // Check for previous unfinished run
            const previousLog = await ProcessingLog.findOne(
                { processName: 'deed-processing', status: { $nin: ['completed', 'stopped'] } }
            ).sort({ startTime: -1 });

            let startPage = 0;
            if (previousLog && previousLog.lastProcessedPage > 0) {
                // Resume from next page after the last processed
                startPage = previousLog.lastProcessedPage + 1;
                log(`Resuming from page ${startPage} based on previous run`);
            }

            await processAllBatches(startPage);

        } catch (error) {
            log(`Fatal error in batch processing: ${error.message}`);
            process.exit(1);
        }
    })();
} else {
    // Export for use as a module
    module.exports = {
        processAllBatches,
        processBatch,
        getProcessingStats
    };
}