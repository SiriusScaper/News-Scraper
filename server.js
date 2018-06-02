const express = require('express');
const exphb = require('express-handlebars')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const request = require('request');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
// const axios = require('axios');
const cheerio = require('cheerio');

// Require all models
const db = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongoHeadlines';

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {}, err => console.log(err));

const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Configure middleware

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static('public'));

// Routes

// A GET route for scraping the echoJS website
app.get('/scrape', (req, res) => {
  // First, we grab the body of the html with request
  app.get('http://www.echojs.com/').then((response) => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $('article h2').each(function (i, element) {
      // Save an empty result object
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children('a')
        .text();
      result.link = $(this)
        .children('a')
        .attr('href');

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then((dbArticle) => {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(err =>
          // If an error occurred, send it to the client
          res.json(err));
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send('Scrape Complete');
  });
});

// Route for getting all Articles from the db
app.get('/articles', (req, res) => {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then(dbArticle => res.json(dbArticle))
    .catch(err => res.json(err));
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get('/articles/:id', (req, res) => {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  db.Article.findOne({ _id: req.params.id })
    // and run the populate method with "note",
    .populate('note')
    // then responds with the article with the note included
    .then(dbArticle => res.json(dbArticle))
    .catch(err => res.json(err));
});

// Route for saving/updating an Article's associated Note
app.post('/articles/:id', (req, res) => {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  db.Note.create(req.body)
    .then(dbNote => db.ArticlefindOneAndUpdate({ _id: req.parans.id }, { note: dbNote._id }, { new: true }))
    // then find an article from the req.params.id
    .then(dbArticle => res.json(dbArticle))
    .catch(err => res.json(err));
  // and update it's "note" property with the _id of the new note
});

// Start the server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
