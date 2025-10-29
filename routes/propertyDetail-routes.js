const express = require('express');
const router = express.Router();
const propertyDetailController = require('../controllers/propertyDetail-controller');
// const Deed = require('../models/deedSchema');
const json2csv = require('json2csv').Parser;
const fs = require('fs');
const path = require('path');
const District = require('../models/districtSchema');
const Village = require('../models/villageSchema');
const { builderRegex } = require('../builderRegex');
const getDeedModel = require('../utils/getDeedModel');
const { db1 } = require('../database/db');
const Locality = require('../models/Locality');

// Route to fetch and save property detail
router.post('/property-records/fetch-detail', propertyDetailController.fetchPropertyDetail);

// router.get('/get-all-deeds', async (req, res) => {
//     try {
//         // Extract pagination parameters
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 20;
//         const skip = (page - 1) * limit;

//         // Parse sort parameter
//         let sortOption = {};
//         if (req.query.sort) {
//             // Handle descending sort with a prefix of '-'
//             if (req.query.sort.startsWith('-')) {
//                 const field = req.query.sort.substring(1);
//                 sortOption[field] = -1;
//             } else {
//                 sortOption[req.query.sort] = 1;
//             }
//         } else {
//             // Default sort by registration date, descending
//             sortOption = { registrationDateParsed: -1 };
//         }

//         // Build filter query
//         const query = {};

//         // Search across multiple fields
//         if (req.query.search) {
//             query.$or = [
//                 { 'firstParty.name': { $regex: req.query.search, $options: 'i' } },
//                 { 'secondParty.name': { $regex: req.query.search, $options: 'i' } },
//                 { documentNumber: { $regex: req.query.search, $options: 'i' } }
//             ];
//         }

//         // Filter by deed type
//         if (req.query.deedType) {
//             query.deedType = req.query.deedType;
//         }

//         // Filter by district
//         if (req.query.district) {
//             query.district = req.query.district;
//         }

//         // Filter by year
//         if (req.query.year) {
//             query.year = req.query.year;
//         }

//         // Filter by value range
//         if (req.query.minValue) {
//             query.transactionValue = { ...query.transactionValue, $gte: Number(req.query.minValue) };
//         }
//         if (req.query.maxValue) {
//             query.transactionValue = { ...query.transactionValue, $lte: Number(req.query.maxValue) };
//         }

//         // Filter by date range
//         if (req.query.fromDate) {
//             const fromDate = new Date(req.query.fromDate);
//             query.registrationDateParsed = { ...query.registrationDateParsed, $gte: fromDate };
//         }
//         if (req.query.toDate) {
//             const toDate = new Date(req.query.toDate);
//             // Set to end of day
//             toDate.setHours(23, 59, 59, 999);
//             query.registrationDateParsed = { ...query.registrationDateParsed, $lte: toDate };
//         }

//         // Execute query with pagination
//         const deeds = await Deed.find(query)
//             .sort(sortOption)
//             .skip(skip)
//             .limit(limit);

//         // Get total count for pagination
//         const total = await Deed.countDocuments(query);

//         // Calculate total pages
//         const pages = Math.ceil(total / limit);

//         res.json({
//             status: 'success',
//             pages,
//             total,
//             data: deeds
//         });
//     } catch (error) {
//         console.error('Error fetching deeds:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Server error while fetching deeds',
//             error: error.message
//         });
//     }
// });

// router.get('/get-all-deeds', async (req, res) => {
//     console.log(req.query)
//     try {
//         // Extract pagination parameters
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) ;
//         const skip = (page - 1) * limit;

//         // Parse sort parameter
//         let sortOption = {};
//         if (req.query.sort) {
//             // Handle descending sort with a prefix of '-'
//             if (req.query.sort.startsWith('-')) {
//                 const field = req.query.sort.substring(1);
//                 sortOption[field] = -1;
//             } else {
//                 sortOption[req.query.sort] = 1;
//             }
//         } else {
//             // Default sort by registration date, descending
//             sortOption = { registrationDateParsed: -1 };
//         }

//         // Build filter query
//         const query = {};

//         // Search across multiple fields
//         if (req.query.search) {
//             query.$or = [
//                 { 'firstParty.name': { $regex: req.query.search, $options: 'i' } },
//                 { 'secondParty.name': { $regex: req.query.search, $options: 'i' } },
//                 { documentNumber: { $regex: req.query.search, $options: 'i' } }
//             ];
//         }

//         // Filter by deed type
//         if (req.query.deedType) {
//             query.deedType = req.query.deedType;
//         }

//         // Filter by district , where district = code of district 
//         if (req.query.district) {
//             query.dcode = req.query.district;
//         }

//         // Filter by year
//         if (req.query.year) {
//             query.year = req.query.year;
//         }

//         // NEW FILTER: Filter by land type
//         if (req.query.landType) {
//             query.landType = req.query.landType;
//         }

//         // NEW FILTER: Filter by locality
//         if (req.query.locality) {
//             query.locality = { $regex: req.query.locality, $options: 'i' };
//         }

//         // NEW FILTER: Filter by floor number
//         if (req.query.floor) {
//             query.floor = parseInt(req.query.floor);
//         }

//         // NEW FILTER: Filter by month 
//         if (req.query.month) {
//             const month = parseInt(req.query.month);
//             // If we have a valid month number (1-12)
//             if (!isNaN(month) && month >= 1 && month <= 12) {
//                 // Add a criteria that matches documents where the month of registrationDateParsed
//                 // equals the requested month
//                 query.$and = query.$and || [];
//                 query.$and.push({
//                     $expr: {
//                         $eq: [{ $month: "$registrationDateParsed" }, month]
//                     }
//                 });
//             }
//         }

//         // Filter by value range
//         if (req.query.minValue) {
//             query.transactionValue = { ...query.transactionValue, $gte: Number(req.query.minValue) };
//         }
//         if (req.query.maxValue) {
//             query.transactionValue = { ...query.transactionValue, $lte: Number(req.query.maxValue) };
//         }

//         // NEW FILTER: Filter by market value range
//         if (req.query.minMarketValue) {
//             query.marketValue = { ...query.marketValue, $gte: Number(req.query.minMarketValue) };
//         }
//         if (req.query.maxMarketValue) {
//             query.marketValue = { ...query.marketValue, $lte: Number(req.query.maxMarketValue) };
//         }

//         // NEW FILTER: Filter by area range
//         if (req.query.minArea) {
//             query.area = { ...query.area, $gte: Number(req.query.minArea) };
//         }
//         if (req.query.maxArea) {
//             query.area = { ...query.area, $lte: Number(req.query.maxArea) };
//         }

//         // Filter by date range
//         if (req.query.fromDate) {
//             const fromDate = new Date(req.query.fromDate);
//             query.registrationDateParsed = { ...query.registrationDateParsed, $gte: fromDate };
//         }
//         if (req.query.toDate) {
//             const toDate = new Date(req.query.toDate);
//             // Set to end of day
//             toDate.setHours(23, 59, 59, 999);
//             query.registrationDateParsed = { ...query.registrationDateParsed, $lte: toDate };
//         }

//         // NEW FILTER: Filter by subRegistrar
//         if (req.query.subRegistrar) {
//             query.subRegistrar = req.query.subRegistrar;
//         }

//         // NEW FILTER: Filter by ward
//         if (req.query.ward) {
//             query.ward = req.query.ward;
//         }

//          // 🔹 New filter: by builder
//         if (req.query.builder) {
//             const builderRegex = new RegExp(req.query.builder, 'i'); // case-insensitive
//             query.$or = query.$or || [];
//             query.$or.push(
//                 { 'firstParty.name': { $regex: builderRegex } },
//                 { 'secondParty.name': { $regex: builderRegex } }
//             );
//         }
        

//         // Execute query with pagination
//         const deeds = await Deed.find(query)
//             .sort(sortOption)
//             .skip(skip)
//             .limit(limit);

//         // Get total count for pagination
//         const total = await Deed.countDocuments(query);

//         console.log("total", total)

//         // Calculate total pages
//         const pages = Math.ceil(total / limit);

//         res.json({
            
//             status: 'success',
//             pages,
//             total,
//             data: deeds
//         });
//     } catch (error) {
//         console.error('Error fetching deeds:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Server error while fetching deeds',
//             error: error.message
//         });
//     }
// });

// router.get('/get-all-deeds', async (req, res) => {
//   console.log(req.query);
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit);
//     const skip = (page - 1) * limit;

//     // Sorting
//     let sortOption = {};
//     if (req.query.sort) {
//       if (req.query.sort.startsWith('-')) {
//         sortOption[req.query.sort.substring(1)] = -1;
//       } else {
//         sortOption[req.query.sort] = 1;
//       }
//     } else {
//       sortOption = { registrationDateParsed: -1 };
//     }

//     // Build query
//     const query = {};

//     // Search filters
//     if (req.query.search) {
//       query.$or = [
//         { 'firstParty.name': { $regex: req.query.search, $options: 'i' } },
//         { 'secondParty.name': { $regex: req.query.search, $options: 'i' } },
//         { documentNumber: { $regex: req.query.search, $options: 'i' } }
//       ];
//     }

//     if (req.query.deedType) query.deedType = req.query.deedType;
//     if (req.query.district) query.dcode = req.query.district;
//     if (req.query.year) query.year = req.query.year;
//     if (req.query.landType) query.landType = req.query.landType;

//     // ✅ Locality filter
//     if (req.query.locality) {
//       query.locality = { $regex: req.query.locality, $options: 'i' };
//     }

//     if (req.query.floor) query.floor = parseInt(req.query.floor);

//     // Month filter
//     if (req.query.month) {
//       const month = parseInt(req.query.month);
//       if (!isNaN(month) && month >= 1 && month <= 12) {
//         query.$and = query.$and || [];
//         query.$and.push({
//           $expr: { $eq: [{ $month: "$registrationDateParsed" }, month] }
//         });
//       }
//     }

//     // Value filters
//     if (req.query.minValue) query.transactionValue = { ...query.transactionValue, $gte: Number(req.query.minValue) };
//     if (req.query.maxValue) query.transactionValue = { ...query.transactionValue, $lte: Number(req.query.maxValue) };
//     if (req.query.minMarketValue) query.marketValue = { ...query.marketValue, $gte: Number(req.query.minMarketValue) };
//     if (req.query.maxMarketValue) query.marketValue = { ...query.marketValue, $lte: Number(req.query.maxMarketValue) };
//     if (req.query.minArea) query.area = { ...query.area, $gte: Number(req.query.minArea) };
//     if (req.query.maxArea) query.area = { ...query.area, $lte: Number(req.query.maxArea) };

//     // Date range filters
//     if (req.query.fromDate) {
//       const fromDate = new Date(req.query.fromDate);
//       query.registrationDateParsed = { ...query.registrationDateParsed, $gte: fromDate };
//     }
//     if (req.query.toDate) {
//       const toDate = new Date(req.query.toDate);
//       toDate.setHours(23, 59, 59, 999);
//       query.registrationDateParsed = { ...query.registrationDateParsed, $lte: toDate };
//     }

//     if (req.query.subRegistrar) query.subRegistrar = req.query.subRegistrar;
//     if (req.query.ward) query.ward = req.query.ward;

//     // Builder name filter
//     if (req.query.builder) {
//       const builderRegexDynamic = new RegExp(req.query.builder, 'i');
//       query.$or = query.$or || [];
//       query.$or.push(
//         { 'firstParty.name': { $regex: builderRegexDynamic } },
//         { 'secondParty.name': { $regex: builderRegexDynamic } }
//       );
//     }

//     // Execute main query
//     const deeds = await Deed.find(query).sort(sortOption).skip(skip).limit(limit);
//     const total = await Deed.countDocuments(query);
//     const pages = Math.ceil(total / limit);

//     // 🧠 New Section: Builder Summary for selected locality
//     let builderSummary = [];

//     if (req.query.locality) {
//       // Step 1️⃣: Find all deeds in this locality with builder names
//       const allLocalityDeeds = await Deed.find({
//         locality: { $regex: req.query.locality, $options: 'i' },
//         $or: [
//           { 'firstParty.name': { $regex: builderRegex } },
//           { 'secondParty.name': { $regex: builderRegex } }
//         ]
//       }).sort({ registrationDateParsed: -1 });

//       // Step 2️⃣: Aggregate builder stats
//       const builderMap = {};

//       allLocalityDeeds.forEach(d => {
//         const builderParties = [
//           ...d.firstParty.filter(p => builderRegex.test(p.name || '')),
//           ...d.secondParty.filter(p => builderRegex.test(p.name || ''))
//         ];

//         builderParties.forEach(b => {
//           const builderName = b.name.trim();
//           if (!builderMap[builderName]) {
//             builderMap[builderName] = { name: builderName, totalArea: 0, transactionCount: 0, latestDate: null };
//           }
//           builderMap[builderName].totalArea += d.area || 0;
//           builderMap[builderName].transactionCount += 1;
//           const regDate = d.registrationDateParsed || new Date(d.registrationDate);
//           if (!builderMap[builderName].latestDate || regDate > builderMap[builderName].latestDate) {
//             builderMap[builderName].latestDate = regDate;
//           }
//         });
//       });

//       // Step 3️⃣: Convert to array and format statements
//       builderSummary = Object.values(builderMap)
//         .sort((a, b) => b.latestDate - a.latestDate)
//         .map(b => ({
//           builder: b.name,
//           totalArea: b.totalArea,
//           transactionCount: b.transactionCount,
//           latestDate: b.latestDate,
//           statement: `${b.name} ने इस क्षेत्र में लगभग ${b.totalArea.toFixed(2)} वर्ग मीटर भूमि (${b.transactionCount} रजिस्ट्री) खरीदी है।`
//         }));
//     }

//     // ✅ Final Response
//     res.json({
//       status: 'success',
//       pages,
//       total,
//       data: deeds,
//       builderSummary, // 🆕 Added summary array
//     });

//   } catch (error) {
//     console.error('Error fetching deeds:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error while fetching deeds',
//       error: error.message
//     });
//   }
// });



// // 🔤 Hindi → English transliteration map
// const transliterationMap = {
//   'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
//   'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
//   'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
//   'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
//   'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
//   'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
//   'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
//   'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
//   'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
//   'ळ': 'l', '़': '', 'ं': 'n', 'ः': 'h', 'ँ': 'n',
//   '्य': 'y', '्र': 'r', '्व': 'v',
//   '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
//   '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
//   ' ': ' ', '्': '', 'ो': 'o', 'े': 'e', 'ा': 'a',
//   'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ैं': 'ai', 'ै': 'ai', 'ौ': 'au'
// };

// // 🔠 Transliteration function (Hindi → English letters)
// function transliterate(text) {
//   if (!text) return '';
//   return text
//     .split('')
//     .map(ch => transliterationMap[ch] || ch)
//     .join('')
//     .replace(/\s+/g, ' ')
//     .trim();
// }

// // 🧠 Capitalize each word for readability
// function capitalizeWords(text) {
//   return text
//     .split(' ')
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(' ');
// }


// router.get('/get-all-deeds', async (req, res) => {
//   console.log(req.query);
//   try {
//     // 🧩 Determine which collection to use
//     let collectionName;

//     // ✅ If frontend passes "district" as numeric (e.g. 134, 137)
//     if (req.query.district && /^\d+$/.test(req.query.district)) {
//       collectionName = `deeds${req.query.district}`;
//     } else {
//       // fallback to default or manual collection param
//       collectionName = req.query.collection || 'deeds';
//     }

//     const Deed = getDeedModel(collectionName); // dynamically get correct model

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit);
//     const skip = (page - 1) * limit;

//     // 🔽 Sorting
//     let sortOption = {};
//     if (req.query.sort) {
//       if (req.query.sort.startsWith('-')) {
//         sortOption[req.query.sort.substring(1)] = -1;
//       } else {
//         sortOption[req.query.sort] = 1;
//       }
//     } else {
//       sortOption = { registrationDateParsed: -1 };
//     }

//     // 🧱 Build query
//     const query = {};

//     // 🔍 Search filters
//     if (req.query.search) {
//       query.$or = [
//         { 'firstParty.name': { $regex: req.query.search, $options: 'i' } },
//         { 'secondParty.name': { $regex: req.query.search, $options: 'i' } },
//         { documentNumber: { $regex: req.query.search, $options: 'i' } }
//       ];
//     }

//     if (req.query.deedType) query.deedType = req.query.deedType;
//     if (req.query.year) query.year = req.query.year;
//     if (req.query.landType) query.landType = req.query.landType;

//     // ✅ Locality filter
//     if (req.query.locality) {
//       query.locality = { $regex: req.query.locality, $options: 'i' };
//     }

//     if (req.query.floor) query.floor = parseInt(req.query.floor);

//     // 📆 Month filter
//     if (req.query.month) {
//       const month = parseInt(req.query.month);
//       if (!isNaN(month) && month >= 1 && month <= 12) {
//         query.$and = query.$and || [];
//         query.$and.push({
//           $expr: { $eq: [{ $month: "$registrationDateParsed" }, month] }
//         });
//       }
//     }

//     // 💰 Value filters
//     if (req.query.minValue) query.transactionValue = { ...query.transactionValue, $gte: Number(req.query.minValue) };
//     if (req.query.maxValue) query.transactionValue = { ...query.transactionValue, $lte: Number(req.query.maxValue) };
//     if (req.query.minMarketValue) query.marketValue = { ...query.marketValue, $gte: Number(req.query.minMarketValue) };
//     if (req.query.maxMarketValue) query.marketValue = { ...query.marketValue, $lte: Number(req.query.maxMarketValue) };
//     if (req.query.minArea) query.area = { ...query.area, $gte: Number(req.query.minArea) };
//     if (req.query.maxArea) query.area = { ...query.area, $lte: Number(req.query.maxArea) };

//     // 🗓️ Date range filters
//     if (req.query.fromDate) {
//       const fromDate = new Date(req.query.fromDate);
//       query.registrationDateParsed = { ...query.registrationDateParsed, $gte: fromDate };
//     }
//     if (req.query.toDate) {
//       const toDate = new Date(req.query.toDate);
//       toDate.setHours(23, 59, 59, 999);
//       query.registrationDateParsed = { ...query.registrationDateParsed, $lte: toDate };
//     }

//     if (req.query.subRegistrar) query.subRegistrar = req.query.subRegistrar;
//     if (req.query.ward) query.ward = req.query.ward;

//     // 👷 Builder name filter
//     if (req.query.builder) {
//       const builderRegexDynamic = new RegExp(req.query.builder, 'i');
//       query.$or = query.$or || [];
//       query.$or.push(
//         { 'firstParty.name': { $regex: builderRegexDynamic } },
//         { 'secondParty.name': { $regex: builderRegexDynamic } }
//       );
//     }

//     // 🔎 Execute main query
//     const deeds = await Deed.find(query).sort(sortOption).skip(skip).limit(limit);
//     const total = await Deed.countDocuments(query);
//     const pages = Math.ceil(total / limit);

//     // 🧠 Builder Summary (Transliterated English)
//     let builderSummary = [];

//     if (req.query.locality) {
//       const allLocalityDeeds = await Deed.find({
//         locality: { $regex: req.query.locality, $options: 'i' },
//         $or: [
//           { 'firstParty.name': { $regex: builderRegex } },
//           { 'secondParty.name': { $regex: builderRegex } }
//         ]
//       }).sort({ registrationDateParsed: -1 });

//       const builderMap = {};

//       allLocalityDeeds.forEach(d => {
//         const builderParties = [
//           ...(d.firstParty?.filter(p => builderRegex.test(p.name || '')) || []),
//           ...(d.secondParty?.filter(p => builderRegex.test(p.name || '')) || [])
//         ];

//         builderParties.forEach(b => {
//           const rawName = b.name.trim();
//           const engName = capitalizeWords(transliterate(rawName));

//           if (!builderMap[engName]) {
//             builderMap[engName] = {
//               name: engName,
//               totalArea: 0,
//               transactionCount: 0,
//               latestDate: null
//             };
//           }

//           builderMap[engName].totalArea += d.area || 0;
//           builderMap[engName].transactionCount += 1;

//           const regDate = d.registrationDateParsed || new Date(d.registrationDate);
//           if (!builderMap[engName].latestDate || regDate > builderMap[engName].latestDate) {
//             builderMap[engName].latestDate = regDate;
//           }
//         });
//       });

//       builderSummary = Object.values(builderMap)
//         .sort((a, b) => b.latestDate - a.latestDate)
//         .map(b => ({
//           builder: b.name,
//           totalArea: b.totalArea,
//           transactionCount: b.transactionCount,
//           latestDate: b.latestDate,
//           statement: `${b.name} has purchased approximately ${b.totalArea.toFixed(2)} square meters of land (${b.transactionCount} transaction${b.transactionCount > 1 ? 's' : ''}) in this area.`
//         }));
//     }

//     // ✅ Final Response
//     res.json({
//       status: 'success',
//       collectionUsed: collectionName,
//       pages,
//       total,
//       data: deeds,
//       builderSummary
//     });

//   } catch (error) {
//     console.error('Error fetching deeds:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error while fetching deeds',
//       error: error.message
//     });
//   }
// });



// // 🔤 Hindi → English transliteration map
// const transliterationMap = {
//   'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
//   'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
//   'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
//   'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
//   'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
//   'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
//   'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
//   'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
//   'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
//   'ळ': 'l', '़': '', 'ं': 'n', 'ः': 'h', 'ँ': 'n',
//   '्य': 'y', '्र': 'r', '्व': 'v',
//   '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
//   '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
//   ' ': ' ', '्': '', 'ो': 'o', 'े': 'e', 'ा': 'a',
//   'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ैं': 'ai', 'ै': 'ai', 'ौ': 'au'
// };

// // 📖 English → Hindi Translation Dictionary (for common words and names)
// const englishToHindiDictionary = {
//   // Common words that should be translated, not transliterated
//   'builder': 'बिल्डर',
//   'developer': 'डेवलपर',
//   'private': 'प्राइवेट',
//   'limited': 'लिमिटेड',
//   'pvt': 'प्रा',
//   'ltd': 'लि',
//   'company': 'कंपनी',
//   'construction': 'कंस्ट्रक्शन',
//   'infrastructure': 'इंफ्रास्ट्रक्चर',
//   'estate': 'एस्टेट',
//   'real': 'रियल',
//   'properties': 'प्रॉपर्टीज',
//   'group': 'ग्रुप',
//   'enterprises': 'एंटरप्राइजेज',
//   'india': 'इंडिया',
//   'nagar': 'नगर',
//   'colony': 'कॉलोनी',
//   'apartment': 'अपार्टमेंट',
//   'residency': 'रेजिडेंसी',
//   'tower': 'टावर',
//   'heights': 'हाइट्स',
//   'enclave': 'एन्क्लेव',
//   'plaza': 'प्लाजा',
  
//   // Common name patterns (add more as needed)
//   'kumar': 'कुमार',
//   'singh': 'सिंह',
//   'sharma': 'शर्मा',
//   'gupta': 'गुप्ता',
//   'verma': 'वर्मा',
//   'yadav': 'यादव',
//   'mishra': 'मिश्रा',
//   'pandey': 'पाण्डेय',
//   'tiwari': 'तिवारी',
//   'jain': 'जैन',
//   'agarwal': 'अग्रवाल',
//   'agrawal': 'अग्रवाल',
//   'srivastava': 'श्रीवास्तव',
//   'shrivastava': 'श्रीवास्तव',
//   'dubey': 'दुबे',
//   'chaturvedi': 'चतुर्वेदी',
//   'trivedi': 'त्रिवेदी',
//   'dwivedi': 'द्विवेदी',
//   'pathak': 'पाठक',
//   'saxena': 'सक्सेना',
//   'tandon': 'टंडन',
//   'malhotra': 'मल्होत्रा',
//   'chopra': 'चोपड़ा',
//   'kapoor': 'कपूर',
//   'mehta': 'मेहता',
//   'shah': 'शाह',
//   'patel': 'पटेल',
//   'reddy': 'रेड्डी',
//   'nair': 'नायर',
//   'iyer': 'अय्यर',
//   'rao': 'राव',
//   'khan': 'खान',
//   'ali': 'अली',
//   'ahmad': 'अहमद',
//   'hussain': 'हुसैन',
  
//   // Common first names
//   'ram': 'राम',
//   'shyam': 'श्याम',
//   'mohan': 'मोहन',
//   'sohan': 'सोहन',
//   'gopal': 'गोपाल',
//   'krishna': 'कृष्ण',
//   'radha': 'राधा',
//   'sita': 'सीता',
//   'gita': 'गीता',
//   'amit': 'अमित',
//   'sumit': 'सुमित',
//   'rajesh': 'राजेश',
//   'suresh': 'सुरेश',
//   'mahesh': 'महेश',
//   'dinesh': 'दिनेश',
//   'ramesh': 'रमेश',
//   'mukesh': 'मुकेश',
//   'rakesh': 'राकेश',
//   'pradeep': 'प्रदीप',
//   'sandeep': 'संदीप',
//   'manish': 'मनीष',
//   'ashok': 'अशोक',
//   'vijay': 'विजय',
//   'ajay': 'अजय',
//   'sanjay': 'संजय',
//   'anil': 'अनिल',
//   'sunil': 'सुनील',
//   'kapil': 'कपिल',
//   'nitin': 'नितिन',
//   'sachin': 'सचिन',
//   'rohit': 'रोहित',
//   'mohit': 'मोहित',
//   'ankit': 'अंकित',
//   'vikas': 'विकास',
//   'prakash': 'प्रकाश',
//   'deepak': 'दीपक',
//   'pankaj': 'पंकज',
//   'manoj': 'मनोज',
//   'vinod': 'विनोद',
//   'pramod': 'प्रमोद',
//   'ravi': 'रवि',
//   'kavi': 'कवि',
//   'shiv': 'शिव',
//   'dev': 'देव',
//   'hari': 'हरि',
//   'basant': 'बसन्त',
//   'vasant': 'वसन्त',
//   'hemant': 'हेमन्त',
//   'anant': 'अनन्त',
//   'nath': 'नाथ',
//   'lal': 'लाल',
//   'bai': 'बाई',
//   'devi': 'देवी',
//   'kumari': 'कुमारी',
//   'bala': 'बाला',
//   'chand': 'चन्द',
//   'chandra': 'चन्द्र',
//   'narayan': 'नारायण',
//   'prasad': 'प्रसाद',
//   'sagar': 'सागर',
//   'nandan': 'नन्दन'
// };

// // 🔠 English → Hindi phonetic transliteration map (for names not in dictionary)
// const englishToHindiPhonetic = {
//   // Vowels
//   'aa': 'आ', 'a': 'ा',
//   'ee': 'ई', 'i': 'ि',
//   'oo': 'ऊ', 'u': 'ु',
//   'e': 'े', 'ai': 'ै',
//   'o': 'ो', 'au': 'ौ',
  
//   // Consonants with combinations
//   'chh': 'छ', 'ch': 'च',
//   'kh': 'ख', 'k': 'क',
//   'gh': 'घ', 'g': 'ग',
//   'jh': 'झ', 'j': 'ज',
//   'th': 'थ', 't': 'त',
//   'dh': 'ध', 'd': 'द',
//   'ph': 'फ', 'p': 'प',
//   'bh': 'भ', 'b': 'ब',
//   'sh': 'श',
//   'ng': 'ङ', 'n': 'न',
//   'ny': 'ञ',
//   'm': 'म', 'y': 'य',
//   'r': 'र', 'l': 'ल',
//   'v': 'व', 'w': 'व',
//   's': 'स', 'h': 'ह',
//   'z': 'ज़'
// };

// // 🔠 Transliteration function (Hindi → English letters)
// function transliterate(text) {
//   if (!text) return '';
//   return text
//     .split('')
//     .map(ch => transliterationMap[ch] || ch)
//     .join('')
//     .replace(/\s+/g, ' ')
//     .trim();
// }

// // 🔄 Smart English → Hindi conversion (uses dictionary first, then phonetic)
// function englishToHindi(text) {
//   if (!text) return '';
  
//   const lowerText = text.toLowerCase().trim();
  
//   // Check if entire text is in dictionary
//   if (englishToHindiDictionary[lowerText]) {
//     return englishToHindiDictionary[lowerText];
//   }
  
//   // Check for multi-word phrases
//   const words = lowerText.split(/\s+/);
//   const translatedWords = words.map(word => {
//     // Check dictionary first
//     if (englishToHindiDictionary[word]) {
//       return englishToHindiDictionary[word];
//     }
    
//     // Fallback to phonetic transliteration
//     return phoneticTransliterate(word);
//   });
  
//   return translatedWords.join(' ');
// }

// // 📝 Phonetic transliteration for names not in dictionary
// function phoneticTransliterate(word) {
//   if (!word) return '';
  
//   let result = '';
//   let i = 0;
//   const lowerWord = word.toLowerCase();
  
//   // Start with the first consonant
//   while (i < lowerWord.length) {
//     let matched = false;
    
//     // Try to match longer patterns first (3 chars, then 2, then 1)
//     for (let len = 3; len >= 1; len--) {
//       if (i + len <= lowerWord.length) {
//         const substr = lowerWord.substring(i, i + len);
        
//         if (englishToHindiPhonetic[substr]) {
//           result += englishToHindiPhonetic[substr];
//           i += len;
//           matched = true;
//           break;
//         }
//       }
//     }
    
//     // If no match found, try basic mapping
//     if (!matched) {
//       const char = lowerWord[i];
//       // Basic single character mapping
//       const basicMap = {
//         'a': 'अ', 'b': 'ब', 'c': 'क', 'd': 'द', 'e': 'ए',
//         'f': 'फ', 'g': 'ग', 'h': 'ह', 'i': 'इ', 'j': 'ज',
//         'k': 'क', 'l': 'ल', 'm': 'म', 'n': 'न', 'o': 'ओ',
//         'p': 'प', 'q': 'क', 'r': 'र', 's': 'स', 't': 'त',
//         'u': 'उ', 'v': 'व', 'w': 'व', 'x': 'क्स', 'y': 'य',
//         'z': 'ज़'
//       };
      
//       result += basicMap[char] || char;
//       i++;
//     }
//   }
  
//   return result;
// }

// // 🧠 Generate multiple Hindi variations for better matching
// function generateHindiVariations(englishText) {
//   if (!englishText) return [];
  
//   const variations = new Set();
//   const lowerText = englishText.toLowerCase().trim();
  
//   // Primary translation using dictionary
//   const primaryTranslation = englishToHindi(lowerText);
//   variations.add(primaryTranslation);
  
//   // Check if it's a common word that might appear with/without spaces
//   const words = lowerText.split(/\s+/);
//   if (words.length > 1) {
//     // Also try without spaces
//     const noSpaces = words.join('');
//     const noSpaceTranslation = englishToHindi(noSpaces);
//     variations.add(noSpaceTranslation);
//   }
  
//   // For names, also try common variations
//   if (words.length === 1) {
//     // Try with common suffixes
//     const commonSuffixes = ['lal', 'singh', 'kumar', 'devi', 'bai', 'prasad'];
//     commonSuffixes.forEach(suffix => {
//       const withSuffix = lowerText + ' ' + suffix;
//       if (englishToHindiDictionary[withSuffix]) {
//         variations.add(englishToHindiDictionary[withSuffix]);
//       }
//     });
//   }
  
//   return Array.from(variations).filter(v => v && v.length > 0);
// }

// // 🧠 Capitalize each word for readability
// function capitalizeWords(text) {
//   return text
//     .split(' ')
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(' ');
// }

// // 🔍 Check if text contains Hindi characters
// function containsHindi(text) {
//   return /[\u0900-\u097F]/.test(text);
// }

// router.get('/get-all-deeds', async (req, res) => {
//   console.log(req.query);
//   try {
//     // 🧩 Determine which collection to use
//     let collectionName;

//     // ✅ If frontend passes "district" as numeric (e.g. 134, 137)
//     if (req.query.district && /^\d+$/.test(req.query.district)) {
//       collectionName = `deeds${req.query.district}`;
//     } else {
//       // fallback to default or manual collection param
//       collectionName = req.query.collection || 'deeds';
//     }

//     const Deed = getDeedModel(collectionName); // dynamically get correct model

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit);
//     const skip = (page - 1) * limit;

//     // 🔽 Sorting
//     let sortOption = {};
//     if (req.query.sort) {
//       if (req.query.sort.startsWith('-')) {
//         sortOption[req.query.sort.substring(1)] = -1;
//       } else {
//         sortOption[req.query.sort] = 1;
//       }
//     } else {
//       sortOption = { registrationDateParsed: -1 };
//     }

//     // 🧱 Build query
//     const query = {};

//     // 🔍 Enhanced Search filters with English-to-Hindi conversion
//     if (req.query.search) {
//       const searchTerm = req.query.search.trim();
//       const searchQueries = [];
      
//       // Check if search term is in English (no Hindi characters)
//       if (!containsHindi(searchTerm)) {
//         console.log(`🔄 English search detected: "${searchTerm}"`);
        
//         // Generate Hindi variations using dictionary + phonetic
//         const hindiVariations = generateHindiVariations(searchTerm);
//         console.log(`📝 Generated Hindi variations:`, hindiVariations);
        
//         // Search with both English and Hindi variations
//         hindiVariations.forEach(hindiTerm => {
//           if (hindiTerm && hindiTerm.trim()) {
//             searchQueries.push(
//               { 'firstParty.name': { $regex: hindiTerm, $options: 'i' } },
//               { 'secondParty.name': { $regex: hindiTerm, $options: 'i' } },
//               { 'witnesses.name': { $regex: hindiTerm, $options: 'i' } }
//             );
//           }
//         });
        
//         // Also search with original English term (for already transliterated data)
//         searchQueries.push(
//           { 'firstParty.name': { $regex: searchTerm, $options: 'i' } },
//           { 'secondParty.name': { $regex: searchTerm, $options: 'i' } },
//           { 'witnesses.name': { $regex: searchTerm, $options: 'i' } }
//         );
//       } else {
//         // Hindi search - use as is
//         console.log(`🇮🇳 Hindi search detected: "${searchTerm}"`);
//         searchQueries.push(
//           { 'firstParty.name': { $regex: searchTerm, $options: 'i' } },
//           { 'secondParty.name': { $regex: searchTerm, $options: 'i' } },
//           { 'witnesses.name': { $regex: searchTerm, $options: 'i' } }
//         );
//       }
      
//       // Add document number search (always)
//       searchQueries.push(
//         { documentNumber: { $regex: searchTerm, $options: 'i' } }
//       );
      
//       query.$or = searchQueries;
//     }

//     if (req.query.deedType) query.deedType = req.query.deedType;
//     if (req.query.year) query.year = req.query.year;
//     if (req.query.landType) query.landType = req.query.landType;

//     // ✅ Locality filter
//     if (req.query.locality) {
//       query.locality = { $regex: req.query.locality, $options: 'i' };
//     }

//     if (req.query.floor) query.floor = parseInt(req.query.floor);

//     // 📆 Month filter
//     if (req.query.month) {
//       const month = parseInt(req.query.month);
//       if (!isNaN(month) && month >= 1 && month <= 12) {
//         query.$and = query.$and || [];
//         query.$and.push({
//           $expr: { $eq: [{ $month: "$registrationDateParsed" }, month] }
//         });
//       }
//     }

//     // 💰 Value filters
//     if (req.query.minValue) query.transactionValue = { ...query.transactionValue, $gte: Number(req.query.minValue) };
//     if (req.query.maxValue) query.transactionValue = { ...query.transactionValue, $lte: Number(req.query.maxValue) };
//     if (req.query.minMarketValue) query.marketValue = { ...query.marketValue, $gte: Number(req.query.minMarketValue) };
//     if (req.query.maxMarketValue) query.marketValue = { ...query.marketValue, $lte: Number(req.query.maxMarketValue) };
//     if (req.query.minArea) query.area = { ...query.area, $gte: Number(req.query.minArea) };
//     if (req.query.maxArea) query.area = { ...query.area, $lte: Number(req.query.maxArea) };

//     // 🗓️ Date range filters
//     if (req.query.fromDate) {
//       const fromDate = new Date(req.query.fromDate);
//       query.registrationDateParsed = { ...query.registrationDateParsed, $gte: fromDate };
//     }
//     if (req.query.toDate) {
//       const toDate = new Date(req.query.toDate);
//       toDate.setHours(23, 59, 59, 999);
//       query.registrationDateParsed = { ...query.registrationDateParsed, $lte: toDate };
//     }

//     if (req.query.subRegistrar) query.subRegistrar = req.query.subRegistrar;
//     if (req.query.ward) query.ward = req.query.ward;

//     // 👷 Builder name filter with English-to-Hindi support
//     if (req.query.builder) {
//       const builderTerm = req.query.builder.trim();
//       const builderQueries = [];
      
//       if (!containsHindi(builderTerm)) {
//         // English builder name - convert to Hindi using dictionary
//         const hindiVariations = generateHindiVariations(builderTerm);
//         hindiVariations.forEach(hindiTerm => {
//           if (hindiTerm && hindiTerm.trim()) {
//             const builderRegex = new RegExp(hindiTerm, 'i');
//             builderQueries.push(
//               { 'firstParty.name': { $regex: builderRegex } },
//               { 'secondParty.name': { $regex: builderRegex } }
//             );
//           }
//         });
//       }
      
//       // Also search with original term
//       const builderRegexOriginal = new RegExp(builderTerm, 'i');
//       builderQueries.push(
//         { 'firstParty.name': { $regex: builderRegexOriginal } },
//         { 'secondParty.name': { $regex: builderRegexOriginal } }
//       );
      
//       query.$or = query.$or || [];
//       query.$or.push(...builderQueries);
//     }

//     // 🔎 Execute main query
//     console.log('🔍 Final MongoDB query:', JSON.stringify(query, null, 2));
//     const deeds = await Deed.find(query).sort(sortOption).skip(skip).limit(limit);
//     const total = await Deed.countDocuments(query);
//     const pages = Math.ceil(total / limit);

//     // 🧠 Builder Summary (Transliterated English)
//     let builderSummary = [];

//     if (req.query.locality) {
//       const builderRegex = /प्राइवेट लिमिटेड|प्रा० लि०|लिमिटेड|बिल्डर|डेवलपर|बिल्डर्स|कंस्ट्रक्शन|इंफ्रा|प्रॉपर्टीज|एस्टेट/i;
      
//       const allLocalityDeeds = await Deed.find({
//         locality: { $regex: req.query.locality, $options: 'i' },
//         $or: [
//           { 'firstParty.name': { $regex: builderRegex } },
//           { 'secondParty.name': { $regex: builderRegex } }
//         ]
//       }).sort({ registrationDateParsed: -1 });

//       const builderMap = {};

//       allLocalityDeeds.forEach(d => {
//         const builderParties = [
//           ...(d.firstParty?.filter(p => builderRegex.test(p.name || '')) || []),
//           ...(d.secondParty?.filter(p => builderRegex.test(p.name || '')) || [])
//         ];

//         builderParties.forEach(b => {
//           const rawName = b.name.trim();
//           const engName = capitalizeWords(transliterate(rawName));

//           if (!builderMap[engName]) {
//             builderMap[engName] = {
//               name: engName,
//               totalArea: 0,
//               transactionCount: 0,
//               latestDate: null
//             };
//           }

//           builderMap[engName].totalArea += d.area || 0;
//           builderMap[engName].transactionCount += 1;

//           const regDate = d.registrationDateParsed || new Date(d.registrationDate);
//           if (!builderMap[engName].latestDate || regDate > builderMap[engName].latestDate) {
//             builderMap[engName].latestDate = regDate;
//           }
//         });
//       });

//       builderSummary = Object.values(builderMap)
//         .sort((a, b) => b.latestDate - a.latestDate)
//         .map(b => ({
//           builder: b.name,
//           totalArea: b.totalArea,
//           transactionCount: b.transactionCount,
//           latestDate: b.latestDate,
//           statement: `${b.name} has purchased approximately ${b.totalArea.toFixed(2)} square meters of land (${b.transactionCount} transaction${b.transactionCount > 1 ? 's' : ''}) in this area.`
//         }));
//     }

//     // ✅ Final Response
//     res.json({
//       status: 'success',
//       collectionUsed: collectionName,
//       pages,
//       total,
//       data: deeds,
//       builderSummary,
//       searchInfo: req.query.search ? {
//         originalSearch: req.query.search,
//         isHindiInput: containsHindi(req.query.search),
//         hindiConversions: containsHindi(req.query.search) ? null : generateHindiVariations(req.query.search)
//       } : null
//     });

//   } catch (error) {
//     console.error('Error fetching deeds:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error while fetching deeds',
//       error: error.message
//     });
//   }
// });

// 🔤 Hindi → English transliteration map
const transliterationMap = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'ळ': 'l', '़': '', 'ं': 'n', 'ः': 'h', 'ँ': 'n',
  '्य': 'y', '्र': 'r', '्व': 'v',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  ' ': ' ', '्': '', 'ो': 'o', 'े': 'e', 'ा': 'a',
  'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ैं': 'ai', 'ै': 'ai', 'ौ': 'au'
};

// 📖 English → Hindi Translation Dictionary (for common words and names)
const englishToHindiDictionary = {
  // Common words that should be translated, not transliterated
  'builder': 'बिल्डर',
  'developer': 'डेवलपर',
  'private': 'प्राइवेट',
  'limited': 'लिमिटेड',
  'pvt': 'प्रा',
  'ltd': 'लि',
  'company': 'कंपनी',
  'construction': 'कंस्ट्रक्शन',
  'infrastructure': 'इंफ्रास्ट्रक्चर',
  'estate': 'एस्टेट',
  'real': 'रियल',
  'properties': 'प्रॉपर्टीज',
  'group': 'ग्रुप',
  'enterprises': 'एंटरप्राइजेज',
  'india': 'इंडिया',
  'nagar': 'नगर',
  'colony': 'कॉलोनी',
  'apartment': 'अपार्टमेंट',
  'residency': 'रेजिडेंसी',
  'tower': 'टावर',
  'heights': 'हाइट्स',
  'enclave': 'एन्क्लेव',
  'plaza': 'प्लाजा',
  
  // Common name patterns (add more as needed)
  'kumar': 'कुमार',
  'singh': 'सिंह',
  'sharma': 'शर्मा',
  'gupta': 'गुप्ता',
  'verma': 'वर्मा',
  'yadav': 'यादव',
  'mishra': 'मिश्रा',
  'pandey': 'पाण्डेय',
  'tiwari': 'तिवारी',
  'jain': 'जैन',
  'agarwal': 'अग्रवाल',
  'agrawal': 'अग्रवाल',
  'srivastava': 'श्रीवास्तव',
  'shrivastava': 'श्रीवास्तव',
  'dubey': 'दुबे',
  'chaturvedi': 'चतुर्वेदी',
  'trivedi': 'त्रिवेदी',
  'dwivedi': 'द्विवेदी',
  'pathak': 'पाठक',
  'saxena': 'सक्सेना',
  'tandon': 'टंडन',
  'malhotra': 'मल्होत्रा',
  'chopra': 'चोपड़ा',
  'kapoor': 'कपूर',
  'mehta': 'मेहता',
  'shah': 'शाह',
  'patel': 'पटेल',
  'reddy': 'रेड्डी',
  'nair': 'नायर',
  'iyer': 'अय्यर',
  'rao': 'राव',
  'khan': 'खान',
  'ali': 'अली',
  'ahmad': 'अहमद',
  'hussain': 'हुसैन',
  'arora': 'अरोरा',
  'sethi': 'सेठी',
  'bhatia': 'भाटिया',
  'khanna': 'खन्ना',
  'grover': 'ग्रोवर',
  'anand': 'आनंद',
  'bajaj': 'बजाज',
  'bansal': 'बंसल',
  'garg': 'गर्ग',
  'goyal': 'गोयल',
  'mittal': 'मित्तल',
  'singhal': 'सिंघल',
  'jindal': 'जिंदल',
  'modi': 'मोदी',
  'joshi': 'जोशी',
  'bhatt': 'भट्ट',
  'deshpande': 'देशपांडे',
  'kulkarni': 'कुलकर्णी',
  'jaiswal': 'जायसवाल',
  'jayswal': 'जायसवाल',
  
  // Common first names
  'ram': 'राम',
  'shyam': 'श्याम',
  'mohan': 'मोहन',
  'sohan': 'सोहन',
  'gopal': 'गोपाल',
  'krishna': 'कृष्ण',
  'radha': 'राधा',
  'sita': 'सीता',
  'gita': 'गीता',
  'amit': 'अमित',
  'sumit': 'सुमित',
  'rajesh': 'राजेश',
  'suresh': 'सुरेश',
  'mahesh': 'महेश',
  'dinesh': 'दिनेश',
  'ramesh': 'रमेश',
  'mukesh': 'मुकेश',
  'rakesh': 'राकेश',
  'pradeep': 'प्रदीप',
  'sandeep': 'संदीप',
  'manish': 'मनीष',
  'ashok': 'अशोक',
  'vijay': 'विजय',
  'ajay': 'अजय',
  'sanjay': 'संजय',
  'anil': 'अनिल',
  'sunil': 'सुनील',
  'kapil': 'कपिल',
  'nitin': 'नितिन',
  'sachin': 'सचिन',
  'rohit': 'रोहित',
  'mohit': 'मोहित',
  'ankit': 'अंकित',
  'vikas': 'विकास',
  'prakash': 'प्रकाश',
  'deepak': 'दीपक',
  'pankaj': 'पंकज',
  'manoj': 'मनोज',
  'vinod': 'विनोद',
  'pramod': 'प्रमोद',
  'ravi': 'रवि',
  'kavi': 'कवि',
  'shiv': 'शिव',
  'dev': 'देव',
  'hari': 'हरि',
  'basant': 'बसन्त',
  'vasant': 'वसन्त',
  'hemant': 'हेमन्त',
  'anant': 'अनन्त',
  'nath': 'नाथ',
  'lal': 'लाल',
  'bai': 'बाई',
  'devi': 'देवी',
  'kumari': 'कुमारी',
  'bala': 'बाला',
  'chand': 'चन्द',
  'chandra': 'चन्द्र',
  'narayan': 'नारायण',
  'prasad': 'प्रसाद',
  'sagar': 'सागर',
  'nandan': 'नन्दन'
};

// 🔠 English → Hindi phonetic transliteration map (for names not in dictionary)
const englishToHindiPhonetic = {
  // Vowels - full forms (used at start)
  'aa': 'आ', 'ee': 'ई', 'oo': 'ऊ', 'ai': 'ऐ', 'au': 'औ',
  
  // Consonant combinations (must come before single consonants)
  'chh': 'छ', 'ch': 'च',
  'kh': 'ख', 'gh': 'घ',
  'jh': 'झ', 'th': 'थ',
  'dh': 'ध', 'ph': 'फ',
  'bh': 'भ', 'sh': 'श',
  'ng': 'ङ', 'ny': 'ञ',
  
  // Single consonants
  'k': 'क', 'g': 'ग', 'j': 'ज',
  't': 'त', 'd': 'द', 'n': 'न',
  'p': 'प', 'b': 'ब', 'm': 'म',
  'y': 'य', 'r': 'र', 'l': 'ल',
  'v': 'व', 'w': 'व', 's': 'स',
  'h': 'ह', 'z': 'ज़', 'f': 'फ'
};

// 🔠 Transliteration function (Hindi → English letters)
function transliterate(text) {
  if (!text) return '';
  return text
    .split('')
    .map(ch => transliterationMap[ch] || ch)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

// 🔄 Smart English → Hindi conversion (uses dictionary first, then phonetic)
function englishToHindi(text) {
  if (!text) return '';
  
  const lowerText = text.toLowerCase().trim();
  
  // Check if entire text is in dictionary
  if (englishToHindiDictionary[lowerText]) {
    return englishToHindiDictionary[lowerText];
  }
  
  // Check for multi-word phrases
  const words = lowerText.split(/\s+/);
  const translatedWords = words.map(word => {
    // Check dictionary first
    if (englishToHindiDictionary[word]) {
      return englishToHindiDictionary[word];
    }
    
    // Fallback to phonetic transliteration
    return phoneticTransliterate(word);
  });
  
  return translatedWords.join(' ');
}

// 📝 Phonetic transliteration for names not in dictionary
function phoneticTransliterate(word) {
  if (!word) return '';
  
  let result = '';
  let i = 0;
  const lowerWord = word.toLowerCase();
  let isFirstChar = true;
  
  while (i < lowerWord.length) {
    let matched = false;
    
    // Try to match longer patterns first (3 chars, then 2, then 1)
    for (let len = 3; len >= 1; len--) {
      if (i + len <= lowerWord.length) {
        const substr = lowerWord.substring(i, i + len);
        
        // For consonants, check if we need full consonant or matra
        if (englishToHindiPhonetic[substr]) {
          const hindiChar = englishToHindiPhonetic[substr];
          
          // If it's a vowel sound and not first character, use matra form
          if (!isFirstChar && ['आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'].includes(hindiChar)) {
            const matraMap = {
              'आ': 'ा', 'इ': 'ि', 'ई': 'ी', 'उ': 'ु', 'ऊ': 'ू',
              'ए': 'े', 'ऐ': 'ै', 'ओ': 'ो', 'औ': 'ौ'
            };
            result += matraMap[hindiChar] || hindiChar;
          } else {
            result += hindiChar;
          }
          
          i += len;
          matched = true;
          isFirstChar = false;
          break;
        }
      }
    }
    
    // If no match found, try basic mapping
    if (!matched) {
      const char = lowerWord[i];
      
      // Improved vowel handling
      if (isFirstChar && 'aeiou'.includes(char)) {
        const vowelMap = {
          'a': 'अ', 'e': 'ए', 'i': 'इ', 'o': 'ओ', 'u': 'उ'
        };
        result += vowelMap[char] || 'अ';
      } else if ('aeiou'.includes(char)) {
        // Use matra for vowels after consonants
        const matraMap = {
          'a': 'ा', 'e': 'े', 'i': 'ि', 'o': 'ो', 'u': 'ु'
        };
        result += matraMap[char] || '';
      } else {
        // Consonant mapping
        const consonantMap = {
          'b': 'ब', 'c': 'क', 'd': 'द', 'f': 'फ', 'g': 'ग',
          'h': 'ह', 'j': 'ज', 'k': 'क', 'l': 'ल', 'm': 'म',
          'n': 'न', 'p': 'प', 'q': 'क', 'r': 'र', 's': 'स',
          't': 'त', 'v': 'व', 'w': 'व', 'x': 'क्स', 'y': 'य',
          'z': 'ज़'
        };
        result += consonantMap[char] || char;
      }
      
      isFirstChar = false;
      i++;
    }
  }
  
  return result;
}

// 🧠 Generate multiple Hindi variations for better matching
function generateHindiVariations(englishText) {
  if (!englishText) return [];
  
  const variations = new Set();
  const lowerText = englishText.toLowerCase().trim();
  
  // Primary translation using dictionary
  const primaryTranslation = englishToHindi(lowerText);
  variations.add(primaryTranslation);
  
  // Check if it's a common word that might appear with/without spaces
  const words = lowerText.split(/\s+/);
  if (words.length > 1) {
    // Also try without spaces
    const noSpaces = words.join('');
    const noSpaceTranslation = englishToHindi(noSpaces);
    variations.add(noSpaceTranslation);
  }
  
  // For names, also try common variations
  if (words.length === 1) {
    // Try with common suffixes
    const commonSuffixes = ['lal', 'singh', 'kumar', 'devi', 'bai', 'prasad'];
    commonSuffixes.forEach(suffix => {
      const withSuffix = lowerText + ' ' + suffix;
      if (englishToHindiDictionary[withSuffix]) {
        variations.add(englishToHindiDictionary[withSuffix]);
      }
    });
  }
  
  return Array.from(variations).filter(v => v && v.length > 0);
}

// 🧠 Capitalize each word for readability
function capitalizeWords(text) {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 🔍 Check if text contains Hindi characters
function containsHindi(text) {
  return /[\u0900-\u097F]/.test(text);
}

router.get('/get-all-deeds', async (req, res) => {
  console.log(req.query);
  try {
    // 🧩 Determine which collection to use
    let collectionName;

    // ✅ If frontend passes "district" as numeric (e.g. 134, 137)
    if (req.query.district && /^\d+$/.test(req.query.district)) {
      collectionName = `deeds${req.query.district}`;
    } else {
      // fallback to default or manual collection param
      collectionName = req.query.collection || 'deeds';
    }

    const Deed = getDeedModel(collectionName); // dynamically get correct model

    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit);
    // const skip = (page - 1) * limit;

    // 🔽 Sorting
    let sortOption = {};
    if (req.query.sort) {
      if (req.query.sort.startsWith('-')) {
        sortOption[req.query.sort.substring(1)] = -1;
      } else {
        sortOption[req.query.sort] = 1;
      }
    } else {
      sortOption = { registrationDateParsed: -1 };
    }

    // 🧱 Build query
    const query = {};

    // 🔍 Enhanced Search filters with English-to-Hindi conversion
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      const searchQueries = [];
      
      // Check if search term is in English (no Hindi characters)
      if (!containsHindi(searchTerm)) {
        console.log(`🔄 English search detected: "${searchTerm}"`);
        
        // Generate Hindi variations using dictionary + phonetic
        const hindiVariations = generateHindiVariations(searchTerm);
        console.log(`📝 Generated Hindi variations:`, hindiVariations);
        
        // Search with both English and Hindi variations
        hindiVariations.forEach(hindiTerm => {
          if (hindiTerm && hindiTerm.trim()) {
            searchQueries.push(
              { 'firstParty.name': { $regex: hindiTerm, $options: 'i' } },
              { 'secondParty.name': { $regex: hindiTerm, $options: 'i' } },
              { 'witnesses.name': { $regex: hindiTerm, $options: 'i' } }
            );
          }
        });
        
        // Also search with original English term (for already transliterated data)
        searchQueries.push(
          { 'firstParty.name': { $regex: searchTerm, $options: 'i' } },
          { 'secondParty.name': { $regex: searchTerm, $options: 'i' } },
          { 'witnesses.name': { $regex: searchTerm, $options: 'i' } }
        );
      } else {
        // Hindi search - use as is
        console.log(`🇮🇳 Hindi search detected: "${searchTerm}"`);
        searchQueries.push(
          { 'firstParty.name': { $regex: searchTerm, $options: 'i' } },
          { 'secondParty.name': { $regex: searchTerm, $options: 'i' } },
          { 'witnesses.name': { $regex: searchTerm, $options: 'i' } }
        );
      }
      
      // Add document number search (always)
      searchQueries.push(
        { documentNumber: { $regex: searchTerm, $options: 'i' } }
      );
      
      query.$or = searchQueries;
    }

    if (req.query.deedType) query.deedType = req.query.deedType;
    if (req.query.year) query.year = req.query.year;
    if (req.query.landType) query.landType = req.query.landType;

    // ✅ Locality filter
    if (req.query.locality) {
      query.locality = { $regex: req.query.locality, $options: 'i' };
    }

    if (req.query.floor) query.floor = parseInt(req.query.floor);

    // 📆 Month filter
    if (req.query.month) {
      const month = parseInt(req.query.month);
      if (!isNaN(month) && month >= 1 && month <= 12) {
        query.$and = query.$and || [];
        query.$and.push({
          $expr: { $eq: [{ $month: "$registrationDateParsed" }, month] }
        });
      }
    }

    // 💰 Value filters
    if (req.query.minValue) query.transactionValue = { ...query.transactionValue, $gte: Number(req.query.minValue) };
    if (req.query.maxValue) query.transactionValue = { ...query.transactionValue, $lte: Number(req.query.maxValue) };
    if (req.query.minMarketValue) query.marketValue = { ...query.marketValue, $gte: Number(req.query.minMarketValue) };
    if (req.query.maxMarketValue) query.marketValue = { ...query.marketValue, $lte: Number(req.query.maxMarketValue) };
    if (req.query.minArea) query.area = { ...query.area, $gte: Number(req.query.minArea) };
    if (req.query.maxArea) query.area = { ...query.area, $lte: Number(req.query.maxArea) };

    // 🗓️ Date range filters
    if (req.query.fromDate) {
      const fromDate = new Date(req.query.fromDate);
      query.registrationDateParsed = { ...query.registrationDateParsed, $gte: fromDate };
    }
    if (req.query.toDate) {
      const toDate = new Date(req.query.toDate);
      toDate.setHours(23, 59, 59, 999);
      query.registrationDateParsed = { ...query.registrationDateParsed, $lte: toDate };
    }

    if (req.query.subRegistrar) query.subRegistrar = req.query.subRegistrar;
    if (req.query.ward) query.ward = req.query.ward;

    // 👷 Builder name filter with English-to-Hindi support
    if (req.query.builder) {
      const builderTerm = req.query.builder.trim();
      const builderQueries = [];
      
      if (!containsHindi(builderTerm)) {
        // English builder name - convert to Hindi using dictionary
        const hindiVariations = generateHindiVariations(builderTerm);
        hindiVariations.forEach(hindiTerm => {
          if (hindiTerm && hindiTerm.trim()) {
            const builderRegex = new RegExp(hindiTerm, 'i');
            builderQueries.push(
              { 'firstParty.name': { $regex: builderRegex } },
              { 'secondParty.name': { $regex: builderRegex } }
            );
          }
        });
      }
      
      // Also search with original term
      const builderRegexOriginal = new RegExp(builderTerm, 'i');
      builderQueries.push(
        { 'firstParty.name': { $regex: builderRegexOriginal } },
        { 'secondParty.name': { $regex: builderRegexOriginal } }
      );
      
      query.$or = query.$or || [];
      query.$or.push(...builderQueries);
    }

    // 🔎 Execute main query
    console.log('🔍 Final MongoDB query:', JSON.stringify(query, null, 2));
    const deeds = await Deed.find(query).sort(sortOption);
    const total = await Deed.countDocuments(query);
    // const pages = Math.ceil(total / limit);

    // 🧠 Builder Summary (Transliterated English)
   

//     let builderSummary = [];

// if (req.query.locality && req.query.locality.trim() !== '') {
//   console.log('📍 Running builderSummary for locality:', req.query.locality);

//   const builderRegex = /(बिल्डर|बिल्डर्स|डेवलपर|डेवलपर्स|कंस्ट्रक्शन|इंफ्रा|इन्फ्रास्ट्रक्चर|प्रॉपर्टीज|एस्टेट|प्रा.?लि.?|प्राइवेट.?लिमिटेड|builders?|developers?|construction|infra|properties|estate|pvt.?ltd.?)/i;

//   const allLocalityDeeds = await Deed.find({
//     locality: { $regex: req.query.locality, $options: 'i' },
//     $or: [
//       { 'firstParty.name': { $regex: builderRegex } },
//       { 'secondParty.name': { $regex: builderRegex } }
//     ]
//   }).sort({ registrationDateParsed: -1 });

//   console.log('📍 Deeds found for builder summary:', allLocalityDeeds.length);
//   console.dir(allLocalityDeeds, { depth: null, colors: true });
  

//   const builderMap = {};

//   allLocalityDeeds.forEach(d => {
//     const builderParties = [
//       ...(d.firstParty?.filter(p => builderRegex.test((p.name || '').trim())) || []),
//       ...(d.secondParty?.filter(p => builderRegex.test((p.name || '').trim())) || [])
//     ];
    
//     console.log("builderParties" ,builderParties)

//     builderParties.forEach(b => {
//       const builderName = (b.name || '').trim(); // 👈 keep as is (no transliteration / capitalization)

//       if (!builderMap[builderName]) {
//         builderMap[builderName] = {
//           name: builderName,
//           totalArea: 0,
//           transactionCount: 0,
//           latestDate: null
//         };
//       }

//       builderMap[builderName].totalArea += Number(d.area) || 0;
//       builderMap[builderName].transactionCount += 1;

//       const regDate = d.registrationDateParsed || new Date(d.registrationDate);
//       if (!builderMap[builderName].latestDate || regDate > builderMap[builderName].latestDate) {
//         builderMap[builderName].latestDate = regDate;
//       }
//     });
//   });

//   console.log('builderMap',builderMap)
//   console.log('builderSummary',builderSummary)

//   builderSummary = Object.values(builderMap)
//     .sort((a, b) => b.latestDate - a.latestDate)
//     .map(b => ({
//       builder: b.name, // 👈 name shown exactly as in DB
//       totalArea: b.totalArea,
//       transactionCount: b.transactionCount,
//       latestDate: b.latestDate,
//       statement: `${b.name} has purchased approximately ${b.totalArea.toFixed(2)} sq.m (${b.transactionCount} transaction${b.transactionCount > 1 ? 's' : ''}) in this area.`
//     }));
// }


// 🧠 Builder Summary - Fixed version
let builderSummary = [];

if (req.query.locality && req.query.locality.trim() !== '') {
  console.log('📍 Running builderSummary for locality:', req.query.locality);

  const builderRegex = /(बिल्डर|बिल्डर्स|डेवलपर|डेवलपर्स|कंस्ट्रक्शन|इंफ्रा|इन्फ्रास्ट्रक्चर|प्रॉपर्टीज|एस्टेट|प्रा.?लि.?|प्राइवेट.?लिमिटेड|builders?|developers?|construction|infra|properties|estate|pvt.?ltd.?)/i;

  // Find all deeds in the locality that have builder-related parties
  // Use .lean() to get plain JavaScript objects instead of Mongoose documents
  const allLocalityDeeds = await Deed.find({
    locality: { $regex: req.query.locality, $options: 'i' },
    $or: [
      { 'firstParty.name': { $regex: builderRegex } },
      { 'secondParty.name': { $regex: builderRegex } }
    ]
  })
  .lean() // ✅ This converts Mongoose documents to plain objects
  .sort({ registrationDateParsed: -1 });

  console.log('📍 Deeds found for builder summary:', allLocalityDeeds.length);

  const builderMap = {};

  allLocalityDeeds.forEach((d, index) => {
    // Debug: Check deed structure
    console.log(`\n🔍 Processing deed ${index + 1}:`);
    console.log('  - documentNumber:', d.documentNumber);
    console.log('  - deedType:', d.deedType);
    console.log('  - firstParty:', d.firstParty?.length || 0, 'parties');
    console.log('  - secondParty:', d.secondParty?.length || 0, 'parties');
    
    // Log party names
    if (d.firstParty?.length > 0) {
      d.firstParty.forEach((p, i) => {
        console.log(`    firstParty[${i}]: "${p.name}"`);
      });
    }
    if (d.secondParty?.length > 0) {
      d.secondParty.forEach((p, i) => {
        console.log(`    secondParty[${i}]: "${p.name}"`);
      });
    }

    // ✅ DON'T filter again - the deed was already matched by the query
    // Just check each party and include those that match
    const builderParties = [];
    
    // Check firstParty
    if (d.firstParty && Array.isArray(d.firstParty)) {
      d.firstParty.forEach(p => {
        const name = (p.name || '').trim();
        console.log(`    Testing firstParty name: "${name}" against regex:`, builderRegex.test(name));
        if (name && builderRegex.test(name)) {
          builderParties.push(p);
        }
      });
    }
    
    // Check secondParty
    if (d.secondParty && Array.isArray(d.secondParty)) {
      d.secondParty.forEach(p => {
        const name = (p.name || '').trim();
        console.log(`    Testing secondParty name: "${name}" against regex:`, builderRegex.test(name));
        if (name && builderRegex.test(name)) {
          builderParties.push(p);
        }
      });
    }

    console.log('  ✅ builderParties found:', builderParties.length);

    builderParties.forEach(b => {
      const builderName = (b.name || '').trim();

      if (!builderName) return; // Skip empty names

      if (!builderMap[builderName]) {
        builderMap[builderName] = {
          name: builderName,
          totalArea: 0,
          transactionCount: 0,
          latestDate: null
        };
      }

      builderMap[builderName].totalArea += Number(d.area) || 0;
      builderMap[builderName].transactionCount += 1;

      const regDate = d.registrationDateParsed || new Date(d.registrationDate);
      if (!builderMap[builderName].latestDate || regDate > builderMap[builderName].latestDate) {
        builderMap[builderName].latestDate = regDate;
      }
    });
  });

  console.log('builderMap:', Object.keys(builderMap).length, 'unique builders');

  builderSummary = Object.values(builderMap)
    .sort((a, b) => b.latestDate - a.latestDate)
    .map(b => ({
      builder: b.name,
      totalArea: b.totalArea,
      transactionCount: b.transactionCount,
      latestDate: b.latestDate,
      statement: `${b.name} has purchased approximately ${b.totalArea.toFixed(2)} sq.m (${b.transactionCount} transaction${b.transactionCount > 1 ? 's' : ''}) in this area.`
    }));

  console.log('builderSummary:', builderSummary.length, 'builders');
}

    // ✅ Final Response
    res.json({
      status: 'success',
      collectionUsed: collectionName,
      total,
      data: deeds,
      builderSummary,
      searchInfo: req.query.search ? {
        originalSearch: req.query.search,
        isHindiInput: containsHindi(req.query.search),
        hindiConversions: containsHindi(req.query.search) ? null : generateHindiVariations(req.query.search)
      } : null
    });

  } catch (error) {
    console.error('Error fetching deeds:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching deeds',
      error: error.message
    });
  }
});

/**
 * GET /districts
 * Get all unique districts for filtering
 */
// router.get('/get/districts', async (req, res) => {
//     try {
//         const districts = await Deed.distinct('district');

//         // Filter out null or empty values
//         const filteredDistricts = districts.filter(district => district && district.trim() !== '');

//         // Sort alphabetically
//         filteredDistricts.sort();

//         res.json({
//             status: 'success',
//             data: filteredDistricts
//         });
//     } catch (error) {
//         console.error('Error fetching districts:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Server error while fetching districts',
//             error: error.message
//         });
//     }
// });

// router.get('/get/districts', async (req, res) => {
//     try {
//         // Fetch districts from the District collection instead
//         const districts = await District.find({}, { districtName: 1, _id: 0 });

//         // Extract just the district names
//         const districtNames = districts
//             .map(district => district.districtName)
//             .filter(name => name && name.trim() !== ''); // Filter out null or empty values

//         // Sort alphabetically
//         districtNames.sort();

//         res.json({
//             status: 'success',
//             data: districtNames
//         });
//     } catch (error) {
//         console.error('Error fetching districts:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Server error while fetching districts',
//             error: error.message
//         });
//     }
// });

// router.get('/get/districts', async (req, res) => {
//     try {
//         // Use the Village model which is actually using the districtSchema
//         const districts = await Village.find({}, { districtName: 1, _id: 0 });

//         // Extract just the district names
//         const districtNames = districts
//             .map(district => district.districtName)
//             .filter(name => name && name.trim() !== ''); // Filter out null or empty values

//         // Remove duplicates
//         const uniqueDistrictNames = [...new Set(districtNames)];

//         // Sort alphabetically
//         uniqueDistrictNames.sort();

//         res.json({
//             status: 'success',
//             data: uniqueDistrictNames
//         });
//     } catch (error) {
//         console.error('Error fetching districts:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Server error while fetching districts',
//             error: error.message
//         });
//     }
// });

// 📘 GET /get-all-districts
router.get('/get-all-districts', async (req, res) => {
  try {
    // Step 1️⃣: Get all collection names
    const collections = await db1.db.listCollections().toArray();

    // Step 2️⃣: Filter only "deeds" collections (e.g. deeds132, deeds164)
    const deedCollections = collections
      .map(c => c.name)
      .filter(name => /^deeds\d+$/.test(name));

    const districtData = [];

    // Step 3️⃣: Loop through each collection and extract district + dcode
    for (const col of deedCollections) {
      const Deed = getDeedModel(col);

      // Each collection corresponds to one unique district
      const districtArr = await Deed.distinct('district');
      const districtName = districtArr.length > 0 ? districtArr[0] : null;

      if (districtName) {
        const dcode = col.replace('deeds', ''); // extract numeric part
        districtData.push({
          dcode,
          district: districtName,
        });
      }
    }

    // Step 4️⃣: Return structured result
    res.json({
      status: 'success',
      total: districtData.length,
      districts: districtData.sort((a, b) => a.dcode - b.dcode)
    });

  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching districts',
      error: error.message
    });
  }
});


// router.get('/get/districts', async (req, res) => {
//     try {
//         // Query for both districtName and districtCode
//         const districts = await Village.find({}, { districtName: 1, districtCode: 1, _id: 0 });

//         // Create an array of objects with both code and name
//         const districtData = districts
//             .filter(district => district.districtName && district.districtName.trim() !== '')
//             .map(district => ({
//                 code: district.districtCode,
//                 name: district.districtName
//             }));

//         // Remove duplicates (in case there are any districts with the same code)
//         const uniqueDistricts = districtData.reduce((unique, district) => {
//             const exists = unique.find(item => item.code === district.code);
//             if (!exists) {
//                 unique.push(district);
//             }
//             return unique;
//         }, []);

//         // Sort alphabetically by district name
//         uniqueDistricts.sort((a, b) => a.name.localeCompare(b.name));

//         res.json({
//             status: 'success',
//             data: uniqueDistricts
//         });
//     } catch (error) {
//         console.error('Error fetching districts:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Server error while fetching districts',
//             error: error.message
//         });
//     }
// });

/**
 * GET /deed-types
 * Get all unique deed types for filtering
 */
router.get('/get/deed-types', async (req, res) => {
    try {
        const deedTypes = await Deed.distinct('deedType');

        // Filter out null or empty values
        const filteredDeedTypes = deedTypes.filter(type => type && type.trim() !== '');

        // Sort alphabetically
        filteredDeedTypes.sort();

        res.json({
            status: 'success',
            data: filteredDeedTypes
        });
    } catch (error) {
        console.error('Error fetching deed types:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching deed types',
            error: error.message
        });
    }
});

/**
 * GET /sub-registrars
 * Get all unique sub-registrars for filtering
 */
router.get('/get/sub-registrars', async (req, res) => {
    try {
        const subRegistrars = await Deed.distinct('subRegistrar');

        // Filter out null or empty values
        const filteredSubRegistrars = subRegistrars.filter(sr => sr && sr.trim() !== '');

        // Sort alphabetically
        filteredSubRegistrars.sort();

        res.json({
            status: 'success',
            data: filteredSubRegistrars
        });
    } catch (error) {
        console.error('Error fetching sub-registrars:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching sub-registrars',
            error: error.message
        });
    }
});

/**
 * GET /land-types
 * Get all unique land types for filtering
 */
router.get('/land-types', async (req, res) => {
    try {
        const landTypes = await Deed.distinct('landType');

        // Filter out null or empty values
        const filteredLandTypes = landTypes.filter(type => type && type.trim() !== '');

        // Sort alphabetically
        filteredLandTypes.sort();

        res.json({
            status: 'success',
            data: filteredLandTypes
        });
    } catch (error) {
        console.error('Error fetching land types:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching land types',
            error: error.message
        });
    }
});

/**
 * GET /stats
 * Get summary statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const totalDeeds = await Deed.countDocuments();

        // Total transaction value
        const valueStats = await Deed.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: '$transactionValue' },
                    avgValue: { $avg: '$transactionValue' },
                    maxValue: { $max: '$transactionValue' }
                }
            }
        ]);

        // Deeds by type
        const deedsByType = await Deed.aggregate([
            {
                $group: {
                    _id: '$deedType',
                    count: { $sum: 1 },
                    value: { $sum: '$transactionValue' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Deeds by month (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const deedsByMonth = await Deed.aggregate([
            {
                $match: {
                    registrationDateParsed: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$registrationDateParsed' },
                        month: { $month: '$registrationDateParsed' }
                    },
                    count: { $sum: 1 },
                    value: { $sum: '$transactionValue' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            status: 'success',
            data: {
                totalDeeds,
                valueStats: valueStats[0] || { totalValue: 0, avgValue: 0, maxValue: 0 },
                deedsByType,
                deedsByMonth
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching stats',
            error: error.message
        });
    }
});


/**
 * GET /districts
 * Get all unique districts for filtering
 */
router.get('/districts', async (req, res) => {
    try {
        const districts = await Deed.distinct('district');

        // Filter out null or empty values
        const filteredDistricts = districts.filter(district => district && district.trim() !== '');

        // Sort alphabetically
        filteredDistricts.sort();

        res.json({
            status: 'success',
            data: filteredDistricts
        });
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching districts',
            error: error.message
        });
    }
});

/**
 * GET /deed-types
 * Get all unique deed types for filtering
 */
// router.get('/deed-types', async (req, res) => {
//     try {
//         const deedTypes = await Deed.distinct('deedType');

//         // Filter out null or empty values
//         const filteredDeedTypes = deedTypes.filter(type => type && type.trim() !== '');

//         // Sort alphabetically
//         filteredDeedTypes.sort();

//         res.json({
//             status: 'success',
//             data: filteredDeedTypes
//         });
//     } catch (error) {
//         console.error('Error fetching deed types:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Server error while fetching deed types',
//             error: error.message
//         });
//     }
// });

/**
 * GET /sub-registrars
 * Get all unique sub-registrars for filtering
 */
router.get('/sub-registrars', async (req, res) => {
    try {
        const subRegistrars = await Deed.distinct('subRegistrar');

        // Filter out null or empty values
        const filteredSubRegistrars = subRegistrars.filter(sr => sr && sr.trim() !== '');

        // Sort alphabetically
        filteredSubRegistrars.sort();

        res.json({
            status: 'success',
            data: filteredSubRegistrars
        });
    } catch (error) {
        console.error('Error fetching sub-registrars:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching sub-registrars',
            error: error.message
        });
    }
});

/**
 * GET /land-types
 * Get all unique land types for filtering
 */
// router.get('/land-types', async (req, res) => {
//     try {
//         const landTypes = await Deed.distinct('landType');

//         // Filter out null or empty values
//         const filteredLandTypes = landTypes.filter(type => type && type.trim() !== '');

//         // Sort alphabetically
//         filteredLandTypes.sort();

//         res.json({
//             status: 'success',
//             data: filteredLandTypes
//         });
//     } catch (error) {
//         console.error('Error fetching land types:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Server error while fetching land types',
//             error: error.message
//         });
//     }
// });

// Update the existing land-types endpoint to maintain consistent naming
router.get('/get/land-types', async (req, res) => {
    try {
        const landTypes = await Deed.distinct('landType');

        // Filter out null or empty values
        const filteredLandTypes = landTypes.filter(type => type && type.trim() !== '');

        // Sort alphabetically
        filteredLandTypes.sort();

        res.json({
            status: 'success',
            data: filteredLandTypes
        });
    } catch (error) {
        console.error('Error fetching land types:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching land types',
            error: error.message
        });
    }
});

/**
 * GET /stats
 * Get summary statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const totalDeeds = await Deed.countDocuments();

        // Total transaction value
        const valueStats = await Deed.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: '$transactionValue' },
                    avgValue: { $avg: '$transactionValue' },
                    maxValue: { $max: '$transactionValue' }
                }
            }
        ]);

        // Deeds by type
        const deedsByType = await Deed.aggregate([
            {
                $group: {
                    _id: '$deedType',
                    count: { $sum: 1 },
                    value: { $sum: '$transactionValue' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Deeds by month (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const deedsByMonth = await Deed.aggregate([
            {
                $match: {
                    registrationDateParsed: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$registrationDateParsed' },
                        month: { $month: '$registrationDateParsed' }
                    },
                    count: { $sum: 1 },
                    value: { $sum: '$transactionValue' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            status: 'success',
            data: {
                totalDeeds,
                valueStats: valueStats[0] || { totalValue: 0, avgValue: 0, maxValue: 0 },
                deedsByType,
                deedsByMonth
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching stats',
            error: error.message
        });
    }
});



/**
 * GET /export/csv
 * Export deeds as CSV
 */
router.get('/csv', async (req, res) => {
    try {
        // Build query from parameters
        const query = {};

        // Handle IDs parameter (for exporting selected deeds)
        if (req.query.ids) {
            const ids = req.query.ids.split(',');
            query._id = { $in: ids };
        }

        // Apply same filters as the main deeds API
        if (req.query.search) {
            query.$or = [
                { 'firstParty.name': { $regex: req.query.search, $options: 'i' } },
                { 'secondParty.name': { $regex: req.query.search, $options: 'i' } },
                { documentNumber: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Basic filters
        if (req.query.deedType) query.deedType = req.query.deedType;
        if (req.query.district) query.district = req.query.district;
        if (req.query.year) query.year = req.query.year;

        // NEW FILTERS
        if (req.query.landType) query.landType = req.query.landType;
        if (req.query.locality) query.locality = { $regex: req.query.locality, $options: 'i' };
        if (req.query.subRegistrar) query.subRegistrar = req.query.subRegistrar;
        if (req.query.ward) query.ward = req.query.ward;

        // Floor number filter
        if (req.query.floor) {
            query.floor = parseInt(req.query.floor);
        }

        // Month filter
        if (req.query.month) {
            const month = parseInt(req.query.month);
            if (!isNaN(month) && month >= 1 && month <= 12) {
                query.$and = query.$and || [];
                query.$and.push({
                    $expr: {
                        $eq: [{ $month: "$registrationDateParsed" }, month]
                    }
                });
            }
        }

        // Numeric range filters
        // Transaction value
        if (req.query.minValue) {
            query.transactionValue = { ...query.transactionValue, $gte: Number(req.query.minValue) };
        }
        if (req.query.maxValue) {
            query.transactionValue = { ...query.transactionValue, $lte: Number(req.query.maxValue) };
        }

        // Market value
        if (req.query.minMarketValue) {
            query.marketValue = { ...query.marketValue, $gte: Number(req.query.minMarketValue) };
        }
        if (req.query.maxMarketValue) {
            query.marketValue = { ...query.marketValue, $lte: Number(req.query.maxMarketValue) };
        }

        // Area
        if (req.query.minArea) {
            query.area = { ...query.area, $gte: Number(req.query.minArea) };
        }
        if (req.query.maxArea) {
            query.area = { ...query.area, $lte: Number(req.query.maxArea) };
        }

        // Date range filters
        if (req.query.fromDate) {
            const fromDate = new Date(req.query.fromDate);
            query.registrationDateParsed = { ...query.registrationDateParsed, $gte: fromDate };
        }
        if (req.query.toDate) {
            const toDate = new Date(req.query.toDate);
            toDate.setHours(23, 59, 59, 999);
            query.registrationDateParsed = { ...query.registrationDateParsed, $lte: toDate };
        }

        // Fetch data with appropriate sort
        let sortOption = {};
        if (req.query.sort) {
            if (req.query.sort.startsWith('-')) {
                const field = req.query.sort.substring(1);
                sortOption[field] = -1;
            } else {
                sortOption[req.query.sort] = 1;
            }
        } else {
            sortOption = { registrationDateParsed: -1 };
        }

        const deeds = await Deed.find(query).sort(sortOption);

        if (deeds.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No deeds found to export'
            });
        }

        // Process data for export
        const exportData = deeds.map(deed => {
            // Format dates
            const formatDate = (date) => {
                if (!date) return '';
                return new Date(date).toLocaleDateString('en-IN');
            };

            // Process parties into strings
            const firstPartyNames = deed.firstParty ? deed.firstParty.map(p => p.name).join(', ') : '';
            const secondPartyNames = deed.secondParty ? deed.secondParty.map(p => p.name).join(', ') : '';
            const witnessNames = deed.witnesses ? deed.witnesses.map(p => p.name).join(', ') : '';

            return {
                'Document Number': `${deed.documentNumber}/${deed.year}`,
                'Type': deed.deedType,
                'Registration Date': formatDate(deed.registrationDateParsed),
                'Execution Date': formatDate(deed.executionDateParsed),
                'District': deed.district,
                'Sub-Registrar': deed.subRegistrar,
                'First Party': firstPartyNames,
                'Second Party': secondPartyNames,
                'Witnesses': witnessNames,
                'Transaction Value': deed.transactionValue,
                'Market Value': deed.marketValue,
                'Stamp Duty': deed.stampDuty,
                'Property Description': deed.propertyDescription,
                'Area': deed.area,
                'Land Type': deed.landType,
                'Ward': deed.ward,
                'Floor': deed.floor,
                'Locality': deed.locality,
                'Created': formatDate(deed.createdAt)
            };
        });

        // Convert to CSV
        const fields = Object.keys(exportData[0]);
        const json2csvParser = new json2csv({ fields });
        const csv = json2csvParser.parse(exportData);

        // Set headers for CSV download
        res.setHeader('Content-Disposition', 'attachment; filename=deeds_export.csv');
        res.setHeader('Content-Type', 'text/csv');

        // Send CSV data
        res.send(csv);
    } catch (error) {
        console.error('Error exporting deeds:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while exporting deeds',
            error: error.message
        });
    }
});

/**
 * GET /export/excel
 * Export deeds as Excel
 */
router.get('/excel', async (req, res) => {
    try {
        // Use the same query building logic as CSV endpoint
        const query = {};

        if (req.query.ids) {
            const ids = req.query.ids.split(',');
            query._id = { $in: ids };
        }

        // Apply filters (same as CSV endpoint)
        // ... (same filtering logic as CSV route)

        // Fetch data
        const deeds = await Deed.find(query);

        if (deeds.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No deeds found to export'
            });
        }

        // Process data for export
        // ... (same processing logic as CSV route)

        // Generate Excel file using a library like exceljs
        // For this example, we'd use the Excel library to create a workbook

        // Send Excel file as download
        // Here we would normally create and save the Excel file, then send it

        // For this example, let's just return a simple JSON confirmation
        res.json({
            status: 'success',
            message: 'Excel export functionality would be implemented here with a library like exceljs'
        });
    } catch (error) {
        console.error('Error exporting deeds as Excel:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while exporting deeds as Excel',
            error: error.message
        });
    }
});

/**
 * GET /localities
 * Get all unique localities for filtering
 */
router.get('/get/localities', async (req, res) => {
    try {
        const localities = await Locality.find({});

        // Filter out null or empty values
        // const filteredLocalities = localities.filter(locality => locality && locality.trim() !== '');

        // Sort alphabetically
        localities.sort();

        res.json({
            status: 'success',
            data: localities
        });
    } catch (error) {
        console.error('Error fetching localities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching localities',
            error: error.message
        });
    }
});

/**
 * GET /wards
 * Get all unique wards for filtering
 */
router.get('/get/wards', async (req, res) => {
    try {
        const wards = await Deed.distinct('ward');

        // Filter out null or empty values
        const filteredWards = wards.filter(ward => ward && ward.trim() !== '');

        // Sort alphabetically
        filteredWards.sort();

        res.json({
            status: 'success',
            data: filteredWards
        });
    } catch (error) {
        console.error('Error fetching wards:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching wards',
            error: error.message
        });
    }
});

/**
 * GET /floors
 * Get all unique floor values for filtering
 */
router.get('/get/floors', async (req, res) => {
    try {
        const floors = await Deed.distinct('floor');

        // Filter out null values
        const filteredFloors = floors.filter(floor => floor !== null);

        // Sort numerically
        filteredFloors.sort((a, b) => a - b);

        res.json({
            status: 'success',
            data: filteredFloors
        });
    } catch (error) {
        console.error('Error fetching floors:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching floors',
            error: error.message
        });
    }
});

/**
 * GET /months
 * Get list of months for filtering
 */
router.get('/get/months', async (req, res) => {
    try {
        // Return all 12 months with their numbers
        const months = [
            { value: 1, label: 'January' },
            { value: 2, label: 'February' },
            { value: 3, label: 'March' },
            { value: 4, label: 'April' },
            { value: 5, label: 'May' },
            { value: 6, label: 'June' },
            { value: 7, label: 'July' },
            { value: 8, label: 'August' },
            { value: 9, label: 'September' },
            { value: 10, label: 'October' },
            { value: 11, label: 'November' },
            { value: 12, label: 'December' }
        ];

        res.json({
            status: 'success',
            data: months
        });
    } catch (error) {
        console.error('Error fetching months:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching months',
            error: error.message
        });
    }
});

/**
 * GET /years
 * Get all unique years from the deeds for filtering
 */
router.get('/get/years', async (req, res) => {
    try {
        const years = await Deed.distinct('year');

        // Filter out null or empty values
        const filteredYears = years.filter(year => year && year.trim() !== '');

        // Sort numerically (descending)
        filteredYears.sort((a, b) => parseInt(b) - parseInt(a));

        res.json({
            status: 'success',
            data: filteredYears
        });
    } catch (error) {
        console.error('Error fetching years:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching years',
            error: error.message
        });
    }
});


/**
 * GET /deeds/:id
 * Get a single deed by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const deed = await Deed.findById(req.params.id);

        if (!deed) {
            return res.status(404).json({
                status: 'error',
                message: 'Deed not found'
            });
        }

        res.json({
            status: 'success',
            data: deed
        });
    } catch (error) {
        console.error('Error fetching deed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching deed',
            error: error.message
        });
    }
});

/**
 * POST /deeds
 * Create a new deed
 */
router.post('/', async (req, res) => {
    try {
        const deedData = req.body;

        // Create a new deed document
        const newDeed = new Deed(deedData);

        // Save to database
        await newDeed.save();

        res.status(201).json({
            status: 'success',
            data: newDeed
        });
    } catch (error) {
        console.error('Error creating deed:', error);
        res.status(400).json({
            status: 'error',
            message: 'Error creating deed',
            error: error.message
        });
    }
});

/**
 * DELETE /deeds/:id
 * Delete a deed by ID
 */
router.delete('/:id', async (req, res) => {
    try {
        const result = await Deed.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                status: 'error',
                message: 'Deed not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Deed deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting deed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while deleting deed',
            error: error.message
        });
    }
});

/**
 * DELETE /deeds
 * Delete multiple deeds by ID
 */
router.delete('/', async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request. Please provide an array of deed IDs.'
            });
        }

        const result = await Deed.deleteMany({ _id: { $in: ids } });

        res.json({
            status: 'success',
            message: `${result.deletedCount} deeds deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting multiple deeds:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while deleting deeds',
            error: error.message
        });
    }
});








module.exports = router;