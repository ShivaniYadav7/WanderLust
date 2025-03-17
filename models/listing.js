const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    
    image: {
        filename: String,  // ✅ Now image is an object with filename & url
        url: {
            type: String,
            default: "https://unsplash.com/photos/an-empty-road-in-the-middle-of-the-woods-fs130s4gUKo",
        },
    },
    
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
