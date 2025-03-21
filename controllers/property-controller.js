const axios = require('axios');
const cheerio = require('cheerio');
const PropertyRecord = require('../models/PropertyRecordSchema');
const { extractPropertyData } = require('../utils/extractPropertyData');

// Fetch property data from external API and store in database
// exports.fetchPropertyData = async (req, res) => {
//     try {
//         const { districtCode, sroCode, propertyId, propNEWAddress, gaonCode1 } = req.body;

//         // Validate required fields
//         if (!districtCode || !sroCode || !gaonCode1) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         // Prepare the form data for the external API request
//         const formData = new URLSearchParams();
//         formData.append('districtCode', districtCode);
//         formData.append('sroCode', sroCode);
//         formData.append('propertyId', propertyId || '');
//         formData.append('propNEWAddress', propNEWAddress || '1');
//         formData.append('gaonCode1', gaonCode1);
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
//             // timeout: 60000
//         });

//         if (response.status !== 200) {
//             console.error(`Error: API returned status code ${response.status}`);
//             return res.status(response.status).json({
//                 message: `External API returned status code ${response.status}`
//             });
//         }

//         // Get HTML content
//         const htmlContent = response.data;

//         const propertyRecords = extractPropertyData(htmlContent);
//         console.log("Data After Parse", propertyRecords.length, propertyRecords);

//         // Find or create a record with the given search parameters
//         let result = await PropertyRecord.findOneAndUpdate(
//             {
//                 districtCode,
//                 sroCode,
//                 propertyId: propertyId || '',
//                 propNEWAddress: propNEWAddress || '1',
//                 gaonCode1
//             },
//             {
//                 districtCode,
//                 sroCode,
//                 propertyId: propertyId || '',
//                 propNEWAddress: propNEWAddress || '1',
//                 gaonCode1,
//                 propertyRecords,
//                 recordCount: propertyRecords.length,
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
//             message: "Property data fetched and saved successfully",
//             totalRecords: propertyRecords.length,
//             searchId: result._id,
//             data: result
//         });

//     } catch (error) {
//         console.error('Error fetching or saving property data:', error);
//         return res.status(500).json({
//             message: `An error occurred: ${error.message}`,
//             error: error.toString(),
//             stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         });
//     }
// };

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
            timeout: 60000
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

        const propertyRecords = extractPropertyData(htmlContent);
        console.log("Data After Parse", propertyRecords.length, propertyRecords);

        // Enhance property records with unique identifiers
        const enhancedRecords = propertyRecords.map(record => {
            let recordUniqueId = null;
            if (record.details && record.details.regno && record.details.regyear) {
                recordUniqueId = `${record.details.dcode || districtCode}-${record.details.srocode || sroCode}-${record.details.regno}-${record.details.regyear}`;
            }
            return { ...record, recordUniqueId };
        });

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

// Get all property records with optional filtering
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