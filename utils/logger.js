const fs = require('fs');
const path = require('path');

// Simple logging utility to keep track of the API calls
class Logger {
    constructor() {
        this.logFile = path.join(__dirname, '../logger.txt');
        // Initialize log file if it doesn't exist
        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, '--- DEED FETCHING LOG ---\n', 'utf8');
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;

        // Append to log file
        fs.appendFileSync(this.logFile, logMessage, 'utf8');

        // Also log to console
        console.log(message);
    }

    error(message, error) {
        const timestamp = new Date().toISOString();
        const errorMessage = `[${timestamp}] ERROR: ${message} - ${error.message || error}\n`;

        // Append to log file
        fs.appendFileSync(this.logFile, errorMessage, 'utf8');

        // Also log to console
        console.error(message, error);
    }

    batchStart(batchNumber, totalBatches, batchSize) {
        this.log(`=== BATCH ${batchNumber}/${totalBatches} STARTED (Size: ${batchSize}) ===`);
    }

    batchComplete(batchNumber, totalBatches, success, failed, skipped = 0) {
        this.log(`=== BATCH ${batchNumber}/${totalBatches} COMPLETED ===`);
        this.log(`    Success: ${success}, Failed: ${failed}, Skipped: ${skipped}`);
    }
}

module.exports = new Logger();