/**
 * Utility functions for parsing property detail HTML
 */
import * as cheerio from "cheerio"

/**
 * Extract property detail information from HTML content
 * @param {string} html - Raw HTML content from property detail page
 * @returns {Object} Parsed property details
 */
export const parsePropertyDetailHtml = (html) => {
    try {
        const $ = cheerio.load(html);
        const parsedData = {};

        // First check if main table exists
        const mainTable = $('#TABLE1');
        if (!mainTable.length) {
            console.error('Main table with ID "TABLE1" not found in HTML');
            return {
                error: 'Failed to find main table in HTML content',
                empty: true
            };
        }

        // Extract document type
        parsedData.documentType = $('#lbldeedname').text().trim();

        // Extract registration details
        parsedData.year = $('#lblyr').text().trim();
        parsedData.registrationNumber = $('#lblregno').text().trim();
        parsedData.bindNumber = $('#lblbinderno').text().trim();

        // Extract location information
        parsedData.district = $('#lbldistrict').text().trim();
        parsedData.sro = $('#lblsro').text().trim();
        parsedData.ward = $('#lblward').text().trim();
        parsedData.mohalla = $('#lblgram').text().trim();

        // Extract property details
        parsedData.landType = $('#lblland').text().trim();
        parsedData.khataNumber = $('#lblkhasrano').text().trim();
        parsedData.propertyDescription = $('#lblpropdesc').text().trim();
        parsedData.areaUnit = $('#lblunit').text().trim();
        parsedData.area = $('#lblarea').text().trim();
        parsedData.ownershipShare = $('#lblareafrac1').text().trim();
        parsedData.soldShare = $('#lblareafrac2').text().trim();

        // Extract financial details
        parsedData.marketValue = $('#lblmktvalue').text().trim();
        parsedData.transactionValue = $('#lbltransvalue').text().trim();
        parsedData.stampDuty = $('#lblstampduty').text().trim();

        // Extract dates
        parsedData.executionDate = $('#lblexedate').text().trim();
        parsedData.registrationDate = $('#lblregdate').text().trim();

        // Log available fields for debugging
        console.log('Available fields in HTML:');
        mainTable.find('span[id]').each((i, el) => {
            const id = $(el).attr('id');
            const value = $(el).text().trim();
            console.log(`${id}: ${value}`);
        });

        // Extract party information using a more generic approach
        parsedData.parties = extractPartyInformationGeneric($, mainTable);

        // Check if we actually got any data
        if (!hasData(parsedData)) {
            // Fallback to a more resilient parsing approach
            return parseWithResilientApproach($, mainTable);
        }

        return parsedData;
    } catch (error) {
        console.error('Error parsing property detail HTML:', error);
        // Return minimal structure even if parsing fails
        return {
            error: 'Failed to parse HTML content',
            errorMessage: error.message
        };
    }
};

/**
 * Checks if the parsed data object actually contains any meaningful data
 */
function hasData(parsedData) {
    // Check if at least some essential fields have data
    return (
        parsedData.documentType ||
        parsedData.registrationNumber ||
        parsedData.year ||
        parsedData.district ||
        (parsedData.parties && (
            (parsedData.parties.firstParty && parsedData.parties.firstParty.length > 0) ||
            (parsedData.parties.secondParty && parsedData.parties.secondParty.length > 0)
        ))
    );
}

/**
 * Extracts party information from the HTML using a more generic approach
 * @param {Object} $ - Cheerio instance
 * @param {Object} mainTable - The main table element
 * @returns {Object} First party, second party, and witness information
 */
function extractPartyInformationGeneric($, mainTable) {
    const parties = {
        firstParty: [],
        secondParty: [],
        witnesses: []
    };

    // Look for the party information table
    const partyTable = $('#first');

    if (partyTable.length === 0) {
        // Try a different approach if the specific table isn't found
        return extractPartiesFromGeneralStructure($, mainTable);
    }

    // Current party type being processed
    let currentPartyType = null;

    // Variables to build the current party
    let currentParty = {};

    // Process each row in the party table
    partyTable.find('tr').each((index, row) => {
        const rowText = $(row).text().trim();

        // Determine party type based on row header
        if (rowText.includes('प्रथम पक्ष')) {
            currentPartyType = 'firstParty';
            return;
        } else if (rowText.includes('द्वितीय पक्ष')) {
            currentPartyType = 'secondParty';
            return;
        } else if (rowText.includes('गवाह')) {
            currentPartyType = 'witnesses';
            return;
        }

        // If no party type is set, skip
        if (!currentPartyType) {
            return;
        }

        // Extract field label and value
        const cells = $(row).find('td');
        if (cells.length >= 2) {
            const label = $(cells[0]).text().trim();
            const value = $(cells[1]).text().trim();

            // Skip empty rows
            if (!label && !value) {
                return;
            }

            // Skip separator rows
            if (label.includes('background-color:DimGray') || value.includes('background-color:DimGray')) {
                return;
            }

            // Process based on field label
            if (label.includes('नाम')) {
                // If we already have a party, save it and start a new one
                if (currentParty.name) {
                    parties[currentPartyType].push({ ...currentParty });
                    currentParty = {};
                }
                currentParty.name = value;
            } else if (label.includes('पिता/माता/पति का नाम')) {
                currentParty.relationName = value;
                // Determine relation type based on the relationship name
                if (label.includes('पिता')) {
                    currentParty.relation = 'पिता';
                } else if (label.includes('माता')) {
                    currentParty.relation = 'माता';
                } else if (label.includes('पति')) {
                    currentParty.relation = 'पति';
                }
            } else if (label.includes('पता')) {
                currentParty.address = value;
                // If we have a complete party record, add it to the appropriate array
                if (currentParty.name) {
                    parties[currentPartyType].push({ ...currentParty });
                    currentParty = {};
                }
            }
        }
    });

    // Add the last party if not already added
    if (currentParty.name && currentPartyType) {
        parties[currentPartyType].push(currentParty);
    }

    return parties;
}

/**
 * Extract party information using a more general approach
 * @param {Object} $ - Cheerio instance
 * @param {Object} mainTable - The main table element
 * @returns {Object} Party information
 */
function extractPartiesFromGeneralStructure($, mainTable) {
    const parties = {
        firstParty: [],
        secondParty: [],
        witnesses: []
    };

    // Look for sections that might contain party information
    mainTable.find('tr').each((i, row) => {
        const headerText = $(row).text().trim();

        // Look for section headers
        if (headerText.includes('पक्ष विवरण') || headerText.includes('Party Details')) {
            // Found the party section header
            // Now look for party tables or sections below this
            let currentSection = $(row).next('tr');
            let processing = true;

            // Loop through following rows until we reach another major section
            while (processing && currentSection.length) {
                const sectionText = currentSection.text().trim();

                // Check if this is a party header
                if (sectionText.includes('प्रथम पक्ष') || sectionText.includes('First Party')) {
                    // First party section found - extract the info
                    const partyInfo = extractPartyInfo($, currentSection, 'first');
                    if (partyInfo) {
                        parties.firstParty.push(partyInfo);
                    }
                } else if (sectionText.includes('द्वितीय पक्ष') || sectionText.includes('Second Party')) {
                    // Second party section found - extract the info
                    const partyInfo = extractPartyInfo($, currentSection, 'second');
                    if (partyInfo) {
                        parties.secondParty.push(partyInfo);
                    }
                } else if (sectionText.includes('गवाह') || sectionText.includes('Witness')) {
                    // Witness section found - extract the info
                    const partyInfo = extractPartyInfo($, currentSection, 'witness');
                    if (partyInfo) {
                        parties.witnesses.push(partyInfo);
                    }
                }

                // Check if we've reached the end of the party section
                if (sectionText.includes('Technical Details') || sectionText.includes('Additional Information')) {
                    processing = false;
                }

                currentSection = currentSection.next('tr');
            }
        }
    });

    return parties;
}

/**
 * Extract information for a single party from surrounding rows
 * @param {Object} $ - Cheerio instance 
 * @param {Object} startRow - The row containing the party header
 * @param {string} partyType - The type of party (first, second, witness)
 * @returns {Object} Party information
 */
function extractPartyInfo($, startRow, partyType) {
    const partyInfo = {
        name: '',
        relation: '',
        relationName: '',
        address: ''
    };

    // Look for specific content in nearby rows
    let currentRow = startRow.next('tr');
    let rowsChecked = 0;
    const maxRows = 10; // Only check a reasonable number of rows

    while (currentRow.length && rowsChecked < maxRows) {
        const rowText = currentRow.text().trim();
        const cells = currentRow.find('td');

        if (cells.length >= 2) {
            const label = $(cells[0]).text().trim();
            const value = $(cells[1]).text().trim();

            if (label.includes('नाम') || label.includes('Name')) {
                partyInfo.name = value;
            } else if (label.includes('पिता') || label.includes('Father') ||
                label.includes('माता') || label.includes('Mother') ||
                label.includes('पति') || label.includes('Husband')) {
                partyInfo.relationName = value;
                if (label.includes('पिता') || label.includes('Father')) {
                    partyInfo.relation = 'पिता';
                } else if (label.includes('माता') || label.includes('Mother')) {
                    partyInfo.relation = 'माता';
                } else if (label.includes('पति') || label.includes('Husband')) {
                    partyInfo.relation = 'पति';
                }
            } else if (label.includes('पता') || label.includes('Address')) {
                partyInfo.address = value;
            }
        }

        currentRow = currentRow.next('tr');
        rowsChecked++;
    }

    // Only return if we found at least a name
    return partyInfo.name ? partyInfo : null;
}

/**
 * Parse the document using a more resilient approach that doesn't rely on specific IDs
 * @param {Object} $ - Cheerio instance
 * @param {Object} mainTable - The main table element
 * @returns {Object} Parsed property details
 */
function parseWithResilientApproach($, mainTable) {
    console.log('Using resilient parsing approach');
    const parsedData = {
        parties: {
            firstParty: [],
            secondParty: [],
            witnesses: []
        },
        boundaries: {
            north: '',
            south: '',
            east: '',
            west: ''
        }
    };

    // Process all rows in the main table to extract information based on text labels
    mainTable.find('tr').each((i, row) => {
        const rowText = $(row).text().trim();
        const cells = $(row).find('td');

        if (cells.length >= 2) {
            const label = $(cells[0]).text().trim();
            let value = '';

            // For most rows, the value is in the next cell
            if (cells.length >= 2) {
                value = $(cells[1]).text().trim();
            }

            // Some rows might have spans with the actual values
            const spans = $(row).find('span');
            if (spans.length > 0) {
                spans.each((j, span) => {
                    const spanId = $(span).attr('id');
                    if (spanId && spanId.startsWith('lbl')) {
                        value = $(span).text().trim();
                    }
                });
            }

            // Match known field patterns by their labels
            if (label.includes('अभिलॆख का प्रकार') || label.includes('Document Type')) {
                parsedData.documentType = value;
            } else if (label.includes('वर्ष') || label.includes('Year')) {
                parsedData.year = value;
            } else if (label.includes('लेखपत्र संख्या') || label.includes('Registration Number')) {
                parsedData.registrationNumber = value;
            } else if (label.includes('खंड संख्या') || label.includes('Bind Number')) {
                parsedData.bindNumber = value;
            } else if (label.includes('जनपद') || label.includes('District')) {
                parsedData.district = value;
            } else if (label.includes('उप निबंधक') || label.includes('Sub-Registrar')) {
                parsedData.sro = value;
            } else if (label.includes('वार्ड/ परगना') || label.includes('Ward/Pargana')) {
                parsedData.ward = value;
            } else if (label.includes('मोहल्ला/ग्राम') || label.includes('Mohalla/Village')) {
                parsedData.mohalla = value;
            } else if (label.includes('भूमि का प्रकार') || label.includes('Land Type')) {
                parsedData.landType = value;
            } else if (label.includes('खसरा /मकान /गाटा संख्या') || label.includes('Khasra/House Number')) {
                parsedData.khataNumber = value;
            } else if (label.includes('भूमि की अवस्थिति') || label.includes('Property Description')) {
                parsedData.propertyDescription = value;
            } else if (label.includes('भूमि की इकाई') || label.includes('Area Unit')) {
                parsedData.areaUnit = value;
            } else if (label.includes('क्षेत्रफल') || label.includes('Area')) {
                parsedData.area = value;
            } else if (label.includes('स्वामित्व का अंश') || label.includes('Ownership Share')) {
                parsedData.ownershipShare = value;
            } else if (label.includes('स्वामित्व के विक्रीत अंश') || label.includes('Sold Share')) {
                parsedData.soldShare = value;
            } else if (label.includes('बाजारी मूल्य') || label.includes('Market Value')) {
                parsedData.marketValue = value;
            } else if (label.includes('प्रतिफल') || label.includes('Transaction Value')) {
                parsedData.transactionValue = value;
            } else if (label.includes('स्टाम्प शुल्क') || label.includes('Stamp Duty')) {
                parsedData.stampDuty = value;
            } else if (label.includes('निष्पादन की तिथि') || label.includes('Execution Date')) {
                parsedData.executionDate = value;
            } else if (label.includes('पंजीकरण की तिथि') || label.includes('Registration Date')) {
                parsedData.registrationDate = value;
            }
        }
    });

    // Look for party information
    const partyTable = mainTable.find('table#first');
    if (partyTable.length > 0) {
        parsedData.parties = extractPartyInformationGeneric($, mainTable);
    } else {
        // Try a broader search for party information
        parsedData.parties = extractPartiesAlternative($, mainTable);
    }

    return parsedData;
}

/**
 * Extract party information using an alternative approach
 * @param {Object} $ - Cheerio instance
 * @param {Object} mainTable - The main table element
 * @returns {Object} Party information
 */
function extractPartiesAlternative($, mainTable) {
    const parties = {
        firstParty: [],
        secondParty: [],
        witnesses: []
    };

    // Look for tables inside the main table
    const innerTables = mainTable.find('table');
    innerTables.each((i, table) => {
        const tableText = $(table).text().trim();

        // Check the table content to determine its purpose
        if (tableText.includes('प्रथम पक्ष') || tableText.includes('First Party')) {
            // This table likely contains first party information
            const party = extractPartyFromTable($, $(table), 'first');
            if (party.name) parties.firstParty.push(party);
        } else if (tableText.includes('द्वितीय पक्ष') || tableText.includes('Second Party')) {
            // This table likely contains second party information
            const party = extractPartyFromTable($, $(table), 'second');
            if (party.name) parties.secondParty.push(party);
        } else if (tableText.includes('गवाह') || tableText.includes('Witness')) {
            // This table likely contains witness information
            const party = extractPartyFromTable($, $(table), 'witness');
            if (party.name) parties.witnesses.push(party);
        }
    });

    return parties;
}

/**
 * Extract a party's information from a table
 * @param {Object} $ - Cheerio instance
 * @param {Object} table - The table element
 * @param {string} type - The party type
 * @returns {Object} Party information
 */
function extractPartyFromTable($, table, type) {
    const party = {
        name: '',
        relation: '',
        relationName: '',
        address: ''
    };

    table.find('tr').each((i, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
            const label = $(cells[0]).text().trim();
            const value = $(cells[1]).text().trim();

            if (label.includes('नाम') || label.includes('Name')) {
                party.name = value;
            } else if (
                label.includes('पिता') || label.includes('Father') ||
                label.includes('माता') || label.includes('Mother') ||
                label.includes('पति') || label.includes('Husband')
            ) {
                party.relationName = value;
                if (label.includes('पिता') || label.includes('Father')) {
                    party.relation = 'पिता';
                } else if (label.includes('माता') || label.includes('Mother')) {
                    party.relation = 'माता';
                } else if (label.includes('पति') || label.includes('Husband')) {
                    party.relation = 'पति';
                }
            } else if (label.includes('पता') || label.includes('Address')) {
                party.address = value;
            }
        }
    });

    return party;
}




/* check mark */

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

    console.log(`Extracted ${properties.length} property records`);
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