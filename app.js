const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// Middleware
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views')); // in your app.js file
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For JSON data
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));
// EJS & EJS-Mate Setup

// Database Connection
main()
    .then(() => {
        console.log("Connected to DB");
    })

    .catch((err) => {
        console.log(err);
    });

    async function main(){
        await mongoose.connect(MONGO_URL);
    }

// Root Route
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

// 🔹 Route: Show All Listings
app.get("/listings", async (req, res) => {

        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
});

// 🔹 Route: Create New Listing Form
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// 🔹 Route: Show Single Listing
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing =await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});


// 🔹 Route: Create Listing (POST)
app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

// 🔹 Route: Edit Listing Form
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

// 🔹 Route: Update Listing (PUT)
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

// 🔹 Route: Delete Listing
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

// Start Server
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
// Example of getting all listings from a MongoDB database
app.use(express.static("public"));


