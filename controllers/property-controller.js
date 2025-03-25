
const axios = require('axios');
const PropertyRecord = require('../models/PropertyRecordSchema');
const { extractPropertyData } = require('../utils/extractPropertyData');


// exports.fetchPropertyData = async (req, res) => {
//     try {
//         const { districtCode, sroCode, propertyId, propNEWAddress, gaonCode1 } = req.body;

//         // Validate required fields
//         if (!districtCode || !sroCode || !gaonCode1) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing required fields: districtCode, sroCode, and gaonCode1 are mandatory"
//             });
//         }

//         // Generate a unique search key
//         const searchKey = `${districtCode}-${sroCode}-${propertyId || ''}-${propNEWAddress || '1'}-${gaonCode1}`;

//         // Check if we already have this data in the database and it's recent (within 24 hours)
//         const existingRecord = await PropertyRecord.findOne({ searchKey });
//         const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

//         if (existingRecord && existingRecord.updatedAt > oneDayAgo) {
//             return res.status(200).json({
//                 message: "Property data retrieved from database",
//                 totalRecords: existingRecord.recordCount,
//                 searchId: existingRecord._id,
//                 data: existingRecord,
//                 fromCache: true
//             });
//         }

//         // Prepare the form data for the external API request
//         const formData = new URLSearchParams();
//         formData.append('districtCode', districtCode.trim());
//         formData.append('sroCode', sroCode.trim());
//         formData.append('propertyId', (propertyId || '').trim());
//         formData.append('propNEWAddress', (propNEWAddress || '1').trim());
//         formData.append('gaonCode1', gaonCode1.trim());
//         formData.append('action:getPropertyDeedSearchDetail', 'सम्पत्ति विलेख विवरण(Property Deed)');

//         // External API URL
//         const url = "https://igrsup.gov.in/igrsup/newPropertySearchAction";

//         // Make the HTTP request to external API
//         console.log(`Making request to ${url} with parameters: ${formData.toString()}`);

//         const response = await axios.post(url, formData, {
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//                 'Origin': 'https://igrsup.gov.in',
//                 'Referer': 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
//                 'Cache-Control': 'no-cache',
//                 'Pragma': 'no-cache'
//             },
//             maxRedirects: 5,
//             timeout: 60000
//         });

//         if (response.status !== 200) {
//             console.error(`Error: API returned status code ${response.status}`);
//             return res.status(response.status).json({
//                 success: false,
//                 message: `External API returned status code ${response.status}`
//             });
//         }

//         // Get HTML content
//         const htmlContent = response.data;

//         const propertyRecords = extractPropertyData(htmlContent);
//         console.log("Data After Parse", propertyRecords.length, propertyRecords);

//         // Enhance property records with unique identifiers
//         const enhancedRecords = propertyRecords.map(record => {
//             let recordUniqueId = null;
//             if (record.details && record.details.regno && record.details.regyear) {
//                 recordUniqueId = `${record.details.dcode || districtCode}-${record.details.srocode || sroCode}-${record.details.regno}-${record.details.regyear}`;
//             }
//             return { ...record, recordUniqueId };
//         });

//         // Find or create a record with the given search parameters
//         let result = await PropertyRecord.findOneAndUpdate(
//             { searchKey },
//             {
//                 districtCode: districtCode.trim(),
//                 sroCode: sroCode.trim(),
//                 propertyId: (propertyId || '').trim(),
//                 propNEWAddress: (propNEWAddress || '1').trim(),
//                 gaonCode1: gaonCode1.trim(),
//                 searchKey,
//                 propertyRecords: enhancedRecords,
//                 recordCount: enhancedRecords.length,
//                 lastFetchedAt: new Date(),
//                 updatedAt: new Date()
//             },
//             {
//                 new: true,            // Return the updated document
//                 upsert: true,         // Create if not exists
//                 runValidators: true   // Ensure data meets schema requirements
//             }
//         );

//         // Return success response with data
//         return res.status(200).json({
//             success: true,
//             message: "Property data fetched and saved successfully",
//             totalRecords: enhancedRecords.length,
//             searchId: result._id,
//             data: result,
//             fromCache: false
//         });

//     } catch (error) {
//         console.error('Error fetching or saving property data:', error);

//         // Check if it's a MongoDB duplicate key error
//         if (error.name === 'MongoError' && error.code === 11000) {
//             return res.status(409).json({
//                 success: false,
//                 message: "This property record already exists in the database",
//                 error: "Duplicate entry"
//             });
//         }

//         return res.status(500).json({
//             success: false,
//             message: `An error occurred: ${error.message}`,
//             error: error.toString(),
//             stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         });
//     }
// };

// Get all property records with optional filtering

exports.fetchPropertyData = async (req, res) => {
    try {
        const { districtCode, sroCode, propertyId, propNEWAddress, gaonCode1 } = req.body;

        // Validate required fields
        if (!districtCode || !sroCode || !gaonCode1) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: districtCode, sroCode, and gaonCode1 are mandatory"
            });
        }

        // Generate a unique search key
        const searchKey = `${districtCode}-${sroCode}-${propertyId || ''}-${propNEWAddress || '1'}-${gaonCode1}`;

        // Check if we already have this data in the database and it's recent (within 24 hours)
        const existingRecord = await PropertyRecord.findOne({ searchKey });
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        if (existingRecord && existingRecord.updatedAt > oneDayAgo) {
            return res.status(200).json({
                message: "Property data retrieved from database",
                totalRecords: existingRecord.recordCount,
                searchId: existingRecord._id,
                data: existingRecord,
                fromCache: true
            });
        }

        // Prepare the form data for the external API request
        const formData = new URLSearchParams();
        formData.append('districtCode', districtCode.trim());
        formData.append('sroCode', sroCode.trim());
        formData.append('propertyId', (propertyId || '').trim());
        formData.append('propNEWAddress', (propNEWAddress || '1').trim());
        formData.append('gaonCode1', gaonCode1.trim());
        formData.append('action:getPropertyDeedSearchDetail', 'सम्पत्ति विलेख विवरण(Property Deed)');

        // External API URL
        const url = "https://igrsup.gov.in/igrsup/newPropertySearchAction";

        // Make the HTTP request to external API
        console.log(`Making request to ${url} with parameters: ${formData.toString()}`);

        const response = await axios.post(url, formData, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Origin': 'https://igrsup.gov.in',
                'Referer': 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            maxRedirects: 5,
        });

        if (response.status !== 200) {
            console.error(`Error: API returned status code ${response.status}`);
            return res.status(response.status).json({
                success: false,
                message: `External API returned status code ${response.status}`
            });
        }

        // Get HTML content
        const htmlContent = response.data;

        // Extract property data from HTML
        const propertyRecords = extractPropertyData(htmlContent);
        console.log("Data After Parse", propertyRecords.length, propertyRecords);

        // Ensure each record has all the necessary details fields populated
        const enhancedRecords = propertyRecords.map(record => {
            // Create a unique ID for each record
            let recordUniqueId = null;
            if (record.details && record.details.regno && record.details.regyear) {
                recordUniqueId = `${record.details.dcode || districtCode}-${record.details.srocode || sroCode}-${record.details.regno}-${record.details.regyear}`;
            }

            // Make sure all details are preserved
            const enhancedRecord = {
                ...record,
                recordUniqueId,
                details: {
                    ...record.details,
                    // Ensure these values are explicitly set
                    recieptNo: record.details.recieptNo || '',
                    pcode: record.details.pcode || '',
                    subDeedCode: record.details.subDeedCode || ''
                }
            };

            return enhancedRecord;
        });

        // Log enhanced records to verify all fields are present
        console.log("Enhanced records sample:",
            enhancedRecords.length > 0 ?
                JSON.stringify(enhancedRecords[0].details, null, 2) :
                "No records found");

        // Find or create a record with the given search parameters
        let result = await PropertyRecord.findOneAndUpdate(
            { searchKey },
            {
                districtCode: districtCode.trim(),
                sroCode: sroCode.trim(),
                propertyId: (propertyId || '').trim(),
                propNEWAddress: (propNEWAddress || '1').trim(),
                gaonCode1: gaonCode1.trim(),
                searchKey,
                propertyRecords: enhancedRecords,
                recordCount: enhancedRecords.length,
                lastFetchedAt: new Date(),
                updatedAt: new Date()
            },
            {
                new: true,            // Return the updated document
                upsert: true,         // Create if not exists
                runValidators: true   // Ensure data meets schema requirements
            }
        );

        // Return success response with data
        return res.status(200).json({
            success: true,
            message: "Property data fetched and saved successfully",
            totalRecords: enhancedRecords.length,
            searchId: result._id,
            data: result,
            fromCache: false
        });

    } catch (error) {
        console.error('Error fetching or saving property data:', error);

        // Check if it's a MongoDB duplicate key error
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This property record already exists in the database",
                error: "Duplicate entry"
            });
        }

        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
            error: error.toString(),
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};


exports.getPropertyRecords = async (req, res) => {
    try {
        const { districtCode, sroCode, gaonCode1, page = 1, limit = 10 } = req.query;
        console.log(req.query)

        // Build query object based on provided filters
        const query = {};
        if (districtCode) query.districtCode = districtCode;
        if (sroCode) query.sroCode = sroCode;
        if (gaonCode1) query.gaonCode1 = gaonCode1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination info
        const totalCount = await PropertyRecord.countDocuments(query);

        // Get records with pagination
        const records = await PropertyRecord.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        // Return paginated results with metadata
        return res.status(200).json({
            success: true,
            totalCount,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalCount / limit),
            data: records
        });

    } catch (error) {
        console.error('Error fetching property records:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};

// Get property record by ID
exports.getPropertyRecordById = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await PropertyRecord.findById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Property record not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: record
        });

    } catch (error) {
        console.error('Error fetching property record by ID:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};

// Get district-wise statistics
exports.getDistrictStatistics = async (req, res) => {
    try {
        const stats = await PropertyRecord.aggregate([
            {
                $group: {
                    _id: '$districtCode',
                    totalSearches: { $sum: 1 },
                    totalRecords: { $sum: '$recordCount' },
                    latestSearch: { $max: '$updatedAt' }
                }
            },
            {
                $sort: { totalRecords: -1 }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error getting district statistics:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};



/**
 * Get all unique SRO codes present in the database
 */
exports.getSroCodes = async (req, res) => {
    try {
        console.log(`Making request to getSroCodes :::: `);

        const sroCodes = await PropertyRecord.distinct('sroCode');

        return res.status(200).json({
            success: true,
            count: sroCodes.length,
            data: sroCodes
        });
    } catch (error) {
        console.error('Error fetching SRO codes:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};

/**
 * Get total number of property records in the database
 */
exports.getTotalRecords = async (req, res) => {
    try {
        // Count total documents in the PropertyRecord collection
        const totalSearches = await PropertyRecord.countDocuments();

        // Aggregate to sum all propertyRecords arrays
        const result = await PropertyRecord.aggregate([
            {
                $group: {
                    _id: null,
                    totalPropertyRecords: { $sum: '$recordCount' }
                }
            }
        ]);

        const totalPropertyRecords = result.length > 0 ? result[0].totalPropertyRecords : 0;

        return res.status(200).json({
            success: true,
            totalSearches,
            totalPropertyRecords
        });
    } catch (error) {
        console.error('Error fetching total records:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};

/**
 * Get summary statistics about the database
 */
exports.getDatabaseStats = async (req, res) => {
    try {
        // Get count of unique values for different fields
        const uniqueDistricts = await PropertyRecord.distinct('districtCode');
        const uniqueSroCodes = await PropertyRecord.distinct('sroCode');
        const uniqueGaonCodes = await PropertyRecord.distinct('gaonCode1');

        // Get total search records
        const totalSearches = await PropertyRecord.countDocuments();

        // Get sum of all property records
        const recordsResult = await PropertyRecord.aggregate([
            {
                $group: {
                    _id: null,
                    totalPropertyRecords: { $sum: '$recordCount' }
                }
            }
        ]);

        const totalPropertyRecords = recordsResult.length > 0 ? recordsResult[0].totalPropertyRecords : 0;

        // Get the latest updated record
        const latestRecord = await PropertyRecord.findOne()
            .sort({ updatedAt: -1 })
            .select('updatedAt');

        // Get top 5 districts by record count
        const topDistricts = await PropertyRecord.aggregate([
            {
                $group: {
                    _id: '$districtCode',
                    totalRecords: { $sum: '$recordCount' },
                    searchCount: { $sum: 1 }
                }
            },
            { $sort: { totalRecords: -1 } },
            { $limit: 5 }
        ]);

        return res.status(200).json({
            success: true,
            databaseStats: {
                uniqueDistrictsCount: uniqueDistricts.length,
                uniqueSroCodesCount: uniqueSroCodes.length,
                uniqueGaonCodesCount: uniqueGaonCodes.length,
                totalSearches,
                totalPropertyRecords,
                lastUpdated: latestRecord ? latestRecord.updatedAt : null,
                topDistricts
            }
        });
    } catch (error) {
        console.error('Error fetching database stats:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};

// exports.searchPropertyRecords = async (req, res) => {
//     try {
//         const {
//             districtCode,
//             sroCode,
//             gaonCode1,
//             partyName,
//             regNo,
//             year,
//             startDate,
//             endDate,
//             page = 1,
//             limit = 10
//         } = req.body;

//         console.log("reqbody", req.body)

//         // Build query object for the main PropertyRecord documents
//         const query = {};
//         if (districtCode) query.districtCode = districtCode;
//         if (sroCode) query.sroCode = sroCode;
//         if (gaonCode1) query.gaonCode1 = gaonCode1;

//         // Initialize pipeline for aggregation
//         const pipeline = [];

//         // Match stage based on the main document criteria
//         pipeline.push({ $match: query });

//         // Unwind the propertyRecords array for detailed filtering
//         pipeline.push({ $unwind: "$propertyRecords" });

//         // Build property records filtering criteria
//         const recordFilters = {};
//         if (regNo) recordFilters["propertyRecords.regNo"] = regNo;
//         if (year) recordFilters["propertyRecords.year"] = year;

//         // Date range filtering
//         if (startDate || endDate) {
//             recordFilters["propertyRecords.regDate"] = {};
//             if (startDate) {
//                 recordFilters["propertyRecords.regDate"]["$gte"] = startDate;
//             }
//             if (endDate) {
//                 recordFilters["propertyRecords.regDate"]["$lte"] = endDate;
//             }
//         }

//         // Text search in party names
//         if (partyName) {
//             recordFilters["propertyRecords.partyNames"] = {
//                 $elemMatch: { $regex: new RegExp(partyName, "i") }
//             };
//         }

//         // Add the property record filters to the pipeline if any exist
//         if (Object.keys(recordFilters).length > 0) {
//             pipeline.push({ $match: recordFilters });
//         }

//         // Count total results before pagination
//         const countPipeline = [...pipeline];
//         countPipeline.push({ $count: "total" });
//         const countResult = await PropertyRecord.aggregate(countPipeline);
//         const totalCount = countResult.length > 0 ? countResult[0].total : 0;

//         // Add pagination
//         pipeline.push({ $skip: (page - 1) * limit });
//         pipeline.push({ $limit: Number(limit) });

//         // Group results back by original document
//         pipeline.push({
//             $group: {
//                 _id: "$_id",
//                 districtCode: { $first: "$districtCode" },
//                 sroCode: { $first: "$sroCode" },
//                 gaonCode1: { $first: "$gaonCode1" },
//                 propertyId: { $first: "$propertyId" },
//                 propNEWAddress: { $first: "$propNEWAddress" },
//                 matchingRecords: { $push: "$propertyRecords" },
//                 createdAt: { $first: "$createdAt" },
//                 updatedAt: { $first: "$updatedAt" }
//             }
//         });

//         // Execute the final query
//         const records = await PropertyRecord.aggregate(pipeline);

//         // Return paginated results with metadata
//         return res.status(200).json({
//             success: true,
//             totalCount,
//             page: Number(page),
//             limit: Number(limit),
//             totalPages: Math.ceil(totalCount / limit),
//             data: records
//         });

//     } catch (error) {
//         console.error('Error searching property records:', error);
//         return res.status(500).json({
//             success: false,
//             message: `An error occurred: ${error.message}`
//         });
//     }
// };

exports.searchPropertyRecords = async (req, res) => {
    try {
        const {
            districtCode,
            sroCode,
            gaonCode1,
            partyName,
            regNo,
            year,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.body;

        console.log("reqbody", req.body)

        // Initialize pipeline for aggregation
        const pipeline = [];

        // Build query object for the main PropertyRecord documents
        const query = {};
        if (districtCode) query.districtCode = districtCode;
        if (sroCode) query.sroCode = sroCode;
        if (gaonCode1) query.gaonCode1 = gaonCode1;

        // If regNo is provided without other top-level filters, create a special pipeline
        if (regNo && Object.keys(query).length === 0) {
            // Direct search across all property records by regNo
            pipeline.push(
                { $unwind: "$propertyRecords" },
                { $match: { "propertyRecords.regNo": regNo } },
                // Reconstruct the document structure
                {
                    $group: {
                        _id: "$_id",
                        districtCode: { $first: "$districtCode" },
                        sroCode: { $first: "$sroCode" },
                        gaonCode1: { $first: "$gaonCode1" },
                        propertyId: { $first: "$propertyId" },
                        propNEWAddress: { $first: "$propNEWAddress" },
                        matchingRecords: { $push: "$propertyRecords" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" }
                    }
                }
            );
        } else {
            // Existing complex search logic
            // Match stage based on the main document criteria
            if (Object.keys(query).length > 0) {
                pipeline.push({ $match: query });
            }

            // Unwind the propertyRecords array for detailed filtering
            pipeline.push({ $unwind: "$propertyRecords" });

            // Build property records filtering criteria
            const recordFilters = {};
            if (regNo) recordFilters["propertyRecords.regNo"] = regNo;
            if (year) recordFilters["propertyRecords.year"] = year;

            // Date range filtering
            if (startDate || endDate) {
                recordFilters["propertyRecords.regDate"] = {};
                if (startDate) {
                    recordFilters["propertyRecords.regDate"]["$gte"] = startDate;
                }
                if (endDate) {
                    recordFilters["propertyRecords.regDate"]["$lte"] = endDate;
                }
            }

            // Text search in party names
            if (partyName) {
                recordFilters["propertyRecords.partyNames"] = {
                    $elemMatch: { $regex: new RegExp(partyName, "i") }
                };
            }

            // Add the property record filters to the pipeline if any exist
            if (Object.keys(recordFilters).length > 0) {
                pipeline.push({ $match: recordFilters });
            }
        }

        // Count total results before pagination
        const countPipeline = [...pipeline];
        countPipeline.push({ $count: "total" });
        const countResult = await PropertyRecord.aggregate(countPipeline);
        const totalCount = countResult.length > 0 ? countResult[0].total : 0;

        // Add pagination
        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: Number(limit) });

        // Group results back by original document if not already grouped
        if (!pipeline.some(stage => stage.$group)) {
            pipeline.push({
                $group: {
                    _id: "$_id",
                    districtCode: { $first: "$districtCode" },
                    sroCode: { $first: "$sroCode" },
                    gaonCode1: { $first: "$gaonCode1" },
                    propertyId: { $first: "$propertyId" },
                    propNEWAddress: { $first: "$propNEWAddress" },
                    matchingRecords: { $push: "$propertyRecords" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" }
                }
            });
        }

        // Execute the final query
        const records = await PropertyRecord.aggregate(pipeline);

        // Return paginated results with metadata
        return res.status(200).json({
            success: true,
            totalCount,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalCount / limit),
            data: records
        });

    } catch (error) {
        console.error('Error searching property records:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};


/**
 * Get property records count grouped by GaonCode
 */
exports.getPropertyRecordsByGaonCode = async (req, res) => {
    try {
        // Optional filtering by district or SRO code
        const { districtCode, sroCode } = req.query;

        // Build match stage for filtering
        const matchStage = {};
        if (districtCode) matchStage.districtCode = districtCode;
        if (sroCode) matchStage.sroCode = sroCode;

        // Build pipeline
        const pipeline = [];

        // Initial match on the parent document if filters are provided
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Group by gaonCode1
        pipeline.push({
            $group: {
                _id: "$gaonCode1",
                searchCount: { $sum: 1 },
                recordCount: { $sum: "$recordCount" },
                lastUpdated: { $max: "$updatedAt" }
            }
        });

        // Sort by record count descending
        pipeline.push({
            $sort: { recordCount: -1 }
        });

        // Execute the aggregation
        const results = await PropertyRecord.aggregate(pipeline);

        // Format the results
        const formattedResults = results.map(item => ({
            gaonCode: item._id,
            searchCount: item.searchCount,
            recordCount: item.recordCount,
            lastUpdated: item.lastUpdated
        }));

        return res.status(200).json({
            success: true,
            count: formattedResults.length,
            data: formattedResults
        });

    } catch (error) {
        console.error('Error fetching property records by GaonCode:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};


// /**
//  * Get party name suggestions as user types with improved matching
//  * @route GET /api/property-records/party-suggestions
//  */
// exports.getPartyNameSuggestions = async (req, res) => {
//     try {
//         console.log("req.query", req.query)
//         const { districtCode, query } = req.query;
//         console.log("req.query", req.query);

//         // Validate required fields
//         if (!districtCode) {
//             return res.status(400).json({
//                 success: false,
//                 message: "District code is required"
//             });
//         }

//         if (!query || query.length < 2) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Search query must be at least 2 characters"
//             });
//         }

//         // Prepare search terms - split by spaces to match partial names
//         const searchTerms = query.trim().split(/\s+/).filter(term => term.length >= 2);

//         if (searchTerms.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Search query must contain at least one term with 2 or more characters"
//             });
//         }

//         // Build regex conditions for more flexible matching
//         const regexConditions = searchTerms.map(term =>
//             new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
//         );

//         // Pipeline for aggregation
//         const pipeline = [
//             // Match records from the specified district
//             { $match: { districtCode } },

//             // Unwind the propertyRecords array to access individual records
//             { $unwind: "$propertyRecords" },

//             // Unwind the partyNames array to work with individual names
//             { $unwind: "$propertyRecords.partyNames" },

//             // Filter names that match ANY of the search terms
//             {
//                 $match: {
//                     "propertyRecords.partyNames": {
//                         $regex: regexConditions.map(regex => regex.source).join('|'),
//                         $options: 'i'
//                     }
//                 }
//             },

//             // Group by party name to avoid duplicates and calculate relevance score
//             {
//                 $group: {
//                     _id: "$propertyRecords.partyNames",
//                     count: { $sum: 1 },
//                     // Calculate a relevance score based on how many terms match
//                     relevanceScore: {
//                         $sum: {
//                             $cond: {
//                                 if: {
//                                     $and: regexConditions.map(regex => ({
//                                         $regexMatch: {
//                                             input: "$propertyRecords.partyNames",
//                                             regex: regex.source,
//                                             options: "i"
//                                         }
//                                     }))
//                                 },
//                                 then: regexConditions.length,  // All terms match
//                                 else: 1  // At least one term matches
//                             }
//                         }
//                     }
//                 }
//             },

//             // Sort by relevance score (higher first) and then by count
//             { $sort: { relevanceScore: -1, count: -1 } },

//             // Limit results to a reasonable number
//             // { $limit: 20 },

//             // Project to desired output format
//             {
//                 $project: {
//                     _id: 0,
//                     name: "$_id",
//                     count: 1,
//                     relevanceScore: 1
//                 }
//             }
//         ];

//         console.log("Executing aggregation pipeline for party name suggestions");
//         const suggestions = await PropertyRecord.aggregate(pipeline);
//         console.log(`Found ${suggestions.length} name suggestions`);

//         return res.status(200).json({
//             success: true,
//             count: suggestions.length,
//             data: suggestions
//         });

//     } catch (error) {
//         console.error('Error fetching party name suggestions:', error);
//         return res.status(500).json({
//             success: false,
//             message: `An error occurred: ${error.message}`
//         });
//     }
// };

// /**
//  * Get all property records for a specific party name in a district
//  * with improved matching for exact and partial matches
//  * @route GET /api/property-records/party-records
//  */
// exports.getRecordsByPartyName = async (req, res) => {
//     try {
//         const { districtCode, name, exactMatch = 'true', page = 1, limit = 10 } = req.query;

//         // Validate required fields
//         if (!districtCode || !name) {
//             return res.status(400).json({
//                 success: false,
//                 message: "District code and party name are required"
//             });
//         }

//         // Calculate pagination
//         const skip = (page - 1) * limit;

//         // Determine the matching condition based on exactMatch flag
//         let matchCondition;
//         if (exactMatch === 'true') {
//             // For exact match, find the exact string
//             matchCondition = { "propertyRecords.partyNames": name };
//         } else {
//             // For partial match, use regex
//             matchCondition = {
//                 "propertyRecords.partyNames": {
//                     $regex: name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
//                     $options: 'i'
//                 }
//             };
//         }

//         // Pipeline to get records where the party name appears
//         const pipeline = [
//             // Match records from the specified district
//             { $match: { districtCode } },

//             // Unwind the propertyRecords array to access individual records
//             { $unwind: "$propertyRecords" },

//             // Match records containing the party name (exact or partial)
//             { $match: matchCondition },

//             // Get total count before pagination (for metadata)
//             {
//                 $facet: {
//                     totalCount: [{ $count: "count" }],
//                     paginatedResults: [
//                         { $skip: skip },
//                         { $limit: Number(limit) },
//                         // Reshape the data for the response
//                         {
//                             $project: {
//                                 _id: 0,
//                                 searchInfo: {
//                                     districtCode: "$districtCode",
//                                     sroCode: "$sroCode",
//                                     gaonCode1: "$gaonCode1"
//                                 },
//                                 propertyRecord: "$propertyRecords"
//                             }
//                         }
//                     ]
//                 }
//             }
//         ];

//         const result = await PropertyRecord.aggregate(pipeline);

//         // Extract data from the facet result
//         const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
//         const records = result[0].paginatedResults;

//         // Return paginated results with metadata
//         return res.status(200).json({
//             success: true,
//             totalCount,
//             page: Number(page),
//             limit: Number(limit),
//             totalPages: Math.ceil(totalCount / limit),
//             data: records
//         });

//     } catch (error) {
//         console.error('Error fetching records by party name:', error);
//         return res.status(500).json({
//             success: false,
//             message: `An error occurred: ${error.message}`
//         });
//     }
// };



/**
 * Get party name suggestions with improved exact matching
 */
// exports.getPartyNameSuggestions = async (req, res) => {
//     try {
//         const { districtCode, query } = req.query;
//         console.log("req.query", req.query);

//         // Validate required fields
//         if (!districtCode || !query || query.length < 2) {
//             return res.status(400).json({
//                 success: false,
//                 message: "District code and query (minimum 2 chars) are required"
//             });
//         }

//         // Normalize the query - replace multiple spaces with a single space
//         const normalizedQuery = query.trim().replace(/\s+/g, ' ');
//         console.log(`Normalized query: "${normalizedQuery}"`);

//         // 1. Perform an initial search to find the EXACT name (if it exists)
//         const exactMatchPipeline = [
//             { $match: { districtCode } },
//             { $unwind: "$propertyRecords" },
//             { $unwind: "$propertyRecords.partyNames" },
//             {
//                 $match: {
//                     "$expr": {
//                         "$regexMatch": {
//                             "input": "$propertyRecords.partyNames",
//                             "regex": `^${normalizedQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`,
//                             "options": "i"
//                         }
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$propertyRecords.partyNames",
//                     count: { $sum: 1 }
//                 }
//             },
//             // Fixed: Use addFields instead of project with mixed inclusion/exclusion
//             {
//                 $addFields: {
//                     name: "$_id",
//                     exactMatch: true
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     name: 1,
//                     count: 1,
//                     exactMatch: 1
//                 }
//             }
//         ];

//         // 2. Also perform a search for names that contain the key terms (for partial matches)
//         const terms = normalizedQuery.split(/\s+/).filter(t => t.length >= 2);
//         const searchTerms = terms.length > 0 ? terms : [normalizedQuery];

//         const partialMatchPipeline = [
//             { $match: { districtCode } },
//             { $unwind: "$propertyRecords" },
//             { $unwind: "$propertyRecords.partyNames" },
//             {
//                 $match: {
//                     "propertyRecords.partyNames": {
//                         $regex: searchTerms.map(term =>
//                             term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'),
//                         $options: 'i'
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$propertyRecords.partyNames",
//                     count: { $sum: 1 }
//                 }
//             },
//             // Fixed: Use addFields instead of project with mixed inclusion/exclusion
//             {
//                 $addFields: {
//                     name: "$_id",
//                     exactMatch: false
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     name: 1,
//                     count: 1,
//                     exactMatch: 1
//                 }
//             }
//         ];

//         // Execute both pipelines
//         console.log("Searching for exact and partial matches...");
//         const exactMatches = await PropertyRecord.aggregate(exactMatchPipeline, { allowDiskUse: true });
//         const partialMatches = await PropertyRecord.aggregate(partialMatchPipeline, { allowDiskUse: true });

//         console.log(`Found ${exactMatches.length} exact matches and ${partialMatches.length} partial matches`);

//         // Combine results, prioritizing exact matches
//         // Use a Map to deduplicate while preserving exact match status
//         const resultMap = new Map();

//         // Add exact matches first
//         exactMatches.forEach(match => {
//             resultMap.set(match.name, match);
//         });

//         // Add partial matches if they don't already exist
//         partialMatches.forEach(match => {
//             if (!resultMap.has(match.name)) {
//                 resultMap.set(match.name, match);
//             }
//         });

//         // Convert map to array and sort
//         const combinedResults = Array.from(resultMap.values())
//             .sort((a, b) => {
//                 // First sort by exact match (true comes before false)
//                 if (a.exactMatch && !b.exactMatch) return -1;
//                 if (!a.exactMatch && b.exactMatch) return 1;
//                 // Then sort by count
//                 return b.count - a.count;
//             })
//             .slice(0, 20); // Limit to 20 results

//         return res.status(200).json({
//             success: true,
//             count: combinedResults.length,
//             data: combinedResults
//         });

//     } catch (error) {
//         console.error('Error fetching party name suggestions:', error);
//         return res.status(500).json({
//             success: false,
//             message: `An error occurred: ${error.message}`
//         });
//     }
// };

exports.getPartyNameSuggestions = async (req, res) => {
    try {
        const { districtCode, query } = req.query;
        console.log("req.query", req.query);

        // Validate required fields
        if (!districtCode || !query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: "District code and query (minimum 2 chars) are required"
            });
        }

        // Normalize the query - replace multiple spaces with a single space
        const normalizedQuery = query.trim().replace(/\s+/g, ' ');
        console.log(`Normalized query: "${normalizedQuery}"`);

        // 1. Perform an initial search to find the EXACT name (if it exists)
        const exactMatchPipeline = [
            { $match: { districtCode } },
            { $unwind: "$propertyRecords" },
            { $unwind: "$propertyRecords.partyNames" },
            {
                $match: {
                    "$expr": {
                        "$regexMatch": {
                            "input": "$propertyRecords.partyNames",
                            "regex": `^${normalizedQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`,
                            "options": "i"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$propertyRecords.partyNames",
                    count: { $sum: 1 },
                    // Store location info in arrays to collect all unique combinations
                    sroCodes: { $addToSet: "$sroCode" },
                    gaonCodes: { $addToSet: "$gaonCode1" },
                    // Track the first occurrence of each document to get complete location info
                    firstDocument: { $first: "$$ROOT" }
                }
            },
            {
                $addFields: {
                    name: "$_id",
                    exactMatch: true,
                    // Extract location data
                    sroCode: "$firstDocument.sroCode",
                    gaonCode1: "$firstDocument.gaonCode1"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    count: 1,
                    exactMatch: 1,
                    // Include location data
                    sroCode: 1,
                    gaonCode1: 1,
                    // Include arrays of all unique location codes for this name
                    sroCodes: 1,
                    gaonCodes: 1
                }
            }
        ];

        // 2. Also perform a search for names that contain the key terms (for partial matches)
        const terms = normalizedQuery.split(/\s+/).filter(t => t.length >= 2);
        const searchTerms = terms.length > 0 ? terms : [normalizedQuery];

        const partialMatchPipeline = [
            { $match: { districtCode } },
            { $unwind: "$propertyRecords" },
            { $unwind: "$propertyRecords.partyNames" },
            {
                $match: {
                    "propertyRecords.partyNames": {
                        $regex: searchTerms.map(term =>
                            term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'),
                        $options: 'i'
                    }
                }
            },
            {
                $group: {
                    _id: "$propertyRecords.partyNames",
                    count: { $sum: 1 },
                    // Store location info in arrays to collect all unique combinations
                    sroCodes: { $addToSet: "$sroCode" },
                    gaonCodes: { $addToSet: "$gaonCode1" },
                    // Track the first occurrence of each document to get complete location info
                    firstDocument: { $first: "$$ROOT" }
                }
            },
            {
                $addFields: {
                    name: "$_id",
                    exactMatch: false,
                    // Extract location data
                    sroCode: "$firstDocument.sroCode",
                    gaonCode1: "$firstDocument.gaonCode1"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    count: 1,
                    exactMatch: 1,
                    // Include location data
                    sroCode: 1,
                    gaonCode1: 1,
                    // Include arrays of all unique location codes for this name
                    sroCodes: 1,
                    gaonCodes: 1
                }
            }
        ];

        // Execute both pipelines
        console.log("Searching for exact and partial matches...");
        const exactMatches = await PropertyRecord.aggregate(exactMatchPipeline, { allowDiskUse: true });
        const partialMatches = await PropertyRecord.aggregate(partialMatchPipeline, { allowDiskUse: true });

        console.log(`Found ${exactMatches.length} exact matches and ${partialMatches.length} partial matches`);

        // Combine results, prioritizing exact matches
        // Use a Map to deduplicate while preserving exact match status
        const resultMap = new Map();

        // Add exact matches first
        exactMatches.forEach(match => {
            resultMap.set(match.name, match);
        });

        // Add partial matches if they don't already exist
        partialMatches.forEach(match => {
            if (!resultMap.has(match.name)) {
                resultMap.set(match.name, match);
            }
        });

        // Convert map to array and sort
        const combinedResults = Array.from(resultMap.values())
            .sort((a, b) => {
                // First sort by exact match (true comes before false)
                if (a.exactMatch && !b.exactMatch) return -1;
                if (!a.exactMatch && b.exactMatch) return 1;
                // Then sort by count
                return b.count - a.count;
            })
            .slice(0, 20); // Limit to 20 results

        return res.status(200).json({
            success: true,
            count: combinedResults.length,
            data: combinedResults
        });

    } catch (error) {
        console.error('Error fetching party name suggestions:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};

/**
 * Get all property records for a specific party name in a district
 * with improved matching for exact and partial matches
 * @route GET /api/property-records/party-records
 */
// exports.getRecordsByPartyName = async (req, res) => {
//     try {
//         const { districtCode, name, exactMatch = 'true', page = 1, limit = 10 } = req.query;

//         // Validate required fields
//         if (!districtCode || !name) {
//             return res.status(400).json({
//                 success: false,
//                 message: "District code and party name are required"
//             });
//         }

//         console.log(`Searching for records with name: "${name}", exactMatch: ${exactMatch}`);

//         // Calculate pagination
//         const skip = (page - 1) * limit;

//         // Determine the matching condition based on exactMatch flag
//         let matchCondition;

//         if (exactMatch === 'true') {
//             // For exact match, try both exact equality (more efficient) and regex with start/end anchors
//             // This provides better matching for names with special characters
//             const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

//             matchCondition = {
//                 $or: [
//                     // Direct equality match - most efficient
//                     { "propertyRecords.partyNames": name },

//                     // Regex with start/end anchors for exact pattern match
//                     // This helps with invisible characters or minor encoding issues
//                     {
//                         "propertyRecords.partyNames": {
//                             $regex: `^${escapedName}$`,
//                             $options: 'i'
//                         }
//                     }
//                 ]
//             };

//             // If the name is very long, log a performance warning
//             if (name.length > 30) {
//                 console.log(`Long name detected (${name.length} chars). Consider using partial matching for better performance.`);
//             }
//         } else {
//             // For partial match, extract key name parts for more efficient matching
//             const nameWords = name.match(/([^\s,]+)/g) || [];
//             const significantWords = nameWords
//                 .filter(word =>
//                     word.length >= 3 &&
//                     !['पुत्र', 'पत्नी', 'श्री', 'स्व०', 'स्व0', 'स्व.', 'के', 'द्वारा', 'उर्फ'].includes(word))
//                 .slice(0, 3);  // Limit to first 3 significant parts

//             if (significantWords.length > 0) {
//                 // Create a regex that matches any of the significant words
//                 const searchPattern = significantWords
//                     .map(word => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
//                     .join('|');

//                 matchCondition = {
//                     "propertyRecords.partyNames": {
//                         $regex: searchPattern,
//                         $options: 'i'
//                     }
//                 };

//                 console.log(`Using search pattern with significant words: ${significantWords.join(', ')}`);
//             } else {
//                 // Fallback to a simple partial match on the whole name
//                 matchCondition = {
//                     "propertyRecords.partyNames": {
//                         $regex: name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
//                         $options: 'i'
//                     }
//                 };
//             }
//         }

//         // Pipeline to get records where the party name appears
//         const pipeline = [
//             // Match records from the specified district first for better index use
//             { $match: { districtCode } },

//             // Unwind the propertyRecords array
//             { $unwind: "$propertyRecords" },

//             // Match records containing the party name using our optimized conditions
//             { $match: matchCondition },

//             // For partial matching, add a field to identify exact matches for better sorting
//             ...(exactMatch !== 'true' ? [{
//                 $addFields: {
//                     exactMatchScore: {
//                         $cond: {
//                             if: { $eq: ["$propertyRecords.partyNames", name] },
//                             then: 1,
//                             else: 0
//                         }
//                     }
//                 }
//             }] : []),

//             // Sort results to prioritize exact matches when doing partial search
//             ...(exactMatch !== 'true' ? [{ $sort: { exactMatchScore: -1 } }] : []),

//             // Get total count and paginated results in one pass
//             {
//                 $facet: {
//                     totalCount: [{ $count: "count" }],
//                     paginatedResults: [
//                         { $skip: skip },
//                         { $limit: Number(limit) },
//                         // Reshape the data for the response
//                         {
//                             $project: {
//                                 _id: 0,
//                                 searchInfo: {
//                                     districtCode: "$districtCode",
//                                     sroCode: "$sroCode",
//                                     gaonCode1: "$gaonCode1"
//                                 },
//                                 propertyRecord: "$propertyRecords",
//                                 exactMatchScore: exactMatch !== 'true' ? 1 : 0
//                             }
//                         }
//                     ]
//                 }
//             }
//         ];

//         console.log("Executing property records search with allowDiskUse=true");
//         // Use allowDiskUse option to prevent memory limit errors
//         const result = await PropertyRecord.aggregate(pipeline, { allowDiskUse: true });

//         // Extract data from the facet result
//         const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
//         const records = result[0].paginatedResults;

//         console.log(`Found ${totalCount} matching records`);

//         // Return paginated results with metadata
//         return res.status(200).json({
//             success: true,
//             totalCount,
//             page: Number(page),
//             limit: Number(limit),
//             totalPages: Math.ceil(totalCount / limit),
//             data: records
//         });

//     } catch (error) {
//         console.error('Error fetching records by party name:', error);
//         return res.status(500).json({
//             success: false,
//             message: `An error occurred: ${error.message}`
//         });
//     }
// };

/**
 * Get all property records for a specific party name in a district
 * with improved matching for exact and partial matches
 * @route GET /api/property-records/party-records
 */
// exports.getRecordsByPartyName = async (req, res) => {
//     try {
//         const {
//             districtCode,
//             name,
//             sroCode, // Added support for sroCode
//             gaonCode1, // Added support for gaonCode1
//             exactMatch = 'true',
//             page = 1,
//             limit = 10
//         } = req.query;

//         // Validate required fields
//         if (!districtCode || !name) {
//             return res.status(400).json({
//                 success: false,
//                 message: "District code and party name are required"
//             });
//         }

//         console.log(`Searching for records with name: "${name}", exactMatch: ${exactMatch}`);
//         console.log(`Location filters: districtCode=${districtCode}, sroCode=${sroCode || 'any'}, gaonCode1=${gaonCode1 || 'any'}`);

//         // Calculate pagination
//         const skip = (page - 1) * limit;

//         // Build the initial match condition for the district
//         const initialMatch = { districtCode };

//         // Add optional location filters if provided
//         if (sroCode) {
//             initialMatch.sroCode = sroCode;
//         }

//         if (gaonCode1) {
//             initialMatch.gaonCode1 = gaonCode1;
//         }

//         // Determine the party name matching condition based on exactMatch flag
//         let partyNameMatchCondition;

//         if (exactMatch === 'true') {
//             // For exact match, try both exact equality (more efficient) and regex with start/end anchors
//             // This provides better matching for names with special characters
//             const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

//             partyNameMatchCondition = {
//                 $or: [
//                     // Direct equality match - most efficient
//                     { "propertyRecords.partyNames": name },

//                     // Regex with start/end anchors for exact pattern match
//                     // This helps with invisible characters or minor encoding issues
//                     {
//                         "propertyRecords.partyNames": {
//                             $regex: `^${escapedName}$`,
//                             $options: 'i'
//                         }
//                     }
//                 ]
//             };

//             // If the name is very long, log a performance warning
//             if (name.length > 30) {
//                 console.log(`Long name detected (${name.length} chars). Consider using partial matching for better performance.`);
//             }
//         } else {
//             // For partial match, extract key name parts for more efficient matching
//             const nameWords = name.match(/([^\s,]+)/g) || [];
//             const significantWords = nameWords
//                 .filter(word =>
//                     word.length >= 3 &&
//                     !['पुत्र', 'पत्नी', 'श्री', 'स्व०', 'स्व0', 'स्व.', 'के', 'द्वारा', 'उर्फ'].includes(word))
//                 .slice(0, 3);  // Limit to first 3 significant parts

//             if (significantWords.length > 0) {
//                 // Create a regex that matches any of the significant words
//                 const searchPattern = significantWords
//                     .map(word => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
//                     .join('|');

//                 partyNameMatchCondition = {
//                     "propertyRecords.partyNames": {
//                         $regex: searchPattern,
//                         $options: 'i'
//                     }
//                 };

//                 console.log(`Using search pattern with significant words: ${significantWords.join(', ')}`);
//             } else {
//                 // Fallback to a simple partial match on the whole name
//                 partyNameMatchCondition = {
//                     "propertyRecords.partyNames": {
//                         $regex: name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
//                         $options: 'i'
//                     }
//                 };
//             }
//         }

//         // Pipeline to get records where the party name appears
//         const pipeline = [
//             // Match records from the specified district and optional location first for better index use
//             { $match: initialMatch },

//             // Unwind the propertyRecords array
//             { $unwind: "$propertyRecords" },

//             // Match records containing the party name using our optimized conditions
//             { $match: partyNameMatchCondition },

//             // For partial matching, add a field to identify exact matches for better sorting
//             ...(exactMatch !== 'true' ? [{
//                 $addFields: {
//                     exactMatchScore: {
//                         $cond: {
//                             if: { $eq: ["$propertyRecords.partyNames", name] },
//                             then: 1,
//                             else: 0
//                         }
//                     }
//                 }
//             }] : []),

//             // Sort results to prioritize exact matches when doing partial search
//             ...(exactMatch !== 'true' ? [{ $sort: { exactMatchScore: -1 } }] : []),

//             // Get total count and paginated results in one pass
//             {
//                 $facet: {
//                     totalCount: [{ $count: "count" }],
//                     paginatedResults: [
//                         { $skip: skip },
//                         { $limit: Number(limit) },
//                         // Reshape the data for the response
//                         {
//                             $project: {
//                                 _id: 0,
//                                 searchInfo: {
//                                     districtCode: "$districtCode",
//                                     sroCode: "$sroCode",
//                                     gaonCode1: "$gaonCode1"
//                                 },
//                                 propertyRecord: "$propertyRecords",
//                                 exactMatchScore: exactMatch !== 'true' ? "$exactMatchScore" : 1
//                             }
//                         }
//                     ]
//                 }
//             }
//         ];

//         console.log("Executing property records search with allowDiskUse=true");
//         // Use allowDiskUse option to prevent memory limit errors
//         const result = await PropertyRecord.aggregate(pipeline, { allowDiskUse: true });

//         // Extract data from the facet result
//         const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
//         const records = result[0].paginatedResults;

//         console.log(`Found ${totalCount} matching records`);

//         // Return paginated results with metadata
//         return res.status(200).json({
//             success: true,
//             totalCount,
//             page: Number(page),
//             limit: Number(limit),
//             totalPages: Math.ceil(totalCount / limit),
//             data: records
//         });

//     } catch (error) {
//         console.error('Error fetching records by party name:', error);
//         return res.status(500).json({
//             success: false,
//             message: `An error occurred: ${error.message}`
//         });
//     }
// };

/**
 * Get all property records for a specific party name across all locations in a district
 * @route GET /api/property-records/party-records
 */
exports.getRecordsByPartyName = async (req, res) => {
    try {
        const {
            districtCode,
            name,
            exactMatch = 'true',
            page = 1,
            limit = 10
        } = req.query;

        // Validate required fields
        if (!districtCode || !name) {
            return res.status(400).json({
                success: false,
                message: "District code and party name are required"
            });
        }

        console.log(`Searching for records with name: "${name}", exactMatch: ${exactMatch}`);

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Determine the party name matching condition based on exactMatch flag
        let partyNameMatchCondition;

        if (exactMatch === 'true') {
            // For exact match, try both exact equality and regex with start/end anchors
            const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

            partyNameMatchCondition = {
                $or: [
                    { "propertyRecords.partyNames": name },
                    {
                        "propertyRecords.partyNames": {
                            $regex: `^${escapedName}$`,
                            $options: 'i'
                        }
                    }
                ]
            };
        } else {
            // For partial match, extract key name parts
            const nameWords = name.match(/([^\s,]+)/g) || [];
            const significantWords = nameWords
                .filter(word =>
                    word.length >= 3 &&
                    !['पुत्र', 'पत्नी', 'श्री', 'स्व०', 'स्व0', 'स्व.', 'के', 'द्वारा', 'उर्फ'].includes(word))
                .slice(0, 3);

            if (significantWords.length > 0) {
                const searchPattern = significantWords
                    .map(word => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
                    .join('|');

                partyNameMatchCondition = {
                    "propertyRecords.partyNames": {
                        $regex: searchPattern,
                        $options: 'i'
                    }
                };
            } else {
                partyNameMatchCondition = {
                    "propertyRecords.partyNames": {
                        $regex: name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
                        $options: 'i'
                    }
                };
            }
        }

        // Pipeline to get records across all locations
        const pipeline = [
            // Match district first for best index utilization
            { $match: { districtCode } },

            // Unwind the propertyRecords array
            { $unwind: "$propertyRecords" },

            // Match records containing the party name
            { $match: partyNameMatchCondition },

            // Add fields for sorting
            {
                $addFields: {
                    exactMatchScore: {
                        $cond: {
                            if: { $eq: ["$propertyRecords.partyNames", name] },
                            then: 1,
                            else: 0
                        }
                    },
                    // Prepare a comprehensive location string for display
                    locationInfo: {
                        $concat: [
                            "District: ", "$districtCode",
                            ", SRO: ", { $ifNull: ["$sroCode", "N/A"] },
                            ", Gaon: ", { $ifNull: ["$gaonCode1", "N/A"] }
                        ]
                    }
                }
            },

            // Sort results to prioritize exact matches 
            { $sort: { exactMatchScore: -1, "propertyRecords.regDate": -1 } },

            // Get total count and paginated results
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    locations: [
                        {
                            $group: {
                                _id: {
                                    sroCode: "$sroCode",
                                    gaonCode1: "$gaonCode1"
                                },
                                count: { $sum: 1 }
                            }
                        },
                        { $project: { _id: 0, sroCode: "$_id.sroCode", gaonCode1: "$_id.gaonCode1", count: 1 } }
                    ],
                    paginatedResults: [
                        { $skip: skip },
                        { $limit: Number(limit) },
                        {
                            $project: {
                                _id: 0,
                                searchInfo: {
                                    districtCode: "$districtCode",
                                    sroCode: "$sroCode",
                                    gaonCode1: "$gaonCode1",
                                    locationInfo: "$locationInfo" // Include the formatted location string
                                },
                                propertyRecord: "$propertyRecords",
                                exactMatchScore: 1
                            }
                        }
                    ]
                }
            }
        ];

        // Execute query with disk use for large results
        const result = await PropertyRecord.aggregate(pipeline, { allowDiskUse: true });

        // Extract data from the facet result
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
        const records = result[0].paginatedResults;
        const locations = result[0].locations;

        console.log(`Found ${totalCount} matching records across ${locations.length} locations`);

        // Return paginated results with metadata
        return res.status(200).json({
            success: true,
            totalCount,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalCount / limit),
            locationCount: locations.length,
            locations,
            data: records
        });

    } catch (error) {
        console.error('Error fetching records by party name:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};

/**
 * Get all locations where a specific party name appears
 * @route GET /api/property-records/party-locations
 */
exports.getPartyNameLocations = async (req, res) => {
    try {
        const { districtCode, name } = req.query;

        // Validate required fields
        if (!districtCode || !name) {
            return res.status(400).json({
                success: false,
                message: "District code and party name are required"
            });
        }

        // Escape special characters in the name for regex
        const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        // Aggregate pipeline to find all unique locations for this name
        const pipeline = [
            // Match on district first for index use
            { $match: { districtCode } },

            // Unwind property records
            { $unwind: "$propertyRecords" },

            // Match records containing the party name
            {
                $match: {
                    "$or": [
                        // Exact match
                        { "propertyRecords.partyNames": name },
                        // Case insensitive match
                        {
                            "propertyRecords.partyNames": {
                                $regex: `^${escapedName}$`,
                                $options: 'i'
                            }
                        }
                    ]
                }
            },

            // Group by location
            {
                $group: {
                    _id: {
                        districtCode: "$districtCode",
                        sroCode: "$sroCode",
                        gaonCode1: "$gaonCode1"
                    },
                    recordCount: { $sum: 1 },
                    // Optional: Include sample property record for each location
                    sampleRecord: { $first: "$propertyRecords" }
                }
            },

            // Format output
            {
                $project: {
                    _id: 0,
                    districtCode: "$_id.districtCode",
                    sroCode: "$_id.sroCode",
                    gaonCode1: "$_id.gaonCode1",
                    recordCount: 1,
                    // Optional: Include sample property info
                    sampleInfo: {
                        deedType: "$sampleRecord.deedType",
                        regDate: "$sampleRecord.regDate"
                    }
                }
            },

            // Sort by record count (most common locations first)
            { $sort: { recordCount: -1 } }
        ];

        // Execute query
        const locations = await PropertyRecord.aggregate(pipeline, { allowDiskUse: true });

        // Return the results
        return res.status(200).json({
            success: true,
            count: locations.length,
            data: locations
        });

    } catch (error) {
        console.error('Error fetching party locations:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};
