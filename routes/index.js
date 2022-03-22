var express = require('express');
var router = express.Router();
var story = require('../controllers/stories');
var initDB = require('../controllers/init');
initDB.init();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'Image Browsing' });
});

/* GET home page. */
router.get('/generateRoom', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

/* GET newStory. */
router.get('/createStory', function(req, res, next) {
  res.render('newStory', { title: 'Create a story' });
})
    .post('/newStory', story.newStory);

/* GET home page.
router
    .get('/insert', function(req, res, next) {
      res.render('insert', {title: 'Test'});
    })

    .post('/insert', stories.insert);
module.exports = router; */

module.exports = router;

