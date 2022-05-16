var express = require('express');
var router = express.Router();
var story = require('../controllers/stories');
var initDB = require('../controllers/init');
initDB.init();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

/* GET generateRoom page, called index in this case . */
router.get('/generateRoom', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

router.get('/visitedRooms', function(req, res, next) {
    res.render('visitedRooms');
});

/* GET newStory page and POST to the function which addes a new story to the databse in controllers/stories.js. */
router.get('/createStory', function(req, res, next) {
  res.render('newStory', { title: 'Create a story' });
})
    .post('/newStory', story.newStory);


router
    .get('/getSelectedStoryData', function (req,res,next) {
        res.render('index',{ title: 'Image Browsing' });
    })
    .post('/getSelectedStoryData',story.getSelectedStoryData)

router
    .get('/getAllStoryData', function (req,res,next) {
        res.render('stories');
    })
    .post('/getAllStoryData',story.getActiveStoryData)

/* GET home page.
router
    .get('/insert', function(req, res, next) {
      res.render('insert', {title: 'Test'});
    })

    .post('/insert', stories.insert);
module.exports = router; */

module.exports = router;

