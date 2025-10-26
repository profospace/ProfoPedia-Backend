import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import Locality from "../models/Locality.js";
dotenv.config();

const GOOGLE_MAPS_API_KEY = 'AIzaSyCAxLPWJ3If855zICuSdKNWCYrSDhPauVM';
const MONGO_URI = 'mongodb://127.0.0.1:27017/Kanpur?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8';
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

// ✅ List of localities (you can import from a JSON file if needed)
const localities = [
  "Jama Masjid ke Peechhe",
  "अकथा",
  "अकवरावाद",
  "अगलगा",
  "अनवर गंज 84 चक",
  "अनूपनगर फाजलपुर पुरानी ग्राम की आबादी",
  "अफजलपुर",
  "अमर नगर",
  "अम्‍बेडकर नगर 117 चक",
  "अशोक नगर कल्‍यानपुर",
  "अहिल्‍याबाई होल्‍कर नगर",
  "आचार्य नगर 87 चक",
  "आदर्श नगर मथुरा नगर जनता नगर कुशवाहा नगर कैलाश नगर रावतपुर",
  "आर्दशनगर (खिर्वा रोड)",
  "आवास विकास अमबेडकरपुरम",
  "आवास विकास योजना 1 केशवपुरम",
  "आवास विकास योजना 3 पनकी कल्यानपुर रोड",
  "इटारा",
  "इन्‍डस्ट्रियल इस्‍टेट फजलगंज",
  "इस्‍पात नगर",
  "उघोग नगर ए ब्‍लाक",
  "उघोग नगर बी ब्‍लाक",
  "उदयपुर",
  "एम पी उघोग मिल कैम्‍पस 117 चक",
  "एेंती",
  "ऐती",
  "ओम नगर  119 चक",
  "कटरा आंशिक",
  "कठारा",
  "कठारा 1",
  "कठारा 2",
  "कठारा 3",
  "कठुई",
  "कठेरूआ",
  "कडरी चम्पतपुर",
  "कड़री चम्‍पतपुर",
  "कपिली",
  "कपिली के डी ए कालोनी व शताब्दी नगर  फेज 3",
  "कपिली गांव",
  "कबाड़ी मार्केट122 123 चक",
  "कमलनेनपुर",
  "कमला नगर",
  "कल्यानपुर कलाँ",
  "कल्यानपुर खुर्द",
  "कल्‍यानपुर खुर्द",
  "कल्‍यानपुर सी व बी  ब्‍लाक",
  "कश्‍यप नगर",
  "कस्बा",
  "कावर खास",
  "किदवई नगर",
  "कुई जेड0ए0",
  "कुकढी",
  "केचुहा",
  "गली पातीराम",
  "गुन्नौर आरिफ़",
  "गोलपाडा",
  "चित्ती खाना",
  "चौसर पडिया (बा०टा०एरिया)",
  "जैमा",
  "देवरी ता0नीबी",
  "धर्मपुर",
  "नई बस्ती",
  "नगला छिददा",
  "नूरपुर पश्रिचमी",
  "पुरवारी टोला आशिक",
  "पूर्वा निहाल सिंह",
  "बंजारी कुंआ",
  "बगबना",
  "बद्रीशपुरम",
  "बुढाना बागंर‚खादर‚ दक्षिणी‚ उत्तरी",
  "बेगमबाग (मेरठ विकास प्राधिकरण)",
  "बेगराजपुर",
  "बेलनगंज",
  "ब्राहम्‍पुर",
  "रमदत्तपुर",
  "राधाकुण्‍ड",
  "रुस्तमपुर हाइवे के दक्षिण्",
  "लक्ष्मी बाई नगर",
  "लौंडा बहेडी",
  "वसुन्धरा  2‚4‚6‚8‚10‚12‚14‚16 व 18",
  "शर्की",
  "शहबाजपुर",
  "शिवपुरवां",
  "शीतला घाटी",
  "शेखामैदान आं0",
  "शौर्यापुरम",
  "सदर बाजार",
  "सरसावा अन्दर हदूद जैड ए",
  "सलावत नगर",
  "सुल्तानपुर भावा",
  "सेब का बाजार",
  "सैदपुर हाकनस",
  "सोनिया",
  "स्वाले नगर नवदिया",
  "हटिया",
  "हापुड"
];

const fetchLatLng = async (place) => {
  try {
    const response = await axios.get(GEOCODE_URL, {
      params: {
        address: `${place}, Kanpur, Uttar Pradesh`,
        key: GOOGLE_MAPS_API_KEY,
      },
    });
    const result = response.data.results[0];
    if (!result) return { lat: null, lng: null, pincode: null };

    const pincode = result.address_components.find((c) =>
      c.types.includes("postal_code")
    )?.long_name;

    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      pincode: pincode || "N/A",
    };
  } catch (err) {
    console.error(`❌ Error fetching ${place}: ${err.message}`);
    return { lat: null, lng: null, pincode: null };
  }
};

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const results = [];

  for (const name of localities) {
    console.log(`📍 Processing: ${name}`);
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
      pincode: data.pincode
    });

    await localityDoc.save();
    results.push(localityDoc);
    await new Promise((r) => setTimeout(r, 400)); // throttle
  }

  fs.writeFileSync("localities_with_latlng.json", JSON.stringify(results, null, 2));
  console.log("✅ Done! Saved all to MongoDB and local file.");
  mongoose.connection.close();
};

run();
