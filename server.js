// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const propertyLeadRoutes = require('./routes/PropertyLeadRoutes');


// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Import Routes
// // const userRoutes = require("./routes/userRoutes");
// // app.use("/api/users", userRoutes);


// app.use('/property-lead', propertyLeadRoutes);

// app.get( '/' , async(eq,res)=>{
//     res.send("HI NDSK")

// })
// // Connect to MongoDB
// mongoose
//     .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("MongoDB Connected"))
//     .catch((err) => console.log(err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const cheerio = require('cheerio');
const propertyRoutes = require('./routes/property-routes');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', propertyRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Property Deed API is running' });
});

// id = 'tablepaging'
// app.post('/scrape', async (req, res) => {
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
//             timeout: 60000
//         });

//         if (response.status !== 200) {
//             console.error(`Error: API returned status code ${response.status}`);
//             return res.status(response.status).json({
//                 message: `External API returned status code ${response.status}`
//             });
//         }

//         // Get HTML content
//         const htmlContent = response.data;

//         console.log("Received HTML content from API");

//         // Check if we have any content
//         if (!htmlContent || typeof htmlContent !== 'string') {
//             console.error('Error: No HTML content received from API');
//             return res.status(200).json({ message: "No valid HTML response received" });
//         }

//         // Load the HTML into cheerio
//         const $ = cheerio.load(htmlContent);

//         // Get the table with id 'tablepaging'
//         const table = $('#tablepaging');

//         if (table.length === 0) {
//             console.log('No table with ID "tablepaging" found in the response');
//             return res.status(200).json({ message: "No table found with ID 'tablepaging'" });
//         }

//         // Initialize an array to store all table data
//         const tableData = [];

//         // Get all rows from the table
//         const rows = table.find('tr');

//         if (rows.length === 0) {
//             console.log('Table exists but contains no rows');
//             return res.status(200).json({ message: "Table exists but contains no data rows" });
//         }

//         // Extract headers (first row)
//         const headers = [];
//         rows.first().find('th').each((i, el) => {
//             headers.push($(el).text().trim());
//         });

//         // If there are no th elements, try td elements (some tables use td for headers)
//         if (headers.length === 0) {
//             rows.first().find('td').each((i, el) => {
//                 headers.push($(el).text().trim());
//             });
//         }

//         console.log(`Found table with headers: ${headers.join(', ')}`);

//         // Extract data from the remaining rows
//         rows.slice(1).each((i, row) => {
//             const rowData = {};
//             const cells = $(row).find('td');

//             cells.each((j, cell) => {
//                 if (j < headers.length) {
//                     rowData[headers[j]] = $(cell).text().trim();
//                 }
//             });

//             if (Object.keys(rowData).length > 0) {
//                 // Add metadata about the request
//                 rowData.metadata = {
//                     district_code: districtCode,
//                     tehsil_code: sroCode,
//                     village_code: gaonCode1,
//                     request_timestamp: new Date().toISOString()
//                 };
//                 tableData.push(rowData);
//             }
//         });

//         console.log(`Extracted ${tableData.length} rows from the table`);

//         // Print the table data in a beautiful format
//         console.log('\n========== TABLE DATA ==========\n');

//         // Print headers
//         const headerRow = headers.map(h => `| ${h} `).join('') + '|';
//         const separatorRow = headers.map(h => `| ${'-'.repeat(h.length)} `).join('') + '|';

//         console.log(headerRow);
//         console.log(separatorRow);

//         // Print data rows
//         tableData.forEach(row => {
//             const dataRow = headers.map(h => `| ${row[h] || ''} `).join('') + '|';
//             console.log(dataRow);
//         });

//         console.log('\n===============================\n');

//         // For even better formatting, also use console.table
//         console.log('\nTable data formatted with console.table:\n');
//         console.table(tableData);

//         // If database storage is needed, uncomment and modify this section
//         /*
//         // Save parsed records to database
//         const savedRecords = [];
//         for (const record of tableData) {
//             const newRecord = new PropertyRecord({
//                 ...record,
//                 district_code: districtCode,
//                 tehsil_code: sroCode,
//                 village_code: gaonCode1,
//                 request_params: {
//                     districtCode,
//                     sroCode,
//                     gaonCode1,
//                     propNEWAddress: propNEWAddress || '1',
//                     propertyId: propertyId || ''
//                 },
//                 original_metadata: record.metadata || {}
//             });

//             try {
//                 const saved = await newRecord.save();
//                 savedRecords.push(saved);
//             } catch (saveError) {
//                 console.error('Error saving record to database:', saveError);
//                 // Continue with other records even if one fails
//             }
//         }

//         return res.status(200).json({
//             message: `Successfully retrieved and stored ${savedRecords.length} property records`,
//             count: savedRecords.length,
//             data: savedRecords
//         });
//         */

//         // Return the extracted data
//         return res.status(200).json({
//             message: `Successfully extracted ${tableData.length} rows from table with ID 'tablepaging'`,
//             count: tableData.length,
//             headers: headers,
//             data: tableData
//         });

//     } catch (error) {
//         console.error('Error fetching table data:', error);
//         return res.status(500).json({
//             message: `An error occurred: ${error.message}`,
//             error: error.toString(),
//             stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         });
//     }
// });



// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});