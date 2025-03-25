// // const express = require("express");
// // const mongoose = require("mongoose");
// // const dotenv = require("dotenv");
// // const cors = require("cors");
// // const propertyLeadRoutes = require('./routes/PropertyLeadRoutes');


// // dotenv.config();

// // const app = express();
// // app.use(express.json());
// // app.use(cors());

// // // Import Routes
// // // const userRoutes = require("./routes/userRoutes");
// // // app.use("/api/users", userRoutes);


// // app.use('/property-lead', propertyLeadRoutes);

// // app.get( '/' , async(eq,res)=>{
// //     res.send("HI NDSK")

// // })
// // // Connect to MongoDB
// // mongoose
// //     .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// //     .then(() => console.log("MongoDB Connected"))
// //     .catch((err) => console.log(err));

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const propertyRoutes = require('./routes/property-routes');
// const propertyDetailsRoutes = require('./routes/propertyDetail-routes');
// const deedRoutes = require('./routes/deadRoutes');
// const automationRoutes = require('./routes/automation-routes');
// const path = require('path');


// // Load environment variables from .env file
// dotenv.config();

// // Create Express app
// const app = express();

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// app.get('/automation', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/automation.html'));
// });

// app.use('/deeds', propertyDetailsRoutes);
// app.use('/api/deeds', deedRoutes);
// app.use('/api/automation', automationRoutes);

// // Static folder for uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api', propertyRoutes);
// // app.use('/api', deedRoutes);


// // Root route
// app.get('/', (req, res) => {
//     res.json({ message: 'Property Deed API is running' });
// });


// // Start server
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// Main server file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const cheerio = require('cheerio');
const propertyRoutes = require('./routes/property-routes');
const propertyDetailsRoutes = require('./routes/propertyDetail-routes');
const deedRoutes = require('./routes/deadRoutes');
const automationRoutes = require('./routes/automation-routes');
const districtsRoutes = require('./routes/districtRoutes')
const villageRoutes = require('./routes/villageRoutes')
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


app.get('/automation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/automation.html'));
});

app.get('/upload-district-sro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'district.html'));
});

app.get('/village', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'village.html'));
});

// Routes
app.use('/district', districtsRoutes);
app.use('/village', villageRoutes);
app.use('/deeds', propertyDetailsRoutes);
app.use('/api/deeds', deedRoutes);
app.use('/api/automation', automationRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', propertyRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Property Deed API is running' });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});