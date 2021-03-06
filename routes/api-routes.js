'use strict';
const router = require('express').Router();
const db = require('../models');
const scrape = require('../scripts/scrape.js');
const validator = require('validator');

router.get('/api/scrape', (req, res) => {
  // res.json({url:req.query.url});
  scrape(req.query.url)
    .then(data => res.json(data))
    .catch(err => res.status(404).send(err));
});

router.get('/api/user', (req, res) =>{
  db.User.findAll()
    .then(users => res.json(users))
    .catch(err => res.status(404).send(err));
});

router.get('/api/recipe', (req, res) => {
  db.Recipe.findAll()
    .then(recipes => res.json(recipes))
    .catch(err => res.status(404).send(err));
});

router.get('/api/recipe/:id', (req, res) => {
  db.Recipe.findById(req.params.id)
    .then(recipe => res.json(recipe))
    .catch(err => res.status(404).send(err));
})

function scrapeToRecipe(url, recipe) {
  return scrape(url).then(scraped => {
    recipe.title = scraped.name;
    recipe.url = url;
    recipe.img = scraped.image;
    recipe.ingredients = scraped.ingredients;
    recipe.directions = scraped.directions;
    recipe.time = scraped.time;

    return recipe.save();
  });
}

// {"url": url}
router.post('/api/recipe', (req, res) => {
  let url = req.body.url;
  if(!validator.isURL(url)) 
    return res.status(400).send('Invalid url');

  if(!req.user)
    return res.status(401).send('Not logged in');

  let UserId = req.user.id;
  let recipeEntry;
  
  db.Recipe
    .findOrCreate({ 
      where: {url}
    })
    .spread((recipe, created) => {
      recipeEntry = recipe;
      if(created) {
        return scrapeToRecipe(url, recipe);
      } else {
        return recipe;
      }
    })
    .then(recipe => {
      if(req.user && req.user.id) {
        // set association
        recipe.setUsers([req.user.id]);
      }
      res.status(200).send('Added');
    })
    .catch(err => {
      if(recipeEntry) recipeEntry.destroy(); // clean up created recipe
      res.status(500).send(err);
    });
});

module.exports = router;