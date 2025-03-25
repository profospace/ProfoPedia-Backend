// Automated Village Data Scraping Script
// This script will iterate through all districts and their SRO offices
// to automatically scrape and save village data

// Queue to manage district and SRO scraping tasks
class ScrapingQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.currentTask = null;
    }

    addTask(districtCode, districtName, sroCode = null, sroName = null) {
        this.queue.push({
            districtCode,
            districtName,
            sroCode,
            sroName,
            status: 'queued',
            timestamp: new Date()
        });

        this.logToConsole(`Added task: District ${districtName} (${districtCode})${sroCode ? `, SRO ${sroName} (${sroCode})` : ''}`);

        // Start processing if not already running
        if (!this.isProcessing) {
            this.processNext();
        }
    }

    async processNext() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            this.logToConsole('✅ All scraping tasks completed!', 'success');
            return;
        }

        this.isProcessing = true;
        this.currentTask = this.queue.shift();
        this.currentTask.status = 'processing';

        try {
            // If we have an SRO code, scrape villages for this district+SRO combination
            if (this.currentTask.sroCode) {
                this.logToConsole(
                    `⏳ Scraping villages for District ${this.currentTask.districtName} (${this.currentTask.districtCode}), SRO ${this.currentTask.sroName} (${this.currentTask.sroCode})...`,
                    'info'
                );

                // Call API to scrape villages
                const response = await fetch(`village/api/scrape-villages?districtCode=${this.currentTask.districtCode}&sroCode=${this.currentTask.sroCode}`);
                const data = await response.json();

                if (data.success) {
                    this.currentTask.status = 'completed';
                    this.logToConsole(
                        `✅ Completed: District ${this.currentTask.districtName} (${this.currentTask.districtCode}), SRO ${this.currentTask.sroName} (${this.currentTask.sroCode}) - Processed ${data.villages.length} villages (Added: ${data.stats.upserted}, Updated: ${data.stats.modified})`,
                        'success'
                    );
                } else {
                    this.currentTask.status = 'failed';
                    this.logToConsole(
                        `❌ Failed: District ${this.currentTask.districtName} (${this.currentTask.districtCode}), SRO ${this.currentTask.sroName} (${this.currentTask.sroCode}) - ${data.message}`,
                        'error'
                    );
                }
            }
            // If we only have a district code, fetch all SRO offices and queue them
            else {
                this.logToConsole(
                    `🔍 Fetching SRO offices for District ${this.currentTask.districtName} (${this.currentTask.districtCode})...`,
                    'info'
                );

                // Call API to get SRO offices
                const response = await fetch(`village/api/sro-offices?districtCode=${this.currentTask.districtCode}`);
                const data = await response.json();

                if (data.success && data.sroOffices.length > 0) {
                    this.currentTask.status = 'completed';
                    this.logToConsole(
                        `✅ Found ${data.sroOffices.length} SRO offices for District ${this.currentTask.districtName} (${this.currentTask.districtCode})`,
                        'success'
                    );

                    // Add each SRO office to the queue
                    data.sroOffices.forEach(sro => {
                        this.addTask(this.currentTask.districtCode, this.currentTask.districtName, sro.code, sro.name);
                    });
                } else {
                    this.currentTask.status = 'failed';
                    this.logToConsole(
                        `❌ Failed to fetch SRO offices for District ${this.currentTask.districtName} (${this.currentTask.districtCode})`,
                        'error'
                    );
                }
            }
        } catch (error) {
            this.currentTask.status = 'failed';
            this.logToConsole(
                `❌ Error: ${error.message}`,
                'error'
            );
        }

        // Process next task after a short delay (to avoid overwhelming the server)
        setTimeout(() => this.processNext(), 2000);
    }

    logToConsole(message, level = 'info') {
        const consolePanel = document.getElementById('consolePanel');
        const timestamp = new Date().toLocaleTimeString();

        const entry = document.createElement('div');
        entry.className = `console-entry console-${level}`;
        entry.innerHTML = `<span class="console-timestamp">[${timestamp}]</span> ${message}`;

        consolePanel.appendChild(entry);

        // Auto-scroll to bottom
        consolePanel.scrollTop = consolePanel.scrollHeight;

        // Also update summary statistics
        this.updateStats();
    }

    updateStats() {
        const completed = document.getElementById('tasksCompleted');
        const queued = document.getElementById('tasksQueued');
        const failed = document.getElementById('tasksFailed');

        const stats = {
            completed: 0,
            queued: this.queue.length,
            failed: 0
        };

        // Count completed and failed tasks
        document.querySelectorAll('.console-entry').forEach(entry => {
            if (entry.classList.contains('console-success') && entry.textContent.includes('Completed:')) {
                stats.completed++;
            } else if (entry.classList.contains('console-error') && entry.textContent.includes('Failed:')) {
                stats.failed++;
            }
        });

        completed.textContent = stats.completed;
        queued.textContent = stats.queued;
        failed.textContent = stats.failed;
    }

    pause() {
        if (this.isProcessing) {
            this.isProcessing = false;
            this.queue.unshift(this.currentTask);
            this.currentTask = null;
            this.logToConsole('⏸️ Scraping paused', 'warning');
        }
    }

    resume() {
        if (!this.isProcessing && this.queue.length > 0) {
            this.logToConsole('▶️ Scraping resumed', 'info');
            this.processNext();
        }
    }

    clear() {
        this.queue = [];
        this.logToConsole('🗑️ Queue cleared', 'warning');
        this.updateStats();
    }
}

// Global scraping queue instance
const scrapingQueue = new ScrapingQueue();

// Function to start scraping for all districts
function startAutomatedScraping() {
    // Get all district options
    const districtSelect = document.getElementById('districtCode');
    const options = Array.from(districtSelect.options);

    // Skip the first "Select District" option
    options.slice(1).forEach(option => {
        scrapingQueue.addTask(option.value, option.textContent);
    });

    // Update UI buttons
    document.getElementById('startAutomationBtn').disabled = true;
    document.getElementById('pauseAutomationBtn').disabled = false;
    document.getElementById('resumeAutomationBtn').disabled = true;
    document.getElementById('clearQueueBtn').disabled = false;
}

// Initialize automation control event listeners
function initializeAutomationControls() {
    document.getElementById('startAutomationBtn').addEventListener('click', startAutomatedScraping);

    document.getElementById('pauseAutomationBtn').addEventListener('click', () => {
        scrapingQueue.pause();
        document.getElementById('pauseAutomationBtn').disabled = true;
        document.getElementById('resumeAutomationBtn').disabled = false;
    });

    document.getElementById('resumeAutomationBtn').addEventListener('click', () => {
        scrapingQueue.resume();
        document.getElementById('pauseAutomationBtn').disabled = false;
        document.getElementById('resumeAutomationBtn').disabled = true;
    });

    document.getElementById('clearQueueBtn').addEventListener('click', () => {
        scrapingQueue.clear();
        document.getElementById('startAutomationBtn').disabled = false;
        document.getElementById('pauseAutomationBtn').disabled = true;
        document.getElementById('resumeAutomationBtn').disabled = true;
        document.getElementById('clearQueueBtn').disabled = true;
    });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeAutomationControls();
});