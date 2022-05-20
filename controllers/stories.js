let Story = require('../models/stories');

//This function gets the data inputted in the form and sends it to the database
exports.newStory = function (req, res) {
    let userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!')
    }

    let story = new Story({
        author: userData.authorName,
        title: userData.authorTitle,
        description: userData.authorDescription,
        imageUrl: userData.converted

    });
    console.log('received: ' + story);

    story.save()
        .then ((results) =>               {
            console.log(results._id);
            res.json(story);
        })
        .catch ((error) => {
            res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })

}

/**
 * Method for getting all stories given a server request.
 * @param req
 * @param res
 */
exports.getActiveStoryData=function (req,res) {

    var query = Story.find();
    query.select('title author description imageUrl');
    query.exec(function (err, stories) {
        if (err){
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
exports.getSelectedStoryData=function (req,res) {
    //req contains the id of the story to retrieve.
    var query=Story.find({'title':req.body.title.toString()});
    query.exec(function(err,story){
        if(err){
            console.log('Cannot retrieve story.');
        }
        res.json(story);
    })
}
