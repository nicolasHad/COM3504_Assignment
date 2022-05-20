let Story = require('../models/stories');

/**
 * This function takes the data from the input fields and saves it into
 * the database
 * @param req
 * @param res
 */
exports.newStory = function (req, res) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }
    //Getting information from the form fields
    let story = new Story({
        author: userData.authorName,
        title: userData.authorTitle,
        description: userData.authorDescription,
        imageUrl: userData.converted,
        date: Date()

    });
    console.log('received: ' + story);
    //Saves the data into mongoDB
    story.save()
        .then((results) => {
            console.log(results._id);
            res.json(story);
        })
        .catch((error) => {
            res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })

}

/**
 * Method for getting all stories given a server request.
 * @param req
 * @param res
 */
exports.getActiveStoryData = function (req, res) {

    var query = Story.find();
    query.select('title author description imageUrl date');
    query.sort({date: -1});
    query.exec(function (err, stories) {
        if (err) {
            console.log('Error in retrieving stories.');
        }
        //console.log("Found stories from MongoDB!"+stories);
        res.json(stories);
    })
}

/**
 *
 * @param req
 * @param res
 */
exports.getSelectedStoryData = function (req, res) {
    //req contains the id of the story to retrieve.
    var query = Story.find({'title': req.body.title.toString()});
    query.exec(function (err, story) {
        if (err) {
            console.log('Cannot retrieve story.');
        }
        res.json(story);
    })
}
