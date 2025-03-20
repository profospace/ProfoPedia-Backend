// PropertyDataService.js
// This service handles the parsing and data processing of property registration data

/**
 * Extracts property data from HTML content
 * @param {string} html - Raw HTML content
 * @returns {Array} Array of parsed property objects
 */
export const extractPropertyData = (html) => {
    const properties = [];

    // Match each property row with a comprehensive regex pattern
    const regex = /<tr style="border: thin solid #000000">[\s\S]*?<td\s+class="celltext"\s+style\s*=\s*"text-align: center\s*">(\d+)<\/td>[\s\S]*?<td\s+class="celltext"\s+style\s*=\s*"text-align: center\s*">(\d+)<\/td>[\s\S]*?<td\s+class="celltext"\s+style\s*=\s*"text-align: center\s*">(\d+)<\/td>[\s\S]*?<td class="celltext" style\s*=\s*"text-align: left\s*">([\s\S]*?)<\/td>[\s\S]*?<td class="celltext" style\s*=\s*"text-align: left\s*">([\s\S]*?)<\/td>[\s\S]*?<span id="Repeater1_ctl01_lblregno">([\s\S]*?)<\/span>[\s\S]*?<td\s+class="celltext"\s+style\s*=\s*"text-align: left\s*">([\s\S]*?)<\/td>[\s\S]*?<td class="celltext">([\s\S]*?)<\/td>[\s\S]*?<td class="celltext">([\s\S]*?)<\/td>[\s\S]*?<form method="post" action="propertySearchViewDetail"[\s\S]*?<input type="hidden" name="dcode" value="([^"]*)"[\s\S]*?<input type="hidden" name="regno" value="([^"]*)"[\s\S]*?<input type="hidden" name="regyear" value="([^"]*)"[\s\S]*?<input type="hidden" name="regdate" value="([^"]*)"[\s\S]*?<input type="hidden" name="srocode" value="([^"]*)"[\s\S]*?<input type="hidden" name="recieptNo" value="([^"]*)"[\s\S]*?<input type="hidden" name="pcode" value="([^"]*)"[\s\S]*?<input type="hidden" name="propertyNum" value="([^"]*)"[\s\S]*?<input type="hidden" name="subDeedCode" value="([^"]*)"[\s\S]*?<\/tr>/g;

    let match;
    while ((match = regex.exec(html)) !== null) {
        // Extract names and addresses by cleaning HTML tags
        const namesHtml = match[4];
        const addressesHtml = match[5];

        // Function to clean HTML and split into array
        const cleanAndSplit = (html) => {
            return html
                .replace(/<br>/g, '###BREAK###')
                .replace(/<[^>]*>/g, '')
                .split('###BREAK###')
                .map(item => item.trim())
                .filter(item => item.length > 0);
        };

        const partyNames = cleanAndSplit(namesHtml);
        const partyAddresses = cleanAndSplit(addressesHtml);

        properties.push({
            serialNo: match[1],
            year: match[2],
            regNo: match[3],
            partyNames,
            partyAddresses,
            propertyDesc: match[6].trim(),
            khataNo: match[7].trim(),
            regDate: match[8].trim(),
            deedType: match[9].trim(),
            details: {
                dcode: match[10],
                regno: match[11],
                regyear: match[12],
                regdate: match[13],
                srocode: match[14],
                recieptNo: match[15],
                pcode: match[16],
                propertyNum: match[17],
                subDeedCode: match[18]
            }
        });
    }

    return properties;
};

/**
 * Returns unique values from an array of property objects for a given key
 * @param {Array} properties - Array of property objects
 * @param {string} key - Property key to extract unique values from
 * @returns {Array} Array of unique values
 */
export const getUniqueValues = (properties, key) => {
    return [...new Set(properties.map(property => property[key]))].filter(Boolean);
};

/**
 * Filters properties based on search criteria
 * @param {Array} properties - Array of property objects
 * @param {Object} filters - Object containing filter criteria
 * @returns {Array} Filtered array of property objects
 */
export const filterProperties = (properties, filters) => {
    const { searchTerm, year, deedType, regNo, khataNo } = filters;

    return properties.filter(property => {
        // Check if property matches all provided filters
        const matchesYear = !year || property.year === year;
        const matchesDeedType = !deedType || property.deedType === deedType;
        const matchesRegNo = !regNo || property.regNo.includes(regNo);
        const matchesKhataNo = !khataNo || property.khataNo.includes(khataNo);

        // Check if property matches search term (if provided)
        let matchesSearchTerm = true;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            matchesSearchTerm =
                property.propertyDesc.toLowerCase().includes(term) ||
                property.partyNames.some(name => name.toLowerCase().includes(term)) ||
                property.partyAddresses.some(address => address.toLowerCase().includes(term)) ||
                property.regNo.toLowerCase().includes(term) ||
                property.khataNo.toLowerCase().includes(term) ||
                property.deedType.toLowerCase().includes(term);
        }

        return matchesYear && matchesDeedType && matchesRegNo && matchesKhataNo && matchesSearchTerm;
    });
};

/**
 * Exports properties data to JSON format
 * @param {Array} properties - Array of property objects
 * @returns {string} JSON string
 */
export const exportToJson = (properties) => {
    return JSON.stringify(properties, null, 2);
};

/**
 * Exports properties data to CSV format
 * @param {Array} properties - Array of property objects
 * @returns {string} CSV string
 */
export const exportToCsv = (properties) => {
    // Define CSV headers
    const headers = [
        'Serial No', 'Year', 'Registration No', 'Party Names',
        'Party Addresses', 'Property Description', 'Khata No',
        'Registration Date', 'Deed Type'
    ];

    // Convert data to CSV rows
    const rows = properties.map(p => [
        p.serialNo,
        p.year,
        p.regNo,
        p.partyNames.join(' | '),
        p.partyAddresses.join(' | '),
        p.propertyDesc,
        p.khataNo,
        p.regDate,
        p.deedType
    ]);

    // Combine header and rows
    return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
};