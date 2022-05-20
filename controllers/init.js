//Constant declarations
const mongoose = require('mongoose');
const Story = require('../models/stories');

/**
 * Function which hardcodes some objects in mongo db and saves them
 */
exports.init = function() {
    //Creating a story
    let story = new Story({
        author: 'Bean',
        title: '1',
        description: 'Hello',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg',
        date: Date()
    });
    //Saving a story
    story.save()
        .then ((results) => {
            console.log("object created in init: "+ JSON.stringify(results));
        })
        .catch ((error) => {
            console.log(JSON.stringify(error));
        });
}

