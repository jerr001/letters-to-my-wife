require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { marked } = require('marked');

const path = require('path');

const Letter = require('./models/Letter');

const app = express();

app.locals.marked = marked;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Make `marked` available in all EJS templates
app.locals.marked = marked;

// Routes

// List all letters
app.get('/', async (req, res) => {
  try {
    const letters = await Letter.find().sort({ date: -1 });
    res.render('index', { letters });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Show form to write new letter
app.get('/letters/new', (req, res) => {
  res.render('new');
});

// Create new letter
app.post('/letters', async (req, res) => {
  try {
    const { title, body } = req.body;
    const newLetter = new Letter({ title, body });
    await newLetter.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Show single letter
app.get('/letters/:id', async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).send('Letter not found');
    res.render('letter', { letter });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Show edit form
app.get('/letters/:id/edit', async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).send('Letter not found');
    res.render('edit', { letter });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update letter
app.put('/letters/:id', async (req, res) => {
  try {
    const { title, body } = req.body;
    await Letter.findByIdAndUpdate(req.params.id, { title, body });
    res.redirect(`/letters/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete letter
app.delete('/letters/:id', async (req, res) => {
  try {
    await Letter.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
