const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load .env first

const MONGO_URI ='mongodb://127.0.0.1:27017/Kanpur?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8';

// Check if env variable is loaded
if (!MONGO_URI) {
    console.error('❌ MONGO_URI_DB1 is not defined in .env');
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Loose schemas (strict: false) so we don’t depend on exact models
const Deed = mongoose.model('Deed', new mongoose.Schema({}, { strict: false }));
const Builder = mongoose.model('Builder', new mongoose.Schema({}, { strict: false }));

// Regex for builder/company names in Hindi
const builderRegex = /(बिल्डर|प्रॉपर्टी|कंस्ट्रक्शन|डिवेलपर्स|लिमिटेड|इन्फ्रा|कंपनी)/i;

async function populateBuilders() {
    try {
        console.log('🚀 Starting builder extraction...');

        const deeds = await Deed.find({}, { firstParty: 1, secondParty: 1 });
        console.log(`Total deeds found: ${deeds.length}`);

        const newBuilders = new Set();

        for (const deed of deeds) {
            const parties = [...(deed.firstParty || []), ...(deed.secondParty || [])];

            for (const party of parties) {
                if (party.name && builderRegex.test(party.name)) {
                    newBuilders.add(party.name.trim());
                }
            }
        }

        console.log(`Found ${newBuilders.size} unique builder names.`);

        // Insert builders if not exist
        let addedCount = 0;
        for (const name of newBuilders) {
            const exists = await Builder.findOne({ name });
            if (!exists) {
                await Builder.create({ name });
                addedCount++;
                console.log(`✅ Added builder: ${name}`);
            }
        }

        console.log(`\n🎯 Builder extraction completed. New builders added: ${addedCount}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during builder extraction:', err);
        process.exit(1);
    }
}

// Run the script
populateBuilders();
