let Story = require('../models/stories');

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

    story.save()
        .then ((results) => {
            console.log(results._id);
            res.json(story);
        })
        .catch ((error) => {
            res.status(500).json('Could not insert - probably incorrect data! ' + JSON.stringify(error));
        })

}
