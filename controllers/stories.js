let Story = require('../models/stories');

//This function gets the data inputted in the form and sends it to the database
// For Nicolas- Here call the storeCachedData method to cache the story using indexedDB as soon as the story is created.
exports.newStory = function (req, res) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }

    let story = new Story({
        author: userData.authorName,
        title: userData.authorTitle,
        description: userData.authorDescription,
        imageUrl: userData.image_url
    });
    console.log('received: ' + story);

    //storeCachedData(story);

    story.save()
        .then ((results) => {
            console.log(results._id);
            res.json(story);
        })
        .catch ((error) => {
            res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })

}

/**
 * Method for getting all active stories given a server request.
 * @param req
 * @param res
 */
exports.getActiveStoryData=function (req,res) {

    var query = Story.find();
    query.select('title author');
    query.exec(function (err, stories) {
        if (err){
            console.log('Error in retrieving stories.');
        }
        console.log("Found stories from MongoDB!"+stories);
        res.json(stories);
    })
}
