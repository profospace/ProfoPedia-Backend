/**
 * Separate deeds by dcode (example: 141)
 * Usage:
 *   node scripts/separateDcodeDeeds.js "<MONGO_URI>" 141
 */

const mongoose = require('mongoose');

async function main() {
  try {
    const mongoUri = 'mongodb://127.0.0.1:27017/DeedCatcher?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8';
    const targetDcode = process.argv[3] || '141';

    if (!mongoUri) {
      console.error('❌ Missing MongoDB URI.\nUsage: node scripts/separateDcodeDeeds.js "<MONGO_URI>" 141');
      process.exit(1);
    }

    console.log(`🔗 Connecting to MongoDB...`);
    const db2 = mongoose.createConnection(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await new Promise((resolve, reject) => {
      db2.once('open', resolve);
      db2.on('error', reject);
    });
    console.log('✅ Connected to MongoDB');

    // Load your schema from models
    const deedSchema = require('../models/deedSchema').schema;

    const Deed = db2.model('Deed', deedSchema, 'deeds'); // existing collection
    const DeedSeparated = db2.model(`Deed_${targetDcode}`, deedSchema, `Deed_${targetDcode}`);

    console.log(`🔍 Finding deeds with dcode = ${targetDcode}...`);
    const deeds = await Deed.find({ dcode: targetDcode }).lean();

    if (deeds.length === 0) {
      console.log(`❌ No deeds found for dcode: ${targetDcode}`);
      process.exit(0);
    }

    console.log(`✅ Found ${deeds.length} deeds. Copying...`);
    await DeedSeparated.insertMany(deeds);

    console.log(`🎉 Successfully copied ${deeds.length} deeds to collection: Deed_${targetDcode}`);

    await db2.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error separating deeds:', err);
    process.exit(1);
  }
}

main();
