// File: app.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const District = require('../models/districtSchema')


// API to get SROs for a specific district
router.get('/api/sros/:districtCode', async (req, res) => {
    console.log("HI")
    try {
        const { districtCode } = req.params;
        console.log("dis" , districtCode)
        const district = await District.findOne({ districtCode });

        if (!district) {
            return res.status(404).json({
                success: false,
                message: `District with code ${districtCode} not found`
            });
        }

        // Sort the SRO list by name
        const sros = district.sroList.sort((a, b) => a.sroName.localeCompare(b.sroName));
        res.json(sros);
    } catch (error) {
        console.error('Error fetching SROs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching SROs',
            error: error.message
        });
    }
});

router.post('/api/fetch-districts', async (req, res) => {
    try {
        const districtCode = req.body.districtCode || '0';

        const response = await axios({
            method: 'post',
            url: 'https://igrsup.gov.in/igrsup/getDistrictNameEngJson',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://igrsup.gov.in',
                'Referer': 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: `districtCode=${districtCode}`
        });

        const districtsData = response.data;

        // Check if the response is an object (key-value pairs)
        if (districtsData && typeof districtsData === 'object') {
            // Handle both array and object formats
            let districtEntries = [];

            if (Array.isArray(districtsData)) {
                // If it's already an array of objects with districtCode and districtName
                districtEntries = districtsData.map(district => ({
                    districtCode: district.districtCode,
                    districtName: district.districtName
                }));
            } else if (!Array.isArray(districtsData)) {
                // If it's an object with key-value pairs (code: name)
                districtEntries = Object.entries(districtsData).map(([districtCode, districtName]) => ({
                    districtCode,
                    districtName
                }));
            }

            // Save all districts
            const savedDistricts = [];

            for (const district of districtEntries) {
                try {
                    // Use upsert to update if exists or insert if not
                    const result = await District.findOneAndUpdate(
                        { districtCode: district.districtCode },
                        {
                            districtCode: district.districtCode,
                            districtName: district.districtName,
                            lastUpdated: new Date()
                        },
                        { upsert: true, new: true }
                    );

                    savedDistricts.push(result);
                } catch (err) {
                    console.error(`Error saving district ${district.districtCode}:`, err);
                }
            }

            res.json({
                success: true,
                message: `Saved ${savedDistricts.length} districts`,
                data: savedDistricts
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid data format received from IGRS UP API',
                receivedData: districtsData
            });
        }
    } catch (error) {
        console.error('Error fetching district data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching district data',
            error: error.message
        });
    }
});

// API to fetch and save SRO data for a district
// router.post('/api/fetch-sros', async (req, res) => {
//     try {
//         const districtCode = req.body.districtCode;

//         if (!districtCode) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'District code is required'
//             });
//         }

//         const response = await axios({
//             method: 'post',
//             url: 'https://igrsup.gov.in/igrsup/getSroListJson',
//             headers: {
//                 'Accept': '*/*',
//                 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//                 'Origin': 'https://igrsup.gov.in',
//                 'Referer': 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
//                 'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
//                 'X-Requested-With': 'XMLHttpRequest'
//             },
//             data: `districtCode=${districtCode}`
//         });

//         const srosData = response.data;
//         console.log("srosData", srosData)

//         // Check if the response is an object (key-value pairs)
//         if (srosData) {
//             //     // First, check if district exists
//             //     // let district = await District.findOne({ districtCode });

//             //     // if (!district) {
//             //     //     return res.status(404).json({
//             //     //         success: false,
//             //     //         message: `District with code ${districtCode} not found`
//             //     //     });
//             //     // }

//             // Convert object format to array of objects
//             const sroList = Object.entries(srosData).map(([sroCode, sroName]) => ({
//                 sroCode,
//                 sroName
//             }));

//             console.log("sroList", sroList)

//             //     // Create and save a new District
//             //     const district = new District({
//             //         sroList: sroList,
//             //         lastUpdated: new Date()
//             //     });

//             //     // Save the district
//             //     await district.save();
//             // Create and save a new District
//             const district = new District({
//                 districtCode,  // Add this
//                 districtName: req.body.districtName || '', // Optional, but should be passed if available
//                 sroList: sroList,
//                 lastUpdated: new Date()
//             });


//             res.json({
//                 success: true,
//                 message: `Saved ${sroList.length} SROs for district ${districtCode}`,
//                 data: district
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: 'Invalid data format received from IGRS UP API',
//                 receivedData: srosData
//             });
//         }
//     } catch (error) {
//         console.error('Error fetching SRO data:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching SRO data',
//             error: error.message
//         });
//     }
// });

// router.post('/api/fetch-sros', async (req, res) => {
//     try {
//         const districtCode = req.body.districtCode;

//         if (!districtCode) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'District code is required'
//             });
//         }

//         const response = await axios({
//             method: 'post',
//             url: 'https://igrsup.gov.in/igrsup/getSroListJson',
//             headers: {
//                 'Accept': '*/*',
//                 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//                 'Origin': 'https://igrsup.gov.in',
//                 'Referer': 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
//                 'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
//                 'X-Requested-With': 'XMLHttpRequest'
//             },
//             data: `districtCode=${districtCode}`
//         });

//         const srosData = response.data;
//         console.log("srosData", srosData);

//         // Check if the response is valid
//         if (srosData) {
//             // Convert object format to array of objects
//             const sroList = Object.entries(srosData).map(([sroCode, sroName]) => ({
//                 sroCode,
//                 sroName
//             }));

//             console.log("sroList", sroList);

//             // Check if district already exists in the database
//             let district = await District.findOne({ districtCode });

//             if (district) {
//                 // Update existing district
//                 district.sroList = sroList;
//                 district.lastUpdated = new Date();
//                 if (req.body.districtName) {
//                     district.districtName = req.body.districtName;
//                 }
//                 await district.save();
//             } else {
//                 // Create new district
//                 district = new District({
//                     districtCode,
//                     districtName: req.body.districtName || '',
//                     sroList: sroList,
//                     lastUpdated: new Date()
//                 });
//                 await district.save();
//             }

//             res.json({
//                 success: true,
//                 message: `Saved ${sroList.length} SROs for district ${districtCode}`,
//                 data: district
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: 'Invalid data format received from IGRS UP API',
//                 receivedData: srosData
//             });
//         }
//     } catch (error) {
//         console.error('Error fetching or saving SRO data:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error processing SRO data',
//             error: error.message
//         });
//     }
// });

// Route to manually save SRO data (for when you already have the data)
router.post('/api/save-sros', async (req, res) => {
    try {
        const { districtCode, districtName, sroList } = req.body;

        if (!districtCode || !Array.isArray(sroList)) {
            return res.status(400).json({
                success: false,
                message: 'District code and SRO list are required'
            });
        }

        // Check if district already exists
        let district = await District.findOne({ districtCode });

        if (district) {
            // Update existing district
            district.sroList = sroList;
            district.lastUpdated = new Date();
            if (districtName) {
                district.districtName = districtName;
            }
            await district.save();
        } else {
            // Create new district
            district = new District({
                districtCode,
                districtName: districtName || '',
                sroList,
                lastUpdated: new Date()
            });
            await district.save();
        }

        res.json({
            success: true,
            message: `Saved ${sroList.length} SROs for district ${districtCode}`,
            data: district
        });
    } catch (error) {
        console.error('Error saving SRO data:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving SRO data',
            error: error.message
        });
    }
});

// Route to get SROs for a district
router.post('/api/fetch-sros', async (req, res) => {
    try {
        const districtCode = req.body.districtCode;

        if (!districtCode) {
            return res.status(400).json({
                success: false,
                message: 'District code is required'
            });
        }

        // First, fetch the district name
        const districtNameResponse = await axios({
            method: 'post',
            url: 'https://igrsup.gov.in/igrsup/getDistrictNameEngJson',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://igrsup.gov.in',
                'Referer': 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: `districtCode=${districtCode}`
        });

        console.log("districtNameResponse", districtNameResponse)

        const districtNameData = districtNameResponse.data;
        console.log("districtNameData", districtNameData);

        // Extract district name from the response
        const districtName = districtNameData && districtNameData.District_Name
            ? districtNameData.District_Name
            : '';

        // Then, fetch the SRO list
        const response = await axios({
            method: 'post',
            url: 'https://igrsup.gov.in/igrsup/getSroListJson',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://igrsup.gov.in',
                'Referer': 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: `districtCode=${districtCode}`
        });

        const srosData = response.data;
        console.log("srosData", srosData);

        // Check if the response is valid
        if (srosData) {
            // Convert object format to array of objects
            const sroList = Object.entries(srosData).map(([sroCode, sroName]) => ({
                sroCode,
                sroName
            }));

            console.log("sroList", sroList);

            // Check if district already exists in the database
            let district = await District.findOne({ districtCode });

            if (district) {
                // Update existing district
                district.sroList = sroList;
                district.lastUpdated = new Date();
                district.districtName = districtName; // Always update with latest district name
                await district.save();
            } else {
                // Create new district
                district = new District({
                    districtCode,
                    districtName: districtName,
                    sroList: sroList,
                    lastUpdated: new Date()
                });
                await district.save();
            }

            res.json({
                success: true,
                message: `Saved ${sroList.length} SROs for district ${districtCode}`,
                data: district
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid data format received from IGRS UP API',
                receivedData: srosData
            });
        }
    } catch (error) {
        console.error('Error fetching or saving SRO data:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing SRO data',
            error: error.message
        });
    }
});

// Route to manually save SRO data (for when you already have the data)
router.post('/api/save-sros', async (req, res) => {
    try {
        const { districtCode, districtName, sroList } = req.body;

        if (!districtCode || !Array.isArray(sroList)) {
            return res.status(400).json({
                success: false,
                message: 'District code and SRO list are required'
            });
        }

        // Check if district already exists
        let district = await District.findOne({ districtCode });

        if (district) {
            // Update existing district
            district.sroList = sroList;
            district.lastUpdated = new Date();
            if (districtName) {
                district.districtName = districtName;
            }
            await district.save();
        } else {
            // Create new district
            district = new District({
                districtCode,
                districtName: districtName || '',
                sroList,
                lastUpdated: new Date()
            });
            await district.save();
        }

        res.json({
            success: true,
            message: `Saved ${sroList.length} SROs for district ${districtCode}`,
            data: district
        });
    } catch (error) {
        console.error('Error saving SRO data:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving SRO data',
            error: error.message
        });
    }
});

// Route to get SROs for a district
router.get('/api/sros/:districtCode', async (req, res) => {
    try {
        const { districtCode } = req.params;

        const district = await District.findOne({ districtCode });

        if (!district) {
            return res.status(404).json({
                success: false,
                message: `No SROs found for district ${districtCode}`
            });
        }

        res.json({
            success: true,
            data: district
        });
    } catch (error) {
        console.error('Error fetching SROs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching SROs',
            error: error.message
        });
    }
});

// API to fetch all districts and their SROs
router.get('/api/fetch-all-districts-sros', async (req, res) => {
    try {
        // Get list of all districts
        const districts = await District.find({}).sort({ districtName: 1 });

        // For each district, fetch and save SROs
        const results = [];

        for (const district of districts) {
            try {
                const response = await axios({
                    method: 'post',
                    url: 'https://igrsup.gov.in/igrsup/getSroListJson',
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Origin': 'https://igrsup.gov.in',
                        'Referer': 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    data: `districtCode=${district.districtCode}`
                });

                const srosData = response.data;

                // Check if the response is an object (key-value pairs)
                if (srosData && typeof srosData === 'object' && !Array.isArray(srosData)) {
                    // Convert object format to array of objects
                    const sroList = Object.entries(srosData).map(([sroCode, sroName]) => ({
                        sroCode,
                        sroName
                    }));

                    // Update the district with the new SRO list
                    const updatedDistrict = await District.findOneAndUpdate(
                        { districtCode: district.districtCode },
                        {
                            sroList: sroList,
                            lastUpdated: new Date()
                        },
                        { new: true }
                    );

                    results.push(updatedDistrict);
                } else {
                    console.error(`Invalid SRO data format for district ${district.districtCode}`);
                }
            } catch (error) {
                console.error(`Error fetching SROs for district ${district.districtCode}:`, error);
            }

            // Add a small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        res.json({
            success: true,
            message: `Fetched and saved SROs for ${results.length} districts`,
            data: results
        });
    } catch (error) {
        console.error('Error fetching all districts and SROs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching all districts and SROs',
            error: error.message
        });
    }
});

// API to get all districts
router.get('/api/districts', async (req, res) => {
    try {
        const districts = await District.find({}).sort({ districtName: 1 });
        res.json(districts);
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching districts',
            error: error.message
        });
    }
});




module.exports = router;
