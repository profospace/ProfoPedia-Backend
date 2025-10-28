import mongoose from "mongoose";
// local to local
const SOURCE_DB = "DeedCatcher";
const TARGET_DB = "DeedDistricts";
const MONGO_URI = "mongodb://127.0.0.1:27017/";

async function cloneDatabase() {
  console.log(`🚀 Connecting to source: ${SOURCE_DB}`);
  const sourceConn = await mongoose.createConnection(MONGO_URI + SOURCE_DB).asPromise();

  console.log(`⚙️  Connecting to target: ${TARGET_DB}`);
  const targetConn = await mongoose.createConnection(MONGO_URI + TARGET_DB).asPromise();

  // ✅ Get all collections from source
  const collections = await sourceConn.db.listCollections().toArray();
  console.log(`📚 Found ${collections.length} collections.`);

  for (const { name } of collections) {
    console.log(`\n➡️ Copying collection: ${name}`);

    const sourceCol = sourceConn.db.collection(name);
    const targetCol = targetConn.db.collection(name);

    const docs = await sourceCol.find().toArray();
    if (docs.length > 0) {
      await targetCol.insertMany(docs);
      console.log(`✅ Inserted ${docs.length} docs into ${TARGET_DB}.${name}`);
    } else {
      console.log(`⚠️  Skipped empty collection: ${name}`);
    }
  }

  console.log("\n🎯 Database duplicated successfully!");
  await sourceConn.close();
  await targetConn.close();
  process.exit(0);
}

cloneDatabase().catch((err) => {
  console.error("❌ Error cloning DB:", err);
  process.exit(1);
});
