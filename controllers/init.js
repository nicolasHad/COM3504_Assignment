const mongoose = require('mongoose');
const Story = require('../models/stories');

exports.init= function() {

    let story = new Story({
        title: 'Garbanzo',
        author: 'Bean',
        description: 'I love beans'
    });
    // console.log('dob: '+character.dob);

    story.save()
        .then ((results) => {
            console.log("object created in init: "+ JSON.stringify(results));
        })
        .catch ((error) => {
            console.log(JSON.stringify(error));
        });
}

