const axios = require('axios');
const PropertyDetail = require('../models/PropertyDetailSchema');
const { parsePropertyDetailHtml } = require('../utils/extractPropertyData');
const { parseDeedHtml } = require('../utils/deedParser');

/**
 * Fetch property details from external API and store in database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.fetchPropertyDetail = async (req, res) => {
    try {
        const {
            dcode,
            regno,
            regyear,
            regdate,
            srocode,
            recieptNo,
            pcode,
            propertyNum,
            subDeedCode,
            propertyId
        } = req.body;

        // Validate required fields
        if (!dcode || !regno || !regyear || !srocode) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: dcode, regno, regyear, and srocode are mandatory"
            });
        }

        // Generate a unique ID for this detail record
        const detailUniqueId = `${dcode}-${srocode}-${regno}-${regyear}`;

        // Check if we already have this data in the database
        const existingRecord = await PropertyDetail.findOne({ detailUniqueId });

        if (existingRecord) {
            console.log(`Property detail retrieved from database for: ${detailUniqueId}`);
            return res.status(200).json({
                success: true,
                message: "Property detail retrieved from database",
                data: existingRecord,
                fromCache: true
            });
        }

        // Prepare form data for external API request
        const formData = new URLSearchParams();
        formData.append('dcode', dcode);
        formData.append('regno', regno);
        formData.append('regyear', regyear);
        formData.append('regdate', regdate || '');
        formData.append('srocode', srocode);
        formData.append('recieptNo', recieptNo || '');
        formData.append('pcode', pcode || '');
        formData.append('propertyNum', propertyNum || '');
        formData.append('subDeedCode', subDeedCode || '');

        // Log request parameters
        console.log(`Making request to https://igrsup.gov.in/igrsup/propertySearchViewDetail with parameters: ${formData.toString()}`);

        // Make the HTTP request to external API
        const response = await axios.post('https://igrsup.gov.in/igrsup/propertySearchViewDetail', formData, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Origin': 'https://igrsup.gov.in',
                'Referer': 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
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

        // Check if we received actual HTML content
        if (!htmlContent || htmlContent.length < 100) {
            console.error('Received empty or very short HTML content');
            return res.status(500).json({
                success: false,
                message: 'Received invalid or empty response from external API'
            });
        }

        // Parse HTML to extract structured data
        const parsedData = parseDeedHtml(htmlContent);

        // Log the parsed data for debugging
        console.log('Parsed data from HTML:', JSON.stringify(parsedData, null, 2));

        // Check if we have at least some basic data
        if (parsedData.error || !parsedData.documentType) {
            console.warn('Parser extracted minimal or no data from HTML');

            // Try to save the raw HTML so we can debug later
            const debugRecord = new PropertyDetail({
                propertyId: propertyId || detailUniqueId,
                detailUniqueId,
                registrationDetails: {
                    dcode,
                    regno,
                    regyear,
                    regdate: regdate || '',
                    srocode,
                    recieptNo: recieptNo || '',
                    pcode: pcode || '',
                    propertyNum: propertyNum || '',
                    subDeedCode: subDeedCode || ''
                },
                parsedData: {},
                rawHtml: htmlContent
            });

            await debugRecord.save();

            console.log('Saved HTML for debugging with ID:', debugRecord._id);

            return res.status(200).json({
                success: true,
                message: "Property detail fetched but couldn't be fully parsed. Raw HTML stored for analysis.",
                data: {
                    _id: debugRecord._id,
                    propertyId: debugRecord.propertyId,
                    detailUniqueId: debugRecord.detailUniqueId,
                    registrationDetails: debugRecord.registrationDetails,
                    needsReview: true
                },
                fromCache: false,
                parsingFailed: true
            });
        }

        // Create and save the new property detail record
        const propertyDetail = new PropertyDetail({
            propertyId: propertyId || detailUniqueId, // Use provided ID or generate one
            detailUniqueId,
            registrationDetails: {
                dcode,
                regno,
                regyear,
                regdate: regdate || '',
                srocode,
                recieptNo: recieptNo || '',
                pcode: pcode || '',
                propertyNum: propertyNum || '',
                subDeedCode: subDeedCode || ''
            },
            parsedData,
            rawHtml: process.env.NODE_ENV === 'development' ? htmlContent : undefined // Only store HTML in development
        });

        await propertyDetail.save();
        console.log(`Saved new property detail with ID: ${propertyDetail._id}`);

        // Return success response with data
        return res.status(200).json({
            success: true,
            message: "Property detail fetched and saved successfully",
            data: propertyDetail,
            fromCache: false
        });

    } catch (error) {
        console.error('Error fetching or saving property detail:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
            error: error.toString(),
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Get property detail by ID from database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPropertyDetailById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: id"
            });
        }

        // Try to find by MongoDB _id first
        let propertyDetail = await PropertyDetail.findById(id);

        // If not found, try finding by detailUniqueId
        if (!propertyDetail) {
            propertyDetail = await PropertyDetail.findOne({ detailUniqueId: id });
        }

        // If still not found, try finding by propertyId
        if (!propertyDetail) {
            propertyDetail = await PropertyDetail.findOne({ propertyId: id });
        }

        if (!propertyDetail) {
            return res.status(404).json({
                success: false,
                message: "Property detail not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: propertyDetail
        });

    } catch (error) {
        console.error('Error fetching property detail:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};

/**
 * Utility method to parse HTML content for debugging
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.parseHtmlContent = async (req, res) => {
    try {
        const { html } = req.body;

        if (!html) {
            return res.status(400).json({
                success: false,
                message: "HTML content is required"
            });
        }

        const parsedData = parsePropertyDetailHtml(html);

        return res.status(200).json({
            success: true,
            data: parsedData
        });
    } catch (error) {
        console.error('Error parsing HTML content:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};

/**
 * Reprocess property detail from stored raw HTML
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.reprocessPropertyDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: id"
            });
        }

        // Find the property detail record by ID
        const propertyDetail = await PropertyDetail.findById(id).select('+rawHtml');

        if (!propertyDetail) {
            return res.status(404).json({
                success: false,
                message: "Property detail not found"
            });
        }

        // Check if rawHtml is available
        if (!propertyDetail.rawHtml) {
            return res.status(400).json({
                success: false,
                message: "Raw HTML not available for reprocessing"
            });
        }

        // Parse the raw HTML to extract structured data
        const parsedData = parsePropertyDetailHtml(propertyDetail.rawHtml);

        // Check if parsing was successful
        if (parsedData.error || !parsedData.documentType) {
            return res.status(500).json({
                success: false,
                message: "Failed to parse HTML content",
                error: parsedData.error,
                errorMessage: parsedData.errorMessage
            });
        }

        // Update the property detail record
        propertyDetail.parsedData = parsedData;
        propertyDetail.updatedAt = new Date();

        // Save the updated record
        await propertyDetail.save();

        return res.status(200).json({
            success: true,
            message: "Property detail reprocessed successfully",
            data: propertyDetail
        });

    } catch (error) {
        console.error('Error reprocessing property detail:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
            error: error.toString(),
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Get records that need manual review (parsing failed or incomplete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRecordsNeedingReview = async (req, res) => {
    try {
        // Find records with empty or minimal parsed data
        const records = await PropertyDetail.find({
            $or: [
                { 'parsedData.documentType': { $exists: false } },
                { 'parsedData.documentType': '' },
                { 'parsedData.documentType': null }
            ]
        }).select('-rawHtml').limit(50);

        return res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });

    } catch (error) {
        console.error('Error fetching records needing review:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};

/**
 * Delete a property detail record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deletePropertyDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: id"
            });
        }

        // Find and delete the property detail record
        const result = await PropertyDetail.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Property detail not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Property detail deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting property detail:', error);
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};