const express = require("express");
const app = express();
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require("mongoose");
const path = require("path"); // 🟢 Move path before usage
const Listing = require("./models/listing");

// Database URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connect to MongoDB
main()
  .then(() => console.log("✅ Connected to DB"))
  .catch(err => console.log("❌ DB Connection Error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// View Engine Setup
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set('layout', 'layouts/boilerplate');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); // 🟢 Must be after path and before routes

// Routes
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
});

// New Listing Form
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

// Show Single Listing
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show", { listing }); // 🟢 Removed .ejs
});

// Create Listing
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});

// Edit Listing Form
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit", { listing });
});

// Delete route
app.delete("/listings/:id", async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});


// Start Server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
