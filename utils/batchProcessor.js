// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const { base_url } = require('./base_url');

// // Configuration
// const API_URL = `${base_url}/api/deeds/processDeeds`;
// const STATS_URL = `${base_url}/api/deeds/processingStats`;
// const BATCH_SIZE = 10;
// const MAX_BATCHES = 100;  // Maximum number of batches to process in one run
// const DELAY_MS = 2000;    // Delay between batches in milliseconds

// // Create a log file
// const logFile = path.join(__dirname, 'automation-log.txt');
// fs.writeFileSync(logFile, `=== BATCH PROCESSING STARTED AT ${new Date().toISOString()} ===\n`, 'utf8');

// /**
//  * Log message to both console and file
//  */
// function log(message) {
//     const timestamp = new Date().toISOString();
//     const logMessage = `[${timestamp}] ${message}\n`;
//     console.log(message);
//     fs.appendFileSync(logFile, logMessage, 'utf8');
// }

// /**
//  * Delay function to pause between API calls
//  */
// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// /**
//  * Process a single batch
//  */
// async function processBatch(page) {
//     try {
//         log(`Processing batch ${page}...`);
//         const response = await axios.get(`${API_URL}?page=${page}&batchSize=${BATCH_SIZE}`);

//         if (response.data && response.data.success) {
//             const batchResults = response.data.batchResults;
//             log(`Batch ${page} processed. Success: ${batchResults.successCount}, Failed: ${batchResults.failedCount}`);
//             return {
//                 success: true,
//                 nextPage: batchResults.nextPage,
//                 stats: batchResults
//             };
//         } else {
//             log(`Batch ${page} processing failed: ${response.data.message || 'Unknown error'}`);
//             return { success: false, error: response.data.message };
//         }
//     } catch (error) {
//         log(`Error processing batch ${page}: ${error.message}`);
//         return { success: false, error: error.message };
//     }
// }

// /**
//  * Get processing statistics
//  */
// async function getProcessingStats() {
//     try {
//         const response = await axios.get(STATS_URL);
//         if (response.data && response.data.success) {
//             return response.data.stats;
//         }
//         return null;
//     } catch (error) {
//         log(`Error fetching statistics: ${error.message}`);
//         return null;
//     }
// }

// /**
//  * Main function to process all batches
//  */
// async function processAllBatches() {
//     let page = 0;
//     let hasMore = true;
//     let batchesProcessed = 0;

//     log('Starting batch processing of property deeds...');
//     log(`Batch size: ${BATCH_SIZE}`);
//     log(`API URL: ${API_URL}`);

//     // Process batches until no more or max reached
//     while (hasMore && batchesProcessed < MAX_BATCHES) {
//         const result = await processBatch(page);

//         if (!result.success) {
//             log('Stopping batch processing due to error.');
//             break;
//         }

//         batchesProcessed++;

//         if (result.nextPage === null) {
//             hasMore = false;
//             log('No more batches to process.');
//         } else {
//             page = result.nextPage;
//             log(`Next batch: ${page}`);
//             // Add delay between batches
//             await delay(DELAY_MS);
//         }
//     }

//     // Get final statistics
//     log('Batch processing completed.');
//     log(`Total batches processed: ${batchesProcessed}`);

//     const stats = await getProcessingStats();
//     if (stats) {
//         log('Final processing statistics:');
//         log(JSON.stringify(stats, null, 2));
//     }

//     log(`=== BATCH PROCESSING FINISHED AT ${new Date().toISOString()} ===`);
// }

// // Run as standalone script
// if (require.main === module) {
//     processAllBatches()
//         .catch(error => {
//             log(`Fatal error in batch processing: ${error.message}`);
//             process.exit(1);
//         });
// } else {
//     // Export for use as a module
//     module.exports = {
//         processAllBatches,
//         processBatch,
//         getProcessingStats
//     };
// }



const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { base_url } = require('./base_url');

// Configuration
const API_URL = `${base_url}/api/deeds/processDeeds`;
const STATS_URL = `${base_url}/api/deeds/processingStats`;
const BATCH_SIZE = 10;
const MAX_BATCHES = 100;  // Maximum number of batches to process in one run
const DELAY_MS = 2000;    // Delay between batches in milliseconds

// Create a log file
const logFile = path.join(__dirname, 'automation-log.txt');
fs.writeFileSync(logFile, `=== BATCH PROCESSING STARTED AT ${new Date().toISOString()} ===\n`, 'utf8');

/**
 * Log message to both console and file
 */
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(logFile, logMessage, 'utf8');
}

/**
 * Delay function to pause between API calls
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a single batch
 */
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

/**
 * Get processing statistics
 */
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

/**
 * Main function to process all batches
 * @param {number} startPage - Page to start processing from
 * @param {function} pageCallback - Callback function to update page tracking
 */
async function processAllBatches(startPage = 0, pageCallback = null) {
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
            log('Stopping batch processing due to error.');
            break;
        }

        batchesProcessed++;

        // Call the page callback if provided
        if (pageCallback && typeof pageCallback === 'function') {
            pageCallback(page);
        }

        if (result.nextPage === null) {
            hasMore = false;
            log('No more batches to process.');
        } else {
            page = result.nextPage;
            log(`Next batch: ${page}`);
            // Add delay between batches
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
    }

    log(`=== BATCH PROCESSING FINISHED AT ${new Date().toISOString()} ===`);
}

// Run as standalone script
if (require.main === module) {
    processAllBatches()
        .catch(error => {
            log(`Fatal error in batch processing: ${error.message}`);
            process.exit(1);
        });
} else {
    // Export for use as a module
    module.exports = {
        processAllBatches,
        processBatch,
        getProcessingStats
    };
}