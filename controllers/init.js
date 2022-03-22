const mongoose = require('mongoose');
const Story = require('../models/stories');



exports.init = function() {

    let story = new Story({
        author: 'Bean',
        title: '1',
        description: 'Hello',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg'
    });
    // console.log('dob: '+character.dgob);

    story.save()
        .then ((results) => {
            console.log("object created in init: "+ JSON.stringify(results));
        })
        .catch ((error) => {
            console.log(JSON.stringify(error));
        });
}

