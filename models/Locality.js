// const mongoose = require('mongoose');

// const localitySchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true }, // Original name (Hindi/English)
//   lat: { type: Number },
//   lng: { type: Number },
//   pincode: { type: String },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Locality", localitySchema);


const mongoose = require('mongoose');

const localitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Locality name (Hindi/English)
  lat: { type: Number }, // Center latitude
  lng: { type: Number }, // Center longitude
  pincode: { type: String },
  boundary: {
    type: mongoose.Schema.Types.Mixed, // Can store Google viewport or OSM polygon array
    default: null,
  },
  source: {
    type: String,
    enum: ['google', 'osm', null],
    default: null, // Tracks which API provided the boundary
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Automatically update timestamps on save
localitySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Locality', localitySchema);
