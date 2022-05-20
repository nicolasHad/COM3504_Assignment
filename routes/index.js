var express = require('express');
var router = express.Router();
var story = require('../controllers/stories');
var initDB = require('../controllers/init');
initDB.init();


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Image Browsing'});
});

/* GET generateRoom page, called index in this case . */
router.get('/generateRoom', function (req, res, next) {
    res.render('index', {title: 'Image Browsing'});
});

router.get('/visitedRooms', function (req, res, next) {
    res.render('visitedRooms');
});

/* GET newStory page and POST to the function which addes a new story to the database in controllers/stories.js. */
router.get('/createStory', function (req, res, next) {
    res.render('newStory', {title: 'Create a story'});
})
    .post('/newStory', story.newStory);


router
    .get('/getSelectedStoryData', function (req, res, next) {
        res.render('index', {title: 'Image Browsing'});
    })
    .post('/getSelectedStoryData', story.getSelectedStoryData)

router
    .get('/getAllStoryData', function (req, res, next) {
        res.render('stories');
    })
    .post('/getAllStoryData', story.getActiveStoryData)

router
    .post('/individual_storyPage', function (req, res, next) {
        res.render('individual_storyPage', {
            title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            imageUrl: req.body.imageUrl
        });
    })

module.exports = router;

