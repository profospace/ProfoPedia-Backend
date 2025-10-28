const mongoose = require("mongoose");
//  deeds -> deeds114 ,deeds210 , ................
const MONGO_URI = "mongodb://127.0.0.1:27017/DeedDistricts"; // change 

async function splitDeeds() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const sourceCollection = db.collection("deeds");
  const distinctDcodes = await sourceCollection.distinct("dcode");

  console.log(`🚀 Found ${distinctDcodes.length} unique dcode values.`);

  for (const dcode of distinctDcodes) {
    if (!dcode) continue; // skip empty ones

    const targetCollectionName = `deeds${dcode}`;
    const targetCollection = db.collection(targetCollectionName);

    const deeds = await sourceCollection.find({ dcode }).toArray();

    if (deeds.length === 0) continue;

    console.log(`📦 Creating collection: ${targetCollectionName} (${deeds.length} docs)`);

    // Clean if already exists
    await targetCollection.deleteMany({});
    await targetCollection.insertMany(deeds);

    console.log(`✅ Inserted ${deeds.length} documents into ${targetCollectionName}`);
  }

  console.log("🎯 Done splitting deeds by dcode!");
  mongoose.connection.close();
}

splitDeeds().catch((err) => {
  console.error("❌ Error splitting deeds:", err);
  process.exit(1);
});
