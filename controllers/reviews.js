const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// post function to handle POST requests to /listings/:id/reviews
module.exports.post = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New review added!!");
    res.redirect(`/listings/${listing._id}`);
};

// Defines a destroyReview function to handle DELETE requests to /listings/:id/reviews/:reviewId
module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
};