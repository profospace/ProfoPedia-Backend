// import mongoose from "mongoose";
// import axios from "axios";
// import dotenv from "dotenv";
// import fs from "fs";
// import Locality from "../models/Locality.js";
// dotenv.config();



// const axios = require("axios");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const fs = require("fs");
// // const Locality = require("../models/Locality.js"); // ✅ your existing schema
// const Locality = mongoose.model('locality', new mongoose.Schema({}, { strict: false }));
// dotenv.config();



// const GOOGLE_MAPS_API_KEY = 'AIzaSyCAxLPWJ3If855zICuSdKNWCYrSDhPauVM';
// const MONGO_URI = 'mongodb://127.0.0.1:27017/DeedDistricts?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8';
// const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

// // ✅ List of localities (you can import from a JSON file if needed)
// const localities = [
//   "Jama Masjid ke Peechhe",
//   "अकथा",
//   "अकवरावाद",
//   "अगलगा",
//   "अनवर गंज 84 चक",
//   "अनूपनगर फाजलपुर पुरानी ग्राम की आबादी",
//   "अफजलपुर",
//   "अमर नगर",
//   "अम्‍बेडकर नगर 117 चक",
//   "अशोक नगर कल्‍यानपुर",
//   "अहिल्‍याबाई होल्‍कर नगर",
//   "आचार्य नगर 87 चक",
//   "आदर्श नगर मथुरा नगर जनता नगर कुशवाहा नगर कैलाश नगर रावतपुर",
//   "आर्दशनगर (खिर्वा रोड)",
//   "आवास विकास अमबेडकरपुरम",
//   "आवास विकास योजना 1 केशवपुरम",
//   "आवास विकास योजना 3 पनकी कल्यानपुर रोड",
//   "इटारा",
//   "इन्‍डस्ट्रियल इस्‍टेट फजलगंज",
//   "इस्‍पात नगर",
//   "उघोग नगर ए ब्‍लाक",
//   "उघोग नगर बी ब्‍लाक",
//   "उदयपुर",
//   "एम पी उघोग मिल कैम्‍पस 117 चक",
//   "एेंती",
//   "ऐती",
//   "ओम नगर  119 चक",
//   "कटरा आंशिक",
//   "कठारा",
//   "कठारा 1",
//   "कठारा 2",
//   "कठारा 3",
//   "कठुई",
//   "कठेरूआ",
//   "कडरी चम्पतपुर",
//   "कड़री चम्‍पतपुर",
//   "कपिली",
//   "कपिली के डी ए कालोनी व शताब्दी नगर  फेज 3",
//   "कपिली गांव",
//   "कबाड़ी मार्केट122 123 चक",
//   "कमलनेनपुर",
//   "कमला नगर",
//   "कल्यानपुर कलाँ",
//   "कल्यानपुर खुर्द",
//   "कल्‍यानपुर खुर्द",
//   "कल्‍यानपुर सी व बी  ब्‍लाक",
//   "कश्‍यप नगर",
//   "कस्बा",
//   "कावर खास",
//   "किदवई नगर",
//   "कुई जेड0ए0",
//   "कुकढी",
//   "केचुहा",
//   "गली पातीराम",
//   "गुन्नौर आरिफ़",
//   "गोलपाडा",
//   "चित्ती खाना",
//   "चौसर पडिया (बा०टा०एरिया)",
//   "जैमा",
//   "देवरी ता0नीबी",
//   "धर्मपुर",
//   "नई बस्ती",
//   "नगला छिददा",
//   "नूरपुर पश्रिचमी",
//   "पुरवारी टोला आशिक",
//   "पूर्वा निहाल सिंह",
//   "बंजारी कुंआ",
//   "बगबना",
//   "बद्रीशपुरम",
//   "बुढाना बागंर‚खादर‚ दक्षिणी‚ उत्तरी",
//   "बेगमबाग (मेरठ विकास प्राधिकरण)",
//   "बेगराजपुर",
//   "बेलनगंज",
//   "ब्राहम्‍पुर",
//   "रमदत्तपुर",
//   "राधाकुण्‍ड",
//   "रुस्तमपुर हाइवे के दक्षिण्",
//   "लक्ष्मी बाई नगर",
//   "लौंडा बहेडी",
//   "वसुन्धरा  2‚4‚6‚8‚10‚12‚14‚16 व 18",
//   "शर्की",
//   "शहबाजपुर",
//   "शिवपुरवां",
//   "शीतला घाटी",
//   "शेखामैदान आं0",
//   "शौर्यापुरम",
//   "सदर बाजार",
//   "सरसावा अन्दर हदूद जैड ए",
//   "सलावत नगर",
//   "सुल्तानपुर भावा",
//   "सेब का बाजार",
//   "सैदपुर हाकनस",
//   "सोनिया",
//   "स्वाले नगर नवदिया",
//   "हटिया",
//   "हापुड"
// ];

// const fetchLatLng = async (place) => {
//   try {
//     const response = await axios.get(GEOCODE_URL, {
//       params: {
//         address: `${place}, Kanpur, Uttar Pradesh`,
//         key: GOOGLE_MAPS_API_KEY,
//       },
//     });
//     const result = response.data.results[0];
//     if (!result) return { lat: null, lng: null, pincode: null };

//     const pincode = result.address_components.find((c) =>
//       c.types.includes("postal_code")
//     )?.long_name;

//     return {
//       lat: result.geometry.location.lat,
//       lng: result.geometry.location.lng,
//       pincode: pincode || "N/A",
//     };
//   } catch (err) {
//     console.error(`❌ Error fetching ${place}: ${err.message}`);
//     return { lat: null, lng: null, pincode: null };
//   }
// };

// const run = async () => {
//   await mongoose.connect(MONGO_URI);
//   console.log("✅ Connected to MongoDB");

//   const results = [];

//   for (const name of localities) {
//     console.log(`📍 Processing: ${name}`);
//     const existing = await Locality.findOne({ name });
//     if (existing) {
//       console.log("⚠️ Already exists, skipping");
//       continue;
//     }

//     const data = await fetchLatLng(name);
//     const localityDoc = new Locality({
//       name,
//       lat: data.lat,
//       lng: data.lng,
//       pincode: data.pincode
//     });

//     await localityDoc.save();
//     results.push(localityDoc);
//     await new Promise((r) => setTimeout(r, 400)); // throttle
//   }

//   fs.writeFileSync("localities_with_latlng.json", JSON.stringify(results, null, 2));
//   console.log("✅ Done! Saved all to MongoDB and local file.");
//   mongoose.connection.close();
// };

// run();



// const axios = require("axios");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const fs = require("fs");
// // const Locality = require("../models/Locality.js"); // ✅ your existing schema
// const Locality = mongoose.model('locality', new mongoose.Schema({}, { strict: false }));


// dotenv.config();

// const GOOGLE_API_KEY =
//   process.env.VITE_GOOGLE_API_KEY ||
//   "AIzaSyCAxLPWJ3If855zICuSdKNWCYrSDhPauVM";
// const MONGO_URI =
//   "mongodb://127.0.0.1:27017/Kanpur?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8";

// // 1️⃣ Fetch boundary from Google Places API
// async function fetchGoogleBoundary(locality) {
//   try {
//     const searchRes = await axios.get(
//       "https://maps.googleapis.com/maps/api/place/textsearch/json",
//       {
//         params: {
//           query: `${locality}, Kanpur, Uttar Pradesh`,
//           key: GOOGLE_API_KEY,
//         },
//       }
//     );

//     const place = searchRes.data.results[0];
//     if (!place) return null;

//     const detailRes = await axios.get(
//       "https://maps.googleapis.com/maps/api/place/details/json",
//       {
//         params: { place_id: place.place_id, key: GOOGLE_API_KEY },
//       }
//     );

//     const geometry = detailRes.data.result.geometry;
//     return geometry?.viewport || null; // returns bounding box
//   } catch (err) {
//     console.error(`❌ Google error for ${locality}: ${err.message}`);
//     return null;
//   }
// }

// // 2️⃣ Fetch boundary from OpenStreetMap (fallback)
// async function fetchOSMBoundary(locality) {
//   try {
//     const query = `[out:json];relation["name"="${locality}"];out geom;`;
//     const res = await axios.get(
//       `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
//     );

//     if (!res.data.elements.length) return null;

//     const geometry = res.data.elements[0].members
//       .flatMap((m) => m.geometry)
//       .map((g) => ({ lat: g.lat, lng: g.lon }));

//     return geometry;
//   } catch (err) {
//     console.error(`❌ OSM error for ${locality}: ${err.message}`);
//     return null;
//   }
// }

// // 3️⃣ Main function
// async function run() {
//   await mongoose.connect(MONGO_URI);
//   console.log("✅ Connected to MongoDB");

//   const allLocalities = await Locality.find({});
//   console.log(`📦 Found ${allLocalities.length} localities in database.`);

//   const results = [];

//   for (const loc of allLocalities) {
//     const name = loc.name;
//     console.log(`📍 Processing: ${name}`);

//     // Skip if boundary already exists
//     if (loc.boundary) {
//       console.log(`⚠️ Already has boundary, skipping.`);
//       continue;
//     }

//     let boundary = await fetchGoogleBoundary(name);
//     if (!boundary) boundary = await fetchOSMBoundary(name);

//     if (!boundary) {
//       console.log(`⚠️ No boundary found for ${name}`);
//       continue;
//     }

//     // Add boundary dynamically
//     loc.boundary = boundary;
//     await loc.save();

//     console.log(`✅ Saved boundary for ${name}`);
//     results.push({ name, boundary });

//     await new Promise((r) => setTimeout(r, 400)); // prevent API throttling
//   }

//   fs.writeFileSync(
//     "localities_with_boundaries.json",
//     JSON.stringify(results, null, 2)
//   );
//   console.log("✅ Done! Boundaries updated and saved to JSON file.");

//   mongoose.connection.close();
// }

// run();


// const axios = require("axios");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const fs = require("fs");
// const Locality = require("../models/Locality.js"); // ✅ use your actual schema

// dotenv.config();

// const GOOGLE_API_KEY =
//   process.env.VITE_GOOGLE_API_KEY ||
//   "AIzaSyCAxLPWJ3If855zICuSdKNWCYrSDhPauVM";
// const MONGO_URI =
//   "mongodb://127.0.0.1:27017/DeedDistricts?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8";

// // ✅ Google Place Boundary
// async function fetchGoogleBoundary(locality) {
//   try {
//     const searchRes = await axios.get(
//       "https://maps.googleapis.com/maps/api/place/textsearch/json",
//       {
//         params: {
//           query: `${locality}, Kanpur, Uttar Pradesh`,
//           key: GOOGLE_API_KEY,
//         },
//       }
//     );

//     const place = searchRes.data.results[0];
//     if (!place) return null;

//     const detailRes = await axios.get(
//       "https://maps.googleapis.com/maps/api/place/details/json",
//       {
//         params: { place_id: place.place_id, key: GOOGLE_API_KEY },
//       }
//     );

//     const geometry = detailRes.data.result.geometry;
//     return geometry?.viewport || null;
//   } catch (err) {
//     console.error(`❌ Google error for ${locality}: ${err.message}`);
//     return null;
//   }
// }

// // ✅ OSM Boundary (fallback)
// async function fetchOSMBoundary(locality) {
//   try {
//     const query = `[out:json];relation["name"="${locality}"];out geom;`;
//     const res = await axios.get(
//       `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
//     );

//     if (!res.data.elements.length) return null;

//     const geometry = res.data.elements[0].members
//       .flatMap((m) => m.geometry)
//       .map((g) => ({ lat: g.lat, lng: g.lon }));

//     return geometry;
//   } catch (err) {
//     console.error(`❌ OSM error for ${locality}: ${err.message}`);
//     return null;
//   }
// }

// // ✅ Run main process
// async function run() {
//   await mongoose.connect(MONGO_URI);
//   console.log("✅ Connected to MongoDB");

//   const allLocalities = await Locality.find({});
//   console.log(`📦 Found ${allLocalities.length} localities in database.`);

//   const results = [];

//   for (const loc of allLocalities) {
//     const name = loc.name;
//     console.log(`📍 Processing: ${name}`);

//     if (loc.boundary) {
//       console.log(`⚠️ Already has boundary, skipping.`);
//       continue;
//     }

//     let boundary = await fetchGoogleBoundary(name);
//     if (!boundary) boundary = await fetchOSMBoundary(name);

//     if (!boundary) {
//       console.log(`⚠️ No boundary found for ${name}`);
//       continue;
//     }

//     // ✅ Save boundary to DB
//     await Locality.updateOne(
//       { _id: loc._id },
//       { $set: { boundary, updatedAt: new Date() } }
//     );

//     console.log(`✅ Saved boundary for ${name}`);
//     results.push({ name, boundary });

//     await new Promise((r) => setTimeout(r, 400));
//   }

//   fs.writeFileSync(
//     "localities_with_boundaries.json",
//     JSON.stringify(results, null, 2)
//   );

//   console.log("✅ Done! Boundaries updated and saved to JSON file.");
//   mongoose.connection.close();
// }

// run();


/**
 * ✅ Auto-generate locality collection from deeds
 * Scans deeds, fetches lat/lng via Google Maps, and saves to MongoDB.
 */

const axios = require("axios");
const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

// --- CONFIG ---
const GOOGLE_MAPS_API_KEY = "AIzaSyCAxLPWJ3If855zICuSdKNWCYrSDhPauVM";
const MONGO_URI = "mongodb://127.0.0.1:27017/DeedDistricts?directConnection=true";

// --- SCHEMAS ---
const Locality = mongoose.model("locality", new mongoose.Schema({}, { strict: false }));


// const Deed = mongoose.model("deed", deedSchema, "deeds"); // 👈 Use your actual collection name here
const Deed = mongoose.model('deeds164', new mongoose.Schema({}, { strict: false }), 'deeds164');


// --- Google Maps Geocode API ---
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

const fetchLatLng = async (place) => {
  if (!place || place.trim() === "") return { lat: null, lng: null, pincode: null };

  try {
    const response = await axios.get(GEOCODE_URL, {
      params: {
        address: `${place}, Kanpur, Uttar Pradesh`,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    const result = response.data.results[0];
    if (!result) return { lat: null, lng: null, pincode: null };

    const pincode =
      result.address_components.find((c) => c.types.includes("postal_code"))?.long_name || "N/A";

    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      pincode,
    };
  } catch (err) {
    console.error(`❌ Error fetching "${place}": ${err.message}`);
    return { lat: null, lng: null, pincode: null };
  }
};

// --- MAIN FUNCTION ---
const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Step 1: Get unique localities from deeds
  const localities = await Deed.distinct("locality", { locality: { $ne: null, $ne: "" } });
  console.log(`📍 Found ${localities.length} unique localities in deeds`);

  const results = [];

  // Step 2: Process each locality
  for (const name of localities) {
    console.log(`➡️ Processing: ${name}`);

    const existing = await Locality.findOne({ name });
    if (existing) {
      console.log("⚠️ Already exists, skipping");
      continue;
    }

    const data = await fetchLatLng(name);
    const localityDoc = new Locality({
      name,
      lat: data.lat,
      lng: data.lng,
      pincode: data.pincode,
    });

    await localityDoc.save();
    results.push(localityDoc);
    console.log(`✅ Saved: ${name}`);
    await new Promise((r) => setTimeout(r, 400)); // throttle requests
  }

  // Step 3: Save backup file
  fs.writeFileSync("localities_from_deeds.json", JSON.stringify(results, null, 2));
  console.log("🎉 Done! All localities saved to MongoDB and local file.");

  mongoose.connection.close();
};

run();
