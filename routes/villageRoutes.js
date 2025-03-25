// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// const Village = require('../models/villageSchema')
// const cheerio = require('cheerio')


// // API endpoint to scrape and save village data
// router.get('/api/scrape-villages', async (req, res) => {
//     try {
//         // Get district code and SRO code from query parameters or use defaults
//         const districtCode = req.query.districtCode || '178';
//         const sroCode = req.query.sroCode || '030';

//         console.log(`Scraping villages for district ${districtCode} and SRO ${sroCode}`);

//         // Create form data for the request
//         const formData = `districtCode=${districtCode}&sroCode=${sroCode}&propNEWAddress=`;

//         // Make the request to the IGRSUP website
//         const response = await axios({
//             method: 'post',
//             url: 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
//             headers: {
//                 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36'
//             },
//             data: formData
//         });

//         // Parse the HTML response
//         const $ = cheerio.load(response.data);

//         // Get the village select element
//         const villageSelect = $('#villageCode3');

//         if (!villageSelect.length) {
//             return res.status(404).json({ success: false, message: 'Village select element not found' });
//         }

//         // Extract village options
//         const villages = [];
//         villageSelect.find('option').each((i, element) => {
//             const value = $(element).val();
//             // Skip the "-select--" option
//             if (value !== '-1') {
//                 villages.push({
//                     villageCode: value,
//                     villageName: $(element).text(),
//                     districtCode,
//                     sroCode
//                 });
//             }
//         });

//         if (villages.length === 0) {
//             return res.status(404).json({ success: false, message: 'No villages found' });
//         }

//         console.log(`Found ${villages.length} villages`);

//         // Save villages to MongoDB
//         // We use bulkWrite with updateOne to handle duplicates with upsert
//         const operations = villages.map(village => ({
//             updateOne: {
//                 filter: { villageCode: village.villageCode },
//                 update: { $set: village },
//                 upsert: true
//             }
//         }));

//         const result = await Village.bulkWrite(operations);

//         return res.json({
//             success: true,
//             message: `Successfully processed ${villages.length} villages`,
//             stats: {
//                 matched: result.matchedCount,
//                 modified: result.modifiedCount,
//                 upserted: result.upsertedCount
//             },
//             villages: villages.slice(0, 10) // Return first 10 as sample
//         });

//     } catch (error) {
//         console.error('Error scraping villages:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Error scraping village data',
//             error: error.message
//         });
//     }
// });

// // API endpoint to get all villages
// router.get('/api/villages', async (req, res) => {
//     try {
//         const { districtCode, sroCode, page = 1, limit = 50 } = req.query;

//         const query = {};
//         if (districtCode) query.districtCode = districtCode;
//         if (sroCode) query.sroCode = sroCode;

//         const villages = await Village.find(query)
//             .skip((page - 1) * limit)
//             .limit(Number(limit))
//             .sort({ villageName: 1 });

//         const total = await Village.countDocuments(query);

//         return res.json({
//             success: true,
//             totalVillages: total,
//             currentPage: Number(page),
//             totalPages: Math.ceil(total / limit),
//             villages
//         });
//     } catch (error) {
//         console.error('Error getting villages:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Error retrieving village data',
//             error: error.message
//         });
//     }
// });

// // API endpoint to get village by code
// router.get('/api/villages/:code', async (req, res) => {
//     try {
//         const village = await Village.findOne({ villageCode: req.params.code });

//         if (!village) {
//             return res.status(404).json({ success: false, message: 'Village not found' });
//         }

//         return res.json({
//             success: true,
//             village
//         });
//     } catch (error) {
//         console.error('Error getting village:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Error retrieving village data',
//             error: error.message
//         });
//     }
// });


// // API endpoint to get SRO offices for a district
// router.get('/api/sro-offices', async (req, res) => {
//     try {
//         const { districtCode } = req.query;

//         if (!districtCode) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'District code is required'
//             });
//         }

//         console.log(`Fetching SRO offices for district ${districtCode}`);

//         // Create form data for the request
//         const formData = `districtCode=${districtCode}&propNEWAddress=`;

//         // Make the request to the IGRSUP website
//         const response = await axios({
//             method: 'post',
//             url: 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
//             headers: {
//                 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36'
//             },
//             data: formData
//         });

//         // Parse the HTML response
//         const $ = cheerio.load(response.data);

//         // Get the SRO select element
//         const sroSelect = $('#sroCode');

//         if (!sroSelect.length) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'SRO select element not found'
//             });
//         }

//         // Extract SRO options
//         const sroOffices = [];
//         sroSelect.find('option').each((i, element) => {
//             const value = $(element).val();
//             // Skip the "-select--" option
//             if (value !== '-1') {
//                 sroOffices.push({
//                     code: value,
//                     name: $(element).text().trim()
//                 });
//             }
//         });

//         if (sroOffices.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'No SRO offices found for this district'
//             });
//         }

//         console.log(`Found ${sroOffices.length} SRO offices for district ${districtCode}`);

//         return res.json({
//             success: true,
//             sroOffices
//         });

//     } catch (error) {
//         console.error('Error fetching SRO offices:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Error fetching SRO offices',
//             error: error.message
//         });
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const axios = require('axios');
const Village = require('../models/villageSchema');
const cheerio = require('cheerio');

// API endpoint to scrape and save village data
router.get('/api/scrape-villages', async (req, res) => {
    try {
        // Get district code and SRO code from query parameters or use defaults
        const districtCode = req.query.districtCode || '178';
        const sroCode = req.query.sroCode || '030';

        console.log(`Scraping villages for district ${districtCode} and SRO ${sroCode}`);

        // Make the request to get district name and SRO name
        const initialFormData = `propNEWAddress=`;
        const initialResponse = await axios({
            method: 'post',
            url: 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36'
            },
            data: initialFormData
        });

        // Parse the initial HTML response to get district name
        const $initial = cheerio.load(initialResponse.data);
        let districtName = '';
        const districtOption = $initial(`#districtCode option[value="${districtCode}"]`);

        if (districtOption.length) {
            districtName = districtOption.text().trim();
        } else {
            districtName = `District ${districtCode}`;
            console.log(`District name not found for code ${districtCode}, using fallback name`);
        }

        // Make the request to get SRO name
        const sroFormData = `districtCode=${districtCode}&propNEWAddress=`;
        const sroResponse = await axios({
            method: 'post',
            url: 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36'
            },
            data: sroFormData
        });

        const $sro = cheerio.load(sroResponse.data);
        let sroName = '';
        const sroOption = $sro(`#sroCode option[value="${sroCode}"]`);

        if (sroOption.length) {
            sroName = sroOption.text().trim();
        } else {
            sroName = `SRO ${sroCode}`;
            console.log(`SRO name not found for code ${sroCode}, using fallback name`);
        }

        // Log the district and SRO names for debugging
        console.log(`District: ${districtName} (${districtCode}), SRO: ${sroName} (${sroCode})`);

        // Create form data for the village request
        const formData = `districtCode=${districtCode}&sroCode=${sroCode}&propNEWAddress=`;

        // Make the request to get villages
        const response = await axios({
            method: 'post',
            url: 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36'
            },
            data: formData
        });

        // Parse the HTML response
        const $ = cheerio.load(response.data);

        // Get the village select element
        const villageSelect = $('#villageCode3');

        if (!villageSelect.length) {
            return res.status(404).json({ success: false, message: 'Village select element not found' });
        }

        // Extract village options
        const villages = [];
        villageSelect.find('option').each((i, element) => {
            const value = $(element).val();
            // Skip the "-select--" option
            if (value !== '-1') {
                villages.push({
                    villageCode: value,
                    villageName: $(element).text().trim(),
                    scrapedAt: new Date()
                });
            }
        });

        if (villages.length === 0) {
            return res.status(404).json({ success: false, message: 'No villages found' });
        }

        console.log(`Found ${villages.length} villages`);

        // Update or create the district in the schema structure
        const result = await Village.findOneAndUpdate(
            { districtCode },
            {
                $set: {
                    districtName,
                    lastUpdated: new Date()
                }
            },
            { upsert: true, new: true }
        );

        // Find if the SRO already exists in the district
        const sroExists = result.sroOffices.find(sro => sro.sroCode === sroCode);

        if (sroExists) {
            // Update existing SRO
            await Village.updateOne(
                { districtCode, "sroOffices.sroCode": sroCode },
                {
                    $set: {
                        "sroOffices.$.sroName": sroName,
                        "sroOffices.$.villages": villages,
                        "sroOffices.$.lastUpdated": new Date()
                    }
                }
            );
        } else {
            // Add new SRO
            await Village.updateOne(
                { districtCode },
                {
                    $push: {
                        sroOffices: {
                            sroCode,
                            sroName,
                            villages,
                            lastUpdated: new Date()
                        }
                    }
                }
            );
        }

        return res.json({
            success: true,
            message: `Successfully processed ${villages.length} villages`,
            district: {
                code: districtCode,
                name: districtName
            },
            sro: {
                code: sroCode,
                name: sroName
            },
            stats: {
                upserted: sroExists ? 0 : 1,
                modified: sroExists ? 1 : 0
            },
            villages: villages.slice(0, 10) // Return first 10 as sample
        });

    } catch (error) {
        console.error('Error scraping villages:', error);
        return res.status(500).json({
            success: false,
            message: 'Error scraping village data',
            error: error.message
        });
    }
});

// API endpoint to get all villages
router.get('/api/villages', async (req, res) => {
    try {
        const { districtCode, sroCode, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        // Build the query based on provided filters
        let query = {};
        if (districtCode) {
            query.districtCode = districtCode;
        }

        let villages = [];
        let total = 0;

        if (districtCode && sroCode) {
            // Case 1: Both district and SRO specified
            const district = await Village.findOne({ districtCode });

            if (!district) {
                return res.json({
                    success: true,
                    totalVillages: 0,
                    currentPage: Number(page),
                    totalPages: 0,
                    villages: []
                });
            }

            const sroOffice = district.sroOffices.find(sro => sro.sroCode === sroCode);

            if (!sroOffice) {
                return res.json({
                    success: true,
                    totalVillages: 0,
                    currentPage: Number(page),
                    totalPages: 0,
                    villages: []
                });
            }

            total = sroOffice.villages.length;

            // Apply pagination
            villages = sroOffice.villages
                .sort((a, b) => a.villageName.localeCompare(b.villageName))
                .slice(skip, skip + Number(limit))
                .map(village => ({
                    villageCode: village.villageCode,
                    villageName: village.villageName,
                    districtCode,
                    sroCode,
                    scrapedAt: village.scrapedAt
                }));

        } else if (districtCode) {
            // Case 2: Only district specified
            const district = await Village.findOne({ districtCode });

            if (!district) {
                return res.json({
                    success: true,
                    totalVillages: 0,
                    currentPage: Number(page),
                    totalPages: 0,
                    villages: []
                });
            }

            // Flatten all villages from all SROs in this district
            const allVillages = [];
            district.sroOffices.forEach(sro => {
                sro.villages.forEach(village => {
                    allVillages.push({
                        villageCode: village.villageCode,
                        villageName: village.villageName,
                        districtCode,
                        sroCode: sro.sroCode,
                        scrapedAt: village.scrapedAt
                    });
                });
            });

            // Sort and paginate
            total = allVillages.length;
            villages = allVillages
                .sort((a, b) => a.villageName.localeCompare(b.villageName))
                .slice(skip, skip + Number(limit));

        } else {
            // Case 3: No filters - get all villages from all districts
            const districts = await Village.find({});

            // Flatten all villages from all districts and SROs
            const allVillages = [];
            districts.forEach(district => {
                district.sroOffices.forEach(sro => {
                    sro.villages.forEach(village => {
                        allVillages.push({
                            villageCode: village.villageCode,
                            villageName: village.villageName,
                            districtCode: district.districtCode,
                            sroCode: sro.sroCode,
                            scrapedAt: village.scrapedAt
                        });
                    });
                });
            });

            // Sort and paginate
            total = allVillages.length;
            villages = allVillages
                .sort((a, b) => a.villageName.localeCompare(b.villageName))
                .slice(skip, skip + Number(limit));
        }

        return res.json({
            success: true,
            totalVillages: total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            villages
        });
    } catch (error) {
        console.error('Error getting villages:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving village data',
            error: error.message
        });
    }
});

// API endpoint to get village by code
router.get('/api/villages/:code', async (req, res) => {
    try {
        const villageCode = req.params.code;

        // Search for the village across all districts and SROs
        const districts = await Village.find({
            "sroOffices.villages.villageCode": villageCode
        });

        if (districts.length === 0) {
            return res.status(404).json({ success: false, message: 'Village not found' });
        }

        // Find the specific village
        let foundVillage = null;
        let districtCode = '';
        let sroCode = '';

        for (const district of districts) {
            for (const sro of district.sroOffices) {
                const village = sro.villages.find(v => v.villageCode === villageCode);
                if (village) {
                    foundVillage = village;
                    districtCode = district.districtCode;
                    sroCode = sro.sroCode;
                    break;
                }
            }
            if (foundVillage) break;
        }

        // Format the response
        const villageData = {
            villageCode: foundVillage.villageCode,
            villageName: foundVillage.villageName,
            districtCode,
            sroCode,
            scrapedAt: foundVillage.scrapedAt
        };

        return res.json({
            success: true,
            village: villageData
        });
    } catch (error) {
        console.error('Error getting village:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving village data',
            error: error.message
        });
    }
});

// API endpoint to get SRO offices for a district
router.get('/api/sro-offices', async (req, res) => {
    try {
        const { districtCode } = req.query;

        if (!districtCode) {
            return res.status(400).json({
                success: false,
                message: 'District code is required'
            });
        }

        console.log(`Fetching SRO offices for district ${districtCode}`);

        // First check if we already have this district and its SRO offices in our database
        const district = await Village.findOne({ districtCode });

        if (district && district.sroOffices && district.sroOffices.length > 0) {
            // We already have the SRO offices in the database
            const sroOffices = district.sroOffices.map(sro => ({
                code: sro.sroCode,
                name: sro.sroName
            }));

            return res.json({
                success: true,
                sroOffices,
                source: 'database'
            });
        }

        // If not in database, fetch from the website
        const formData = `districtCode=${districtCode}&propNEWAddress=`;

        const response = await axios({
            method: 'post',
            url: 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36'
            },
            data: formData
        });

        // Parse the HTML response
        const $ = cheerio.load(response.data);

        // Get the SRO select element
        const sroSelect = $('#sroCode');

        if (!sroSelect.length) {
            return res.status(404).json({
                success: false,
                message: 'SRO select element not found'
            });
        }

        // Extract SRO options
        const sroOffices = [];
        sroSelect.find('option').each((i, element) => {
            const value = $(element).val();
            // Skip the "-select--" option
            if (value !== '-1') {
                sroOffices.push({
                    code: value,
                    name: $(element).text().trim()
                });
            }
        });

        if (sroOffices.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No SRO offices found for this district'
            });
        }

        console.log(`Found ${sroOffices.length} SRO offices for district ${districtCode}`);

        // Get district name if it exists in the district select
        let districtName = '';
        try {
            const districtSelect = $('#districtCode');
            const districtOption = districtSelect.find(`option[value="${districtCode}"]`);
            if (districtOption.length) {
                districtName = districtOption.text().trim();
            } else {
                districtName = `District ${districtCode}`;
            }
        } catch (err) {
            districtName = `District ${districtCode}`;
        }

        // If we don't have this district in our database yet, create it with empty SRO offices
        if (!district) {
            await Village.create({
                districtCode,
                districtName,
                sroOffices: sroOffices.map(sro => ({
                    sroCode: sro.code,
                    sroName: sro.name,
                    villages: []
                }))
            });
        } else if (district.sroOffices.length === 0) {
            // Update the district with the SRO offices if it exists but has no SRO offices
            await Village.updateOne(
                { districtCode },
                {
                    $set: {
                        sroOffices: sroOffices.map(sro => ({
                            sroCode: sro.code,
                            sroName: sro.name,
                            villages: []
                        }))
                    }
                }
            );
        }

        return res.json({
            success: true,
            sroOffices,
            source: 'website'
        });

    } catch (error) {
        console.error('Error fetching SRO offices:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching SRO offices',
            error: error.message
        });
    }
});

// New endpoint to get all districts (for dropdowns)
router.get('/api/districts', async (req, res) => {
    try {
        const districts = await Village.find({}, 'districtCode districtName');

        return res.json({
            success: true,
            districts: districts.map(d => ({
                code: d.districtCode,
                name: d.districtName
            }))
        });
    } catch (error) {
        console.error('Error fetching districts:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching districts',
            error: error.message
        });
    }
});

module.exports = router;

