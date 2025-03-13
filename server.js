const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const propertyLeadRoutes = require('./routes/PropertyLeadRoutes');


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
// const userRoutes = require("./routes/userRoutes");
// app.use("/api/users", userRoutes);


app.use('/property-lead', propertyLeadRoutes);

app.get( '/' , async(eq,res)=>{
    res.send("HI NDSK")

})
// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
