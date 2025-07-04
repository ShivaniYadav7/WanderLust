const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validationListing } = require("../middleware.js");
const ListingController = require("../controllers/listing.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Index and Create routes
router.route('/')
    .get(wrapAsync(ListingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validationListing,
        wrapAsync(ListingController.createListing)
    );

// New route
router.get("/new", isLoggedIn, ListingController.rendernewForm);

// Show, Update, Delete routes
router.route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single("listing[image]"), 
        wrapAsync(ListingController.updateListing))
    .delete(
        isLoggedIn, 
        isOwner, 
        wrapAsync(ListingController.destroyListing));

// Edit route
router.get("/:id/edit", 
    isLoggedIn, 
    isOwner, 
    wrapAsync(ListingController.renderEditForm));

module.exports = router;