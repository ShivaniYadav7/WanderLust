const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isReviewAuthor, validationReview } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

router.post("/", 
    isLoggedIn, 
    validationReview, 
    wrapAsync(reviewController.post));

router.delete("/:reviewId", 
    isLoggedIn, 
    isReviewAuthor, 
    wrapAsync(reviewController.destroyReview));

module.exports = router;