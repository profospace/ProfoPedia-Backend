const cheerio = require('cheerio');
const axios = require('axios');

/**
 * Parse deed HTML and extract structured data
 * @param {string} html - HTML content of the deed document
 * @returns {Object} - Structured deed data
 */
function parseDeedHtml(html) {
    const $ = cheerio.load(html);

    // Extract basic document information
    const deedType = $('#lbldeedname').text().trim();
    const year = $('#lblyr').text().trim();
    const documentNumber = $('#lblregno').text().trim();
    const volumeNumber = $('#lblbinderno').text().trim();

    // Extract property location
    const district = $('#lbldistrict').text().trim();
    const subRegistrar = $('#lblsro').text().trim();
    const ward = $('#lblward').text().trim();
    const locality = $('#lblgram').text().trim();

    // Extract property details
    const landType = $('#lblland').text().trim();
    const khasraNumber = $('#lblkhasrano').text().trim();
    const propertyDescription = $('#lblpropdesc').text().trim();
    const unitType = $('#lblunit').text().trim();
    const area = parseFloatWithDefault($('#lblarea').text().trim());
    const ownershipShare = parseFloatWithDefault($('#lblareafrac1').text().trim());
    const soldShare = parseFloatWithDefault($('#lblareafrac2').text().trim());

    // Extract financial details
    const marketValue = parseIntWithDefault($('#lblmktvalue').text().trim());
    const transactionValue = parseIntWithDefault($('#lbltransvalue').text().trim());
    const stampDuty = parseIntWithDefault($('#lblstampduty').text().trim());

    // Extract dates
    const executionDate = $('#lblexedate').text().trim();
    const registrationDate = $('#lblregdate').text().trim();

    // Extract party information
    const parties = extractParties($);

    // Compile the extracted data
    return {
        // Document Info
        deedType,
        year,
        documentNumber,
        volumeNumber,

        // Property Location
        district,
        subRegistrar,
        ward,
        locality,

        // Property Details
        landType,
        khasraNumber,
        propertyDescription,
        unitType,
        area,
        ownershipShare,
        soldShare,

        // Financial Details
        marketValue,
        transactionValue,
        stampDuty,

        // Dates
        executionDate,
        registrationDate,

        // Parties
        ...parties
    };
}

/**
 * Parse a number string, returning a default value if parsing fails
 * @param {string} str - Number string to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} - Parsed integer or default value
 */
function parseIntWithDefault(str, defaultValue = 0) {
    // Remove non-numeric characters
    const cleaned = str.replace(/[^\d]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse a float string, returning a default value if parsing fails
 * @param {string} str - Float string to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} - Parsed float or default value
 */
function parseFloatWithDefault(str, defaultValue = 0) {
    // Replace comma with dot and remove other non-numeric characters except decimal point
    const cleaned = str.replace(',', '.').replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Extract party information from the deed HTML
 * @param {CheerioStatic} $ - Cheerio instance loaded with HTML
 * @returns {Object} - Object containing first party, second party, and witnesses
 */
function extractParties($) {
    const firstParty = [];
    const secondParty = [];
    const witnesses = [];

    let currentParty = null;
    let partyType = null;

    // Process the tables containing party information
    $('#first tr').each((index, element) => {
        const text = $(element).text().trim();

        // Check for party type headers
        if (text.includes('प्रथम पक्ष')) {
            partyType = 'firstParty';
            return; // Skip header row
        } else if (text.includes('द्वितीय पक्ष')) {
            partyType = 'secondParty';
            return; // Skip header row
        } else if (text.includes('गवाह')) {
            partyType = 'witnesses';
            return; // Skip header row
        }

        // Skip if no party type identified or separator row
        if (!partyType || $(element).find('td').length < 2) {
            return;
        }

        // Check the first cell to identify the type of information
        const label = $(element).find('td').first().text().trim();
        const value = $(element).find('td').eq(1).text().trim();

        if (label.includes('नाम')) {
            // Start a new party
            currentParty = { name: value, parentName: '', address: '' };
        } else if (label.includes('पिता/माता/पति का नाम') && currentParty) {
            currentParty.parentName = value;
        } else if (label.includes('पता') && currentParty) {
            currentParty.address = value;

            // Add the completed party to the appropriate array
            if (partyType === 'firstParty') {
                firstParty.push({ ...currentParty });
            } else if (partyType === 'secondParty') {
                secondParty.push({ ...currentParty });
            } else if (partyType === 'witnesses') {
                witnesses.push({ ...currentParty });
            }

            currentParty = null;
        }
    });

    return { firstParty, secondParty, witnesses };
}

/**
 * Make an API call to save deed data to MongoDB
 * @param {Object} deedData - Parsed deed data
 * @param {string} apiUrl - URL of the API endpoint
 * @returns {Promise<Object>} - API response
 */
async function saveDeedToMongoDB(deedData, apiUrl) {
    try {
        const response = await axios.post(apiUrl, deedData);
        return response.data;
    } catch (error) {
        console.error('Error saving deed to MongoDB:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Process a deed HTML file and save to MongoDB
 * @param {string} html - HTML content of the deed document
 * @param {string} apiUrl - URL of the API endpoint
 * @returns {Promise<Object>} - Processed deed data and API response
 */
async function processAndSaveDeed(html, apiUrl) {
    // Parse the HTML
    const deedData = parseDeedHtml(html);

    // Save to MongoDB via API
    const saveResult = await saveDeedToMongoDB(deedData, apiUrl);

    return {
        parsed: deedData,
        saveResult
    };
}

module.exports = {
    parseDeedHtml,
    saveDeedToMongoDB,
    processAndSaveDeed
};