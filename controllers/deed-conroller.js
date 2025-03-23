// const axios = require('axios');
// const PropertyRecord = require('../models/PropertyRecordSchema');
// const FailedDeed = require('../models/FailedDeedSchema');
// const logger = require('../utils/logger');
// const { base_url } = require('../utils/base_url');

// exports.fetchDeedsInBatches = async (req, res) => {
//     try {
//         const batchSize = parseInt(req.query.batchSize) || 10; // Default batch size 10
//         const startPage = parseInt(req.query.page) || 0; // For pagination

//         logger.log('Starting deed fetch operation in batches');

//         // Count total property records to determine number of batches
//         const totalRecords = await PropertyRecord.countDocuments();

//         if (totalRecords === 0) {
//             logger.log('No property records found in the database.');
//             return res.status(404).json({
//                 success: false,
//                 message: 'No property records found in the database.'
//             });
//         }

//         // Calculate total number of batches
//         const totalBatches = Math.ceil(totalRecords / batchSize);
//         logger.log(`Total records: ${totalRecords}, Batch size: ${batchSize}, Total batches: ${totalBatches}`);

//         // Process the current batch only (for controlled execution)
//         if (startPage >= totalBatches) {
//             logger.log(`Requested page ${startPage} exceeds total batches ${totalBatches}`);
//             return res.status(400).json({
//                 success: false,
//                 message: `Requested page ${startPage} exceeds total batches ${totalBatches}`
//             });
//         }

//         // Fetch current batch of property records
//         const skip = startPage * batchSize;
//         const propertyRecords = await PropertyRecord.find()
//             .skip(skip)
//             .limit(batchSize);

//         logger.batchStart(startPage + 1, totalBatches, propertyRecords.length);

//         let successCount = 0;
//         let failedCount = 0;

//         // Process each property record
//         const batchResults = await Promise.all(
//             propertyRecords.map(async (propertyRecord) => {
//                 try {
//                     if (!propertyRecord.propertyRecords || propertyRecord.propertyRecords.length === 0) {
//                         logger.log(`PropertyRecord ${propertyRecord._id} has no property records, skipping.`);
//                         return { success: false, recordId: propertyRecord._id, message: 'No property records' };
//                     }

//                     // Process each property record item
//                     const itemResults = await Promise.all(
//                         propertyRecord.propertyRecords.map(async (item) => {
//                             try {
//                                 if (!item.details || !item.details.dcode || !item.details.regno ||
//                                     !item.details.regyear || !item.details.srocode) {
//                                     logger.log(`Missing required details for record ${item._id || 'unknown'}, skipping.`);
//                                     return { success: false, itemId: item._id, message: 'Missing required details' };
//                                 }

//                                 // Prepare the request body for fetchPropertyDetail API
//                                 const requestBody = {
//                                     dcode: item.details.dcode,
//                                     regno: item.details.regno,
//                                     regyear: item.details.regyear,
//                                     regdate: item.details.regdate || '',
//                                     srocode: item.details.srocode,
//                                     recieptNo: item.details.recieptNo || '',
//                                     pcode: item.details.pcode || '',
//                                     propertyNum: item.details.propertyNum || '',
//                                     subDeedCode: item.details.subDeedCode || ''
//                                 };

//                                 logger.log(`Calling fetchPropertyDetail for record ${item.recordUniqueId || 'unknown'}`);

//                                 // Call the fetchPropertyDetail API
//                                 const response = await axios.post(
//                                     `${base_url}/deeds/property-records/fetch-detail`,
//                                     requestBody
//                                 );

//                                 // Check if deed data was successfully received
//                                 if (response.data && response.data.success) {
//                                     logger.log(`Successfully fetched deed for ${item.recordUniqueId || 'unknown'}`);
//                                     successCount++;
//                                     return { success: true, itemId: item._id };
//                                 } else {
//                                     // No deed data found, update deedPresent field to '0'
//                                     item.deedPresent = '0';

//                                     // Save the failed deed information
//                                     const failedDeed = new FailedDeed({
//                                         receiptNo: requestBody.recieptNo,
//                                         dcode: requestBody.dcode,
//                                         regno: requestBody.regno,
//                                         regyear: requestBody.regyear,
//                                         srocode: requestBody.srocode,
//                                         recordUniqueId: item.recordUniqueId,
//                                         errorMessage: 'No deed data found',
//                                         status: 'FAILED'
//                                     });

//                                     await failedDeed.save();

//                                     logger.log(`No deed data found for ${item.recordUniqueId || 'unknown'}, marked as deedPresent=0`);
//                                     failedCount++;
//                                     return { success: false, itemId: item._id, message: 'No deed data found' };
//                                 }
//                             } catch (error) {
//                                 // Handle errors during API call
//                                 item.deedPresent = '0';

//                                 // Save the failed deed information
//                                 const failedDeed = new FailedDeed({
//                                     receiptNo: item.details.recieptNo || '',
//                                     dcode: item.details.dcode || '',
//                                     regno: item.details.regno || '',
//                                     regyear: item.details.regyear || '',
//                                     srocode: item.details.srocode || '',
//                                     recordUniqueId: item.recordUniqueId || '',
//                                     errorMessage: error.message || 'API error',
//                                     status: 'ERROR'
//                                 });

//                                 await failedDeed.save();

//                                 logger.error(`Error fetching deed for ${item.recordUniqueId || 'unknown'}`, error);
//                                 failedCount++;
//                                 return { success: false, itemId: item._id, message: error.message };
//                             }
//                         })
//                     );

//                     // Save the updated property record with potential deedPresent=0 flags
//                     await propertyRecord.save();

//                     return { success: true, recordId: propertyRecord._id, items: itemResults };
//                 } catch (error) {
//                     logger.error(`Error processing property record ${propertyRecord._id}`, error);
//                     return { success: false, recordId: propertyRecord._id, message: error.message };
//                 }
//             })
//         );

//         logger.batchComplete(startPage + 1, totalBatches, successCount, failedCount);

//         // Return the results for this batch
//         return res.status(200).json({
//             success: true,
//             message: `Processed batch ${startPage + 1} of ${totalBatches}`,
//             batchResults: {
//                 page: startPage,
//                 batchSize,
//                 totalRecords,
//                 totalBatches,
//                 processedRecords: propertyRecords.length,
//                 successCount,
//                 failedCount,
//                 nextPage: startPage + 1 < totalBatches ? startPage + 1 : null
//             }
//         });
//     } catch (error) {
//         logger.error('Error in batch processing', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Failed to process deeds in batch',
//             error: error.message
//         });
//     }
// };

// // Endpoint to get stats about processing
// exports.getProcessingStats = async (req, res) => {
//     try {
//         const totalRecords = await PropertyRecord.countDocuments();
//         const totalProcessed = await PropertyRecord.countDocuments({
//             'propertyRecords.deedPresent': { $in: ['0', '1'] }
//         });
//         const successfulDeeds = await PropertyRecord.countDocuments({
//             'propertyRecords.deedPresent': '1'
//         });
//         const failedDeeds = await PropertyRecord.countDocuments({
//             'propertyRecords.deedPresent': '0'
//         });
//         const failedDeedsCount = await FailedDeed.countDocuments();

//         return res.status(200).json({
//             success: true,
//             stats: {
//                 totalRecords,
//                 totalProcessed,
//                 successfulDeeds,
//                 failedDeeds,
//                 failedDeedsCount,
//                 remainingToProcess: totalRecords - totalProcessed
//             }
//         });
//     } catch (error) {
//         logger.error('Error getting stats', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Failed to get processing stats',
//             error: error.message
//         });
//     }
// };

const axios = require('axios');
const PropertyRecord = require('../models/PropertyRecordSchema');
const FailedDeed = require('../models/FailedDeedSchema');
const Deed = require('../models/deedSchema');
const logger = require('../utils/logger');
const { base_url } = require('../utils/base_url');

// exports.fetchDeedsInBatches = async (req, res) => {
    
//     try {
//         const batchSize = parseInt(req.query.batchSize) || 10; // Default batch size 10
//         const startPage = parseInt(req.query.page) || 0; // For pagination

//         logger.log('Starting deed fetch operation in batches');

//         // Count total property records to determine number of batches
//         const totalRecords = await PropertyRecord.countDocuments();

//         if (totalRecords === 0) {
//             logger.log('No property records found in the database.');
//             return res.status(404).json({
//                 success: false,
//                 message: 'No property records found in the database.'
//             });
//         }

//         // Calculate total number of batches
//         const totalBatches = Math.ceil(totalRecords / batchSize);
//         logger.log(`Total records: ${totalRecords}, Batch size: ${batchSize}, Total batches: ${totalBatches}`);

//         // Process the current batch only (for controlled execution)
//         if (startPage >= totalBatches) {
//             logger.log(`Requested page ${startPage} exceeds total batches ${totalBatches}`);
//             return res.status(400).json({
//                 success: false,
//                 message: `Requested page ${startPage} exceeds total batches ${totalBatches}`
//             });
//         }

//         // Fetch current batch of property records
//         // Add a more sophisticated query to prioritize unprocessed records
//         const skip = startPage * batchSize;
//         const propertyRecords = await PropertyRecord.find({
//             // Find records where at least one property record doesn't have deedPresent set
//             // or where the propertyRecords array is empty (needs to be processed)
//             $or: [
//                 { 'propertyRecords.deedPresent': { $exists: false } },
//                 { propertyRecords: { $size: 0 } }
//             ]
//         })
//             .skip(skip)
//             .limit(batchSize);

//         logger.batchStart(startPage + 1, totalBatches, propertyRecords.length);

//         let successCount = 0;
//         let failedCount = 0;
//         let skippedCount = 0;

//         // Process each property record
//         const batchResults = await Promise.all(
//             propertyRecords.map(async (propertyRecord) => {
//                 try {
//                     if (!propertyRecord.propertyRecords || propertyRecord.propertyRecords.length === 0) {
//                         logger.log(`PropertyRecord ${propertyRecord._id} has no property records, skipping.`);
//                         return { success: false, recordId: propertyRecord._id, message: 'No property records' };
//                     }

//                     // Process each property record item
//                     const itemResults = await Promise.all(
//                         propertyRecord.propertyRecords.map(async (item) => {
//                             try {




//                                 // Skip if this item has already been processed (deedPresent is set)
//                                 // if (item.deedPresent === '2' || item.deedPresent === '2') {
//                                 //     logger.log(`Record ${item._id || 'unknown'} already processed (deedPresent=${item.deedPresent}), skipping.`);
//                                 //     skippedCount++;
//                                 //     return { success: true, itemId: item._id, skipped: true, message: 'Already processed' };
//                                 // }

//                                 if (!item.details || !item.details.dcode || !item.details.regno ||
//                                     !item.details.regyear || !item.details.srocode) {
//                                     logger.log(`Missing required details for record ${item._id || 'unknown'}, skipping.`);
//                                     return { success: false, itemId: item._id, message: 'Missing required details' };
//                                 }

//                                 // Prepare the request body for fetchPropertyDetail API
//                                 const requestBody = {
//                                     dcode: item.details.dcode,
//                                     regno: item.details.regno,
//                                     regyear: item.details.regyear,
//                                     regdate: item.details.regdate || '',
//                                     srocode: item.details.srocode,
//                                     recieptNo: item.details.recieptNo || '',
//                                     pcode: item.details.pcode || '',
//                                     propertyNum: item.details.propertyNum || '',
//                                     subDeedCode: item.details.subDeedCode || ''
//                                 };

//                                 logger.log(`Calling fetchPropertyDetail for record ${item.recordUniqueId || 'unknown'}`);

//                                 // Call the fetchPropertyDetail API
//                                 const response = await axios.post(
//                                     `${base_url}/deeds/property-records/fetch-detail`,
//                                     requestBody,
//                                     {
//                                         timeout: 30000 // 30 seconds instead of default
//                                     }
//                                 );

//                                 // Check if deed data was successfully received
//                                 if (response.data && response.data.success) {
//                                     logger.log(`Successfully fetched deed for ${item.recordUniqueId || 'unknown'}`);

//                                     // Mark the item as successfully processed
//                                     item.deedPresent = '1';

//                                     // Create a new deed document with the response data
//                                     const deed = new Deed({
//                                         // Base data from the request
//                                         dcode: requestBody.dcode,
//                                         regno: requestBody.regno,
//                                         regyear: requestBody.regyear,
//                                         regdate: requestBody.regdate || '',
//                                         srocode: requestBody.srocode,
//                                         recieptNo: requestBody.recieptNo || '',
//                                         pcode: requestBody.pcode || '',
//                                         propertyNum: requestBody.propertyNum || '',
//                                         subDeedCode: requestBody.subDeedCode || '',

//                                         // Data from the response
//                                         deedData: response.data.data || {},

//                                         // Metadata
//                                         recordUniqueId: item.recordUniqueId,
//                                         processedAt: new Date(),
//                                         source: 'batch-processing'
//                                     });

//                                     // Save the deed to the database
//                                     await deed.save();

//                                     successCount++;
//                                     return { success: true, itemId: item._id };
//                                 } else {
//                                     // No deed data found, update deedPresent field to '0'
//                                     item.deedPresent = '0';

//                                     // Save the failed deed information
//                                     const failedDeed = new FailedDeed({
//                                         receiptNo: requestBody.recieptNo,
//                                         dcode: requestBody.dcode,
//                                         regno: requestBody.regno,
//                                         regyear: requestBody.regyear,
//                                         srocode: requestBody.srocode,
//                                         recordUniqueId: item.recordUniqueId,
//                                         errorMessage: 'No deed data found',
//                                         status: 'FAILED'
//                                     });

//                                     await failedDeed.save();

//                                     logger.log(`No deed data found for ${item.recordUniqueId || 'unknown'}, marked as deedPresent=0`);
//                                     failedCount++;
//                                     return { success: false, itemId: item._id, message: 'No deed data found' };
//                                 }
//                             } catch (error) {
//                                 // Handle errors during API call
//                                 // item.deedPresent = '0';

//                                 // Save the failed deed information
//                                 const failedDeed = new FailedDeed({
//                                     receiptNo: item.details.recieptNo || '',
//                                     dcode: item.details.dcode || '',
//                                     regno: item.details.regno || '',
//                                     regyear: item.details.regyear || '',
//                                     srocode: item.details.srocode || '',
//                                     recordUniqueId: item.recordUniqueId || '',
//                                     errorMessage: error.message || 'API error',
//                                     status: 'ERROR'
//                                 });

//                                 await failedDeed.save();

//                                 logger.error(`Error fetching deed for ${item.recordUniqueId || 'unknown'}`, error);
//                                 failedCount++;
//                                 return { success: false, itemId: item._id, message: error.message };
//                             }
//                         })
//                     );

//                     // Save the updated property record with potential deedPresent=0 flags
//                     await propertyRecord.save();

//                     return { success: true, recordId: propertyRecord._id, items: itemResults };
//                 } catch (error) {
//                     logger.error(`Error processing property record ${propertyRecord._id}`, error);
//                     return { success: false, recordId: propertyRecord._id, message: error.message };
//                 }
//             })
//         );

//         logger.batchComplete(startPage + 1, totalBatches, successCount, failedCount, skippedCount);

//         // Return the results for this batch
//         return res.status(200).json({
//             success: true,
//             message: `Processed batch ${startPage + 1} of ${totalBatches}`,
//             batchResults: {
//                 page: startPage,
//                 batchSize,
//                 totalRecords,
//                 totalBatches,
//                 processedRecords: propertyRecords.length,
//                 successCount,
//                 failedCount,
//                 skippedCount,
//                 nextPage: startPage + 1 < totalBatches ? startPage + 1 : null
//             }
//         });
//     } catch (error) {
//         logger.error('Error in batch processing', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Failed to process deeds in batch',
//             error: error.message
//         });
//     }
// };

// Endpoint to get stats about processing
// Reset the processing state for all records or a subset


exports.fetchDeedsInBatches = async (req, res) => {
    try {
        const batchSize = parseInt(req.query.batchSize) || 10; // Default batch size 10
        const startPage = parseInt(req.query.page) || 0; // For pagination

        logger.log('Starting deed fetch operation in batches');

        // Count total property records to determine number of batches
        const totalRecords = await PropertyRecord.countDocuments();

        if (totalRecords === 0) {
            logger.log('No property records found in the database.');
            return res.status(404).json({
                success: false,
                message: 'No property records found in the database.'
            });
        }

        // Calculate total number of batches
        const totalBatches = Math.ceil(totalRecords / batchSize);
        logger.log(`Total records: ${totalRecords}, Batch size: ${batchSize}, Total batches: ${totalBatches}`);

        // Process the current batch only (for controlled execution)
        if (startPage >= totalBatches) {
            logger.log(`Requested page ${startPage} exceeds total batches ${totalBatches}`);
            return res.status(400).json({
                success: false,
                message: `Requested page ${startPage} exceeds total batches ${totalBatches}`
            });
        }

        // Fetch current batch of property records
        const skip = startPage * batchSize;
        const propertyRecords = await PropertyRecord.find()
            .skip(skip)
            .limit(batchSize);

        logger.batchStart(startPage + 1, totalBatches, propertyRecords.length);

        let successCount = 0;
        let failedCount = 0;

        // Process each property record
        const batchResults = await Promise.all(
            propertyRecords.map(async (propertyRecord) => {
                try {
                    if (!propertyRecord.propertyRecords || propertyRecord.propertyRecords.length === 0) {
                        logger.log(`PropertyRecord ${propertyRecord._id} has no property records, skipping.`);
                        return { success: false, recordId: propertyRecord._id, message: 'No property records' };
                    }

                    // Process each property record item
                    const itemResults = await Promise.all(
                        propertyRecord.propertyRecords.map(async (item) => {
                            try {
                                if (!item.details || !item.details.dcode || !item.details.regno ||
                                    !item.details.regyear || !item.details.srocode) {
                                    logger.log(`Missing required details for record ${item._id || 'unknown'}, skipping.`);
                                    return { success: false, itemId: item._id, message: 'Missing required details' };
                                }

                                // Prepare the request body for fetchPropertyDetail API
                                const requestBody = {
                                    dcode: item.details.dcode,
                                    regno: item.details.regno,
                                    regyear: item.details.regyear,
                                    regdate: item.details.regdate || '',
                                    srocode: item.details.srocode,
                                    recieptNo: item.details.recieptNo || '',
                                    pcode: item.details.pcode || '',
                                    propertyNum: item.details.propertyNum || '',
                                    subDeedCode: item.details.subDeedCode || ''
                                };

                                logger.log(`Calling fetchPropertyDetail for record ${item.recordUniqueId || 'unknown'}`);

                                // Call the fetchPropertyDetail API
                                const response = await axios.post(
                                    `${base_url}/deeds/property-records/fetch-detail`,
                                    requestBody
                                );

                                // Check if deed data was successfully received
                                if (response.data && response.data.success) {
                                    logger.log(`Successfully fetched deed for ${item.recordUniqueId || 'unknown'}`);
                                    successCount++;
                                    return { success: true, itemId: item._id };
                                } else {
                                    // No deed data found, update deedPresent field to '0'
                                    item.deedPresent = '0';

                                    // Save the failed deed information
                                    const failedDeed = new FailedDeed({
                                        receiptNo: requestBody.recieptNo,
                                        dcode: requestBody.dcode,
                                        regno: requestBody.regno,
                                        regyear: requestBody.regyear,
                                        srocode: requestBody.srocode,
                                        recordUniqueId: item.recordUniqueId,
                                        errorMessage: 'No deed data found',
                                        status: 'FAILED'
                                    });

                                    await failedDeed.save();

                                    logger.log(`No deed data found for ${item.recordUniqueId || 'unknown'}, marked as deedPresent=0`);
                                    failedCount++;
                                    return { success: false, itemId: item._id, message: 'No deed data found' };
                                }
                            } catch (error) {
                                // Handle errors during API call
                                item.deedPresent = '0';

                                // Save the failed deed information
                                const failedDeed = new FailedDeed({
                                    receiptNo: item.details.recieptNo || '',
                                    dcode: item.details.dcode || '',
                                    regno: item.details.regno || '',
                                    regyear: item.details.regyear || '',
                                    srocode: item.details.srocode || '',
                                    recordUniqueId: item.recordUniqueId || '',
                                    errorMessage: error.message || 'API error',
                                    status: 'ERROR'
                                });

                                await failedDeed.save();

                                logger.error(`Error fetching deed for ${item.recordUniqueId || 'unknown'}`, error);
                                failedCount++;
                                return { success: false, itemId: item._id, message: error.message };
                            }
                        })
                    );

                    // Save the updated property record with potential deedPresent=0 flags
                    await propertyRecord.save();

                    return { success: true, recordId: propertyRecord._id, items: itemResults };
                } catch (error) {
                    logger.error(`Error processing property record ${propertyRecord._id}`, error);
                    return { success: false, recordId: propertyRecord._id, message: error.message };
                }
            })
        );

        logger.batchComplete(startPage + 1, totalBatches, successCount, failedCount);

        // Return the results for this batch
        return res.status(200).json({
            success: true,
            message: `Processed batch ${startPage + 1} of ${totalBatches}`,
            batchResults: {
                page: startPage,
                batchSize,
                totalRecords,
                totalBatches,
                processedRecords: propertyRecords.length,
                successCount,
                failedCount,
                nextPage: startPage + 1 < totalBatches ? startPage + 1 : null
            }
        });
    } catch (error) {
        logger.error('Error in batch processing', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process deeds in batch',
            error: error.message
        });
    }
};

exports.resetProcessingState = async (req, res) => {
    try {
        const { type, status } = req.query;
        let filter = {};
        let update = {};

        // Determine what to reset based on query parameters
        if (type === 'all') {
            // Reset all records
            update = {
                $unset: { "propertyRecords.$[].deedPresent": "" }
            };
        } else if (type === 'status' && status) {
            // Reset only records with a specific status
            filter = {
                'propertyRecords.deedPresent': status
            };
            update = {
                $unset: { "propertyRecords.$[elem].deedPresent": "" }
            };

            // Use arrayFilters to only update elements matching the condition
            const options = {
                arrayFilters: [{ "elem.deedPresent": status }],
                multi: true
            };

            const result = await PropertyRecord.updateMany(filter, update, options);

            return res.status(200).json({
                success: true,
                message: `Reset processing state for records with status ${status}`,
                modifiedCount: result.modifiedCount,
                matchedCount: result.matchedCount
            });
        }

        // If resetting all, use a simpler approach
        if (Object.keys(filter).length === 0) {
            const result = await PropertyRecord.updateMany({}, update);

            return res.status(200).json({
                success: true,
                message: 'Reset processing state for all records',
                modifiedCount: result.modifiedCount,
                matchedCount: result.matchedCount
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Invalid reset parameters'
        });
    } catch (error) {
        logger.error('Error resetting processing state', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reset processing state',
            error: error.message
        });
    }
};

exports.getProcessingStats = async (req, res) => {
    try {
        // Get total document count
        const totalRecords = await PropertyRecord.countDocuments();

        // Get detailed property record counts
        const recordStats = await PropertyRecord.aggregate([
            // Unwind the propertyRecords array to count by deedPresent value
            { $unwind: { path: "$propertyRecords", preserveNullAndEmptyArrays: true } },
            // Group by deedPresent value
            {
                $group: {
                    _id: "$propertyRecords.deedPresent",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Process the aggregation results
        let successfulDeeds = 0;
        let failedDeeds = 0;
        let notProcessedDeeds = 0;

        recordStats.forEach(stat => {
            if (stat._id === '1') {
                successfulDeeds = stat.count;
            } else if (stat._id === '0') {
                failedDeeds = stat.count;
            } else if (stat._id === null || stat._id === undefined) {
                notProcessedDeeds = stat.count;
            }
        });

        const totalProcessed = successfulDeeds + failedDeeds;
        const failedDeedsCount = await FailedDeed.countDocuments();

        // Count property records with at least one processed item
        const recordsWithAtLeastOneProcessed = await PropertyRecord.countDocuments({
            'propertyRecords.deedPresent': { $in: ['0', '1'] }
        });

        return res.status(200).json({
            success: true,
            stats: {
                totalRecords,
                totalPropertyItems: totalProcessed + notProcessedDeeds,
                totalProcessed,
                successfulDeeds,
                failedDeeds,
                notProcessedDeeds,
                recordsWithAtLeastOneProcessed,
                failedDeedsCount,
                remainingToProcess: notProcessedDeeds
            }
        });
    } catch (error) {
        logger.error('Error getting stats', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get processing stats',
            error: error.message
        });
    }
};

