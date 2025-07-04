// init/index.js
require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/listing');
const { data } = require('./data');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log('DB Connected for seeding!');

    // Clear existing data
    await Listing.deleteMany({});
    console.log('Cleared existing listings');

    // Add owner reference if needed
    const ownerId = '65faaae8d351653782e5a739'; // Replace with actual user ID
    
    const listings = data.map(listing => ({
      ...listing,
      owner: ownerId
    }));

    await Listing.insertMany(listings);
    console.log(`Added ${listings.length} listings`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();