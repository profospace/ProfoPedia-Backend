/**
 * Batch script to update floor information for all deeds
 * Only assigns floor values to apartment/flat properties, sets -1 for others
 * 
 * Usage: node update-floor.js [batchSize]
 */

const Deed = require('./models/deedSchema');

/**
 * Extract floor information from property description
 * @param {string} description - Property description
 * @param {string} landType - Type of land/property
 * @returns {number} - Floor number (0 for ground floor) or -1 for non-apartment properties
 */
const extractFloorFromDescription = (description, landType) => {
    if (!description) return -1;

    // First check if this is an apartment/flat type property
    const isApartment = /फ्लैट|flat|अपार्टमेन्ट|apartment/i.test(description);

    // If not an apartment/flat, return -1
    if (!isApartment) {
        return -1;
    }

    // Default: ground floor
    let floor = 0;

    // Check for Hindi floor indicators
    if (description.includes('प्रथमतल') || description.includes('प्रथम तल') || description.includes('पहला तल')) {
        floor = 1;
    } else if (description.includes('द्वितीयतल') || description.includes('द्वितीय तल') || description.includes('दूसरा तल')) {
        floor = 2;
    } else if (description.includes('तृतीयतल') || description.includes('तृतीय तल') || description.includes('तीसरा तल')) {
        floor = 3;
    } else if (description.includes('चतुर्थतल') || description.includes('चतुर्थ तल') || description.includes('चौथा तल')) {
        floor = 4;
    } else if (description.includes('पंचमतल') || description.includes('पंचम तल') || description.includes('पांचवां तल')) {
        floor = 5;
    } else if (description.includes('षष्ठतल') || description.includes('षष्ठ तल') || description.includes('छठा तल')) {
        floor = 6;
    } else if (description.includes('भूतल') || description.includes('ground floor')) {
        floor = 0;
    }

    // Check for English floor indicators
    if (description.match(/1st floor|first floor/i)) {
        floor = 1;
    } else if (description.match(/2nd floor|second floor/i)) {
        floor = 2;
    } else if (description.match(/3rd floor|third floor/i)) {
        floor = 3;
    } else if (description.match(/4th floor|fourth floor/i)) {
        floor = 4;
    } else if (description.match(/5th floor|fifth floor/i)) {
        floor = 5;
    } else if (description.match(/6th floor|sixth floor/i)) {
        floor = 6;
    } else if (description.match(/ground floor|g floor/i)) {
        floor = 0;
    }

    // Only for apartment/flat properties, try to extract floor from flat numbers
    const flatMatches = [
        description.match(/फ्लैट न[ंो][.०]* *(\d+)/),
        description.match(/flat no[.०]* *(\d+)/i),
        description.match(/फ्लैट (\d+)/),
        description.match(/flat (\d+)/i)
    ];

    for (const match of flatMatches) {
        if (match && match[1]) {
            const flatNumber = parseInt(match[1], 10);
            if (flatNumber > 100 && flatNumber < 1000) {
                // Typical flat numbering: first digit is floor number
                const extractedFloor = Math.floor(flatNumber / 100);
                if (extractedFloor >= 0 && extractedFloor <= 20) { // Reasonable floor range
                    floor = extractedFloor;
                    break;
                }
            }
        }
    }

    return floor;
};

/**
 * Process deeds in batches to reduce memory usage
 * @param {number} batchSize - Number of records to process at once
 */
async function updateFloorInformation(batchSize = 100) {
    try {
        console.log('Starting floor information update process...');

        // Get total count of deeds with property descriptions
        const totalDeeds = await Deed.countDocuments({
            propertyDescription: { $exists: true, $ne: '' }
        });

        console.log(`Found ${totalDeeds} deeds with property descriptions`);

        // Initialize counters
        const stats = {
            total: totalDeeds,
            processed: 0,
            updated: 0,
            errors: 0,
            floorDistribution: {},
            apartmentCount: 0,
            nonApartmentCount: 0
        };

        // Calculate number of batches
        const totalBatches = Math.ceil(totalDeeds / batchSize);

        // Process in batches
        for (let batch = 0; batch < totalBatches; batch++) {
            // Get a batch of deeds
            const deeds = await Deed.find({
                propertyDescription: { $exists: true, $ne: '' }
            })
                .skip(batch * batchSize)
                .limit(batchSize);

            console.log(`Processing batch ${batch + 1}/${totalBatches} (${deeds.length} deeds)`);

            // Update each deed in the batch
            for (const deed of deeds) {
                try {
                    stats.processed++;

                    // Extract floor from description with improved logic
                    const extractedFloor = extractFloorFromDescription(deed.propertyDescription, deed.landType);

                    // Update floor information
                    deed.floor = extractedFloor;
                    await deed.save();

                    // Update statistics
                    stats.updated++;

                    if (extractedFloor === -1) {
                        stats.nonApartmentCount++;
                    } else {
                        stats.apartmentCount++;
                        stats.floorDistribution[extractedFloor] = (stats.floorDistribution[extractedFloor] || 0) + 1;
                    }

                    // Progress indicator
                    if (stats.processed % 100 === 0 || stats.processed === stats.total) {
                        const percent = ((stats.processed / stats.total) * 100).toFixed(2);
                        console.log(`Progress: ${stats.processed}/${stats.total} (${percent}%)`);
                    }
                } catch (error) {
                    console.error(`Error updating deed ${deed._id}:`, error.message);
                    stats.errors++;
                }
            }
        }

        // Convert floor distribution to a more readable format
        const formattedDistribution = Object.entries(stats.floorDistribution)
            .map(([floor, count]) => ({
                floor: parseInt(floor, 10),
                floorLabel: getFloorLabel(parseInt(floor, 10)),
                count
            }))
            .sort((a, b) => a.floor - b.floor);

        // Print summary
        console.log('\nFloor Update Summary:');
        console.log(`Total deeds processed: ${stats.processed}`);
        console.log(`Successfully updated: ${stats.updated}`);
        console.log(`Errors: ${stats.errors}`);
        console.log(`\nProperty Classification:`);
        console.log(`Apartments/Flats: ${stats.apartmentCount} (${((stats.apartmentCount / stats.updated) * 100).toFixed(2)}%)`);
        console.log(`Non-Apartments: ${stats.nonApartmentCount} (${((stats.nonApartmentCount / stats.updated) * 100).toFixed(2)}%)`);

        console.log('\nFloor Distribution (Apartments Only):');
        formattedDistribution.forEach(item => {
            console.log(`  ${item.floorLabel}: ${item.count} properties`);
        });

        console.log('\nProcess completed!');
    } catch (error) {
        console.error('Error during floor update process:', error);
        throw error; // Re-throw to be caught by the caller
    }
}

// Helper function to get floor labels
const getFloorLabel = (floor) => {
    if (floor === -1) return 'Non-Apartment';
    if (floor === 0) return 'Ground Floor';
    if (floor === 1) return '1st Floor';
    if (floor === 2) return '2nd Floor';
    if (floor === 3) return '3rd Floor';
    return `${floor}th Floor`;
};

// Add command line argument support for batch size
const args = process.argv.slice(2);
let batchSize = 200; // Default batch size

if (args.length > 0) {
    const parsedBatchSize = parseInt(args[0], 10);
    if (!isNaN(parsedBatchSize) && parsedBatchSize > 0) {
        batchSize = parsedBatchSize;
        console.log(`Using custom batch size: ${batchSize}`);
    }
}

// Start the update process
console.log(`Starting floor update with batch size of ${batchSize}...`);
updateFloorInformation(batchSize)
    .then(() => {
        console.log('Script finished successfully.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Script failed with error:', err);
        process.exit(1);
    });