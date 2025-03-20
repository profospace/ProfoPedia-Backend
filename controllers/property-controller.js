

const axios = require('axios');
const cheerio = require('cheerio');
const PropertyRecord = require('../models/PropertyRecordSchema');
const { extractPropertyData } = require('../utils/extractPropertyData');

// Fetch property data from external API and store in database
exports.fetchPropertyData = async (req, res) => {
    try {
        const { districtCode, sroCode, propertyId, propNEWAddress, gaonCode1 } = req.body;

        // Validate required fields
        if (!districtCode || !sroCode || !gaonCode1) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Prepare the form data for the external API request
        const formData = new URLSearchParams();
        formData.append('districtCode', districtCode);
        formData.append('sroCode', sroCode);
        formData.append('propertyId', propertyId || '');
        formData.append('propNEWAddress', propNEWAddress || '1');
        formData.append('gaonCode1', gaonCode1);
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
            // timeout: 60000
        });

        if (response.status !== 200) {
            console.error(`Error: API returned status code ${response.status}`);
            return res.status(response.status).json({
                message: `External API returned status code ${response.status}`
            });
        }

        // Get HTML content
        const htmlContent = response.data;

        const propertyRecords = extractPropertyData(htmlContent);
        console.log("Data After Parse", propertyRecords.length, propertyRecords);

        // Find or create a record with the given search parameters
        let result = await PropertyRecord.findOneAndUpdate(
            {
                districtCode,
                sroCode,
                propertyId: propertyId || '',
                propNEWAddress: propNEWAddress || '1',
                gaonCode1
            },
            {
                districtCode,
                sroCode,
                propertyId: propertyId || '',
                propNEWAddress: propNEWAddress || '1',
                gaonCode1,
                propertyRecords,
                recordCount: propertyRecords.length,
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
            message: "Property data fetched and saved successfully",
            totalRecords: propertyRecords.length,
            searchId: result._id,
            data: result
        });

    } catch (error) {
        console.error('Error fetching or saving property data:', error);
        return res.status(500).json({
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

        // Build query object for the main PropertyRecord documents
        const query = {};
        if (districtCode) query.districtCode = districtCode;
        if (sroCode) query.sroCode = sroCode;
        if (gaonCode1) query.gaonCode1 = gaonCode1;

        // Initialize pipeline for aggregation
        const pipeline = [];

        // Match stage based on the main document criteria
        pipeline.push({ $match: query });

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

        // Count total results before pagination
        const countPipeline = [...pipeline];
        countPipeline.push({ $count: "total" });
        const countResult = await PropertyRecord.aggregate(countPipeline);
        const totalCount = countResult.length > 0 ? countResult[0].total : 0;

        // Add pagination
        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: Number(limit) });

        // Group results back by original document
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