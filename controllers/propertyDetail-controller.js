const axios = require('axios');
const deedParser = require('../utils/deedParser');
const Deed = require('../models/deedSchema');
const fs = require('fs');
const path = require('path');


/**
 * Fetch property details from external API and store in database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

// exports.fetchPropertyDetail = async (req, res) => {
//     try {
//         const {
//             dcode,
//             regno,
//             regyear,
//             regdate,
//             srocode,
//             recieptNo,
//             pcode,
//             propertyNum,
//             subDeedCode,
//             propertyId
//         } = req.body;

//         console.log(req.body)

//         // Validate required fields
//         if (!dcode || !regno || !regyear || !srocode) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing required fields: dcode, regno, regyear, and srocode are mandatory"
//             });
//         }

//         // Generate a unique ID for this detail record
//         const detailUniqueId = `${dcode}-${srocode}-${regno}-${regyear}`;

//         // Check if we already have this data in the database
//         // const existingRecord = await PropertyDetail.findOne({ detailUniqueId });

//         // if (existingRecord) {
//         // console.log(`Property detail retrieved from database for: ${detailUniqueId}`);
//         // return res.status(200).json({
//         //     success: true,
//         //     message: "Property detail retrieved from database",
//         //     data: existingRecord,
//         //     fromCache: true
//         // });
//         // }

//         // Prepare form data for external API request
//         const formData = new URLSearchParams();
//         formData.append('dcode', dcode);
//         formData.append('regno', regno);
//         formData.append('regyear', regyear);
//         formData.append('regdate', regdate || '');
//         formData.append('srocode', srocode);
//         formData.append('recieptNo', recieptNo || '');
//         formData.append('pcode', pcode || '');
//         formData.append('propertyNum', propertyNum || '');
//         formData.append('subDeedCode', subDeedCode || '');

//         // Log request parameters
//         console.log(`Making request to https://igrsup.gov.in/igrsup/propertySearchViewDetail with parameters: ${formData.toString()}`);

//         // Make the HTTP request to external API
//         const response = await axios.post('https://igrsup.gov.in/igrsup/propertySearchViewDetail', formData, {
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
//                 'Origin': 'https://igrsup.gov.in',
//                 'Referer': 'https://igrsup.gov.in/igrsup/newPropertySearchAction',
//                 'Cache-Control': 'max-age=0',
//                 'Connection': 'keep-alive',
//                 'Upgrade-Insecure-Requests': '1'
//             },
//             maxRedirects: 5,
//         });

//         console.log("Web response", response)

//         if (response.status !== 200) {
//             console.error(`Error: API returned status code ${response.status}`);
//             return res.status(response.status).json({
//                 success: false,
//                 message: `External API returned status code ${response.status}`
//             });
//         }

//         // Get HTML content
//         const html = response.data;
//         console.log("html" , html)

//         // Parse the HTML
//         const deedData = deedParser.parseDeedHtml(html);

//         console.log("deedData", deedData)


//         // Create an object with the form data fields to be stored
//         const formDataFields = {
//             dcode,
//             regno,
//             regyear,
//             regdate: regdate || '',
//             srocode,
//             recieptNo: recieptNo || '',
//             pcode: pcode || '',
//             propertyNum: propertyNum || '',
//             subDeedCode: subDeedCode || '',
//             propertyId: propertyId || '',
//             detailUniqueId
//         };
        

//         // Create a new deed document
//         const deed = new Deed({
//             ...deedData,
//             ...formDataFields
//         });

//         console.log("deed", deed)

//         // Save to database
//         const savedDeed = await deed.save();

//         res.status(201).json({
//             success: true,
//             message: 'Deed uploaded and saved successfully',
//             data: savedDeed
//         });

//     } catch (error) {
//         console.error('Error processing deed upload:', error);

//         res.status(500).json({
//             success: false,
//             message: 'Failed to process deed',
//             error: error.message
//         });
//     }
// };



exports.fetchPropertyDetail = async (req, res) => {
    console.log("fetchPropertyDetail is called  - -  -- which will fetch and save Deed")
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

        console.log(req.body);

        // Validate required fields
        if (!dcode || !regno || !regyear || !srocode) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: dcode, regno, regyear, and srocode are mandatory"
            });
        }

        // Generate a unique ID for this detail record
        const detailUniqueId = `${dcode}-${srocode}-${regno}-${regyear}`;

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
        });

        console.log("formData", formData)
        if (response.status !== 200) {
            console.error(`Error: API returned status code ${response.status}`);
            return res.status(response.status).json({
                success: false,
                message: `External API returned status code ${response.status}`
            });
        }

        // Get HTML content
        const html = response.data;
        console.log("HTML content received.");

        // Define path and file name
        const uploadDir = path.join(__dirname, '../uploads');
        const fileName = `${detailUniqueId}.html`;
        const filePath = path.join(uploadDir, fileName);

        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        // Save the HTML to the file
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`HTML response saved to ${filePath}`);

        // Parse the HTML
        const deedData = deedParser.parseDeedHtml(html);

        console.log("Parsed deed data:", deedData);

        // Create an object with the form data fields to be stored
        const formDataFields = {
            dcode,
            regno,
            regyear,
            regdate: regdate || '',
            srocode,
            recieptNo: recieptNo || '',
            pcode: pcode || '',
            propertyNum: propertyNum || '',
            subDeedCode: subDeedCode || '',
            propertyId: propertyId || '',
            detailUniqueId
        };

        // Create a new deed document
        const deed = new Deed({
            ...deedData,
            ...formDataFields,
            htmlFilePath: filePath // Save file path in DB if required
        });

        console.log("Deed to be saved:", deed);
        
        // Save to database
        const savedDeed = await deed.save();

        console.log("Deed savedDeed=======>:", savedDeed);
        
        return {
            success: true,
            message: 'Deed uploaded and saved successfully',
            data: savedDeed,
            htmlPath: filePath
        }
        
        res.status(201).json({
            success: true,
            message: 'Deed uploaded and saved successfully',
            data: savedDeed,
            htmlPath: filePath // Return the saved file path in response
        });

    } catch (error) {
        console.error('Error processing deed upload:', error);
        return {
            success: false,
            message: 'Failed to process deed',
            error: error.message

        }
        res.status(500).json({
            success: false,
            message: 'Failed to process deed',
            error: error.message
        });
    }
};

