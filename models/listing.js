const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    
    image: {
            type: String,
            default:
                "https://unsplash.com/photos/an-empty-road-in-the-middle-of-the-woods-fs130s4gUKo",
                // this is when image is not set at all and if image is undefined both are different conditions
            set: (v) =>
                v === ""
            ? "https://unsplash.com/photos/an-empty-road-in-the-middle-of-the-woods-fs130s4gUKo" : v,
        },
    
    price: Number,
    location: String,
    country: String,
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
