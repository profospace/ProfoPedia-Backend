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
const propertyDetailsRoutes = require('./routes/propertyDetail-routes');
const deedRoutes = require('./routes/deadRoutes');
const path = require('path');


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

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', propertyRoutes);
app.use('/details', propertyDetailsRoutes);
app.use('/api', deedRoutes);


// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Property Deed API is running' });
});


// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});