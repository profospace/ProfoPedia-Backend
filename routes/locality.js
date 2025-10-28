const express = require('express');
const Locality =  require("../models/Locality");
const axios = require('axios')

const router = express.Router();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

// 📍 Get all localities
router.get("/", async (req, res) => {
  const localities = await Locality.find().sort({ createdAt: -1 });
  res.json(localities);
});

// ➕ Add or update a locality
router.post("/", async (req, res) => {
  const { name, lat, lng, pincode } = req.body;
  let loc = await Locality.findOneAndUpdate(
    { name },
    { lat, lng, pincode },
    { upsert: true, new: true }
  );
  res.json(loc);
});

// 🌍 Fetch from Google Maps
router.get("/geocode", async (req, res) => {
  try {
    const { name } = req.query;
    const response = await axios.get(GEOCODE_URL, {
      params: { address: `${name}, Kanpur, Uttar Pradesh`, key: GOOGLE_MAPS_API_KEY },
    });
    const result = response.data.results[0];
    if (!result) return res.status(404).json({ error: "No results found" });

    const pincode = result.address_components.find((c) =>
      c.types.includes("postal_code")
    )?.long_name;

    res.json({
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      pincode: pincode || "N/A",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
