const request = require('supertest'); // API testing
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Listing = require('../models/listing');
const Review = require('../models/review');
const User = require('../models/user');
const Joi = require('joi');

jest.setTimeout(15000); // Prevent timeout

// Mock Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Passport setup
passport.use(new LocalStrategy({ usernameField: 'username' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Validation middlewares
const validateListing = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    geometry: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });
  next();
};

const validateReview = (req, res, next) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });
  next();
};

// Auth & Authorization middlewares
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Unauthorized' });
};

const isOwner = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Not found' });
  if (!req.user || !listing.owner.equals(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Routes
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Login failed' });
    req.logIn(user, err => {
      if (err) return next(err);
      res.status(200).json({ message: 'Logged in' });
    });
  })(req, res, next);
});

app.post('/listings', isLoggedIn, validateListing, async (req, res) => {
  const listing = await Listing.create({ ...req.body, owner: req.user._id });
  res.status(201).json(listing);
});

app.get('/listings', async (req, res) => {
  const listings = await Listing.find({});
  res.status(200).json(listings);
});

app.put('/listings/:id', isLoggedIn, isOwner, validateListing, async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(listing);
});

app.delete('/listings/:id', isLoggedIn, isOwner, async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Deleted' });
});

app.post('/listings/:id/reviews', isLoggedIn, validateReview, async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Not found' });
  const review = await Review.create({ ...req.body, author: req.user._id, listing: req.params.id });
  listing.reviews.push(review._id);
  await listing.save();
  res.status(201).json(review);
});

// DB Setup
let mongoServer;
beforeAll(async () => {
  mongoose.set('strictQuery', false);
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ===============================================
// AUTOMATION TESTING (5 TCs)
// ===============================================
describe('Unit 4: Automation Testing - API Endpoints', () => {
  let user, listing;

  beforeEach(async () => {
    await Listing.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});
    user = await User.register({ username: 'testuser', email: 'test@example.com' }, 'password123');
  });

  // TC-01: Create Listing (Valid Data)
  it('TC-01: should create listing with valid data', async () => {
    const agent = request.agent(app);
    await agent.post('/login').send({ username: 'testuser', password: 'password123' });
    const res = await agent.post('/listings').send({
      title: 'Cozy Cabin',
      price: 100,
      description: 'Nice view',
      location: 'Paris',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Cozy Cabin');
  });

  // TC-02: Reject Negative Price
  it('TC-02: should reject negative price', async () => {
    const agent = request.agent(app);
    await agent.post('/login').send({ username: 'testuser', password: 'password123' });
    const res = await agent.post('/listings').send({
      title: 'Cabin', price: -1, description: 'Nice', location: 'Paris',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('"price" must be greater than or equal to 0');
  });

  // TC-03: Allow Price = 0
  it('TC-03: should allow price = 0', async () => {
    const agent = request.agent(app);
    await agent.post('/login').send({ username: 'testuser', password: 'password123' });
    const res = await agent.post('/listings').send({
      title: 'Free Stay', price: 0, description: 'Free', location: 'Paris',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.price).toBe(0);
  });

  // TC-04: Update Listing (Owner Only)
  it('TC-04: should allow owner to update listing', async () => {
    listing = await Listing.create({
      title: 'Old', price: 100, description: 'Old', location: 'Paris',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }, owner: user._id
    });
    const agent = request.agent(app);
    await agent.post('/login').send({ username: 'testuser', password: 'password123' });
    const res = await agent.put(`/listings/${listing._id}`).send({
      title: 'Updated Cabin', price: 150, description: 'New', location: 'London',
      geometry: { type: 'Point', coordinates: [0.127, 51.5074] }
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Cabin');
  });

  // TC-05: Add Review
  it('TC-05: should add review to listing', async () => {
    listing = await Listing.create({
      title: 'Test', price: 100, description: 'Nice', location: 'Paris',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }, owner: user._id
    });
    const agent = request.agent(app);
    await agent.post('/login').send({ username: 'testuser', password: 'password123' });
    const res = await agent.post(`/listings/${listing._id}/reviews`).send({
      rating: 5, comment: 'Amazing!'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.rating).toBe(5);
  });
});

// ===============================================
//OBJECT-ORIENTED TESTING (3 TCs)
// ===============================================
describe('Unit 5: OO Testing - Models & Encapsulation', () => {
  let user;

  beforeEach(async () => {
    await Listing.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});
    user = await User.create({ username: 'testuser', email: 'test@example.com' });
  });

  // TC-06: Listing Constructor & Encapsulation
  it('TC-06: should test Listing constructor (encapsulation)', async () => {
    const listing = new Listing({
      title: 'Cozy Cabin',
      price: 100,
      description: 'Nice',
      location: 'Paris',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
      owner: user._id
    });
    await listing.save();
    expect(listing.title).toBe('Cozy Cabin');
    expect(listing.geometry.type).toBe('Point'); // Encapsulated geometry
    expect(listing.owner.toString()).toBe(user._id.toString());
  });

  // TC-07: Review-Listing Integration
  it('TC-07: should test Review integration with Listing', async () => {
    const listing = await Listing.create({
      title: 'Test', price: 100, description: 'Nice', location: 'Paris',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }, owner: user._id
    });
    const review = await Review.create({
      rating: 4, comment: 'Good', author: user._id, listing: listing._id
    });
    listing.reviews.push(review._id);
    await listing.save();
    const found = await Listing.findById(listing._id).populate('reviews');
    expect(found.reviews[0].rating).toBe(4);
  });

  // TC-08: Schema Validation (Mongoose)
  it('TC-08: should reject invalid data via Mongoose schema', async () => {
    expect.assertions(1);
    try {
      await Listing.create({ title: 'Invalid', price: -5 }); // Missing required fields
    } catch (err) {
      expect(err.message).toContain('validation failed');
    }
  });
});

// ===============================================
// SOFTWARE QUALITY MANAGEMENT (3 TCs)
// ===============================================
describe('Unit 6: SQM - Reliability, Usability, Security', () => {
  let user;

  beforeEach(async () => {
    await Listing.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});
    user = await User.register({ username: 'testuser', email: 'test@example.com' }, 'password123');
  });

  // TC-09: Reliability (Successful Flow)
  it('TC-09: should ensure reliable listing creation', async () => {
    const agent = request.agent(app);
    await agent.post('/login').send({ username: 'testuser', password: 'password123' });
    const res = await agent.post('/listings').send({
      title: 'Reliable Cabin', price: 100, description: 'Test', location: 'Paris',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }
    });
    expect(res.statusCode).toBe(201);
    const count = await Listing.countDocuments();
    expect(count).toBe(1); // Reliable DB state
  });

  // TC-10: Usability (Clear Error Messages)
  it('TC-10: should provide clear error for missing title', async () => {
    const agent = request.agent(app);
    await agent.post('/login').send({ username: 'testuser', password: 'password123' });
    const res = await agent.post('/listings').send({
      price: 100, description: 'No title', location: 'Paris',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('"title" is required');
  });

  // TC-11: Security (Unauthorized Access)
  it('TC-11: should block unauthenticated listing creation', async () => {
    const res = await request(app).post('/listings').send({
      title: 'Hack', price: 100, description: 'Try', location: 'Paris',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] }
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
  });
});