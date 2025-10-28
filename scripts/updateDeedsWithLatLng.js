// // // // // /**
// // // // //  * updateDeedsWithLatLng.js
// // // // //  *
// // // // //  * Updates all deeds with latitude, longitude, and pincode
// // // // //  * from the Locality collection based on their `locality` field.
// // // // //  */

// // // // // const mongoose = require('mongoose');
// // // // // const Deed = require('../models/deedSchema');
// // // // // const Locality = require('../models/locality'); // adjust path if needed

// // // // // // Replace this with your MongoDB URI manually
// // // // // const MONGO_URI = 'mongodb://127.0.0.1:27017/Kanpur?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8';

// // // // // (async () => {
// // // // //   try {
// // // // //     console.log('🚀 Connecting to MongoDB...');
// // // // //     await mongoose.connect(MONGO_URI, {
// // // // //       useNewUrlParser: true,
// // // // //       useUnifiedTopology: true,
// // // // //     });

// // // // //     console.log('✅ Connected successfully.');

// // // // //     // Find all deeds with a locality value
// // // // //     const deeds = await Deed.find({ locality: { $exists: true, $ne: '' } });
// // // // //     console.log(`📜 Found ${deeds.length} deeds with locality.`);

// // // // //     let updatedCount = 0;
// // // // //     let missingCount = 0;

// // // // //     for (const deed of deeds) {
// // // // //       const localityName = deed.locality.trim();

// // // // //       // Find locality (case-insensitive match)
// // // // //       const locality = await Locality.findOne({
// // // // //         name: { $regex: `^${localityName}$`, $options: 'i' }
// // // // //       });

// // // // //       if (locality && locality.lat && locality.lng) {
// // // // //         const updateFields = {
// // // // //           lat: locality.lat,
// // // // //           lng: locality.lng,
// // // // //           pincode: locality.pincode || null,
// // // // //           updatedAt: new Date()
// // // // //         };

// // // // //         await Deed.updateOne({ _id: deed._id }, { $set: updateFields });
// // // // //         updatedCount++;
// // // // //         console.log(`✅ Updated: ${localityName}`);
// // // // //       } else {
// // // // //         missingCount++;
// // // // //         console.warn(`⚠️  Locality not found for: ${localityName}`);
// // // // //       }
// // // // //     }

// // // // //     console.log('--------------------------------------------------');
// // // // //     console.log(`✅ Updated deeds: ${updatedCount}`);
// // // // //     console.log(`⚠️  Missing localities: ${missingCount}`);
// // // // //     console.log('--------------------------------------------------');

// // // // //     await mongoose.connection.close();
// // // // //     console.log('🛑 Connection closed.');
// // // // //   } catch (error) {
// // // // //     console.error('❌ Error while updating deeds:', error);
// // // // //     process.exit(1);
// // // // //   }
// // // // // })();



// // // // const mongoose = require('mongoose');
// // // // const Deed = require('../models/deedSchema');
// // // // const Locality = require('../models/locality');

// // // // // Your MongoDB URI
// // // // const MONGO_URI = 'mongodb://127.0.0.1:27017/Kanpur?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8';

// // // // (async () => {
// // // //   try {
// // // //     console.log('🚀 Connecting to MongoDB...');
// // // //     await mongoose.connect(MONGO_URI, {
// // // //       useNewUrlParser: true,
// // // //       useUnifiedTopology: true,
// // // //     });
// // // //     console.log('✅ Connected successfully.');

// // // //     // Cursor to iterate deeds one by one (memory-efficient)
// // // //     const cursor = Deed.find({ locality: { $exists: true, $ne: '' } }).cursor();

// // // //     let updatedCount = 0;
// // // //     let missingCount = 0;

// // // //     for (let deed = await cursor.next(); deed != null; deed = await cursor.next()) {
// // // //       const localityName = deed.locality.trim();

// // // //       // Search for locality in Locality collection
// // // //       const locality = await Locality.findOne({
// // // //         name: { $regex: `^${localityName}$`, $options: 'i' }
// // // //       });

// // // //       if (locality && locality.lat && locality.lng) {
// // // //         await Deed.updateOne(
// // // //           { _id: deed._id },
// // // //           {
// // // //             $set: {
// // // //               lat: locality.lat,
// // // //               lng: locality.lng,
// // // //               pincode: locality.pincode || null,
// // // //               updatedAt: new Date()
// // // //             }
// // // //           }
// // // //         );
// // // //         updatedCount++;
// // // //         console.log(`✅ Updated deed ID ${deed._id} for locality "${localityName}"`);
// // // //       } else {
// // // //         missingCount++;
// // // //         console.warn(`⚠️  Locality not found for deed ID ${deed._id}: "${localityName}"`);
// // // //       }
// // // //     }

// // // //     console.log('--------------------------------------------------');
// // // //     console.log(`✅ Total updated deeds: ${updatedCount}`);
// // // //     console.log(`⚠️  Localities not found: ${missingCount}`);
// // // //     console.log('--------------------------------------------------');

// // // //     await mongoose.connection.close();
// // // //     console.log('🛑 Connection closed.');
// // // //   } catch (error) {
// // // //     console.error('❌ Error:', error);
// // // //   }
// // // // })();


// // // const mongoose = require('mongoose');
// // // const Deed = require('../models/deedSchema');
// // // const Locality = require('../models/locality');

// // // // Your MongoDB URI
// // // const MONGO_URI = 'mongodb://127.0.0.1:27017/Kanpur?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8';

// // // (async () => {
// // //   try {
// // //     console.log('🚀 Connecting to MongoDB...');
// // //     await mongoose.connect(MONGO_URI, {
// // //       useNewUrlParser: true,
// // //       useUnifiedTopology: true,
// // //     });
// // //     console.log('✅ Connected successfully.');

// // //     // Count total deeds with locality
// // //     const totalDeeds = await Deed.countDocuments({ locality: { $exists: true, $ne: '' } });
// // //     console.log(`📜 Total deeds with locality: ${totalDeeds}`);

// // //     // Cursor to iterate deeds one by one (memory-efficient)
// // //     const cursor = Deed.find({ locality: { $exists: true, $ne: '' } }).cursor();

// // //     let processedCount = 0;
// // //     let updatedCount = 0;
// // //     let missingCount = 0;

// // //     for (let deed = await cursor.next(); deed != null; deed = await cursor.next()) {
// // //       processedCount++;
// // //       const localityName = deed.locality.trim();

// // //       // Search for locality in Locality collection
// // //       const locality = await Locality.findOne({
// // //         name: { $regex: `^${localityName}$`, $options: 'i' }
// // //       });

// // //       if (locality && locality.lat && locality.lng) {
// // //         await Deed.updateOne(
// // //           { _id: deed._id },
// // //           {
// // //             $set: {
// // //               lat: locality.lat,
// // //               lng: locality.lng,
// // //               pincode: locality.pincode || null,
// // //               updatedAt: new Date()
// // //             }
// // //           }
// // //         );
// // //         updatedCount++;
// // //         console.log(`✅ [${processedCount}/${totalDeeds}] Updated deed ID ${deed._id} → "${localityName}"`);
// // //       } else {
// // //         missingCount++;
// // //         console.warn(`⚠️ [${processedCount}/${totalDeeds}] Locality not found for deed ID ${deed._id}: "${localityName}"`);
// // //       }

// // //       // Optional: log progress every 50 deeds
// // //       if (processedCount % 50 === 0) {
// // //         console.log(`📊 Progress: ${processedCount} deeds processed, ${updatedCount} updated, ${missingCount} missing`);
// // //       }
// // //     }

// // //     console.log('--------------------------------------------------');
// // //     console.log(`✅ Total deeds processed: ${processedCount}`);
// // //     console.log(`✅ Total updated deeds: ${updatedCount}`);
// // //     console.log(`⚠️  Localities not found: ${missingCount}`);
// // //     console.log('--------------------------------------------------');

// // //     await mongoose.connection.close();
// // //     console.log('🛑 Connection closed.');
// // //   } catch (error) {
// // //     console.error('❌ Error:', error);
// // //   }
// // // })();



// // const mongoose = require('mongoose');
// // const Deed = require('../models/deedSchema');
// // const Locality = require('../models/locality');

// // const MONGO_URI = 'mongodb://127.0.0.1:27017/Kanpur?directConnection=true&serverSelectionTimeoutMS=20000&appName=mongosh+2.5.8';

// // (async () => {
// //   try {
// //     console.log('🚀 Connecting to MongoDB...');
// //     await mongoose.connect(MONGO_URI, {
// //       useNewUrlParser: true,
// //       useUnifiedTopology: true,
// //       serverSelectionTimeoutMS: 30000
// //     });
// //     console.log('✅ Connected successfully.');

// //     const totalDeeds = await Deed.countDocuments({ locality: { $exists: true, $ne: '' } });
// //     console.log(`📜 Total deeds with locality: ${totalDeeds}`);

// //     const cursor = Deed.find({ locality: { $exists: true, $ne: '' } }).lean().cursor();

// //     let processedCount = 0;
// //     let updatedCount = 0;
// //     let missingCount = 0;

// //     for (let deed = await cursor.next(); deed != null; deed = await cursor.next()) {
// //       processedCount++;
// //       const localityName = deed.locality.trim();

// //       const locality = await Locality.findOne({
// //         name: { $regex: `^${localityName}$`, $options: 'i' }
// //       });

// //       if (locality && locality.lat && locality.lng) {
// //         await Deed.updateOne(
// //           { _id: deed._id },
// //           {
// //             $set: {
// //               lat: locality.lat,
// //               lng: locality.lng,
// //               pincode: locality.pincode || null,
// //               updatedAt: new Date()
// //             }
// //           }
// //         );
// //         updatedCount++;
// //         console.log(`✅ [${processedCount}/${totalDeeds}] Updated deed ID ${deed._id} → "${localityName}"`);
// //       } else {
// //         missingCount++;
// //         console.warn(`⚠️ [${processedCount}/${totalDeeds}] Locality not found for deed ID ${deed._id}: "${localityName}"`);
// //       }

// //       if (processedCount % 50 === 0) {
// //         console.log(`📊 Progress: ${processedCount} processed, ${updatedCount} updated, ${missingCount} missing`);
// //       }
// //     }

// //     console.log('--------------------------------------------------');
// //     console.log(`✅ Total deeds processed: ${processedCount}`);
// //     console.log(`✅ Total updated deeds: ${updatedCount}`);
// //     console.log(`⚠️  Localities not found: ${missingCount}`);
// //     console.log('--------------------------------------------------');

// //     await mongoose.connection.close();
// //     console.log('🛑 Connection closed.');
// //   } catch (error) {
// //     console.error('❌ Error:', error);
// //   }
// // })();


// /**
//  * updateDeedsWithLatLng.js
//  *
//  * Updates all deeds with latitude, longitude, and pincode
//  * from the Locality collection based on their `locality` field.
//  */

// const mongoose = require('mongoose');
// const Deed = require('../models/deedSchema');
// const Locality = require('../models/locality');

// // Replace with your MongoDB URI (local or Atlas)
// const MONGO_URI = 'mongodb://127.0.0.1:27017/Kanpur?directConnection=true&serverSelectionTimeoutMS=30000';

// mongoose.set('bufferCommands', false); // disable buffering to fail fast if connection fails

// (async () => {
//   try {
//     console.log('🚀 Connecting to MongoDB...');
//     await mongoose.connect(MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 30000, // wait longer for server selection
//     });
//     console.log('✅ Connected successfully.');

//     // Count total deeds with a non-empty locality
//     const totalDeeds = await Deed.countDocuments({ locality: { $exists: true, $ne: '' } });
//     console.log(`📜 Total deeds with locality: ${totalDeeds}`);

//     // Cursor to iterate deeds one by one (memory-efficient)
//     const cursor = Deed.find({ locality: { $exists: true, $ne: '' } }).lean().cursor();

//     let processedCount = 0;
//     let updatedCount = 0;
//     let missingCount = 0;

//     for (let deed = await cursor.next(); deed != null; deed = await cursor.next()) {
//       processedCount++;
//       const localityName = deed.locality.trim();

//       // Search for locality in Locality collection (case-insensitive)
//       const locality = await Locality.findOne({
//         name: { $regex: `^${localityName}$`, $options: 'i' }
//       });

//       if (locality && locality.lat && locality.lng) {
//         await Deed.updateOne(
//           { _id: deed._id },
//           {
//             $set: {
//               lat: locality.lat,
//               lng: locality.lng,
//               pincode: locality.pincode || null,
//               updatedAt: new Date()
//             }
//           }
//         );
//         updatedCount++;
//         console.log(`✅ [${processedCount}/${totalDeeds}] Updated deed ID ${deed._id} → "${localityName}"`);
//       } else {
//         missingCount++;
//         console.warn(`⚠️ [${processedCount}/${totalDeeds}] Locality not found for deed ID ${deed._id}: "${localityName}"`);
//       }

//       // Log progress every 50 deeds
//       if (processedCount % 50 === 0) {
//         console.log(`📊 Progress: ${processedCount} processed, ${updatedCount} updated, ${missingCount} missing`);
//       }
//     }

//     console.log('--------------------------------------------------');
//     console.log(`✅ Total deeds processed: ${processedCount}`);
//     console.log(`✅ Total updated deeds: ${updatedCount}`);
//     console.log(`⚠️  Localities not found: ${missingCount}`);
//     console.log('--------------------------------------------------');

//     await mongoose.connection.close();
//     console.log('🛑 Connection closed.');
//   } catch (error) {
//     console.error('❌ Error:', error);
//     process.exit(1);
//   }
// })();


/**
 * updateDeedsWithLatLng.js
 *
 * Updates all deeds with latitude, longitude, and pincode
 * from the Locality collection based on their `locality` field.
 */

// const mongoose = require('mongoose');
// // const Deed = require('../models/deedSchema');
// const Deed = mongoose.model('Deed', new mongoose.Schema({}, { strict: false }));
// const Locality = mongoose.model('locality', new mongoose.Schema({}, { strict: false }));

// // const Locality = require('../models/locality');

// // Replace with your MongoDB URI (local or Atlas)
// const MONGO_URI = 'mongodb://127.0.0.1:27017/DeedDistricts?directConnection=true&serverSelectionTimeoutMS=30000';

// // Remove this line or set it to true
// // mongoose.set('bufferCommands', false);

// (async () => {
//   try {
//     console.log('🚀 Connecting to MongoDB...');
//     await mongoose.connect(MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 30000,
//     });
    
//     // Wait for connection to be fully ready
//     await new Promise(resolve => {
//       if (mongoose.connection.readyState === 1) {
//         resolve();
//       } else {
//         mongoose.connection.once('open', resolve);
//       }
//     });
    
//     console.log('✅ Connected successfully.');

//     // Count total deeds with a non-empty locality
//     const totalDeeds = await Deed.countDocuments({ locality: { $exists: true, $ne: '' } });
//     console.log(`📜 Total deeds with locality: ${totalDeeds}`);

//     // Cursor to iterate deeds one by one (memory-efficient)
//     const cursor = Deed.find({ locality: { $exists: true, $ne: '' } }).lean().cursor();

//     let processedCount = 0;
//     let updatedCount = 0;
//     let missingCount = 0;

//     for (let deed = await cursor.next(); deed != null; deed = await cursor.next()) {
//       processedCount++;
//       const localityName = deed.locality.trim();

//       // Search for locality in Locality collection (case-insensitive)
//       const locality = await Locality.findOne({
//         name: { $regex: `^${localityName}$`, $options: 'i' }
//       });

//       if (locality && locality.lat && locality.lng) {
//         await Deed.updateOne(
//           { _id: deed._id },
//           {
//             $set: {
//               lat: locality.lat,
//               lng: locality.lng,
//               pincode: locality.pincode || null,
//               updatedAt: new Date()
//             }
//           }
//         );
//         updatedCount++;
//         console.log(`✅ [${processedCount}/${totalDeeds}] Updated deed ID ${deed._id} → "${localityName}"`);
//       } else {
//         missingCount++;
//         console.warn(`⚠️ [${processedCount}/${totalDeeds}] Locality not found for deed ID ${deed._id}: "${localityName}"`);
//       }

//       // Log progress every 50 deeds
//       if (processedCount % 50 === 0) {
//         console.log(`📊 Progress: ${processedCount} processed, ${updatedCount} updated, ${missingCount} missing`);
//       }
//     }

//     console.log('--------------------------------------------------');
//     console.log(`✅ Total deeds processed: ${processedCount}`);
//     console.log(`✅ Total updated deeds: ${updatedCount}`);
//     console.log(`⚠️  Localities not found: ${missingCount}`);
//     console.log('--------------------------------------------------');

//     await mongoose.connection.close();
//     console.log('🛑 Connection closed.');
//   } catch (error) {
//     console.error('❌ Error:', error);
//     process.exit(1);
//   }
// })();


const mongoose = require('mongoose');

const Deed = mongoose.model('deeds164', new mongoose.Schema({}, { strict: false }), 'deeds164');
const Locality = mongoose.model('locality', new mongoose.Schema({}, { strict: false }));

const MONGO_URI = 'mongodb://127.0.0.1:27017/DeedDistricts?directConnection=true&serverSelectionTimeoutMS=30000';

(async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    });

    await new Promise(resolve => {
      if (mongoose.connection.readyState === 1) resolve();
      else mongoose.connection.once('open', resolve);
    });

    console.log('✅ Connected successfully.');

    const totalDeeds = await Deed.countDocuments({ locality: { $exists: true, $ne: '' } });
    console.log(`📜 Total deeds with locality: ${totalDeeds}`);

    const cursor = Deed.find({ locality: { $exists: true, $ne: '' } }).lean().cursor();

    let processedCount = 0;
    let updatedCount = 0;
    let missingCount = 0;

    for (let deed = await cursor.next(); deed != null; deed = await cursor.next()) {
      processedCount++;
      const localityName = deed.locality.trim();

      const locality = await Locality.findOne({
        name: { $regex: `^${localityName}$`, $options: 'i' }
      });

      if (locality && locality.lat && locality.lng) {
        await Deed.updateOne(
          { _id: deed._id },
          {
            $set: {
              lat: locality.lat,
              lng: locality.lng,
              pincode: locality.pincode || null,
              updatedAt: new Date()
            }
          }
        );
        updatedCount++;
        console.log(`✅ [${processedCount}/${totalDeeds}] Updated deed ID ${deed._id} → "${localityName}"`);
      } else {
        missingCount++;
        console.warn(`⚠️ [${processedCount}/${totalDeeds}] Locality not found for deed ID ${deed._id}: "${localityName}"`);
      }

      if (processedCount % 50 === 0) {
        console.log(`📊 Progress: ${processedCount} processed, ${updatedCount} updated, ${missingCount} missing`);
      }
    }

    console.log('--------------------------------------------------');
    console.log(`✅ Total deeds processed: ${processedCount}`);
    console.log(`✅ Total updated deeds: ${updatedCount}`);
    console.log(`⚠️  Localities not found: ${missingCount}`);
    console.log('--------------------------------------------------');

    await mongoose.connection.close();
    console.log('🛑 Connection closed.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();

